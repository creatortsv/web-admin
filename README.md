# Venom Finance — Back-Office Admin Cockpit

Back-office administration and operational cockpit for Venom Finance platform operations, treasury management, universal payment gateway configurations, bot fleet supervision, and AI quant strategy synthesis.

## Features

- 🏦 **Treasury & Cold Storage**: Vault management, minimum deposit rules, and threshold-based automated cold sweep operations.
- 💳 **Universal Payment Gateways**: Configuration management, Cloud KMS envelope sealing, webhook secrets, and connection testing (Stripe, Lemon Squeezy, Crypto Direct, Mock Simulator).
- 🤖 **Bot Fleet Supervisor**: Real-time fleet status tracking, emergency soft-stop, force-termination, and bot lifecycle monitoring.
- 📜 **Tamper-Evident Audit Logs**: SHA-256 hash-chained immutable audit log trail of all administrative mutations.
- 🧠 **Autonomous AI Quant Synthesizer**: ReAct synthesis console and strategy parameter verification.
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
