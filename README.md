# Venom Finance — Back-Office Admin Cockpit

Back-office administration and operational cockpit for Venom Finance platform operations, treasury management, universal payment gateway configurations, multi-exchange bot fleet supervision, divergent order compensation governance, and AI quant strategy synthesis.

## Features

- 🤖 **Multi-Exchange Bot Fleet Supervisor (`/bots`)**: Real-time fleet status tracking across **Binance**, **Bybit**, **BingX**, and **GMX v2**, with exchange filter tabs (`ALL`, `BINANCE`, `BYBIT`, `BINGX`, `GMX_V2`), brand badges, emergency soft-stop, force-termination, and lifecycle monitoring.
- ⚖️ **Divergent Orders Governance Console (`/orders/divergent`)**: Cross-venue order state reconciliation, multi-exchange filtering, manual force-sync, compensation ledger balance review, and automated resolution workflows.
- 🏦 **Treasury & Cold Storage (`/treasury`)**: Multi-chain institutional vault management (TRON TRC20, Ethereum/Arbitrum ERC20, Solana SPL, TON Jettons), minimum deposit rules, threshold-based automated cold sweep operations, live gateway proxying (`/v1/treasury/admin/*`), Maker-Checker verification for high-value transfers, and instantaneous circuit breaker kill switches.
- 💳 **Universal Payment Gateways (`/payments`)**: Configuration management, Cloud KMS envelope sealing, webhook secrets, and connection testing (Stripe, Lemon Squeezy, Crypto Direct, Mock Simulator).
- 📜 **Tamper-Evident Audit Logs (`/audit`)**: Cryptographic SHA-256 hash-chained immutable audit log trail of all administrative mutations.
- 💼 **Exchange Broker & Rebate Governance Console (`/settings/broker-rebates`)**: Venue-aware partner configuration management:
  - **On-Chain DEX Governance (Hyperliquid & GMX v2)**: Non-custodial protocol settlement. Hyperliquid builder fees (1–10 BPS consensus maximum) are signed directly into L1 EIP-712 order action payloads with cold EVM vault addresses (`0x...`), requiring zero institutional BD emails, zero API secrets, and zero KYC. GMX v2 referral codes are passed directly into Arbitrum router multicall transactions.
  - **CEX Institutional Broker Governance**: Manages BingX institutional `X-SOURCE-KEY` headers with dual `x-VF-` prefixing, Binance Link `newClientOrderId` prefixes, Bybit `orderLinkId` prefixes with referer tags, and Bitget channel codes.
  - **Security & Performance**: Cloud KMS envelope encryption (`AES-256-GCM` with context-bound AAD `scope:broker_config:<exchange>`), ephemeral RAM memory scrubbing with countdown timers, dry-run attribution testing satisfying the `<1μs` wait-free lookup requirement, and live gateway proxying.
- 🧠 **Autonomous AI Quant Synthesizer (`/ai-quant`)**: ReAct synthesis console and strategy parameter verification.
- 🔭 **Observability & Distributed Tracing**: Outbound W3C `traceparent` context injection (`00-{traceId}-{spanId}-01`) on administrative API calls, full Sentry error tracking with strict PII masking (`maskAllInputs`, `maskAllText`, `blockAllMedia`), and App Router instrumentation.

## Development

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3002
npm run dev

# Run unit tests
npm run test

# Typecheck and build
npm run typecheck
npm run build
```

