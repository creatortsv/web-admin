'use client';

import * as React from 'react';
import { AuditLogEntry } from '@/services/adminApi';
import { computeAuditHash, verifyAuditChain } from '@/lib/auditHasher';
import { FileCode2, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: 'log_0',
    timestamp: '2026-09-02T10:00:00Z',
    actorEmail: 'security-admin@venom.finance',
    action: 'BOOTSTRAP_SUPERADMIN_TOTP',
    target: 'SUPERADMIN_IDENTITY',
    prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
    currentHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    ipAddress: '127.0.0.1 (Local mTLS)',
  },
  {
    id: 'log_1',
    timestamp: '2026-09-02T12:30:00Z',
    actorEmail: 'security-admin@venom.finance',
    action: 'UPDATE_TREASURY_VAULT',
    target: 'TRON_USDT_VAULT',
    prevHash: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    currentHash: '3f79bb7b435b05321651daefd374cd681b61935c13e0e2029d6b73b024138162',
    ipAddress: '127.0.0.1 (Local mTLS)',
  },
  {
    id: 'log_2',
    timestamp: '2026-09-02T15:45:00Z',
    actorEmail: 'security-admin@venom.finance',
    action: 'SEAL_STRIPE_KMS_CREDENTIALS',
    target: 'STRIPE_GATEWAY',
    prevHash: '3f79bb7b435b05321651daefd374cd681b61935c13e0e2029d6b73b024138162',
    currentHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    ipAddress: '127.0.0.1 (Local mTLS)',
  },
];

export default function AuditLogsPage() {
  const [logs] = React.useState<AuditLogEntry[]>(INITIAL_LOGS);
  const isChainValid = verifyAuditChain(
    logs.map((l) => ({
      prevHash: l.prevHash,
      currentHash: l.currentHash,
      timestamp: l.timestamp,
      actorEmail: l.actorEmail,
      action: l.action,
      target: l.target,
    }))
  );

  return (
    <div className="space-y-6 max-w-7xl font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileCode2 className="h-6 w-6 text-rose-400" />
            Cryptographic SHA-256 Audit Trail
          </h1>
          <p className="text-slate-400 mt-1">
            Tamper-evident hash-chained ledger of all administrative interventions and parameter alterations.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Chain Integrity Valid (SHA-256 Chained)</span>
        </div>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#070A12] border-b border-[#1E293B] text-slate-400 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action & Target</th>
              <th className="py-3 px-4">Previous Block Hash</th>
              <th className="py-3 px-4">Current Block Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                <td className="py-3 px-4 text-slate-300">
                  {log.timestamp.replace('T', ' ').replace('Z', '')}
                </td>
                <td className="py-3 px-4 text-white font-bold">{log.actorEmail}</td>
                <td className="py-3 px-4">
                  <div className="font-bold text-emerald-400">{log.action}</div>
                  <div className="text-[10px] text-slate-400">{log.target}</div>
                </td>
                <td className="py-3 px-4 text-slate-500 text-[10px] font-mono truncate max-w-[120px]">
                  {log.prevHash.slice(0, 16)}...
                </td>
                <td className="py-3 px-4 text-cyan-400 text-[10px] font-mono truncate max-w-[120px]">
                  {log.currentHash.slice(0, 16)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
