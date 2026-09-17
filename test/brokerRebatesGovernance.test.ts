import { describe, it, expect, beforeEach } from 'vitest';
import { adminApi, INITIAL_BROKER_CONFIGS, INITIAL_PUBLIC_EXCHANGE_CONFIGS } from '../src/services/adminApi';

describe('Broker & Rebate Governance API', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('lists default broker configs across all supported exchange venues', async () => {
    const configs = await adminApi.getBrokerConfigs();
    expect(configs.length).toBeGreaterThanOrEqual(7);

    const bingx = configs.find((c) => c.exchange === 'EXCHANGE_BINGX');
    expect(bingx).toBeDefined();
    expect(bingx?.attributionType).toBe('ATTRIBUTION_TYPE_SOURCE_KEY_HEADER');
    expect(bingx?.rebateRateBps).toBe(4500); // 45%
    expect(bingx?.isKmsSealed).toBe(true);

    const hl = configs.find((c) => c.exchange === 'EXCHANGE_HYPERLIQUID');
    expect(hl).toBeDefined();
    expect(hl?.attributionType).toBe('ATTRIBUTION_TYPE_BUILDER_FEE');
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
      attributionType: 'ATTRIBUTION_TYPE_SOURCE_KEY_HEADER',
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
    expect(res.injectedHeaders['X-SOURCE-KEY']).toBe('BX-AI-SKILL');
    expect(res.attributionLatencyNanos).toBeLessThan(1000); // <1000 ns = <1μs
  });

  it('retrieves public exchange configs with Cloud NAT egress IPs', async () => {
    const publicConfigs = await adminApi.getPublicExchangeConfigs();
    expect(publicConfigs.length).toBeGreaterThanOrEqual(7);

    const bingx = publicConfigs.find((c) => c.exchange === 'EXCHANGE_BINGX');
    expect(bingx).toBeDefined();
    expect(bingx?.portalUrl).toContain('bingx.com');
    expect(bingx?.staticNatIps).toContain('34.118.24.10');
    expect(bingx?.staticNatIps).toContain('34.118.24.11');
  });
});
