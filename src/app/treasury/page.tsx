'use client';

import * as React from 'react';
import { adminApi, TreasuryVault } from '@/services/adminApi';
import { Wallet, Save, ArrowDownToLine, Check, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function TreasuryPage() {
  const [vaults, setVaults] = React.useState<TreasuryVault[]>([]);
  const [editingVault, setEditingVault] = React.useState<TreasuryVault | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  React.useEffect(() => {
    adminApi.getTreasuryVaults().then(setVaults);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVault) return;

    await adminApi.saveTreasuryVault(editingVault);
    setVaults((prev) => prev.map((v) => (v.id === editingVault.id ? editingVault : v)));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleTriggerSweep = (vault: TreasuryVault) => {
    if (confirm(`Trigger automated cold storage sweep for ${vault.chain} (${vault.asset}) to ${vault.coldSweepAddress}?`)) {
      alert(`Cold storage sweep initiated for $${vault.currentBalanceUsd} USD.`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
          <Wallet className="h-6 w-6 text-emerald-400" />
          Multi-Chain Treasury Vaults
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure platform receiving addresses, minimum deposit limits, and cold storage multi-sig sweep thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Vaults List */}
        <div className="lg:col-span-7 space-y-4">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              onClick={() => setEditingVault({ ...vault })}
              className={`rounded-xl border p-5 bg-[#0D1322] cursor-pointer transition-all ${
                editingVault?.id === vault.id
                  ? 'border-emerald-500 shadow-[0_0_15px_rgba(0,245,155,0.15)]'
                  : 'border-[#1E293B] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <span className="font-bold text-sm text-white font-mono">{vault.chain}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-[#1E293B] text-[11px] font-mono text-emerald-300 font-bold">
                    {vault.asset}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerSweep(vault);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-[#1E293B] text-[11px] font-mono transition-colors"
                >
                  <ArrowDownToLine className="h-3 w-3 text-cyan-400" />
                  Sweep Cold Safe
                </button>
              </div>

              <div className="mt-4 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Receiving Address:</span>
                  <span className="text-slate-200 truncate max-w-[240px]">{vault.receivingAddress}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cold Multi-Sig Target:</span>
                  <span className="text-slate-300 truncate max-w-[240px]">{vault.coldSweepAddress}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-2 border-t border-[#1E293B]/60">
                  <span>Vault Current Balance:</span>
                  <span className="text-emerald-400 font-bold">${vault.currentBalanceUsd.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vault Edit Panel */}
        <div className="lg:col-span-5 rounded-xl border border-[#1E293B] bg-[#0D1322] p-6">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
            Vault Configuration
          </h3>

          {editingVault ? (
            <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Chain & Asset</label>
                <div className="px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-slate-300 font-bold">
                  {editingVault.chain} — {editingVault.asset}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Deposit Receiving Address</label>
                <input
                  type="text"
                  value={editingVault.receivingAddress}
                  onChange={(e) =>
                    setEditingVault({ ...editingVault, receivingAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Cold Multi-Sig Sweep Address</label>
                <input
                  type="text"
                  value={editingVault.coldSweepAddress}
                  onChange={(e) =>
                    setEditingVault({ ...editingVault, coldSweepAddress: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={editingVault.minDepositUsd}
                    onChange={(e) =>
                      setEditingVault({
                        ...editingVault,
                        minDepositUsd: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sweep Limit ($)</label>
                  <input
                    type="number"
                    value={editingVault.sweepThresholdUsd}
                    onChange={(e) =>
                      setEditingVault({
                        ...editingVault,
                        sweepThresholdUsd: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded bg-[#070A12] border border-[#1E293B] text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-colors cursor-pointer"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saveSuccess ? 'Vault Updated' : 'Save Vault Configuration'}
              </button>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              Select a vault on the left to edit configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
