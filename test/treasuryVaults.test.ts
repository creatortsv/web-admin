import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adminApi, TreasuryVault } from '../src/services/adminApi';
import {
  GRPC_CODE_PERMISSION_DENIED,
  REASON_ADMIN_ROUTES_DISABLED,
  expectAdminRejection,
  expectNoDataStorageAccess,
  stubBackendError,
  stubBrowserStorage,
} from './support/adminBackend';

describe('Treasury Vaults Admin Control Plane API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects reading the vaults with the backend error and returns no local data', async () => {
    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.getTreasuryVaults(), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);
  });

  it('rejects saving a vault with the backend error and persists nothing', async () => {
    const newVault: TreasuryVault = {
      id: 'vault-trc20',
      chain: 'Tron (TRC20)',
      asset: 'USDT',
      receivingAddress: 'TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nNEW',
      coldSweepAddress: 'TXYZop93kLmP19vN43qZ9fH8E8qZ1vColdSafe',
      minDepositUsd: 25,
      sweepThresholdUsd: 4000,
      currentBalanceUsd: 0,
      isActive: true,
      updatedAt: new Date().toISOString(),
    };

    const storage = stubBrowserStorage();
    stubBackendError(403, GRPC_CODE_PERMISSION_DENIED, REASON_ADMIN_ROUTES_DISABLED);
    await expectAdminRejection(adminApi.saveTreasuryVault(newVault), 403, REASON_ADMIN_ROUTES_DISABLED);
    expectNoDataStorageAccess(storage);

    await expectAdminRejection(adminApi.getTreasuryVaults(), 403, REASON_ADMIN_ROUTES_DISABLED);
  });

  it('triggers on-demand cold storage sweep successfully via backend API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          sweepId: 'swp-test-001',
          txHash: '0x99238128318239129381293812938123',
          message: 'Cold storage sweep initiated successfully',
        }),
      })
    );

    const res = await adminApi.triggerSweep('vault-trc20');
    expect(res.success).toBe(true);
    expect(res.sweepId).toBe('swp-test-001');
    expect(res.txHash).toBe('0x99238128318239129381293812938123');
    expect(res.message).toContain('Cold storage sweep initiated successfully');
  });

  it('throws error when sweep fails on backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: 'KMS signer unavailable' }),
      })
    );

    await expect(adminApi.triggerSweep('vault-trc20')).rejects.toThrow('KMS signer unavailable');
  });
});
