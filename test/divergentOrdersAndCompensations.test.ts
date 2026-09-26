import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adminApi, INITIAL_DIVERGENT_ORDERS, INITIAL_COMPENSATIONS, clearMemoryStorage } from '../src/services/adminApi';

describe('Divergent Orders Governance Console', () => {
  beforeEach(() => {
    clearMemoryStorage();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves empty divergent orders array by default enforcing zero-mock invariant', async () => {
    const orders = await adminApi.getDivergentOrders();
    expect(orders).toEqual([]);
    expect(INITIAL_DIVERGENT_ORDERS).toEqual([]);
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
    clearMemoryStorage();
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('enforces zero-mock invariant on initial compensation claims', async () => {
    const allClaims = await adminApi.getCompensationClaims();
    expect(allClaims).toEqual([]);
    expect(INITIAL_COMPENSATIONS).toEqual([]);
  });

  it('allows Maker to create a new compensation claim', async () => {
    const newClaim = await adminApi.createCompensationClaim(
      {
        incidentId: 'INC-2026-09-099',
        userId: 'usr_algo_88',
        amountCents: 25000, // $250.00
        reason: 'Execution drift exceeding 75 bps during altcoin market volatility spike',
        evidencePayload: JSON.stringify({ drift_bps: 85, symbol: 'DOGEUSDT' }),
      },
      'ops-maker-support'
    );

    expect(newClaim.id).toBeDefined();
    expect(newClaim.status).toBe('PENDING_APPROVAL');
    expect(newClaim.createdByAdminId).toBe('ops-maker-support');
    expect(newClaim.amountCents).toBe(25000);

    const pendingClaims = await adminApi.getCompensationClaims('PENDING_APPROVAL');
    expect(pendingClaims.length).toBe(1);
    expect(pendingClaims[0].id).toBe(newClaim.id);
  });

  it('strictly enforces Maker-Checker segregation (Maker cannot approve own claim)', async () => {
    const claim = await adminApi.createCompensationClaim(
      {
        incidentId: 'INC-2026-09-100',
        userId: 'usr_algo_99',
        amountCents: 10000,
        reason: 'Order reject latency slippage',
      },
      'ops-maker-support'
    );

    // Maker attempting to approve their own claim must fail with 4-Eyes policy violation
    await expect(
      adminApi.approveCompensationClaim(claim.id, claim.createdByAdminId)
    ).rejects.toThrow('Maker-Checker violation');
  });

  it('strictly enforces Maker-Checker segregation (Maker cannot reject own claim)', async () => {
    const claim = await adminApi.createCompensationClaim(
      {
        incidentId: 'INC-2026-09-101',
        userId: 'usr_algo_100',
        amountCents: 12000,
        reason: 'Latency discrepancy',
      },
      'ops-maker-support'
    );

    // Maker attempting to reject their own claim must fail
    await expect(
      adminApi.rejectCompensationClaim(claim.id, claim.createdByAdminId, 'Self reject')
    ).rejects.toThrow('Maker-Checker violation');
  });

  it('allows independent Checker to approve claim and credit user balance', async () => {
    const claim = await adminApi.createCompensationClaim(
      {
        incidentId: 'INC-2026-09-102',
        userId: 'usr_trader_55',
        amountCents: 15000,
        reason: 'System outage during liquidation',
      },
      'ops-maker-support'
    );

    const checkerId = 'finance-checker-lead';
    expect(claim.createdByAdminId).not.toBe(checkerId);

    const result = await adminApi.approveCompensationClaim(claim.id, checkerId);
    expect(result.claim.status).toBe('APPROVED');
    expect(result.claim.approvedByAdminId).toBe(checkerId);
    expect(result.newBalanceCents).toBeGreaterThan(0);
    expect(result.message).toContain('Claim approved');
  });

  it('allows independent Checker to reject claim with reason', async () => {
    const claim = await adminApi.createCompensationClaim(
      {
        incidentId: 'INC-REJECT-001',
        userId: 'usr_reject_test',
        amountCents: 5000,
        reason: 'Testing rejection workflow',
        evidencePayload: '{}',
      },
      'maker-ops-01'
    );

    const checkerId = 'lead-checker-02';
    const result = await adminApi.rejectCompensationClaim(claim.id, checkerId, 'Inconclusive logs');
    expect(result.claim.status).toBe('REJECTED');
    expect(result.claim.rejectionReason).toBe('Inconclusive logs');
    expect(result.message).toContain('Claim rejected');
  });
});
