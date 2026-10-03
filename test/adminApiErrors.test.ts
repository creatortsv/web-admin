import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { adminApi } from '../src/services/adminApi';
import { AdminContractError } from '../src/services/adminApiError';
import {
  GRPC_CODE_NOT_FOUND,
  GRPC_CODE_PERMISSION_DENIED,
  REASON_ADMIN_ROUTES_DISABLED,
  REASON_NOT_FOUND,
  StorageOperations,
  expectAdminRejection,
  expectNoDataStorageAccess,
  stubBackendError,
  stubBrowserStorage,
  stubNetworkFailure,
} from './support/adminBackend';
import {
  WireFixture,
  botWire,
  brokerConfigWire,
  claimWire,
  natEgressIps,
  orderWire,
  publicExchangeWire,
  statsWire,
  stubBackendJson,
  userWire,
  vaultWire,
  without,
} from './support/adminWireFixtures';

const vault = {
  id: 'vault-1',
  chain: 'Tron',
  asset: 'USDT',
  receivingAddress: 'receiving-address',
  coldSweepAddress: 'cold-address',
  minDepositUsd: 10,
  sweepThresholdUsd: 100,
  currentBalanceUsd: 0,
  isActive: true,
  updatedAt: '2026-10-01T00:00:00Z',
};

const brokerUpdate = {
  exchange: 'EXCHANGE_BYBIT' as const,
  attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX' as const,
  rawIdentifier: 'test-identifier',
  status: 'BROKER_CONFIG_STATUS_ACTIVE' as const,
  rebateRateBps: 3000,
  expectedVersion: 1,
};

const mutations: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ['saveTreasuryVault', () => adminApi.saveTreasuryVault(vault)],
  [
    'updateUniversalGatewayConfig',
    () =>
      adminApi.updateUniversalGatewayConfig({
        gatewayName: 'stripe',
        environment: 'TEST',
        isEnabled: true,
        secretKey: 'test-secret',
        webhookSecret: 'test-webhook-secret',
        planPriceMappings: { PRO: 'price-test' },
      }),
  ],
  ['testGatewayConnection', () => adminApi.testGatewayConnection('stripe', 'TEST', 'test-secret')],
  ['syncDivergentOrder', () => adminApi.syncDivergentOrder('order-1')],
  ['forceCancelDivergentOrder', () => adminApi.forceCancelDivergentOrder('order-1')],
  ['declareAbandonedOrder', () => adminApi.declareAbandonedOrder('order-1')],
  [
    'createCompensationClaim',
    () =>
      adminApi.createCompensationClaim(
        { incidentId: 'inc-1', userId: 'user-1', amountCents: 100, reason: 'test reason' },
        'maker-1',
      ),
  ],
  ['approveCompensationClaim', () => adminApi.approveCompensationClaim('claim-1', 'checker-1')],
  ['rejectCompensationClaim', () => adminApi.rejectCompensationClaim('claim-1', 'checker-1', 'reason')],
  ['updateBrokerConfig', () => adminApi.updateBrokerConfig(brokerUpdate)],
  [
    'testBrokerAttribution',
    () => adminApi.testBrokerAttribution({ exchange: 'EXCHANGE_BYBIT', testOrderId: 'order-1' }),
  ],
  ['proposeVenueDecommission', () => adminApi.proposeVenueDecommission('EXCHANGE_BYBIT', 'maker-1', 'reason')],
  ['approveVenueDecommission', () => adminApi.approveVenueDecommission('EXCHANGE_BYBIT', 'checker-1')],
  [
    'rejectVenueDecommission',
    () => adminApi.rejectVenueDecommission('EXCHANGE_BYBIT', 'checker-1', 'reason'),
  ],
];

const reads: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ['getSystemStats', () => adminApi.getSystemStats()],
  ['getTreasuryVaults', () => adminApi.getTreasuryVaults()],
  ['getPaymentGateways', () => adminApi.getPaymentGateways()],
  ['getUsers', () => adminApi.getUsers()],
  ['getFleetBots', () => adminApi.getFleetBots()],
  ['listUniversalGateways', () => adminApi.listUniversalGateways()],
  ['getUniversalGatewayConfig', () => adminApi.getUniversalGatewayConfig('stripe', 'TEST')],
  ['getDivergentOrders', () => adminApi.getDivergentOrders()],
  ['getCompensationClaims', () => adminApi.getCompensationClaims()],
  ['getBrokerConfigs', () => adminApi.getBrokerConfigs()],
  ['getBrokerConfig', () => adminApi.getBrokerConfig('EXCHANGE_BINGX')],
  ['getPublicExchangeConfigs', () => adminApi.getPublicExchangeConfigs()],
];

describe('adminApi surfaces the real backend error', () => {
  let storage: StorageOperations;

  beforeEach(() => {
    storage = stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(mutations)('mutations reject on 403 and touch no storage: %s', async (_name, call) => {
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(call(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it.each(reads)('reads reject on 403 and return no local data: %s', async (_name, call) => {
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(call(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it.each([...reads, ...mutations])('rejects on 404 with the real status: %s', async (_name, call) => {
    stubBackendError(404, GRPC_CODE_NOT_FOUND, REASON_NOT_FOUND);
    await expectAdminRejection(call(), 404, REASON_NOT_FOUND);
    expectNoDataStorageAccess(storage);
  });

  it.each([...reads, ...mutations])('network failure propagates: %s', async (_name, call) => {
    const failure = new TypeError('fetch failed');
    stubNetworkFailure(failure);
    await expect(call()).rejects.toBe(failure);
    expectNoDataStorageAccess(storage);
  });
});

describe('adminApi resolves only from the backend response', () => {
  let storage: StorageOperations;

  beforeEach(() => {
    storage = stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getSystemStats returns the backend gatewayStatus', async () => {
    stubBackendJson({ ...statsWire, gatewayStatus: 'DEGRADED' });
    const stats = await adminApi.getSystemStats();
    expect(stats.activeBotsCount).toBe(3);
    expect(stats.gatewayStatus).toBe('DEGRADED');
  });

  it('getBrokerConfigs returns only the venues the backend sent and caches nothing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ configs: [{ ...brokerConfigWire, id: 'cfg-1', exchange: 'hyperliquid', isActive: true }] }),
            { status: 200 },
          ),
      ),
    );
    const configs = await adminApi.getBrokerConfigs();
    expect(configs.map((c) => c.exchange)).toEqual(['EXCHANGE_HYPERLIQUID']);
    expectNoDataStorageAccess(storage);
  });

  it('getPublicExchangeConfigs returns an empty list when the backend sends none', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({}), { status: 200 })));
    await expect(adminApi.getPublicExchangeConfigs()).resolves.toEqual([]);
  });

  it('testBrokerAttribution returns only the answer of the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ is_valid: false, diagnostic_message: 'prefix rejected' }), {
            status: 200,
          }),
      ),
    );
    const res = await adminApi.testBrokerAttribution({
      exchange: 'EXCHANGE_BYBIT',
      testOrderId: 'order-1',
    });
    expect(res.success).toBe(false);
    expect(res.statusMessage).toBe('prefix rejected');
    expect(res.attributedOrderId).toBeUndefined();
    expect(res.attributionLatencyNanos).toBeUndefined();
  });

  it('triggerSweep reports success only when the backend does', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ message: 'queued' }), { status: 200 })),
    );
    const res = await adminApi.triggerSweep('vault-1');
    expect(res.success).toBe(false);
    expect(res.message).toBe('queued');
  });
});

interface FailClosedCase {
  readonly name: string;
  readonly call: () => Promise<unknown>;
  readonly body: (fixture: WireFixture) => unknown;
  readonly fixture: WireFixture;
  /** Wire field to delete and the error path the contract error must name. */
  readonly required: ReadonlyArray<readonly [field: string, path: string]>;
}

const listCase = (
  name: string,
  call: () => Promise<unknown>,
  listKey: string,
  fixture: WireFixture,
  fields: readonly string[],
): FailClosedCase => ({
  name,
  call,
  fixture,
  body: (item) => ({ [listKey]: [item] }),
  required: fields.map((f) => [f, `${listKey}[0].${f}`] as const),
});

const failClosedCases: readonly FailClosedCase[] = [
  {
    name: 'getSystemStats',
    call: () => adminApi.getSystemStats(),
    fixture: statsWire,
    body: (item) => item,
    required: Object.keys(statsWire).map((f) => [f, f] as const),
  },
  listCase('getTreasuryVaults', () => adminApi.getTreasuryVaults(), 'vaults', vaultWire, [
    'id',
    'chain',
    'asset',
    'receivingAddress',
    'coldSweepAddress',
    'minDepositUsd',
    'sweepThresholdUsd',
    'currentBalanceUsd',
    'isActive',
    'updatedAt',
  ]),
  listCase('getUsers', () => adminApi.getUsers(), 'users', userWire, Object.keys(userWire)),
  listCase('getFleetBots', () => adminApi.getFleetBots(), 'bots', botWire, Object.keys(botWire)),
  listCase('getDivergentOrders', () => adminApi.getDivergentOrders(), 'orders', orderWire, Object.keys(orderWire)),
  listCase('getCompensationClaims', () => adminApi.getCompensationClaims(), 'claims', claimWire, Object.keys(claimWire)),
];

describe('adminApi fails closed on an incomplete 2xx body', () => {
  beforeEach(() => {
    stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(failClosedCases)('$name resolves a complete body', async ({ call, body, fixture }) => {
    stubBackendJson(body(fixture));
    await expect(call()).resolves.toBeDefined();
  });

  const missing = failClosedCases.flatMap((c) =>
    c.required.map(([field, path]) => [c.name, field, path, c] as const),
  );

  it.each(missing)('%s rejects when %s is missing (no default is invented)', async (_n, field, path, c) => {
    stubBackendJson(c.body(without(c.fixture, field)));
    const error = await c.call().then(
      () => {
        throw new Error('expected the call to reject, but it resolved');
      },
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(path);
  });

  it.each([
    ['getTreasuryVaults', () => adminApi.getTreasuryVaults(), { vaults: [{ ...vaultWire, isActive: 'yes' }] }, 'vaults[0].isActive'],
    ['getTreasuryVaults', () => adminApi.getTreasuryVaults(), { vaults: [{ ...vaultWire, minDepositUsd: 'NaN' }] }, 'vaults[0].minDepositUsd'],
    ['getUsers', () => adminApi.getUsers(), { users: [{ ...userWire, role: null }] }, 'users[0].role'],
    ['getSystemStats', () => adminApi.getSystemStats(), { ...statsWire, kafkaLag: null }, 'kafkaLag'],
  ] as const)('%s rejects a field of the wrong type: %s', async (_n, call, body, path) => {
    stubBackendJson(body);
    const error = await call().then(
      () => {
        throw new Error('expected the call to reject, but it resolved');
      },
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(path);
  });

  it('getTreasuryVaults keeps isActive=false exactly as the backend sent it', async () => {
    stubBackendJson({ vaults: [vaultWire] });
    const [vault] = await adminApi.getTreasuryVaults();
    expect(vault.isActive).toBe(false);
    expect(vault.asset).toBe('USDT');
  });

  it('getPublicExchangeConfigs maps a complete body and keeps the backend NAT list', async () => {
    stubBackendJson({ natEgressIps, exchanges: { bybit: publicExchangeWire } });
    await expect(adminApi.getPublicExchangeConfigs()).resolves.toEqual([
      {
        exchange: 'EXCHANGE_BYBIT',
        name: 'Bybit',
        portalUrl: 'https://portal.example.test',
        staticNatIps: natEgressIps,
        isBrokerActive: false,
        lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_RESTRICTED_NEW',
        sunsetDeadline: null,
        sunsetNotice: null,
        allowNewKeys: false,
        allowNewBots: false,
      },
    ]);
  });

  it.each([
    ['staticNatIps', 'exchanges.bybit.staticNatIps', { exchanges: { bybit: publicExchangeWire } }],
    ['lifecycleStatus', 'exchanges.bybit.lifecycleStatus', { natEgressIps, exchanges: { bybit: without(publicExchangeWire, 'lifecycleStatus') } }],
    ['allowNewKeys', 'exchanges.bybit.allowNewKeys', { natEgressIps, exchanges: { bybit: without(publicExchangeWire, 'allowNewKeys') } }],
    ['allowNewBots', 'exchanges.bybit.allowNewBots', { natEgressIps, exchanges: { bybit: without(publicExchangeWire, 'allowNewBots') } }],
    ['name', 'exchanges.bybit.name', { natEgressIps, exchanges: { bybit: without(publicExchangeWire, 'name') } }],
    ['portalUrl', 'exchanges.bybit.portalUrl', { natEgressIps, exchanges: { bybit: without(publicExchangeWire, 'portalUrl') } }],
  ] as const)('getPublicExchangeConfigs rejects when %s is missing (no default)', async (_field, path, body) => {
    stubBackendJson(body);
    const error = await adminApi.getPublicExchangeConfigs().then(
      () => {
        throw new Error('expected the call to reject, but it resolved');
      },
      (e: unknown) => e,
    );
    expect(error).toBeInstanceOf(AdminContractError);
    expect((error as AdminContractError).field).toBe(path);
  });
});

describe('adminApi returns exactly what the backend sent', () => {
  beforeEach(() => {
    stubBrowserStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('getBrokerConfigs applies no client-side venue filter', async () => {
    stubBackendJson({
      configs: [
        { ...brokerConfigWire, id: 'cfg-1', exchange: 'bybit', isActive: true },
        { ...brokerConfigWire, id: 'cfg-2', exchange: 'bitget', isActive: true },
      ],
    });
    const configs = await adminApi.getBrokerConfigs();
    expect(configs.map((c) => c.exchange)).toEqual(['EXCHANGE_BYBIT', 'EXCHANGE_BITGET']);
  });

  it('triggerSweep falls back to statusText when the error body cannot be read', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: async () => {
          throw new TypeError('body stream failed');
        },
      })),
    );
    await expect(adminApi.triggerSweep('vault-1')).rejects.toThrow('Sweep initiation failed (HTTP 502): Bad Gateway');
  });
});
