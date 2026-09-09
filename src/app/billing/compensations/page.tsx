'use client';

import * as React from 'react';
import { adminApi, CompensationClaim, CreateCompensationClaimPayload } from '@/services/adminApi';
import { useAdminAuthStore } from '@/stores/useAdminAuthStore';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  PlusCircle,
  RefreshCw,
  Search,
  DollarSign,
  ShieldCheck,
  FileText,
  Clock,
  UserCheck,
} from 'lucide-react';

export default function CompensationClaimsPage() {
  const { adminEmail } = useAdminAuthStore();
  const [claims, setClaims] = React.useState<CompensationClaim[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [actionMessage, setActionMessage] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal State for New Claim (Maker)
  const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
  const [newIncidentId, setNewIncidentId] = React.useState<string>('');
  const [newUserId, setNewUserId] = React.useState<string>('');
  const [newAmountUsd, setNewAmountUsd] = React.useState<string>('');
  const [newReason, setNewReason] = React.useState<string>('');
  const [newEvidence, setNewEvidence] = React.useState<string>('{\n  "symbol": "BTCUSDT",\n  "lossType": "SLIPPAGE",\n  "deviation_pct": 0.45\n}');
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  // Evidence view modal
  const [activeEvidence, setActiveEvidence] = React.useState<string | null>(null);

  const fetchClaims = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getCompensationClaims();
      setClaims(data);
    } catch (err) {
      console.error('Failed to load compensation claims', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountCents = Math.round(parseFloat(newAmountUsd) * 100);
    if (!newIncidentId || !newUserId || isNaN(amountCents) || amountCents <= 0 || !newReason) {
      alert('Please fill in all required fields with valid values.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateCompensationClaimPayload = {
        incidentId: newIncidentId,
        userId: newUserId,
        amountCents,
        reason: newReason,
        evidencePayload: newEvidence,
      };
      await adminApi.createCompensationClaim(payload, adminEmail || 'ops-maker-support');
      setActionMessage({
        text: `Compensation claim for incident ${newIncidentId} ($${newAmountUsd} USD) registered for Checker review.`,
        type: 'success',
      });
      setIsModalOpen(false);
      setNewIncidentId('');
      setNewUserId('');
      setNewAmountUsd('');
      setNewReason('');
      fetchClaims();
    } catch (err: any) {
      setActionMessage({ text: `Failed to create claim: ${err.message || err}`, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (claim: CompensationClaim) => {
    if (claim.createdByAdminId === adminEmail) {
      setActionMessage({
        text: `Maker-Checker Violation: You (${adminEmail}) created this claim. The Maker cannot approve their own claim. An independent Checker must verify it.`,
        type: 'error',
      });
      return;
    }

    if (!confirm(`Approve claim ${claim.id} and credit $${(claim.amountCents / 100).toFixed(2)} USD to user ${claim.userId}?`)) {
      return;
    }

    try {
      const res = await adminApi.approveCompensationClaim(claim.id, adminEmail || 'finance-lead-checker');
      setActionMessage({ text: res.message, type: 'success' });
      fetchClaims();
    } catch (err: any) {
      setActionMessage({ text: `Approval failed: ${err.message || err}`, type: 'error' });
    }
  };

  const handleReject = async (claim: CompensationClaim) => {
    if (claim.createdByAdminId === adminEmail) {
      setActionMessage({
        text: `Maker-Checker Violation: You (${adminEmail}) created this claim. An independent Checker must reject it.`,
        type: 'error',
      });
      return;
    }

    const reason = prompt(`Enter rejection reason for claim ${claim.id}:`);
    if (!reason) return;

    try {
      const res = await adminApi.rejectCompensationClaim(claim.id, adminEmail || 'finance-lead-checker', reason);
      setActionMessage({ text: res.message, type: 'success' });
      fetchClaims();
    } catch (err: any) {
      setActionMessage({ text: `Rejection failed: ${err.message || err}`, type: 'error' });
    }
  };

  const filteredClaims = claims.filter((c) => {
    if (filterStatus !== 'ALL' && c.status !== filterStatus) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.incidentId.toLowerCase().includes(q) ||
        c.userId.toLowerCase().includes(q) ||
        c.reason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const pendingClaims = claims.filter((c) => c.status === 'PENDING_APPROVAL');
  const pendingTotalCents = pendingClaims.reduce((acc, c) => acc + c.amountCents, 0);
  const approvedTotalCents = claims.filter((c) => c.status === 'APPROVED').reduce((acc, c) => acc + c.amountCents, 0);

  return (
    <div className="space-y-6 max-w-7xl font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-mono flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-rose-400" />
            Financial Compensation Governance
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Segregated incident compensation workflow with strict Maker-Checker isolation (ADR-0031 / Epic 4.5).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchClaims}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold transition-colors shadow-lg shadow-rose-600/20"
          >
            <PlusCircle className="h-4 w-4" />
            Create Claim (Maker)
          </button>
        </div>
      </div>

      {/* Action Banner */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-mono flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-4"
          >
            &times;
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#0D1322]">
          <div className="text-[11px] font-mono text-slate-400 uppercase">Total Claims Filed</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">{claims.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Audit log entries maintained</div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10">
          <div className="text-[11px] font-mono text-amber-400 uppercase">Pending Checker Review</div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            ${(pendingTotalCents / 100).toFixed(2)} USD
          </div>
          <div className="text-[10px] text-amber-400/70 mt-1">{pendingClaims.length} awaiting checker sign-off</div>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10">
          <div className="text-[11px] font-mono text-emerald-400 uppercase">Total Compensated</div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            ${(approvedTotalCents / 100).toFixed(2)} USD
          </div>
          <div className="text-[10px] text-emerald-400/70 mt-1">Credited directly to user ledgers</div>
        </div>
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/10">
          <div className="text-[11px] font-mono text-indigo-400 uppercase">Segregation Policy</div>
          <div className="text-2xl font-bold font-mono text-indigo-300 mt-1">ENFORCED</div>
          <div className="text-[10px] text-indigo-400/70 mt-1">Maker != Checker role check active</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-800/80 bg-[#0D1322]">
        <div className="relative w-full md:w-80">
          <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by claim ID, incident, user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#070A12] border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-rose-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs font-mono">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-xl border border-slate-800/80 bg-[#0D1322] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#070A12] border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Claim & Incident</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Reason & Evidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Audit Trail</th>
                <th className="py-3 px-4 text-right">Checker Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No compensation claims found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{c.incidentId}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{c.id}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-300">{c.userId}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-white font-bold text-sm">
                        ${(c.amountCents / 100).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">USD</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-300 truncate" title={c.reason}>
                        {c.reason}
                      </div>
                      {c.evidencePayload && (
                        <button
                          type="button"
                          onClick={() => setActiveEvidence(c.evidencePayload)}
                          className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <FileText className="h-3 w-3" /> View Evidence JSON
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'APPROVED'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                            : c.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-950/40 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.status.replace(/_/g, ' ')}
                      </span>
                      {c.rejectionReason && (
                        <div className="text-[10px] text-rose-400 mt-1 max-w-[140px] truncate" title={c.rejectionReason}>
                          Reason: {c.rejectionReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[10px] text-slate-400">
                      <div>Maker: <span className="text-slate-200">{c.createdByAdminId}</span></div>
                      {c.approvedByAdminId && (
                        <div>Checker: <span className="text-emerald-400">{c.approvedByAdminId}</span></div>
                      )}
                      <div className="text-slate-500 mt-0.5">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'PENDING_APPROVAL' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleApprove(c)}
                            title="Checker: Approve and credit user ledger"
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(c)}
                            title="Checker: Reject claim"
                            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">Decided</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Claim (Maker) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-rose-400" />
                Open Compensation Claim (Maker)
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Incident ID *</label>
                <input
                  type="text"
                  placeholder="e.g. INC-2026-09-003"
                  value={newIncidentId}
                  onChange={(e) => setNewIncidentId(e.target.value)}
                  required
                  className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Affected User ID *</label>
                <input
                  type="text"
                  placeholder="e.g. usr_trader_42"
                  value={newUserId}
                  onChange={(e) => setNewUserId(e.target.value)}
                  required
                  className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Compensation Amount (USD) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 150.00"
                  value={newAmountUsd}
                  onChange={(e) => setNewAmountUsd(e.target.value)}
                  required
                  className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Detailed Reason *</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Price drift caused adverse execution due to 1500ms network timeout..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  required
                  className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Evidence Payload (JSON)</label>
                <textarea
                  rows={4}
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full bg-[#070A12] border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/20 text-[11px] text-amber-300">
                Notice: Claim will be submitted as PENDING_APPROVAL. Under Segregation of Duties, another administrator (Checker) must review and approve this claim.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Evidence JSON */}
      {activeEvidence && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1322] border border-slate-800 rounded-2xl w-full max-w-md p-5 space-y-3 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                Incident Evidence Payload
              </h3>
              <button
                type="button"
                onClick={() => setActiveEvidence(null)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#070A12] border border-slate-800 text-[11px] text-emerald-300 overflow-x-auto max-h-72">
              {activeEvidence}
            </pre>
            <div className="text-right">
              <button
                type="button"
                onClick={() => setActiveEvidence(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
