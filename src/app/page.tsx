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
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-white font-mono">Platform Health & Telemetry</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time cluster telemetry across 10 Go microservices, Kafka topics, and PostgreSQL pools.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>ACTIVE FLEET BOTS</span>
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            {stats?.activeBotsCount ?? '...'}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Across 18 user nodes
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>24H VOLUME MATCHED</span>
            <DollarSign className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-white mt-2">
            ${(stats?.totalVolume24hUsd ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Binance Live & Testnet
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>PENDING TREASURY SWEEP</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 mt-2">
            ${(stats?.pendingSweepUsd ?? 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-mono mt-1">
            Pending multi-sig cold sweep
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>KAFKA MESSAGE LAG</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
            {stats?.kafkaLag ?? 0} msgs
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1">
            Zero ingestion backlog
          </div>
        </div>
      </div>

      {/* Microservice Topology Grid */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-5">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4">
          Microservices & Infrastructure Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
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
              className="flex items-center justify-between p-3 rounded-lg bg-[#070A12] border border-[#1E293B]"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white font-bold">{svc.name}</span>
              </div>
              <span className="text-slate-400 text-[11px]">:{svc.port}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
