'use client';

import * as React from 'react';
import {
  BrainCircuit,
  Play,
  Check,
  Key,
  Sliders,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Eye,
  EyeOff,
  RefreshCw,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  useAiQuantStore,
  OPENROUTER_MODELS,
  RiskProfile,
} from '@/stores/useAiQuantStore';

const AVAILABLE_PAIRS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'DOGE/USDT', 'AVAX/USDT'];

export default function AiQuantPage() {
  const {
    provider,
    apiKey,
    selectedModel,
    customModel,
    minTargetApr,
    maxDrawdown,
    lookbackDays,
    riskProfile,
    targetPairs,
    systemPrompt,
    isRunning,
    progressPercent,
    statusMessage,
    executionLogs,
    lastRunAt,
    generatedStrategies,
    setApiKey,
    setSelectedModel,
    setCustomModel,
    setMinTargetApr,
    setMaxDrawdown,
    setLookbackDays,
    setRiskProfile,
    toggleTargetPair,
    setSystemPrompt,
    runSynthesis,
    publishToCatalog,
  } = useAiQuantStore();

  const [showApiKey, setShowApiKey] = React.useState(false);
  const [showPromptEditor, setShowPromptEditor] = React.useState(false);
  const [keySavedToast, setKeySavedToast] = React.useState(false);

  const logsEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs]);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 2000);
  };

  const activeModelOption = OPENROUTER_MODELS.find((m) => m.id === selectedModel);

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                AI Quantitative Strategy Synthesizer
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Multi-model algorithmic intelligence engine for automated Spot, Infinity, and Futures grid modeling.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="text-right">
            <span className="text-xs text-slate-400 block font-mono">CRON SCHEDULE</span>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-500/30">
              0 0 * * 0 (Weekly)
            </span>
          </div>
          <div className="text-right pl-3 border-l border-border">
            <span className="text-xs text-slate-400 block font-mono">LAST RUN</span>
            <span className="text-xs font-mono text-slate-200">
              {lastRunAt || 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: AI Provider & Target Metrics (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: AI Provider & Model Configuration */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  1. AI Provider & Intelligence Model
                </h2>
              </div>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            {/* Provider Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Inference Provider
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-xl border-2 border-emerald-500/50 bg-emerald-500/10 text-white cursor-default">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div>
                      <div className="text-sm font-bold">OpenRouter API</div>
                      <div className="text-xs text-slate-400">Multi-Model Universal Gateway</div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-slate-950/40 text-slate-500 opacity-60 cursor-not-allowed">
                  <div>
                    <div className="text-sm font-bold">Direct OpenAI / Anthropic</div>
                    <div className="text-xs text-slate-600">Coming in Phase 5</div>
                  </div>
                  <span className="text-[10px] font-mono border border-slate-800 px-1.5 py-0.5 rounded">Soon</span>
                </div>
              </div>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Quant Strategy Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-xl border border-border bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {OPENROUTER_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name} — {m.badge} ({m.contextWindow})
                  </option>
                ))}
              </select>

              {activeModelOption && (
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {activeModelOption.description}
                </p>
              )}

              {selectedModel === 'custom' && (
                <div className="mt-2.5">
                  <label className="text-xs text-slate-400 block mb-1">
                    Custom Model Slug (e.g. <code>qwen/qwen-2.5-72b-instruct</code>):
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="provider/model-name"
                    className="w-full rounded-xl border border-border bg-slate-950 px-3.5 py-2 text-sm font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* OpenRouter API Key Input */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-amber-400" />
                  OpenRouter API Key
                </label>
                {keySavedToast && (
                  <span className="text-xs font-mono text-emerald-400 animate-in fade-in">
                    ✓ Saved locally
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => handleApiKeyChange(e.target.value)}
                  placeholder="sk-or-v1-••••••••••••••••••••••••"
                  className="w-full rounded-xl border border-border bg-slate-950 px-3.5 py-2.5 pr-10 text-sm font-mono text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Encrypted in browser local storage. If omitted, platform quota demo simulation is used.
              </p>
            </div>
          </div>

          {/* Section 2: Quantitative Constraints & Targets */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="h-5 w-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  2. Optimization Constraints & Risk Metrics
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                PARAMETRIC SEARCH
              </span>
            </div>

            {/* Target APR and Max DD Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Target APR */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    Target Minimum APR
                  </span>
                  <span className="text-base font-black font-mono text-emerald-400">
                    +{minTargetApr}%
                  </span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={200}
                  step={5}
                  value={minTargetApr}
                  onChange={(e) => setMinTargetApr(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>15% (Defensive)</span>
                  <span>100% (Alpha)</span>
                  <span>200% (High Vol)</span>
                </div>
              </div>

              {/* Max Drawdown */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-950/60 border border-border/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    Maximum Permitted Drawdown
                  </span>
                  <span className="text-base font-black font-mono text-rose-400">
                    {maxDrawdown}%
                  </span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={25}
                  step={0.5}
                  value={maxDrawdown}
                  onChange={(e) => setMaxDrawdown(Number(e.target.value))}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>3% (Strict)</span>
                  <span>10% (Balanced)</span>
                  <span>25% (Wide)</span>
                </div>
              </div>
            </div>

            {/* Lookback Days & Risk Profile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Backtest Lookback Window
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[30, 60, 90, 180].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLookbackDays(days)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        lookbackDays === days
                          ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-border bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Risk Tolerance Profile
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['CONSERVATIVE', 'BALANCED', 'AGGRESSIVE'] as RiskProfile[]).map((rp) => (
                    <button
                      key={rp}
                      type="button"
                      onClick={() => setRiskProfile(rp)}
                      className={`py-2 text-[11px] font-bold rounded-lg border uppercase transition-all cursor-pointer ${
                        riskProfile === rp
                          ? rp === 'AGGRESSIVE'
                            ? 'border-rose-500/50 bg-rose-500/20 text-rose-300'
                            : 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                          : 'border-border bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      {rp.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Target Asset Pairs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Target Trading Pairs
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PAIRS.map((pair) => {
                  const isSelected = targetPairs.includes(pair);
                  return (
                    <button
                      key={pair}
                      type="button"
                      onClick={() => toggleTargetPair(pair)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                          : 'border-border bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && '✓ '}
                      {pair}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* System Prompt Customizer Toggle */}
            <div className="pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={() => setShowPromptEditor(!showPromptEditor)}
                className="flex items-center justify-between w-full text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  Custom Quantitative Directives & System Prompt
                </span>
                {showPromptEditor ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showPromptEditor && (
                <div className="mt-3 space-y-2">
                  <textarea
                    rows={4}
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    className="w-full rounded-xl border border-border bg-slate-950 p-3 text-xs font-mono text-slate-300 leading-relaxed focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500">
                    Directives injected into the AI context window before analyzing market orderbook structures.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Terminal & Output Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Action Trigger Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Play className="h-4 w-4 text-emerald-400 fill-current" />
              Synthesizer Execution
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers Bayesian search and regime classification on live market feeds using{' '}
              <strong className="text-white font-mono">
                {activeModelOption?.name || selectedModel}
              </strong>
              .
            </p>

            <button
              type="button"
              onClick={runSynthesis}
              disabled={isRunning}
              className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-zinc-950 font-black text-sm hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Synthesizing ({progressPercent}%)...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  <span>Run AI Quantitative Synthesis Now</span>
                </>
              )}
            </button>

            {isRunning && (
              <div className="space-y-1.5 pt-1">
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-border">
                  <div
                    className="h-full bg-emerald-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="text-xs font-mono text-emerald-400 text-center animate-pulse">
                  {statusMessage}
                </div>
              </div>
            )}
          </div>

          {/* Execution Log Terminal */}
          <div className="rounded-2xl border border-border bg-[#05070E] p-4 shadow-xl space-y-2 font-mono">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>INFERENCE TELEMETRY LOG</span>
              </div>
              <span className="text-[10px] text-slate-500">LIVE WSS</span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1.5 text-[11px] text-slate-300 pr-1 select-text">
              {executionLogs.length === 0 ? (
                <div className="text-slate-600 italic py-4 text-center">
                  Engine idle. Click &quot;Run AI Quantitative Synthesis&quot; to inspect real-time logs.
                </div>
              ) : (
                executionLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-emerald-500 mr-1.5">›</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Output Presets List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Synthesized Strategy Presets ({generatedStrategies.length})
              </h3>
              <span className="text-xs font-mono text-slate-400">TRADER CATALOG</span>
            </div>

            <div className="space-y-3">
              {generatedStrategies.map((strat) => (
                <div
                  key={strat.id}
                  className="rounded-xl border border-border bg-card p-4 space-y-3 hover:border-emerald-500/40 transition-colors shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{strat.name}</span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {strat.pair}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {strat.rationale}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60 text-center font-mono">
                    <div className="p-2 rounded bg-slate-950/60 border border-border/40">
                      <span className="text-[10px] text-slate-500 block">EST. APR</span>
                      <span className="text-sm font-bold text-emerald-400">+{strat.targetApr}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-border/40">
                      <span className="text-[10px] text-slate-500 block">MAX DD</span>
                      <span className="text-sm font-bold text-rose-400">{strat.maxDrawdown}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950/60 border border-border/40">
                      <span className="text-[10px] text-slate-500 block">GRIDS</span>
                      <span className="text-sm font-bold text-white">{strat.gridCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Range: ${strat.priceRange.lower.toLocaleString('en-US')} – ${strat.priceRange.upper.toLocaleString('en-US')}
                    </span>
                    <button
                      type="button"
                      onClick={() => publishToCatalog(strat.id)}
                      className="px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 transition-colors cursor-pointer"
                    >
                      {strat.isPublished ? '✓ Published to Catalog' : 'Publish to Catalog'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
