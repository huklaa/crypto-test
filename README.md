# Crypto Utility Toolkit

[![Tests](https://github.com/huklaa/crypto-test/actions/workflows/test.yml/badge.svg)](https://github.com/huklaa/crypto-test/actions/workflows/test.yml)

A dependency-free JavaScript toolkit for common cryptocurrency calculations and data handling. It provides focused, composable functions for market analysis, portfolio tracking, trade planning, staking estimates, validation, and presentation.

The project uses modern ECMAScript modules, runs on Node.js 20 or newer, and relies on Node's built-in test runner—there are no runtime or development dependencies.

## Features

- Validate and normalize coin symbols, holdings, prices, and currency codes.
- Format fiat values, crypto amounts, dates, compact market values, and trading pairs.
- Calculate percentage changes, market capitalization, volatility, and moving averages.
- Measure portfolio value, profit and loss, allocations, drawdown, and DCA positions.
- Plan trades with fees, slippage, position sizing, stop-loss, take-profit, and risk/reward calculations.
- Estimate simple and compounded staking returns.
- Import every supported function from one stable public entry point.

## Requirements

- Node.js 20 or newer
- npm 10 or newer (included with supported Node.js releases)

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
├── examples/          # Runnable, network-free integration examples
├── src/               # Validation, formatting, market, portfolio, trading, and staking modules
├── tests/             # Node.js built-in test suites
├── crypto.js          # Compatibility entry point
├── CHANGELOG.md       # Version history
├── CONTRIBUTING.md    # Contribution workflow
├── LICENSE            # MIT License
└── package.json       # Package metadata and scripts
```

## Development

Run the complete test suite:

```bash
npm test
```

Run syntax checks and tests together:

```bash
npm run check
```

Run syntax checks only:

```bash
npm run lint
```

Tests use `node:test` and cover success cases, edge cases, and invalid input handling.

## CI / Tests

GitHub Actions runs the test suite and project checks on every push and pull request using Node.js 20. The status badge at the top of this README reflects the latest workflow result on the default branch.

## Design Principles

- **Dependency-free:** the toolkit uses only standard JavaScript and Node.js APIs.
- **Pure calculations:** utilities do not perform network requests or mutate caller-owned arrays.
- **Explicit failures:** invalid numerical inputs raise `RangeError`; invalid value types raise `TypeError`.
- **Stable imports:** consumers use `src/index.js`, while the root `crypto.js` remains a compatibility entry point.

## Disclaimer

This project is educational software and does not provide financial advice. Verify market data independently before making financial decisions.
