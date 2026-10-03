import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { adminApi } from '../src/services/adminApi';
import { ATTRIBUTION_TYPE } from '../src/types/contracts/brokerConfig';
import {
  GRPC_CODE_NOT_FOUND,
  GRPC_CODE_PERMISSION_DENIED,
  REASON_ADMIN_ROUTES_DISABLED,
  REASON_NOT_FOUND,
  expectAdminRejection,
  expectNoDataStorageAccess,
  stubBackendError,
  stubBrowserStorage,
} from './support/adminBackend';

describe('Broker & Rebate Governance API', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    // Default fetch mock to offline to ensure isolated fallback testing
    global.fetch = vi.fn().mockRejectedValue(new Error('Network offline'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it('rejects the broker config listing with the backend error and lists no baseline venues', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.getBrokerConfigs(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it('propagates a network failure of the broker config listing unchanged', async () => {
    const failure = new Error('Network offline');
    global.fetch = vi.fn().mockRejectedValue(failure);
    await expect(adminApi.getBrokerConfigs()).rejects.toBe(failure);
  });

  it('rejects retrieving a specific broker config with the real 404', async () => {
    stubBackendError(404, GRPC_CODE_NOT_FOUND, REASON_NOT_FOUND);
    await expectAdminRejection(adminApi.getBrokerConfig('EXCHANGE_BINGX'), 404, REASON_NOT_FOUND);
  });

  it('rejects the broker config update, reports no version bump and caches nothing', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.updateBrokerConfig({
        exchange: 'EXCHANGE_BINGX',
        attributionType: ATTRIBUTION_TYPE.HTTP_HEADER,
        rawIdentifier: 'BX-CUSTOM-PROD-KEY-999',
        rawSecret: 'secret_partner_salt',
        status: 'BROKER_CONFIG_STATUS_ACTIVE',
        rebateRateBps: 5000,
        expectedVersion: 1,
        notes: 'Custom VIP institutional agreement',
        extraParams: { client_order_id_prefix: 'x-VF-' },
      }),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });

  it('rejects the attribution test with the backend error and simulates no dry-run', async () => {
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.testBrokerAttribution({ exchange: 'EXCHANGE_BINGX', testOrderId: 'TEST-ORD-001' }),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    await expectAdminRejection(
      adminApi.testBrokerAttribution({ exchange: 'EXCHANGE_HYPERLIQUID', testOrderId: 'HL-ORD-776655' }),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
  });

  it('rejects the public exchange configs with the backend error and returns no baseline venues', async () => {
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.getPublicExchangeConfigs(), 403, REASON_ADMIN_ROUTES_DISABLED);
  });

  it('returns a successful update response as sent by the backend and caches nothing', async () => {
    const storage = stubBrowserStorage();
    const mockConfig = {
      id: 'cfg_binance_spot_1',
      exchange: 'binance_spot',
      environment: 'production',
      broker_id: 'x-VF-PROD',
      masked_identifier: 'x-V***-',
      attribution_type: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
      is_active: false,
      lifecycle_status: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
      sunset_notice: 'Venue decommissioned by operator.',
      version: 5,
      rebate_percentage: 0.3,
      has_encrypted_secrets: true,
      updated_at: '2026-10-02T10:00:00Z',
      updated_by: 'admin-1',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ config: mockConfig }),
    } as Response);

    const updated = await adminApi.updateBrokerConfig({
      exchange: 'EXCHANGE_BINANCE_SPOT',
      attributionType: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
      rawIdentifier: 'x-VF-PROD',
      status: 'BROKER_CONFIG_STATUS_INACTIVE',
      lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
      rebateRateBps: 3000,
      expectedVersion: 4,
    });

    expect(updated.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_TERMINATED');
    expect(updated.version).toBe(5);
    expectNoDataStorageAccess(storage);
  });

  it('persists TERMINATED lifecycle status as sent by the backend and merges with no baseline', async () => {
    const mockConfigs = [
      {
        id: 'cfg_binance_1',
        exchange: 'binance',
        is_active: false,
        lifecycle_status: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
        sunset_notice: 'Decommissioned by operator',
        version: 3,
        rebate_percentage: 0.3,
        environment: 'production',
        attribution_type: 'ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX',
        masked_identifier: 'x-V***-',
        has_encrypted_secrets: true,
        updated_at: '2026-10-02T10:00:00Z',
        updated_by: 'admin-1',
      },
      {
        id: 'cfg_hyperliquid_1',
        exchange: 'hyperliquid',
        is_active: true,
        lifecycle_status: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
        version: 1,
        rebate_percentage: 0.1,
        environment: 'production',
        attribution_type: 'ATTRIBUTION_TYPE_BUILDER_TAG',
        masked_identifier: '0x1122***900',
        has_encrypted_secrets: false,
        updated_at: '2026-10-02T10:00:00Z',
        updated_by: 'admin-1',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ configs: mockConfigs }),
    } as Response);

    const configs = await adminApi.getBrokerConfigs();
    expect(configs.length).toBe(2);

    const binance = configs.find((c) => c.exchange === 'EXCHANGE_BINANCE_SPOT');
    expect(binance).toBeDefined();
    expect(binance?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_TERMINATED');
    expect(binance?.status).toBe('BROKER_CONFIG_STATUS_INACTIVE');

    const hl = configs.find((c) => c.exchange === 'EXCHANGE_HYPERLIQUID');
    expect(hl).toBeDefined();
    expect(hl?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_ACTIVE');

    expect(configs.find((c) => c.exchange === 'EXCHANGE_BYBIT')).toBeUndefined();
  });

  it('correctly parses canonical Protobuf lowerCamelCase wire contract without coercing isActive to false', async () => {
    // Exact lowerCamelCase format emitted by gRPC-Gateway
    const protoWireConfigs = [
      {
        id: 'cfg_hyperliquid_live',
        exchange: 'hyperliquid',
        environment: 'production',
        brokerId: '0x1122334455667788990011223344556677889900',
        attributionType: 'ATTRIBUTION_TYPE_BUILDER_TAG',
        rebatePercentage: 0.1,
        payoutAddress: '0x1122334455667788990011223344556677889900',
        isActive: true,
        lifecycleStatus: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
        version: 2,
        maskedIdentifier: '0x1122***900',
        hasEncryptedSecrets: false,
        updatedAt: '2026-10-02T10:00:00Z',
        updatedBy: 'admin-1',
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ configs: protoWireConfigs }),
    } as Response);

    const configs = await adminApi.getBrokerConfigs();
    const hl = configs.find((c) => c.exchange === 'EXCHANGE_HYPERLIQUID');

    expect(hl).toBeDefined();
    expect(hl?.status).toBe('BROKER_CONFIG_STATUS_ACTIVE');
    expect(hl?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_ACTIVE');
    expect(hl?.maskedIdentifier).toBe('0x1122***900');
    expect(hl?.rebatePercentage).toBe(0.1);
    expect(hl?.rebateRateBps).toBe(10);
    expect(hl?.payoutAddress).toBe('0x1122334455667788990011223344556677889900');
  });
});
