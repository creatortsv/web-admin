# web-admin documentation

## Backend errors

The admin console never shows an action, a balance credit, a configuration change or a health
state that the backend did not confirm. Every `adminApi` call goes through `adminFetch` and
resolves only from `readJsonOrThrow` (`src/services/adminApiError.ts`):

- a 2xx response resolves with its JSON body;
- any other response rejects with `AdminApiError`, whose `status` is the HTTP status and whose
  `reason` is the `message` field of the grpc-gateway error body
  (`{"code":7,"message":"admin_routes_disabled"}`), or the response's `statusText` when the body
  is not that JSON;
- a network failure of `fetch` propagates unchanged.

Pages render four states for every backend read: loading (`Skeleton`), error (a
`@creatortsv/pkg-ui` `Alert` with the HTTP status and reason, for example
`403 admin_routes_disabled`), empty (`InstitutionalEmptyState`) and data. A rejected mutation
shows its error and no success message, and changes no rendered data.

What an operator sees today:

- While the SC-04 part of an admin route prefix is active (WP-0.2c: SC-04a and SC-04d are removed
  by WP-1.2m, SC-04b by WP-6.26, SC-04c by WP-6.27), every admin action on that prefix shows
  `403 admin_routes_disabled`.
- Routes that have no backend contract (for example the divergent-order actions and the
  user, bot and statistics listings) show `404` until WP-8.5a replaces or removes their screens.
- The overview page shows no per-service health and the audit page shows no entries and no
  chain-verification verdict: no backend endpoint provides either yet (audit listings: WP-8.13).
- `adminApi` keeps no data in browser storage. The only values the console still stores in the
  browser are the admin access token (WP-8.4) and the AI Quant provider settings (WP-9.3).
- There is no console stop-crane (D-79): the console does not hide or disable actions on its own;
  the gateway decides.

## Network path

`src/app/api/` is removed and `next.config.ts` has a single rewrite, `/v1/:path*` to svc-gateway
(`API_GATEWAY_URL`). Every request of the console, including `/v1/treasury/*`, therefore passes
svc-gateway and its authentication and route policy. The console has no server route that forwards
a request without authentication.

## Environment contract

The variables `MCP_QUANT_URL` (removed with `src/app/api/quant/`) and `TREASURY_GATEWAY_URL`
(removed with the direct treasury rewrite) are no longer read by web-admin. The environment
contract rows for web-admin list neither.
