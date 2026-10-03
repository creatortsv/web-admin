import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adminApi } from '../src/services/adminApi';
import {
  GRPC_CODE_PERMISSION_DENIED,
  REASON_ADMIN_ROUTES_DISABLED,
  StorageOperations,
  expectAdminRejection,
  expectNoDataStorageAccess,
  stubBackendError,
  stubBrowserStorage,
} from './support/adminBackend';

describe('Universal Payment Gateway Admin API', () => {
  let storage: StorageOperations;

  beforeEach(() => {
    storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('rejects listing universal payment gateways with the backend error and invents none', async () => {
    await expectAdminRejection(adminApi.listUniversalGateways(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it('rejects retrieving the gateway configuration with the backend error and invents none', async () => {
    await expectAdminRejection(
      adminApi.getUniversalGatewayConfig('stripe', 'TEST'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });

  it('rejects updating the gateway configuration and does not report a sealed config', async () => {
    await expectAdminRejection(
      adminApi.updateUniversalGatewayConfig({
        gatewayName: 'stripe',
        environment: 'TEST',
        isEnabled: true,
        publicKey: 'test-public-key',
        secretKey: 'test-secret-key',
        webhookSecret: 'test-webhook-secret',
        planPriceMappings: { PRO_MONTHLY: 'price-pro-test' },
        rotateExisting: true,
      }),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });

  it('rejects the gateway connection test and does not report a verified connection', async () => {
    await expectAdminRejection(
      adminApi.testGatewayConnection('stripe', 'TEST', 'test-secret-key'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });
});
