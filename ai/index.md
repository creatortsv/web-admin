# Knowledge Base — web-admin

## Repository Info
- **Type**: Back-Office Administrative Web Application
- **Path**: `web-admin`
- **Framework**: Next.js 15 (App Router), React 19, TypeScript
- **State**: Zustand 5
- **Styling**: Tailwind CSS, Lucide React Icons

## Key Components
- `src/services/adminApi.ts`: Administrative API integration for treasury vaults, universal payment gateways, fleet supervision, and system stats, with W3C `traceparent` distributed tracing header injection.
- `src/lib/auditHasher.ts`: Cryptographic SHA-256 hash-chaining verification for immutable administrative audit logging.
- `src/instrumentation.ts` & `sentry.*.config.ts`: Sentry error reporting with strict PII masking (`maskAllInputs`, `maskAllText`, `blockAllMedia`).
- `src/app/treasury/page.tsx`: Treasury management, hot/cold sweep thresholds, and vault balances.
- `src/app/payments/page.tsx`: Universal payment gateways (Stripe, Lemon Squeezy, Crypto Direct, Mock Sandbox) with Cloud KMS sealing.
- `src/app/bots/page.tsx`: Fleet supervisor with emergency soft-stop and kill-switch operations.
- `src/app/ai-quant/page.tsx`: AI Quant Strategy Synthesizer console.
