import { describe, it, expect, beforeEach } from 'vitest';
import { adminApi, INITIAL_DIVERGENT_ORDERS, INITIAL_COMPENSATIONS } from '../src/services/adminApi';

describe('Divergent Orders Governance Console', () => {
  it('retrieves divergent orders with discrepancy types', async () => {
    const orders = await adminApi.getDivergentOrders();
    expect(orders.length).toBeGreaterThan(0);
    const ghostFill = orders.find((o) => o.discrepancyType === 'GHOST_FILL');
    expect(ghostFill).toBeDefined();
    expect(ghostFill?.symbol).toBe('BTCUSDT');
    expect(ghostFill?.localStatus).toBe('IN_FLIGHT_UNKNOWN');
    expect(ghostFill?.exchangeStatus).toBe('FILLED');
  });

  it('synchronizes a divergent order with exchange state', async () => {
    const res = await adminApi.syncDivergentOrder('ord-div-001');
    expect(res.success).toBe(true);
    expect(res.updatedStatus).toBe('FILLED');
    expect(res.message).toContain('synchronized');
  });

  it('dispatches force cancellation on divergent order', async () => {
    const res = await adminApi.forceCancelDivergentOrder('ord-div-002');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Emergency cancellation sent');
  });

  it('declares an order abandoned to release risk locks', async () => {
    const res = await adminApi.declareAbandonedOrder('ord-div-003');
    expect(res.success).toBe(true);
    expect(res.message).toContain('declared abandoned');
  });
});

describe('Maker-Checker Compensation Governance', () => {
  it('lists existing compensation claims with status filtering', async () => {
    const allClaims = await adminApi.getCompensationClaims();
    expect(allClaims.length).toBeGreaterThanOrEqual(2);

    const pendingClaims = await adminApi.getCompensationClaims('PENDING_APPROVAL');
    expect(pendingClaims.every((c) => c.status === 'PENDING_APPROVAL')).toBe(true);

    const approvedClaims = await adminApi.getCompensationClaims('APPROVED');
    expect(approvedClaims.every((c) => c.status === 'APPROVED')).toBe(true);
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
  });

  it('strictly enforces Maker-Checker segregation (Maker cannot approve own claim)', async () => {
    const claims = await adminApi.getCompensationClaims('PENDING_APPROVAL');
    const claim = claims[0];
    expect(claim).toBeDefined();

    // Maker attempting to approve their own claim must fail
    await expect(
      adminApi.approveCompensationClaim(claim.id, claim.createdByAdminId)
    ).rejects.toThrow('Maker-Checker violation');
  });

  it('allows independent Checker to approve claim and credit user balance', async () => {
    const claims = await adminApi.getCompensationClaims('PENDING_APPROVAL');
    const claim = claims[0];
    expect(claim).toBeDefined();

    const checkerId = 'finance-checker-lead';
    expect(claim.createdByAdminId).not.toBe(checkerId);

    const result = await adminApi.approveCompensationClaim(claim.id, checkerId);
    expect(result.claim.status).toBe('APPROVED');
    expect(result.claim.approvedByAdminId).toBe(checkerId);
    expect(result.newBalanceCents).toBeGreaterThan(0);
    expect(result.message).toContain('Claim approved');
  });

  it('allows independent Checker to reject claim with reason', async () => {
    // Create a new claim to reject
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
