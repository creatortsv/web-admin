import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { adminApi, INITIAL_VAULTS, TreasuryVault, clearMemoryStorage } from '../src/services/adminApi';

describe('Treasury Vaults Admin Control Plane API', () => {
  beforeEach(() => {
    clearMemoryStorage();
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('retrieves empty array by default enforcing zero-mock data invariant', async () => {
    const vaults = await adminApi.getTreasuryVaults();
    expect(vaults).toEqual([]);
    expect(INITIAL_VAULTS).toEqual([]);
  });

  it('saves, retrieves, and persists configured treasury vault', async () => {
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

    const saved = await adminApi.saveTreasuryVault(newVault);
    expect(saved.sweepThresholdUsd).toBe(4000);
    expect(saved.minDepositUsd).toBe(25);
    expect(saved.receivingAddress).toBe('TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nNEW');

    const list = await adminApi.getTreasuryVaults();
    expect(list.length).toBe(1);
    const found = list.find((v) => v.id === newVault.id);
    expect(found?.sweepThresholdUsd).toBe(4000);
    expect(found?.minDepositUsd).toBe(25);
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
