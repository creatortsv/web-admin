import { describe, it, expect, beforeEach } from 'vitest';
import { adminApi, INITIAL_VAULTS, TreasuryVault } from '../src/services/adminApi';

describe('Treasury Vaults Admin Control Plane API', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  it('retrieves default treasury vaults when backend or storage is initial', async () => {
    const vaults = await adminApi.getTreasuryVaults();
    expect(vaults.length).toBe(INITIAL_VAULTS.length);
    const trc20 = vaults.find((v) => v.chain.includes('TRC20'));
    expect(trc20).toBeDefined();
    expect(trc20?.asset).toBe('USDT');
    expect(trc20?.receivingAddress).toMatch(/^T[a-zA-Z0-9]{33}$/);
    expect(trc20?.sweepThresholdUsd).toBe(2500);
  });

  it('saves and persists updated treasury vault configuration', async () => {
    const updatedVault: TreasuryVault = {
      ...INITIAL_VAULTS[0],
      sweepThresholdUsd: 4000,
      minDepositUsd: 25,
      receivingAddress: 'TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nNEW',
    };

    const saved = await adminApi.saveTreasuryVault(updatedVault);
    expect(saved.sweepThresholdUsd).toBe(4000);
    expect(saved.minDepositUsd).toBe(25);
    expect(saved.receivingAddress).toBe('TLv9nSmL1VemB31bN5k3z9fH8E8qZ1v9nNEW');

    const list = await adminApi.getTreasuryVaults();
    const found = list.find((v) => v.id === updatedVault.id);
    expect(found?.sweepThresholdUsd).toBe(4000);
    expect(found?.minDepositUsd).toBe(25);
  });

  it('triggers on-demand cold storage sweep successfully', async () => {
    const res = await adminApi.triggerSweep('vault-trc20');
    expect(res.success).toBe(true);
    expect(res.sweepId).toBeDefined();
    expect(res.message).toContain('Cold storage sweep initiated successfully');
  });
});
