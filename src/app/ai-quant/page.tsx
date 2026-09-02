'use client';

import * as React from 'react';
import { BrainCircuit, Play, Check, Clock, Sparkles } from 'lucide-react';

export default function AiQuantPage() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [lastRun, setLastRun] = React.useState('2026-08-31 00:00:00 UTC');
  const [statusMessage, setStatusMessage] = React.useState('');

  const handleManualTrigger = () => {
    setIsRunning(true);
    setStatusMessage('Analyzing cross-exchange volatility clusters & Markov regime switches...');
    setTimeout(() => {
      setStatusMessage('Optimizing grid density parameters via Bayesian search...');
      setTimeout(() => {
        setIsRunning(false);
        setLastRun(new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
        setStatusMessage('AI Strategy synthesis complete. New presets published to Bot Catalog.');
      }, 1500);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-7xl font-mono text-xs">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-emerald-400" />
          AI Quantitative Strategy Synthesizer
        </h1>
        <p className="text-slate-400 mt-1">
          Automated weekly quantitative synthesis engine (cron: <code className="text-emerald-300">0 0 * * 0</code>). Models optimal arithmetic and geometric grid parameters from live market data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-[#1E293B] bg-[#0D1322] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div>
              <span className="text-slate-400">Execution Schedule:</span>
              <div className="text-white font-bold mt-0.5">Every Sunday at 00:00 UTC</div>
            </div>
            <div>
              <span className="text-slate-400">Last Synthesis:</span>
              <div className="text-emerald-400 font-bold mt-0.5">{lastRun}</div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Quantitative Optimization Models
            </h3>
            <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E293B]">
              <div className="font-bold text-slate-200">1. ATR-Scaled Geometric Density</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Automatically adjusts grid count dynamically based on 14-day Average True Range.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-[#070A12] border border-[#1E293B]">
              <div className="font-bold text-slate-200">2. Markov Regime Volatility Filter</div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Pauses futures grid execution if high probability of sustained trend breakout is detected.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleManualTrigger}
              disabled={isRunning}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              {isRunning ? 'Synthesizing Strategies...' : 'Run Quantitative Synthesis Now'}
            </button>
            {statusMessage && (
              <div className="mt-3 p-2.5 rounded bg-slate-900 border border-[#1E293B] text-emerald-300">
                {statusMessage}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1322] p-6 space-y-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Engine Configuration
          </h3>
          <div className="space-y-2 text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]/60">
              <span className="text-slate-400">Backtest Lookback:</span>
              <span className="font-bold">90 Days</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]/60">
              <span className="text-slate-400">Min Target APR:</span>
              <span className="font-bold text-emerald-400">30.0%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#1E293B]/60">
              <span className="text-slate-400">Max Permitted DD:</span>
              <span className="font-bold text-rose-400">8.0%</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Min Sharpe Ratio:</span>
              <span className="font-bold text-cyan-400">2.20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
