'use client';

import * as React from 'react';
import { adminApi, SystemStats } from '@/services/adminApi';
import { describeAdminError } from '@/services/adminApiError';
import { Activity, Bot, DollarSign, Layers, Server } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  InstitutionalEmptyState,
  Skeleton,
} from '@creatortsv/pkg-ui';

export default function OverviewPage() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    adminApi
      .getSystemStats()
      .then(setStats)
      .catch((err: unknown) => setError(describeAdminError(err)));
  }, []);

  const isLoading = stats === null && error === null;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Platform Health & Telemetry
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Cluster telemetry as reported by the admin backend.
        </p>
      </div>

      {/* Primary KPI Cards: loading, error and data states of getSystemStats */}
      {error !== null && (
        <Alert variant="destructive" className="border-rose-500/40 bg-rose-950/40 text-rose-300">
          <AlertTitle>Platform telemetry could not be loaded</AlertTitle>
          <AlertDescription className="text-rose-200 font-mono">{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[0, 1, 2, 3].map((slot) => (
            <Skeleton key={slot} className="h-40 rounded-2xl" />
          ))}
        </div>
      )}

      {stats !== null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 border-slate-800/80 relative">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">
              <span>Active Fleet Bots</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Bot className="h-4.5 w-4.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold font-mono text-white mt-4 tracking-tight">
              {stats.activeBotsCount}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-2">
              Bots reported running by the backend
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 border-slate-800/80 relative">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">
              <span>24H Volume Matched</span>
              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <DollarSign className="h-4.5 w-4.5 text-cyan-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold font-mono text-white mt-4 tracking-tight">
              ${stats.totalVolume24hUsd.toLocaleString('en-US')}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-2">
              Matched volume over the last 24 hours
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 border-slate-800/80 relative">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">
              <span>Pending Sweep</span>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Layers className="h-4.5 w-4.5 text-amber-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold font-mono text-amber-400 mt-4 tracking-tight">
              ${stats.pendingSweepUsd.toLocaleString('en-US')}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-2">
              Pending multi-sig cold sweep
            </div>
          </div>

          <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 border-slate-800/80 relative">
            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">
              <span>Kafka Message Lag</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <Activity className="h-4.5 w-4.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-extrabold font-mono text-emerald-400 mt-4 tracking-tight">
              {stats.kafkaLag} msgs
            </div>
            <div className="text-xs text-slate-300 font-medium mt-2">
              Consumer lag reported by the backend
            </div>
          </div>
        </div>
      )}

      {/* Service health is not read from any backend: no service board is rendered. */}
      <InstitutionalEmptyState
        icon={(props: { className?: string }) => <Server className={props.className} />}
        badge="SERVICE HEALTH"
        title="Service health is not available in the admin console"
        description="No backend endpoint reports per-service health to this console yet, so no service status is displayed."
      />
    </div>
  );
}
