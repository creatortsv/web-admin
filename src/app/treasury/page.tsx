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
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-sans tracking-tight flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(0,245,155,0.2)]">
            <Wallet className="h-5 w-5" />
          </div>
          Multi-Chain Treasury Vaults
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Configure platform receiving addresses, minimum deposit limits, and cold storage multi-sig sweep thresholds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Vaults List */}
        <div className="lg:col-span-7 space-y-4">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              onClick={() => setEditingVault({ ...vault })}
              className={`glass-card glass-card-hover rounded-2xl p-6 cursor-pointer transition-all ${
                editingVault?.id === vault.id
                  ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(0,245,155,0.18)] ring-1 ring-emerald-500/30'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,245,155,0.6)]" />
                  <span className="font-bold text-base text-white font-mono">{vault.chain}</span>
                  <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-mono text-emerald-300 font-bold">
                    {vault.asset}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerSweep(vault);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-mono font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  <ArrowDownToLine className="h-3.5 w-3.5 text-cyan-400" />
                  Sweep Cold Safe
                </button>
              </div>

              <div className="mt-5 space-y-2 font-mono text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Receiving Address:</span>
                  <span className="text-slate-200 truncate max-w-[280px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
                    {vault.receivingAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Cold Multi-Sig Target:</span>
                  <span className="text-slate-300 truncate max-w-[280px] bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/80">
                    {vault.coldSweepAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300 pt-3 border-t border-slate-800/80">
                  <span className="font-semibold font-sans text-xs uppercase tracking-wider">Vault Balance:</span>
                  <span className="text-emerald-400 font-bold text-base sm:text-lg">${vault.currentBalanceUsd.toFixed(2)} USD</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vault Edit Panel */}
        <div className="lg:col-span-5 glass-card rounded-2xl border-slate-800/80 p-6 sm:p-7 shadow-xl">
          <h3 className="text-sm sm:text-base font-bold text-white font-mono uppercase tracking-wider mb-6 flex items-center justify-between">
            <span>Vault Configuration</span>
            {editingVault && (
              <span className="text-xs font-mono font-semibold text-emerald-400 px-2.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30">
                Editing
              </span>
            )}
          </h3>

          {editingVault ? (
            <form onSubmit={handleSave} className="space-y-5 font-mono text-xs sm:text-sm">
              <div>
                <label className="block text-slate-300 mb-1.5 font-sans font-semibold">Chain & Asset</label>
                <div className="px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 font-bold">
                  {editingVault.chain} — {editingVault.asset}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-sans font-semibold">Deposit Receiving Address</label>
                <input
                  type="text"
                  value={editingVault.receivingAddress}
                  onChange={(e) =>
                    setEditingVault({ ...editingVault, receivingAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1.5 font-sans font-semibold">Cold Multi-Sig Sweep Address</label>
                <input
                  type="text"
                  value={editingVault.coldSweepAddress}
                  onChange={(e) =>
                    setEditingVault({ ...editingVault, coldSweepAddress: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 mb-1.5 font-sans font-semibold">Min Deposit ($)</label>
                  <input
                    type="number"
                    value={editingVault.minDepositUsd}
                    onChange={(e) =>
                      setEditingVault({
                        ...editingVault,
                        minDepositUsd: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1.5 font-sans font-semibold">Sweep Limit ($)</label>
                  <input
                    type="number"
                    value={editingVault.sweepThresholdUsd}
                    onChange={(e) =>
                      setEditingVault({
                        ...editingVault,
                        sweepThresholdUsd: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-6 flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(0,245,155,0.35)] cursor-pointer"
              >
                {saveSuccess ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                {saveSuccess ? 'Vault Configuration Saved' : 'Save Vault Configuration'}
              </button>
            </form>
          ) : (
            <div className="text-center py-16 text-slate-400 text-sm">
              Select a vault on the left to edit configuration.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
