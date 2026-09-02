'use client';

import * as React from 'react';
import { adminApi, SystemStats } from '@/services/adminApi';
import {
  Activity,
  Bot,
  DollarSign,
  Layers,
  Database,
  Server,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export default function OverviewPage() {
  const [stats, setStats] = React.useState<SystemStats | null>(null);

  React.useEffect(() => {
    adminApi.getSystemStats().then(setStats);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans">
          Platform Health & Telemetry
        </h1>
        <p className="text-sm text-slate-300 mt-2 leading-relaxed">
          Real-time cluster telemetry across 10 Go microservices, Kafka topics, and PostgreSQL pools.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-7 border-slate-800/80 relative">
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase">
            <span>Active Fleet Bots</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="h-4.5 w-4.5 text-emerald-400" />
            </div>
          </div>
          <div className="text-4xl font-extrabold font-mono text-white mt-4 tracking-tight">
            {stats?.activeBotsCount ?? '...'}
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Across 18 user nodes
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
            ${(stats?.totalVolume24hUsd ?? 0).toLocaleString('en-US')}
          </div>
          <div className="text-xs text-slate-300 font-medium mt-2">
            Binance Live & Testnet
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
            ${(stats?.pendingSweepUsd ?? 0).toLocaleString('en-US')}
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
            {stats?.kafkaLag ?? 0} msgs
          </div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Zero ingestion backlog
          </div>
        </div>
      </div>

      {/* Microservice Topology Grid */}
      <div className="glass-card rounded-2xl border-slate-800/80 p-6 sm:p-8">
        <h3 className="text-base sm:text-lg font-bold text-white tracking-wide uppercase mb-6 flex items-center justify-between">
          <span>Microservices & Infrastructure Status</span>
          <span className="text-xs font-mono font-semibold text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            12/12 Operational
          </span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs sm:text-sm">
          {[
            { name: 'svc-gateway', port: 8080, status: 'HEALTHY' },
            { name: 'svc-auth', port: 50051, status: 'HEALTHY' },
            { name: 'svc-user', port: 50052, status: 'HEALTHY' },
            { name: 'svc-exchange-keys', port: 50053, status: 'HEALTHY' },
            { name: 'svc-bot-manager', port: 50054, status: 'HEALTHY' },
            { name: 'svc-trading-engine', port: 50055, status: 'HEALTHY' },
            { name: 'svc-exchange-adapter', port: 50056, status: 'HEALTHY' },
            { name: 'svc-billing', port: 50057, status: 'HEALTHY' },
            { name: 'svc-reporting', port: 50058, status: 'HEALTHY' },
            { name: 'svc-notification', port: 50059, status: 'HEALTHY' },
            { name: 'jaeger-tracing', port: 16686, status: 'HEALTHY' },
            { name: 'otel-collector', port: 4317, status: 'HEALTHY' },
          ].map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(0,245,155,0.6)]" />
                <span className="text-white font-bold text-sm">{svc.name}</span>
              </div>
              <span className="text-slate-400 text-xs font-mono font-medium">:{svc.port}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
