# Crypto Utility Toolkit

[![Tests](https://github.com/huklaa/crypto-test/actions/workflows/test.yml/badge.svg)](https://github.com/huklaa/crypto-test/actions/workflows/test.yml)

**Live demo:** [Base Portfolio Reader](https://huklaa.github.io/crypto-test/)

A dependency-free JavaScript toolkit for common cryptocurrency calculations and data handling. It provides focused, composable functions for market analysis, portfolio tracking, trade planning, staking estimates, validation, and presentation.

The toolkit uses modern ECMAScript modules, runs on Node.js 22.13 or newer, and has no runtime dependencies. The repository's development toolchain uses viem, Vite, Hardhat, and Node's built-in test runner.

## Features

- Validate and normalize coin symbols, holdings, prices, and currency codes.
- Format fiat values, crypto amounts, dates, compact market values, and trading pairs.
- Calculate percentage changes, market capitalization, volatility, and moving averages.
- Measure portfolio value, profit and loss, allocations, drawdown, and DCA positions.
- Plan trades with fees, slippage, position sizing, stop-loss, take-profit, and risk/reward calculations.
- Estimate simple and compounded staking returns.
- Generate deterministic portfolio proofs and read their Base Sepolia registry state.
- Import every supported function from one stable public entry point.

## Requirements

- Node.js 22.13 or newer (required by Hardhat 3 and pnpm 11)
- pnpm 11.16 through Corepack

## Installation

Install the package from npm:

```bash
npm install @huklaa/crypto-utils
```

Then import utilities from the package root:

```js
import {
  calculateMarketCap,
  calculatePortfolioTotal,
  formatCurrency
} from "@huklaa/crypto-utils";

const holdings = [
  { amount: 1.25, price: 3_400 },
  { amount: 2_500, price: 1 }
];

console.log(formatCurrency(calculatePortfolioTotal(holdings)));
console.log(formatCurrency(calculateMarketCap(3_400, 120_500_000)));
```

Until the first npm publication is completed, the repository can also be used directly:

Clone the repository and install the package metadata:

```bash
git clone https://github.com/huklaa/crypto-test.git
cd crypto-test
npm install
```

The toolkit currently has no external dependencies, so installation is fast and deterministic.

## Usage

When working from a repository clone, import utilities from the source entry point:

```js
import {
  calculateMarketCap,
  calculatePercentChange,
  calculatePortfolioTotal,
  formatCurrency
} from "./src/index.js";

const change = calculatePercentChange(60_000, 63_000);
const marketCap = calculateMarketCap(63_000, 19_700_000);

const portfolioValue = calculatePortfolioTotal([
  { symbol: "BTC", amount: 0.25, price: 63_000 },
  { symbol: "ETH", amount: 2, price: 3_200 }
]);

console.log(`${change.toFixed(2)}%`);
console.log(formatCurrency(marketCap));
console.log(formatCurrency(portfolioValue));
```

### Trade planning

```js
import {
  calculatePositionSize,
  calculateRiskReward,
  calculateStopLoss,
  calculateTakeProfit
} from "./src/index.js";

const entry = 100;
const stop = calculateStopLoss(entry, 5);
const target = calculateTakeProfit(entry, 15);

console.log(calculatePositionSize(10_000, 1, entry, stop));
console.log(calculateRiskReward(entry, stop, target));
```

### Staking estimate

```js
import { calculateCompoundedStaking, calculateStakingReward } from "./src/index.js";

const simpleReward = calculateStakingReward(1_000, 8, 180);
const yearEndBalance = calculateCompoundedStaking(1_000, 8, 12, 1);
```

## Function Categories

| Module | Purpose | Examples |
| --- | --- | --- |
| `src/validation.js` | Input guards and record normalization | `normalizeSymbol`, `validateCoin`, `validateHolding` |
| `src/formatting.js` | Locale-aware output formatting | `formatCurrency`, `formatCryptoAmount`, `formatCryptoDate` |
| `src/market.js` | Market metrics and price statistics | `calculateMarketCap`, `calculateVolatility`, `calculateSimpleMovingAverage` |
| `src/portfolio.js` | Holdings, DCA, allocation, and P/L | `calculatePortfolioTotal`, `calculateProfitLoss`, `calculateDcaInvestment` |
| `src/trading.js` | Fees, execution, targets, and risk | `calculateSlippage`, `calculatePositionSize`, `calculateRiskReward` |
| `src/staking.js` | Simple and compounded yield estimates | `calculateStakingReward`, `calculateCompoundedStaking` |
| `src/index.js` | Stable public API | Re-exports every supported utility |

## Base Network Use Cases

Crypto Utility Toolkit is not specific to Base, but its dependency-free calculations and validation helpers fit naturally into applications built across the Base ecosystem. [Base](https://base.org) is an Ethereum Layer 2, so teams can combine this JavaScript crypto toolkit with their existing wallet, indexing, and smart-contract stack while keeping deterministic financial calculations in a separate, testable layer.

Common Base network and Base blockchain use cases include:

- Formatting ETH, USDC, and ERC-20 balances for a Base wallet, portfolio tracker, or account dashboard.
- Calculating price changes, market capitalization, portfolio allocation, and profit/loss for tokens available on Base.
- Supporting a swap or trading calculator with fee, slippage, stop-loss, take-profit, position-sizing, and risk/reward calculations.
- Powering token analytics in Base DeFi dashboards, DEX interfaces, lending applications, staking products, and portfolio-tracking experiences.
- Normalizing token symbols and validating market data before it reaches charts, tables, alerts, or transaction previews.

This library does **not** connect wallets, sign transactions, or make Base RPC calls on its own. It is designed to sit beside `viem`, `ethers`, or wallet SDKs as a calculation and validation layer: those tools handle Web3 connectivity and onchain interactions, while these Web3 utilities handle predictable numeric operations, presentation, and input checks.

### Run the Base portfolio example

The runnable example uses illustrative ETH, USDC, and AERO holdings to calculate portfolio total, allocation, profit/loss, and target-allocation rebalance trades. It is fully offline and does not connect to a blockchain or submit transactions.

```bash
npm run example:base
```

See [`examples/base-portfolio.js`](./examples/base-portfolio.js) to adapt the data for a Base dashboard or portfolio tracker.

## Project Structure

```text
crypto-test/
├── contracts/         # PortfolioSnapshotRegistry Solidity source
├── demo/              # Read-only Base mainnet web application
├── docs/              # Base listing and future Builder Code guidance
├── examples/          # Runnable, network-free integration examples
├── ignition/          # Repeatable Base Sepolia deployment module
├── src/               # Validation, formatting, market, portfolio, trading, and staking modules
├── test/              # Hardhat + viem contract integration tests
├── tests/             # Node.js built-in test suites
├── crypto.js          # Compatibility entry point
├── CHANGELOG.md       # Version history
├── CONTRIBUTING.md    # Contribution workflow
├── LICENSE            # MIT License
└── package.json       # Package metadata and scripts
```

## Live Base Demo / Base Mainnet Integration

Base Portfolio Reader is a responsive developer demo that reads public account state from Base mainnet and feeds those balances into this toolkit's deterministic portfolio functions. Base is an Ethereum Layer 2; the integration validates mainnet chain ID `8453`, reports the latest block, and links the inspected address to the Base block explorer.

The demo reads:

- Native ETH with `eth_getBalance`.
- USDC, WETH, cbETH, and cbBTC with the ERC-20 `balanceOf` function.
- Network chain ID and latest block number for connection status.

Balances are real Base mainnet data. USD prices, cost basis, and target allocations are entered locally by the user. The interface does not pretend that an RPC balance includes market pricing. It calculates holding value, portfolio total, allocation, optional profit/loss, and rebalance amounts with functions exported from `src/index.js`.

The application is strictly read-only. It does **not** connect a wallet, request a private key, sign a message or transaction, transfer tokens, execute swaps, or perform financial actions.

### Local development

```bash
npm install
cp .env.example .env.local # optional
npm run demo:dev
```

Open the local URL printed by Vite, enter any public EVM address, and select **Load portfolio**.

Build and preview the production bundle:

```bash
npm run demo:build
npm run demo:preview
```

Run a live, read-only Base RPC smoke check:

```bash
npm run demo:smoke
```

The default endpoint is Base's public `https://mainnet.base.org` RPC. Base documents this endpoint as rate-limited and unsuitable for production traffic. Set `VITE_BASE_RPC_URL` in `.env.local` to use a dedicated provider without committing an API key. Environment variables prefixed with `VITE_` are embedded in browser builds, so use only client-safe RPC URLs and apply provider-side origin restrictions where available.

### Why viem?

The demo uses viem for typed Base chain configuration, address validation, native balance reads, ERC-20 contract calls, and unit formatting. The RPC layer lives in `demo/lib/baseClient.js`, separate from rendering and analytics, and accepts an injected client for fast unit tests. Viem is a development dependency and is excluded from the published `@huklaa/crypto-utils` package, preserving the toolkit's dependency-free runtime.

GitHub Pages deployment is defined in `.github/workflows/pages.yml`. The production demo is available at [https://huklaa.github.io/crypto-test/](https://huklaa.github.io/crypto-test/).

Base Dashboard listing details are prepared in [`docs/base-dashboard-listing.md`](./docs/base-dashboard-listing.md). The ERC-8021 decision and future transaction-attribution path are documented in [`docs/base-builder-codes.md`](./docs/base-builder-codes.md).

## Base Sepolia Portfolio Snapshot Contract

`PortfolioSnapshotRegistry` is a non-custodial proof registry. It stores the latest Keccak-256 portfolio hash, rounded USD value in cents, asset count, and timestamp for each caller. It has no owner, token, withdrawal path, or payable function and never receives portfolio assets.

| Property | Value |
| --- | --- |
| Network | Base Sepolia |
| Chain ID | `84532` |
| Public RPC | `https://sepolia.base.org` |
| Explorer | `https://base-sepolia.blockscout.com` |
| Contract | Pending approved testnet deployment |
| Source | [`contracts/PortfolioSnapshotRegistry.sol`](./contracts/PortfolioSnapshotRegistry.sol) |

The demo creates a canonical JSON payload from positive Base mainnet balances and local USD prices. Holdings are normalized, sorted by symbol, and hashed with Keccak-256. This makes repeated calculations deterministic while keeping full portfolio data offchain.

### Build, test, deploy, and verify

Install development dependencies and run both JavaScript and Solidity checks:

```bash
pnpm install --frozen-lockfile
pnpm run check
pnpm run demo:build
pnpm run demo:smoke
```

Contract-only commands:

```bash
pnpm run contract:build
pnpm run contract:test
```

Deploying writes to Base Sepolia and consumes test ETH. Put the deployer key in a local environment or CI secret store; never commit it:

```bash
export BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
export BASE_SEPOLIA_PRIVATE_KEY=0x...
pnpm run contract:deploy:base-sepolia
```

Verify the deployed bytecode and Solidity source through Base Sepolia Blockscout:

```bash
pnpm run contract:verify:base-sepolia -- 0xDEPLOYED_CONTRACT
```

After deployment, set `VITE_SNAPSHOT_REGISTRY_ADDRESS` when building the demo so it can read `snapshotCount` and `latestSnapshots` from Base Sepolia. The demo remains read-only and never requests a wallet signature.

## Development

Run the complete JavaScript and smart-contract validation suite:

```bash
npm run check
```

Run syntax checks and tests together:

```bash
npm run check
```

Run syntax checks only:

```bash
npm run lint
```

JavaScript tests use `node:test`. Contract tests run on Hardhat's isolated OP-compatible local EVM with viem assertions and cover state updates, caller isolation, emitted events, and invalid inputs.

## CI / Tests

GitHub Actions runs the test suite and project checks on every push and pull request using Node.js 22.13. The status badge at the top of this README reflects the latest workflow result on the default branch.

## Design Principles

- **Dependency-free:** the toolkit uses only standard JavaScript and Node.js APIs.
- **Pure calculations:** utilities do not perform network requests or mutate caller-owned arrays.
- **Explicit failures:** invalid numerical inputs raise `RangeError`; invalid value types raise `TypeError`.
- **Stable imports:** consumers use `src/index.js`, while the root `crypto.js` remains a compatibility entry point.
- **Non-custodial proofs:** the Base Sepolia registry stores compact hashes and metadata, never funds or private portfolio records.

## Disclaimer

This project is educational software and does not provide financial advice. Verify market data independently before making financial decisions.
