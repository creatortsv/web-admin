# web-admin Architecture Document

## Overview

`web-admin` is the back-office administration cockpit for the Venom Finance engineering and operations teams. Built with Next.js 15 (App Router), React 19, TypeScript strict mode, and Tailwind CSS, it provides real-time oversight of platform infrastructure, treasury balances, payment gateways, running bot fleets, divergent orders, and autonomous AI Quant models.

---

## 1. Multi-Exchange Fleet Supervision (`src/app/bots/page.tsx`)

The Bot Fleet Supervisor provides back-office visibility and emergency intervention across all active user bots:
- **Exchange Filter Tabs**: Quickly isolate bots by venue:
  - `ALL`: Complete platform fleet.
  - `BINANCE`: Binance Spot & Futures bots.
  - `BYBIT`: Bybit V5 Unified accounts.
  - `BINGX`: BingX Swap V2 & VST demo bots.
  - `GMX_V2`: Arbitrum/Avalanche Web3 decentralized bots.
- **Brand Badges**: Visual indicators matching the exchange brand color palette.
- **Emergency Operations**:
  - **Soft Stop**: Pauses active grid order replacement, keeping open positions intact.
  - **Force Terminate**: Cancels all resting open orders on the venue and shuts down the bot's execution loop in `svc-bot-manager`.

---

## 2. Divergent Orders Reconciliation Console (`src/app/orders/divergent/page.tsx`)

Monitors order states that have fallen out of sync between Venom's internal state machine (`svc-trading-engine`) and external exchange matching engines:
- **Venue Segmentation**: Filter divergent order anomalies by exchange venue (`BINANCE`, `BYBIT`, `BINGX`, `GMX_V2`).
- **State Reconciliation**: Visualizes internal status vs venue status (e.g., internal `PENDING` vs exchange `EXPIRED` or `REJECTED`).
- **Compensation & Force-Sync**: Allows back-office operators to trigger manual status resync or credit compensatory balances in the billing ledger.

---

## 3. Platform Administration Modules

### 3.1 Treasury & Cold Storage (`src/app/treasury/page.tsx`)
- Multi-currency vault balances (BTC, ETH, USDT, USDC).
- Automated cold sweep threshold controls.
- Sweep transaction history and multisig destination wallet configurations.

### 3.2 Universal Payment Gateways (`src/app/payments/page.tsx`)
- Manages credentials and webhook configurations for multiple payment rails:
  - Stripe Billing (Credit cards, SEPA)
  - Lemon Squeezy (Merchant of record)
  - Direct Crypto (On-chain deposits)
  - Mock Sandbox Gateway (Local dev and testing)
- Cloud KMS encryption for webhook secrets and secret API keys.

### 3.3 Tamper-Evident Audit Logging (`src/lib/auditHasher.ts` & `/audit`)
- Every administrative action is cryptographically signed and chained with SHA-256 hashes (`previousHash + timestamp + action + actor + payload`).
- Prevents tampering or unrecorded back-office modifications.

### 3.4 AI Quant Synthesis Console (`src/app/ai-quant/page.tsx`)
- Interface for monitoring autonomous strategy synthesis loops (ReAct & Reflection Harness in `svc-ai-quant`).
- Review generated backtests, Sharpe ratios, Hurst regime estimates, and safety constraints.

---

## 4. Observability & Security

- **Tracing**: All calls from `src/services/adminApi.ts` inject W3C `traceparent` headers (`00-{traceId}-{spanId}-01`).
- **Sentry Data Masking**: PII and sensitive inputs (`maskAllInputs: true`, `maskAllText: true`, `blockAllMedia: true`) are masked across client and server runtimes.
