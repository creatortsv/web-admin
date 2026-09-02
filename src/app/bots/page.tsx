'use client';

import * as React from 'react';
import { adminApi, FleetBot } from '@/services/adminApi';
import { Bot, AlertOctagon, PauseCircle, PlayCircle, ShieldAlert } from 'lucide-react';

export default function BotsFleetPage() {
  const [bots, setBots] = React.useState<FleetBot[]>([]);

  React.useEffect(() => {
    adminApi.getFleetBots().then(setBots);
  }, []);

  const handleAction = (botId: string, action: 'SOFT_STOP' | 'HARD_STOP') => {
    const isHard = action === 'HARD_STOP';
    if (confirm(`${isHard ? 'EMERGENCY CANCEL ALL ORDERS' : 'SOFT STOP'}: Apply to bot ${botId}?`)) {
      setBots((prev) =>
        prev.map((b) =>
          b.id === botId
            ? { ...b, status: isHard ? 'STOPPED' : 'SOFT_STOPPING' }
            : b
        )
      );
      alert(`Bot ${botId} received command: ${action}`);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
          <Bot className="h-6 w-6 text-emerald-400" />
          Bot Fleet Supervisor Cockpit
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Cluster-wide bot oversight with goroutine isolation. Execute Soft Stop (wait for grid cycle finish) or Hard Emergency Stop (immediate order cancellation).
        </p>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] overflow-hidden">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-[#070A12] border-b border-[#1E293B] text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3.5 px-4">Bot Label</th>
              <th className="py-3.5 px-4">Strategy</th>
              <th className="py-3.5 px-4">Pair</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Orders</th>
              <th className="py-3.5 px-4">Unrealized PnL</th>
              <th className="py-3.5 px-4 text-right">Supervisor Commands</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {bots.map((b) => (
              <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-bold text-white">{b.label}</div>
                  <div className="text-[10px] text-slate-500">{b.id} &bull; {b.userId}</div>
                </td>
                <td className="py-3.5 px-4 text-slate-300">{b.strategy}</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">{b.symbol}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      b.status === 'RUNNING'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : b.status === 'SOFT_STOPPING'
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-900 text-slate-400 border border-[#1E293B]'
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-300">{b.activeOrders} L2 orders</td>
                <td className="py-3.5 px-4 text-emerald-400 font-bold">+${b.unrealizedPnlUsd.toFixed(2)}</td>
                <td className="py-3.5 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, 'SOFT_STOP')}
                    disabled={b.status !== 'RUNNING'}
                    className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[11px] transition-colors cursor-pointer disabled:opacity-30"
                  >
                    Soft Stop
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(b.id, 'HARD_STOP')}
                    disabled={b.status === 'STOPPED'}
                    className="px-2.5 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-[11px] transition-colors cursor-pointer disabled:opacity-30"
                  >
                    Hard Cancel
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
