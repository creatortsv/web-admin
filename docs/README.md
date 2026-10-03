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
- a network failure of `fetch` propagates unchanged;
- a 2xx body that lacks a field the UI type requires, or carries it with the wrong type, rejects
  with `AdminContractError`, whose `field` names the violated path (for example
  `vaults[0].isActive`). The console never invents a value for such a field: there are no
  per-field defaults on the success path, and an absent list is the only value read as empty
  (proto3 omits an empty repeated field). Fields the UI type declares optional stay `undefined`
  when the backend omits them;
- the readers take the lowerCamelCase keys that grpc-gateway's default marshaler writes
  (Standards §4.5), and an enum-typed field must carry one of the values of its contract; any
  other value rejects with `AdminContractError` instead of being cast to the UI type. One
  exception is open: `parseBrokerConfigWire` still also accepts the snake_case spelling of
  eight required fields (`is_active`, `rebate_percentage`, `attribution_type`,
  `lifecycle_status`, `masked_identifier`, `has_encrypted_secrets`, `updated_at`, `updated_by`),
  because two success-response cases of `test/brokerRebatesGovernance.test.ts` that predate
  WP-0.8b still send them.

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
- There is no console stop-crane (D-79): the console adds no gate of its own and never hides an
  action that has a backend operation; the gateway decides. Controls for which the admin API has
  no operation (a bot stop, a user status or role change) are rendered disabled with an
  explanation, and preset publication is reported as unavailable, until the routes exist
  (WP-8.5a, and the preset-publication work package). Nothing is simulated in their place.

## Network path

`src/app/api/` is removed and `next.config.ts` has a single rewrite, `/v1/:path*` to svc-gateway
(`API_GATEWAY_URL`). Every request of the console, including `/v1/treasury/*`, therefore passes
svc-gateway and its authentication and route policy. The console has no server route that forwards
a request without authentication.

## Environment contract

The variables `MCP_QUANT_URL` (removed with `src/app/api/quant/`) and `TREASURY_GATEWAY_URL`
(removed with the direct treasury rewrite) are no longer read by web-admin. The environment
contract rows for web-admin list neither.
