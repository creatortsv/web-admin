import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { adminApi, INITIAL_BROKER_CONFIGS, INITIAL_PUBLIC_EXCHANGE_CONFIGS } from '../src/services/adminApi';
import { ATTRIBUTION_TYPE } from '../src/types/contracts/brokerConfig';

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
    global.fetch = originalFetch;
  });

  it('lists default broker configs across all supported exchange venues (Bitget removed)', async () => {
    const configs = await adminApi.getBrokerConfigs();
    expect(configs.length).toBe(6);
    expect(configs.some((c) => (c.exchange as string) === 'EXCHANGE_BITGET')).toBe(false);

    const bingx = configs.find((c) => c.exchange === 'EXCHANGE_BINGX');
    expect(bingx).toBeDefined();
    expect(bingx?.attributionType).toBe(ATTRIBUTION_TYPE.HTTP_HEADER);
    expect(bingx?.rebateRateBps).toBe(4500); // 45%
    expect(bingx?.isKmsSealed).toBe(true);

    const hl = configs.find((c) => c.exchange === 'EXCHANGE_HYPERLIQUID');
    expect(hl).toBeDefined();
    expect(hl?.attributionType).toBe(ATTRIBUTION_TYPE.BUILDER_TAG);
    expect(hl?.rebateRateBps).toBe(10); // 0.1%

    const binance = configs.find((c) => c.exchange === 'EXCHANGE_BINANCE_SPOT');
    expect(binance).toBeDefined();
    expect(binance?.attributionType).toBe('ATTRIBUTION_TYPE_CLIENT_ORDER_ID_PREFIX');
  });

  it('retrieves specific broker config by exchange key', async () => {
    const bingx = await adminApi.getBrokerConfig('EXCHANGE_BINGX');
    expect(bingx).toBeDefined();
    expect(bingx?.exchange).toBe('EXCHANGE_BINGX');
    expect(bingx?.status).toBe('BROKER_CONFIG_STATUS_ACTIVE');
  });

  it('updates and seals broker config with version incrementation', async () => {
    const updated = await adminApi.updateBrokerConfig({
      exchange: 'EXCHANGE_BINGX',
      attributionType: ATTRIBUTION_TYPE.HTTP_HEADER,
      rawIdentifier: 'BX-CUSTOM-PROD-KEY-999',
      rawSecret: 'secret_partner_salt',
      status: 'BROKER_CONFIG_STATUS_ACTIVE',
      rebateRateBps: 5000, // 50%
      expectedVersion: 1,
      notes: 'Custom VIP institutional agreement',
      extraParams: { client_order_id_prefix: 'x-VF-' },
    });

    expect(updated.exchange).toBe('EXCHANGE_BINGX');
    expect(updated.maskedIdentifier).toBe('BX-***999');
    expect(updated.isKmsSealed).toBe(true);
    expect(updated.rebateRateBps).toBe(5000);
    expect(updated.version).toBeGreaterThan(1);
    expect(updated.notes).toBe('Custom VIP institutional agreement');
  });

  it('executes dry-run attribution ping test satisfying <1μs requirement', async () => {
    const res = await adminApi.testBrokerAttribution({
      exchange: 'EXCHANGE_BINGX',
      testOrderId: 'TEST-ORD-001',
    });

    expect(res.success).toBe(true);
    expect(res.attributedOrderId).toBe('x-VF-TEST-ORD-001');
    expect(res.injectedHeaders?.['X-SOURCE-KEY']).toBe('BX-AI-SKILL');
    expect(res.attributionLatencyNanos).toBeLessThan(1000); // <1000 ns = <1μs
  });

  it('updates and seals Hyperliquid builder fee config with EVM address and BPS limits', async () => {
    const evmAddress = '0x1122334455667788990011223344556677889900';
    const updated = await adminApi.updateBrokerConfig({
      exchange: 'EXCHANGE_HYPERLIQUID',
      attributionType: ATTRIBUTION_TYPE.BUILDER_TAG,
      rawIdentifier: evmAddress,
      payoutAddress: evmAddress,
      status: 'BROKER_CONFIG_STATUS_ACTIVE',
      rebateRateBps: 10, // 10 bps (0.10% protocol max)
      rebatePercentage: 0.1,
      expectedVersion: 1,
      notes: 'Cold Multisig 3/5 Arbitrum Vault',
      extraParams: { builder: evmAddress, fee: '10' },
    });

    expect(updated.exchange).toBe('EXCHANGE_HYPERLIQUID');
    expect(updated.attributionType).toBe(ATTRIBUTION_TYPE.BUILDER_TAG);
    expect(updated.payoutAddress).toBe(evmAddress);
    expect(updated.rebateRateBps).toBe(10);
    expect(updated.extraParams?.['builder']).toBe(evmAddress);
    expect(updated.extraParams?.['fee']).toBe('10');
    expect(updated.isKmsSealed).toBe(true);
  });

  it('executes Hyperliquid dry-run attribution ping validating on-chain builder parameters', async () => {
    const res = await adminApi.testBrokerAttribution({
      exchange: 'EXCHANGE_HYPERLIQUID',
      testOrderId: 'HL-ORD-776655',
    });

    expect(res.success).toBe(true);
    expect(res.injectedParams?.['builder']).toBeDefined();
    expect(res.injectedParams?.['fee']).toBe('10');
    expect(res.attributionLatencyNanos).toBeLessThan(1000); // <1μs SLA
  });

  it('retrieves public exchange configs with Cloud NAT egress IPs (6 venues)', async () => {
    const publicConfigs = await adminApi.getPublicExchangeConfigs();
    expect(publicConfigs.length).toBe(6);
    expect(publicConfigs.some((c) => (c.exchange as string) === 'EXCHANGE_BITGET')).toBe(false);

    const bingx = publicConfigs.find((c) => c.exchange === 'EXCHANGE_BINGX');
    expect(bingx).toBeDefined();
    expect(bingx?.portalUrl).toContain('bingx.com');
    expect(bingx?.staticNatIps).toContain('34.118.24.10');
    expect(bingx?.staticNatIps).toContain('34.118.24.11');
  });

  it('synchronizes successful API response into localStorage cache', async () => {
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

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vf_admin_broker_configs');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored!);
      const binance = parsed.find((c: any) => c.exchange === 'EXCHANGE_BINANCE_SPOT');
      expect(binance?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_TERMINATED');
    }
  });

  it('persists TERMINATED lifecycle status across reloads and merges with canonical baseline', async () => {
    const mockConfigs = [
      {
        id: 'cfg_binance_1',
        exchange: 'binance',
        is_active: false,
        lifecycle_status: 'VENUE_LIFECYCLE_STATUS_TERMINATED',
        sunset_notice: 'Decommissioned by operator',
        version: 3,
        rebate_percentage: 0.3,
      },
      {
        id: 'cfg_hyperliquid_1',
        exchange: 'hyperliquid',
        is_active: true,
        lifecycle_status: 'VENUE_LIFECYCLE_STATUS_ACTIVE',
        version: 1,
        rebate_percentage: 0.1,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ configs: mockConfigs }),
    } as Response);

    const configs = await adminApi.getBrokerConfigs();
    expect(configs.length).toBe(6);

    const binance = configs.find((c) => c.exchange === 'EXCHANGE_BINANCE_SPOT');
    expect(binance).toBeDefined();
    expect(binance?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_TERMINATED');
    expect(binance?.status).toBe('BROKER_CONFIG_STATUS_INACTIVE');

    const hl = configs.find((c) => c.exchange === 'EXCHANGE_HYPERLIQUID');
    expect(hl).toBeDefined();
    expect(hl?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_ACTIVE');

    const bybit = configs.find((c) => c.exchange === 'EXCHANGE_BYBIT');
    expect(bybit).toBeDefined();
    expect(bybit?.lifecycleStatus).toBe('VENUE_LIFECYCLE_STATUS_ACTIVE');
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
