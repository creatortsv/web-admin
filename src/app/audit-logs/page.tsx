'use client';

import { FileCode2 } from 'lucide-react';
import { InstitutionalEmptyState } from '@creatortsv/pkg-ui';

// No audit listing API exists yet (admin audit listings: WP-8.13). The page renders no entries and
// no chain-verification verdict until a backend listing exists.
export default function AuditLogsPage() {
  return (
    <div className="space-y-6 max-w-7xl font-mono text-xs">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileCode2 className="h-6 w-6 text-rose-400" />
          Cryptographic SHA-256 Audit Trail
        </h1>
        <p className="text-slate-400 mt-1">
          Tamper-evident hash-chained ledger of all administrative interventions and parameter alterations.
        </p>
      </div>

      <InstitutionalEmptyState
        icon={(props: { className?: string }) => <FileCode2 className={props.className} />}
        badge="AUDIT TRAIL"
        title="Audit listings are not available yet"
        description="The backend does not expose an audit listing to this console yet, so no entries and no chain-verification verdict are displayed."
      />
    </div>
  );
}
