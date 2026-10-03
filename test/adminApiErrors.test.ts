import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { adminApi } from '../src/services/adminApi';
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

  it('getSystemStats returns the backend gatewayStatus and applies no default', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ activeBotsCount: 3 }), { status: 200 })),
    );
    const stats = await adminApi.getSystemStats();
    expect(stats.activeBotsCount).toBe(3);
    expect(stats.gatewayStatus).toBeUndefined();
  });

  it('getBrokerConfigs returns only the venues the backend sent and caches nothing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({ configs: [{ id: 'cfg-1', exchange: 'hyperliquid', isActive: true }] }),
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
