import { formatCryptoAmount, formatCurrency } from "../src/index.js";
import { createBasePortfolioReader } from "./lib/baseClient.js";
import { BASE_CHAIN_ID, BASE_EXPLORER_URL } from "./lib/baseConfig.js";
import { analyzePortfolio } from "./lib/portfolioAnalytics.js";
import "./styles.css";

const form = document.querySelector("#wallet-form");
const addressInput = document.querySelector("#wallet-address");
const status = document.querySelector("#network-status");
const message = document.querySelector("#message");
const summary = document.querySelector("#summary");
const holdingsBody = document.querySelector("#holdings-body");
const loadButton = document.querySelector("#load-button");
const reader = createBasePortfolioReader();
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

holdingsBody.addEventListener("change", (event) => {
  const input = event.target.closest("input[data-field]");
  if (!input) return;
  holdings[Number(input.dataset.index)][input.dataset.field] = input.value === "" ? undefined : Number(input.value);
  render();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  loadButton.disabled = true;
  loadButton.textContent = "Loading…";
  status.dataset.state = "loading";
  status.textContent = "Checking Base mainnet…";
  setMessage("");

  try {
    const network = await reader.getNetworkStatus();
    holdings = (await reader.readPortfolio(addressInput.value.trim())).map((holding) => ({
      ...holding,
      price: holding.defaultPrice,
      costBasis: undefined,
      targetAllocation: undefined
    }));
    status.dataset.state = "online";
    status.textContent = `Base mainnet · chain ${network.chainId} · block ${network.blockNumber}`;
    document.querySelector("#explorer-link").href = `${BASE_EXPLORER_URL}/address/${addressInput.value.trim()}`;
    document.querySelector("#explorer-link").hidden = false;
    render();
    setMessage("Balances loaded. Add USD prices, optional cost basis, and target allocations to calculate analytics.");
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
