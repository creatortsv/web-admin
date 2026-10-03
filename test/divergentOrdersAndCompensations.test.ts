import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adminApi } from '../src/services/adminApi';
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

describe('Divergent Orders Governance Console', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects reading the divergent orders with the backend error and returns no local data', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.getDivergentOrders(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it('rejects the divergence actions with the real 404 and never simulates an outcome', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(404, GRPC_CODE_NOT_FOUND, REASON_NOT_FOUND);
    await expectAdminRejection(adminApi.syncDivergentOrder('ord-div-001'), 404, REASON_NOT_FOUND);
    await expectAdminRejection(adminApi.forceCancelDivergentOrder('ord-div-002'), 404, REASON_NOT_FOUND);
    await expectAdminRejection(adminApi.declareAbandonedOrder('ord-div-003'), 404, REASON_NOT_FOUND);
    expectNoDataStorageAccess(storage);
  });

  it('synchronizes a divergent order with exchange state', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          updatedStatus: 'FILLED',
          message: 'Order ord-div-001 synchronized with exchange state: FILLED',
        }),
      })
    );

    const res = await adminApi.syncDivergentOrder('ord-div-001');
    expect(res.success).toBe(true);
    expect(res.updatedStatus).toBe('FILLED');
    expect(res.message).toContain('synchronized');
  });

  it('dispatches force cancellation on divergent order', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Emergency cancellation sent to exchange for ord-div-002',
        }),
      })
    );

    const res = await adminApi.forceCancelDivergentOrder('ord-div-002');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Emergency cancellation sent');
  });

  it('declares an order abandoned to release risk locks', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          message: 'Order ord-div-003 declared abandoned. Risk locks released.',
        }),
      })
    );

    const res = await adminApi.declareAbandonedOrder('ord-div-003');
    expect(res.success).toBe(true);
    expect(res.message).toContain('declared abandoned');
  });
});

describe('Maker-Checker Compensation Governance', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects reading the claims with the backend error and returns no local data', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.getCompensationClaims(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it('rejects creating a claim with the backend error and stores no claim', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.createCompensationClaim(
        {
          incidentId: 'INC-2026-09-099',
          userId: 'usr_algo_88',
          amountCents: 25000,
          reason: 'Execution drift exceeding 75 bps during altcoin market volatility spike',
          evidencePayload: JSON.stringify({ drift_bps: 85, symbol: 'DOGEUSDT' }),
        },
        'ops-maker-support',
      ),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
    await expectAdminRejection(
      adminApi.getCompensationClaims('PENDING_APPROVAL'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
  });

  it('rejects an approval with the backend error and credits no balance', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.approveCompensationClaim('claim-1', 'finance-checker-lead'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });

  it('rejects a self-approval attempt with the backend error instead of a local maker-checker rule', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.approveCompensationClaim('claim-1', 'ops-maker-support'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });

  it('rejects a rejection with the backend error and decides no claim locally', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(
      adminApi.rejectCompensationClaim('claim-1', 'lead-checker-02', 'Inconclusive logs'),
      403,
      REASON_ADMIN_ROUTES_DISABLED,
    );
    expectNoDataStorageAccess(storage);
  });
});
