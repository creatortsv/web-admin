# Knowledge Base — web-admin

## Repository Info
- **Type**: Back-Office Administrative Web Application
- **Path**: `web-admin`
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **State**: Zustand 5
- **Styling**: Tailwind CSS, Lucide React Icons

## Documents

| File | Purpose |
| --- | --- |
| `ai/docs/architecture.md` | Administrative cockpit architecture, multi-exchange fleet controls, and audit integrity |

## Key Components
- `src/app/bots/page.tsx`: Multi-exchange Bot Fleet Supervisor with filter tabs (`ALL`, `BINANCE`, `BYBIT`, `BINGX`, `GMX_V2`), brand badges, and emergency bulk termination.
- `src/app/orders/divergent/page.tsx`: Cross-venue Divergent Orders Console with exchange filtering, status reconciliation, and compensation actions.
- `src/services/adminApi.ts`: Administrative API client for treasury vaults, universal payment gateways, fleet supervision, and system stats, with W3C `traceparent` distributed tracing header injection.
- `src/lib/auditHasher.ts`: Cryptographic SHA-256 hash-chaining verification for immutable administrative audit logging.
- `src/instrumentation.ts` & `sentry.*.config.ts`: Sentry error reporting with strict PII masking (`maskAllInputs`, `maskAllText`, `blockAllMedia`).
- `src/app/treasury/page.tsx`: Treasury management, hot/cold sweep thresholds, and vault balances.
- `src/app/payments/page.tsx`: Universal payment gateways (Stripe, Lemon Squeezy, Crypto Direct, Mock Sandbox) with Cloud KMS sealing.
- `src/app/ai-quant/page.tsx`: AI Quant Strategy Synthesizer console.

