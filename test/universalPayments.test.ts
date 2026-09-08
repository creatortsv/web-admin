import { describe, it, expect } from 'vitest';
import { adminApi } from '../src/services/adminApi';

describe('Universal Payment Gateway Admin API', () => {
  it('lists universal payment gateways', async () => {
    const gateways = await adminApi.listUniversalGateways();
    expect(gateways.length).toBeGreaterThan(0);
    const stripe = gateways.find((g) => g.name === 'stripe');
    expect(stripe).toBeDefined();
    expect(stripe?.type).toBe('FIAT_CARD');
  });

  it('retrieves universal gateway configuration with defaults', async () => {
    const config = await adminApi.getUniversalGatewayConfig('stripe', 'TEST');
    expect(config.gatewayName).toBe('stripe');
    expect(config.environment).toBe('TEST');
    expect(config.webhookUrl).toBe('/v1/billing/webhooks/stripe');
    expect(config.planPriceMappings).toHaveProperty('PRO');
  });

  it('updates gateway configuration and masks secrets', async () => {
    const result = await adminApi.updateUniversalGatewayConfig({
      gatewayName: 'stripe',
      environment: 'TEST',
      isEnabled: true,
      publicKey: 'pk_test_sample',
      secretKey: 'sk_test_1234567890abcdef',
      webhookSecret: 'whsec_sample_secret_12345',
      planPriceMappings: {
        PRO_MONTHLY: 'price_pro_test',
        ENTERPRISE_MONTHLY: 'price_ent_test',
      },
      rotateExisting: true,
    });

    expect(result.config.isSealed).toBe(true);
    expect(result.config.maskedSecretKey).toBe('******cdef');
    expect(result.config.maskedWebhookSecret).toBe('whsec_******');
    expect(result.config.planPriceMappings.PRO_MONTHLY).toBe('price_pro_test');
  });

  it('tests gateway connection successfully', async () => {
    const res = await adminApi.testGatewayConnection('stripe', 'TEST', 'sk_test_mock');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Stripe API connection verified');
  });
});
