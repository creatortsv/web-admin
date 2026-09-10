'use client';

import * as React from 'react';
import { adminApi, DivergentOrder } from '@/services/adminApi';
import {
  GitCompare,
  RefreshCw,
  XCircle,
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
  Clock,
  ShieldAlert,
} from 'lucide-react';

const EXCHANGE_BADGES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  BINANCE: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Binance' },
  BYBIT: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Bybit V5' },
  BINGX: { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30', label: 'BingX' },
  GMX_V2: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', label: 'GMX v2' },
};

export default function DivergentOrdersPage() {
  const [orders, setOrders] = React.useState<DivergentOrder[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [filterType, setFilterType] = React.useState<string>('ALL');
  const [selectedExchange, setSelectedExchange] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [actionMessage, setActionMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getDivergentOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load divergent orders', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSync = async (orderId: string) => {
    try {
      const res = await adminApi.syncDivergentOrder(orderId);
      setActionMessage({ text: res.message, type: 'success' });
      fetchOrders();
    } catch (err) {
      setActionMessage({ text: `Sync failed: ${err}`, type: 'error' });
    }
  };

  const handleForceCancel = async (orderId: string) => {
    if (!confirm(`Force cancel order ${orderId} on exchange? This will clear resting exchange orders.`)) {
      return;
    }
    try {
      const res = await adminApi.forceCancelDivergentOrder(orderId);
      setActionMessage({ text: res.message, type: 'success' });
      fetchOrders();
    } catch (err) {
      setActionMessage({ text: `Cancellation failed: ${err}`, type: 'error' });
    }
  };

  const handleDeclareAbandoned = async (orderId: string) => {
    if (!confirm(`Declare order ${orderId} abandoned? This releases local position locks and marks terminal.`)) {
      return;
    }
    try {
      const res = await adminApi.declareAbandonedOrder(orderId);
      setActionMessage({ text: res.message, type: 'success' });
      fetchOrders();
    } catch (err) {
      setActionMessage({ text: `Abandon action failed: ${err}`, type: 'error' });
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedExchange !== 'ALL') {
      const ex = (o.exchange || 'BINANCE').toUpperCase();
      if (ex !== selectedExchange) return false;
    }
    if (filterType !== 'ALL' && o.discrepancyType !== filterType) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.clientOrderId.toLowerCase().includes(q) ||
        o.userId.toLowerCase().includes(q) ||
        o.symbol.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const ghostFillsCount = orders.filter((o) => o.discrepancyType === 'GHOST_FILL').length;
  const inFlightCount = orders.filter((o) => o.localStatus === 'IN_FLIGHT_UNKNOWN').length;

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <GitCompare className="h-6 w-6 text-rose-500" />
            Divergent Orders Reconciliation Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile state mismatches, detect ghost fills across all exchanges (Binance, Bybit, BingX, GMX v2), and execute operator interventions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#0D1322]">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Divergences</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{orders.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Requiring operator oversight</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10">
          <div className="text-[11px] font-mono text-amber-400 uppercase">In-Flight Unknown</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">{inFlightCount}</div>
          <div className="text-[10px] text-amber-400/70 mt-1">Pending submission or network timeout</div>
        </div>
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10">
          <div className="text-[11px] font-mono text-rose-400 uppercase">Ghost Fills Detected</div>
          <div className="text-2xl font-bold font-mono text-rose-300 mt-1">{ghostFillsCount}</div>
          <div className="text-[10px] text-rose-400/70 mt-1">Filled on exchange without local fill record</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Multi-Exchange Sweeper</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">ACTIVE</div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Binance, Bybit, BingX, GMX v2</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="space-y-3 p-3 rounded-xl border border-slate-800/80 bg-[#0D1322]">
        {/* Exchange Filter Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
            <span className="text-slate-500 text-[11px] uppercase mr-1">Exchange:</span>
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
                className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-xs font-semibold ${
                  selectedExchange === tab.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search orderId, user, symbol..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#070A12] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500/50"
            />
          </div>
        </div>

        {/* Discrepancy Type Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-slate-500 text-[11px] uppercase mr-1">Discrepancy:</span>
          {['ALL', 'GHOST_FILL', 'IN_FLIGHT_TIMEOUT', 'STATE_MISMATCH'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap text-xs ${
                filterType === t
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {t.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#070A12] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Order Identification</th>
                <th className="py-3 px-4">Exchange</th>
                <th className="py-3 px-4">Pair / Side</th>
                <th className="py-3 px-4">Price / Qty</th>
                <th className="py-3 px-4">Local DB Status</th>
                <th className="py-3 px-4">Exchange Status</th>
                <th className="py-3 px-4">Discrepancy</th>
                <th className="py-3 px-4 text-right">Operator Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No divergent orders detected for this exchange filter. All engine and exchange states are fully synchronized.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const ex = (o.exchange || 'BINANCE').toUpperCase();
                  const badge = EXCHANGE_BADGES[ex] || EXCHANGE_BADGES.BINANCE;

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {o.clientOrderId}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          ID: {o.id} &bull; User: {o.userId} {o.botId ? `• Bot: ${o.botId}` : ''}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badge.bg} ${badge.border} ${badge.text}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{o.symbol}</div>
                        <span
                          className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 ${
                            o.side === 'BUY'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {o.side} ({o.orderType})
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white">${o.price}</div>
                        <div className="text-[10px] text-slate-400">{o.quantity} units</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 text-amber-400 border border-amber-500/30">
                          {o.localStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.exchangeStatus === 'FILLED'
                              ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                              : o.exchangeStatus === 'CANCELED'
                              ? 'bg-slate-900 text-slate-400 border border-slate-700'
                              : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {o.exchangeStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-rose-400 font-semibold text-[11px]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {o.discrepancyType}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          Age: {o.divergenceAgeSeconds}s
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSync(o.id)}
                            title={`Query ${badge.label} REST and update local DB state`}
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                          >
                            Query & Sync
                          </button>
                          <button
                            type="button"
                            onClick={() => handleForceCancel(o.id)}
                            title="Send high-priority cancellation to exchange"
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-colors"
                          >
                            Force Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeclareAbandoned(o.id)}
                            title="Mark locally abandoned and release position reservations"
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
                          >
                            Abandon
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
