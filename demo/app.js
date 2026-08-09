import { formatCryptoAmount, formatCurrency } from "../src/index.js";
import { isAddress } from "viem";
import { createBasePortfolioReader } from "./lib/baseClient.js";
import {
  BASE_CHAIN_ID,
  BASE_EXPLORER_URL,
  BASE_SEPOLIA_EXPLORER_URL,
  SNAPSHOT_REGISTRY_ADDRESS
} from "./lib/baseConfig.js";
import { analyzePortfolio } from "./lib/portfolioAnalytics.js";
import { fetchUsdPrices } from "./lib/priceClient.js";
import {
  createPortfolioSnapshot,
  createSnapshotRegistryReader
} from "./lib/snapshotRegistry.js";
import "./styles.css";

const form = document.querySelector("#wallet-form");
const addressInput = document.querySelector("#wallet-address");
const status = document.querySelector("#network-status");
const message = document.querySelector("#message");
const summary = document.querySelector("#summary");
const holdingsBody = document.querySelector("#holdings-body");
const loadButton = document.querySelector("#load-button");
const reader = createBasePortfolioReader();
const registryReader = createSnapshotRegistryReader();
let holdings = [];

function setMessage(text, type = "info") {
  message.textContent = text;
  message.dataset.type = type;
  message.hidden = !text;
}

function render() {
  const analysis = analyzePortfolio(holdings);
  summary.hidden = false;
  document.querySelector("#portfolio-total").textContent = formatCurrency(analysis.total);
  document.querySelector("#asset-count").textContent = String(analysis.holdings.filter((item) => item.amount > 0).length);
  holdingsBody.replaceChildren(...analysis.holdings.map((holding, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${holding.symbol}</strong><span>${holding.name}</span></td>
      <td>${formatCryptoAmount(holding.amount, 8)}</td>
      <td><input aria-label="${holding.symbol} USD price" data-field="price" data-index="${index}" type="number" min="0" step="any" value="${holding.price || ""}" placeholder="USD price"></td>
      <td>${formatCurrency(holding.value)}</td>
      <td>${holding.allocation.toFixed(2)}%</td>
      <td><input aria-label="${holding.symbol} cost basis" data-field="costBasis" data-index="${index}" type="number" min="0" step="any" value="${holding.costBasis ?? ""}" placeholder="Optional"></td>
      <td>${holding.profitLoss ? `${formatCurrency(holding.profitLoss.amount)} (${holding.profitLoss.percentage.toFixed(2)}%)` : "—"}</td>
      <td><input aria-label="${holding.symbol} target allocation" data-field="targetAllocation" data-index="${index}" type="number" min="0" max="100" step="any" value="${holding.targetAllocation ?? ""}" placeholder="%"></td>
      <td>${holding.rebalance == null ? "—" : `${holding.rebalance >= 0 ? "Buy" : "Sell"} ${formatCurrency(Math.abs(holding.rebalance))}`}</td>`;
    return row;
  }));
}

function renderLocalSnapshot(address) {
  try {
    const snapshot = createPortfolioSnapshot(address, holdings);
    document.querySelector("#snapshot-hash").textContent = snapshot.hash;
    document.querySelector("#snapshot-inputs").textContent = `${snapshot.assetCount} assets · ${formatCurrency(Number(snapshot.totalValueCents) / 100)}`;
    return snapshot;
  } catch (error) {
    document.querySelector("#snapshot-hash").textContent = error.message;
    document.querySelector("#snapshot-inputs").textContent = "—";
    return null;
  }
}

async function renderRegistryState(address) {
  const contractLink = document.querySelector("#contract-link");
  const registryMessage = document.querySelector("#registry-message");
  document.querySelector("#snapshot-count").textContent = "—";
  document.querySelector("#latest-snapshot").textContent = "—";

  if (!isAddress(SNAPSHOT_REGISTRY_ADDRESS)) {
    contractLink.hidden = true;
    registryMessage.textContent = "Contract deployment is pending. Local snapshot generation is fully available.";
    registryMessage.dataset.type = "info";
    return;
  }

  contractLink.href = `${BASE_SEPOLIA_EXPLORER_URL}/address/${SNAPSHOT_REGISTRY_ADDRESS}`;
  contractLink.hidden = false;
  registryMessage.textContent = "Reading PortfolioSnapshotRegistry on Base Sepolia…";
  registryMessage.dataset.type = "info";

  try {
    const [network, snapshot] = await Promise.all([
      registryReader.getNetworkStatus(),
      registryReader.getAccountSnapshot(address)
    ]);
    document.querySelector("#snapshot-count").textContent = snapshot.count.toString();
    document.querySelector("#latest-snapshot").textContent = snapshot.hasSnapshot
      ? new Date(snapshot.recordedAt * 1_000).toLocaleString()
      : "No snapshot recorded";
    registryMessage.textContent = `Contract online · Base Sepolia block ${network.blockNumber}`;
  } catch (error) {
    registryMessage.textContent = error.message || "Unable to read the snapshot registry";
    registryMessage.dataset.type = "warning";
  }
}

holdingsBody.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-field]");
  if (!input) return;
  holdings[Number(input.dataset.index)][input.dataset.field] = input.value === "" ? undefined : Number(input.value);
  render();
  renderLocalSnapshot(addressInput.value.trim());
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  loadButton.disabled = true;
  loadButton.textContent = "Loading…";
  status.dataset.state = "loading";
  status.textContent = "Checking Base mainnet…";
  document.querySelector("#explorer-link").hidden = true;
  setMessage("");

  try {
    const network = await reader.getNetworkStatus();
    const portfolio = await reader.readPortfolio(addressInput.value.trim());
    let prices = { USDC: 1 };
    let pricesAvailable = true;
    try {
      prices = await fetchUsdPrices();
      pricesAvailable = ["ETH", "WETH", "cbETH", "cbBTC"].every((symbol) => Number.isFinite(prices[symbol]));
    } catch {
      pricesAvailable = false;
    }
    holdings = portfolio.map((holding) => ({
      ...holding,
      price: prices[holding.symbol] ?? holding.defaultPrice,
      costBasis: undefined,
      targetAllocation: undefined
    }));
    status.dataset.state = "online";
    status.textContent = `Base mainnet · chain ${network.chainId} · block ${network.blockNumber}`;
    document.querySelector("#explorer-link").href = `${BASE_EXPLORER_URL}/address/${addressInput.value.trim()}`;
    document.querySelector("#explorer-link").hidden = false;
    render();
    renderLocalSnapshot(addressInput.value.trim());
    await renderRegistryState(addressInput.value.trim());
    setMessage(pricesAvailable
      ? "Balances and live USD prices loaded. Add optional cost basis and target allocations to calculate analytics."
      : "Balances loaded, but live prices are unavailable. Enter USD prices manually to calculate analytics.", pricesAvailable ? "info" : "warning");
  } catch (error) {
    status.dataset.state = "error";
    status.textContent = `Base mainnet · chain ${BASE_CHAIN_ID} · unavailable`;
    summary.hidden = true;
    setMessage(error.message || "Unable to read this portfolio", "error");
  } finally {
    loadButton.disabled = false;
    loadButton.textContent = "Load portfolio";
  }
});
