'use client';

import * as React from 'react';
import { adminApi, FleetBot } from '@/services/adminApi';
import { describeAdminError } from '@/services/adminApiError';
import { Bot } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  InstitutionalEmptyState,
  Skeleton,
} from '@creatortsv/pkg-ui';

/**
 * No `adminApi` operation stops a bot on the supervisor's behalf, so the commands are shown as
 * unavailable. The console never changes a bot's status or reports a command it did not send.
 * [Policy Ref: Contract §2.1 - no fake success; TFT INV-14 - stop and divergence actions are never simulated]
 */
const BOT_COMMANDS_UNAVAILABLE = 'Supervisor commands are not available in the admin console: the admin API has no bot stop operation.' as const;

const EXCHANGE_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  BINANCE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Binance' },
  BYBIT: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Bybit V5' },
  BINGX: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', label: 'BingX' },
  GMX_V2: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'GMX v2' },
};

export default function BotsFleetPage() {
  // null while the backend has not answered yet (loading state)
  const [bots, setBots] = React.useState<FleetBot[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedExchange, setSelectedExchange] = React.useState<string>('ALL');

  React.useEffect(() => {
    adminApi
      .getFleetBots()
      .then(setBots)
      .catch((err: unknown) => setError(describeAdminError(err)));
  }, []);

  const filteredBots = (bots ?? []).filter((b) => {
    if (selectedExchange === 'ALL') return true;
    const ex = (b.exchange || 'BINANCE').toUpperCase();
    return ex === selectedExchange;
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" />
            Bot Fleet Supervisor Cockpit
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cluster-wide bot oversight with goroutine isolation. Bot status is shown exactly as the backend reports it.
          </p>
        </div>

        {/* Multi-Exchange Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-[#1E293B] text-xs font-mono">
          {[
            { id: 'ALL', label: 'All Exchanges' },
            { id: 'BINANCE', label: 'Binance' },
            { id: 'BYBIT', label: 'Bybit' },
            { id: 'BINGX', label: 'BingX' },
            { id: 'GMX_V2', label: 'GMX v2' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedExchange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold ${
                selectedExchange === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {error !== null ? (
        <Alert variant="destructive" className="border-rose-500/40 bg-rose-950/40 text-rose-300">
          <AlertTitle>Fleet bots could not be loaded</AlertTitle>
          <AlertDescription className="text-rose-200 font-mono">{error}</AlertDescription>
        </Alert>
      ) : bots === null ? (
        <div className="space-y-3">
          {[0, 1, 2].map((slot) => (
            <Skeleton key={slot} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : filteredBots.length === 0 ? (
        <InstitutionalEmptyState
          icon={(props: { className?: string }) => <Bot className={props.className} />}
          badge="SUPERVISOR IDLE"
          title="No Active Cluster Bots"
          description="Zero quantitative trading bots are currently running in the cluster. Deployed bots across all exchange adapters will appear here."
        />
      ) : (
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] overflow-hidden">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#070A12] border-b border-[#1E293B] text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Bot Label</th>
                <th className="py-3.5 px-4">Exchange</th>
                <th className="py-3.5 px-4">Strategy</th>
                <th className="py-3.5 px-4">Pair</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Orders</th>
                <th className="py-3.5 px-4">Unrealized PnL</th>
                <th className="py-3.5 px-4 text-right">Supervisor Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {filteredBots.map((b) => {
                const ex = (b.exchange || 'BINANCE').toUpperCase();
                const badge = EXCHANGE_BADGES[ex] || EXCHANGE_BADGES.BINANCE;

                return (
                  <tr key={b.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{b.label}</div>
                      <div className="text-[10px] text-slate-500">{b.id} &bull; {b.userId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                      >
                        {badge.label}
                      </span>
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
                      <span title={BOT_COMMANDS_UNAVAILABLE} className="inline-block">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled
                          className="bg-amber-950/40 text-amber-300 border-amber-500/30 text-[11px] disabled:opacity-30"
                        >
                          Soft Stop
                        </Button>
                      </span>
                      <span title={BOT_COMMANDS_UNAVAILABLE} className="inline-block">
                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          disabled
                          className="bg-rose-950/40 text-rose-300 border-rose-500/30 text-[11px] disabled:opacity-30"
                        >
                          Hard Cancel
                        </Button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-3 border-t border-[#1E293B] text-[11px] text-slate-400">{BOT_COMMANDS_UNAVAILABLE}</p>
        </div>
      )}
    </div>
  );
}
