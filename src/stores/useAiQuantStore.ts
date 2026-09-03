import { create } from 'zustand';

export type AiProvider = 'openrouter';

export interface AiModelOption {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  badge: string;
  description: string;
}

export const OPENROUTER_MODELS: AiModelOption[] = [
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: '200k',
    badge: 'Recommended',
    description: 'Elite quantitative reasoning, volatility clustering, and risk boundary modeling.',
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    contextWindow: '64k',
    badge: 'Fast & Cost Effective',
    description: 'High-throughput Bayesian parameter optimization and grid distribution simulation.',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    contextWindow: '128k',
    badge: 'High Reasoning',
    description: 'Multi-modal market reasoning and multi-timeframe regime switch detection.',
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    contextWindow: '128k',
    badge: 'Open Weights',
    description: 'Top-tier open-source quantitative analysis with zero proprietary vendor lock-in.',
  },
  {
    id: 'custom',
    name: 'Custom OpenRouter Model...',
    provider: 'Custom',
    contextWindow: 'Auto',
    badge: 'Custom',
    description: 'Specify any model slug available on the OpenRouter platform (e.g. qwen/qwen-2.5-72b-instruct).',
  },
];

export type RiskProfile = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export interface SynthesizedStrategy {
  id: string;
  name: string;
  pair: string;
  strategyType: 'SPOT_GRID' | 'INFINITY_GRID' | 'FUTURES_GRID';
  targetApr: number;
  maxDrawdown: number;
  gridCount: number;
  spacingType: 'ARITHMETIC' | 'GEOMETRIC';
  priceRange: { lower: number; upper: number };
  sharpeRatio: number;
  rationale: string;
  isPublished: boolean;
  createdAt: string;
}

export interface AiQuantState {
  // Provider settings
  provider: AiProvider;
  apiKey: string;
  selectedModel: string;
  customModel: string;

  // Quantitative target metrics
  minTargetApr: number;
  maxDrawdown: number;
  lookbackDays: number;
  riskProfile: RiskProfile;
  targetPairs: string[];
  systemPrompt: string;

  // Execution state
  isRunning: boolean;
  progressPercent: number;
  statusMessage: string;
  executionLogs: string[];
  lastRunAt: string | null;
  generatedStrategies: SynthesizedStrategy[];

  // Actions
  setProvider: (p: AiProvider) => void;
  setApiKey: (key: string) => void;
  setSelectedModel: (m: string) => void;
  setCustomModel: (m: string) => void;
  setMinTargetApr: (apr: number) => void;
  setMaxDrawdown: (dd: number) => void;
  setLookbackDays: (days: number) => void;
  setRiskProfile: (rp: RiskProfile) => void;
  toggleTargetPair: (pair: string) => void;
  setSystemPrompt: (prompt: string) => void;
  runSynthesis: () => Promise<void>;
  publishToCatalog: (id: string) => void;
}

const STORAGE_KEY = 'venom_ai_quant_settings';

const DEFAULT_SYSTEM_PROMPT = `You are the Chief Quantitative Architect for Venom Finance.
Analyze 90-day multi-exchange market volatility, orderbook micro-structure, and Markov regime switches.
Generate mathematically optimal arithmetic and geometric grid trading parameters tailored to the specified risk constraints:
- Enforce strict Maximum Drawdown ceiling.
- Maximize Sortino and Sharpe ratios under high-volatility regimes.
- Account for maker/taker execution fee drag on Binance Spot and Futures.`;

function loadPersistedSettings() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage parse errors
  }
  return null;
}

function persistSettings(data: Partial<AiQuantState>) {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadPersistedSettings() || {};
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // Ignore quota errors
  }
}

const initialSaved = loadPersistedSettings();

export const useAiQuantStore = create<AiQuantState>((set, get) => ({
  provider: 'openrouter',
  apiKey: initialSaved?.apiKey || '',
  selectedModel: initialSaved?.selectedModel || 'anthropic/claude-3.5-sonnet',
  customModel: initialSaved?.customModel || '',
  minTargetApr: initialSaved?.minTargetApr ?? 45,
  maxDrawdown: initialSaved?.maxDrawdown ?? 8.5,
  lookbackDays: initialSaved?.lookbackDays ?? 90,
  riskProfile: initialSaved?.riskProfile || 'BALANCED',
  targetPairs: initialSaved?.targetPairs || ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
  systemPrompt: initialSaved?.systemPrompt || DEFAULT_SYSTEM_PROMPT,

  isRunning: false,
  progressPercent: 0,
  statusMessage: '',
  executionLogs: [],
  lastRunAt: initialSaved?.lastRunAt || '2026-08-31 00:00:00 UTC',
  generatedStrategies: initialSaved?.generatedStrategies || [
    {
      id: 'ai_strat_btc_alpha',
      name: 'BTC Spot Grid Alpha (Bayesian)',
      pair: 'BTC/USDT',
      strategyType: 'SPOT_GRID',
      targetApr: 48.2,
      maxDrawdown: 6.4,
      gridCount: 28,
      spacingType: 'GEOMETRIC',
      priceRange: { lower: 82400, upper: 98600 },
      sharpeRatio: 2.84,
      rationale: 'Calibrated for multi-week consolidation within high-volume POC cluster. Minimal inventory drift.',
      isPublished: true,
      createdAt: '2026-08-31 00:00:00 UTC',
    },
    {
      id: 'ai_strat_eth_infinity',
      name: 'ETH Moon Walker (Infinity)',
      pair: 'ETH/USDT',
      strategyType: 'INFINITY_GRID',
      targetApr: 62.8,
      maxDrawdown: 7.9,
      gridCount: 45,
      spacingType: 'ARITHMETIC',
      priceRange: { lower: 2550, upper: 4200 },
      sharpeRatio: 3.12,
      rationale: 'Infinity trend rider with geometric profit lock at each 1.15% tier. Zero upper ceiling cap.',
      isPublished: true,
      createdAt: '2026-08-31 00:00:00 UTC',
    },
  ],

  setProvider: (provider) => {
    set({ provider });
    persistSettings({ provider });
  },

  setApiKey: (apiKey) => {
    set({ apiKey });
    persistSettings({ apiKey });
  },

  setSelectedModel: (selectedModel) => {
    set({ selectedModel });
    persistSettings({ selectedModel });
  },

  setCustomModel: (customModel) => {
    set({ customModel });
    persistSettings({ customModel });
  },

  setMinTargetApr: (minTargetApr) => {
    set({ minTargetApr });
    persistSettings({ minTargetApr });
  },

  setMaxDrawdown: (maxDrawdown) => {
    set({ maxDrawdown });
    persistSettings({ maxDrawdown });
  },

  setLookbackDays: (lookbackDays) => {
    set({ lookbackDays });
    persistSettings({ lookbackDays });
  },

  setRiskProfile: (riskProfile) => {
    set({ riskProfile });
    persistSettings({ riskProfile });
  },

  toggleTargetPair: (pair) => {
    const current = get().targetPairs;
    const exists = current.includes(pair);
    const updated = exists ? current.filter((p) => p !== pair) : [...current, pair];
    if (updated.length === 0) return;
    set({ targetPairs: updated });
    persistSettings({ targetPairs: updated });
  },

  setSystemPrompt: (systemPrompt) => {
    set({ systemPrompt });
    persistSettings({ systemPrompt });
  },

  runSynthesis: async () => {
    const state = get();
    if (state.isRunning) return;

    set({
      isRunning: true,
      progressPercent: 5,
      statusMessage: 'Initializing ReAct MCP Agent Harness...',
      executionLogs: [
        `[${new Date().toISOString()}] Initializing Autonomous ReAct Quant Agent Harness (Provider: ${state.provider.toUpperCase()})`,
        `[${new Date().toISOString()}] Target Constraints: Min APR >= ${state.minTargetApr}%, Max DD <= ${state.maxDrawdown}%`,
        `[${new Date().toISOString()}] Lookback Window: ${state.lookbackDays} Days, Risk Profile: ${state.riskProfile}`,
        `[${new Date().toISOString()}] Target Asset Pairs: ${state.targetPairs.join(', ')}`,
      ],
    });

    try {
      // Connect to the real SSE streaming endpoint
      const response = await fetch('/api/quant/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: state.provider,
          apiKey: state.apiKey,
          selectedModel: state.selectedModel,
          customModel: state.customModel,
          targetPairs: state.targetPairs,
          minTargetApr: state.minTargetApr,
          maxDrawdown: state.maxDrawdown,
          lookbackDays: state.lookbackDays,
          riskProfile: state.riskProfile,
          systemPrompt: state.systemPrompt,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Failed to initialize harness: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split('\n\n');
        buffer = blocks.pop() || '';

        for (const block of blocks) {
          if (!block.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(block.slice(6));
            if (payload.log) {
              set((s) => ({
                progressPercent: payload.progressPercent ?? s.progressPercent,
                statusMessage: payload.log,
                executionLogs: [...s.executionLogs, payload.log],
              }));
            }
            if (payload.presets && Array.isArray(payload.presets) && payload.presets.length > 0) {
              const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
              set((s) => ({
                isRunning: false,
                progressPercent: 100,
                statusMessage: 'Synthesis complete. Strategies verified and stored.',
                lastRunAt: nowIso,
                generatedStrategies: [...payload.presets, ...s.generatedStrategies.slice(0, 4)],
              }));
              persistSettings({
                lastRunAt: nowIso,
                generatedStrategies: get().generatedStrategies,
              });
            }
          } catch {
            // Ignore parse errors on partial chunks
          }
        }
      }
    } catch {
      // Fallback: Direct local execution if fetch/network fails
      const { QuantAgentHarness } = await import('@/services/quant/harness/quantAgentHarness');
      const harness = new QuantAgentHarness();
      const presets = await harness.run({
        provider: state.provider,
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        customModel: state.customModel,
        targetPairs: state.targetPairs,
        minTargetApr: state.minTargetApr,
        maxDrawdown: state.maxDrawdown,
        lookbackDays: state.lookbackDays,
        riskProfile: state.riskProfile,
        systemPrompt: state.systemPrompt,
        onProgress: (chunk) => {
          set((s) => ({
            progressPercent: chunk.progressPercent,
            statusMessage: chunk.log,
            executionLogs: [...s.executionLogs, chunk.log],
          }));
        },
      });

      const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
      set((s) => ({
        isRunning: false,
        progressPercent: 100,
        statusMessage: 'Synthesis complete. Strategies verified and stored.',
        lastRunAt: nowIso,
        generatedStrategies: [...presets, ...s.generatedStrategies.slice(0, 4)],
      }));

      persistSettings({
        lastRunAt: nowIso,
        generatedStrategies: get().generatedStrategies,
      });
    } finally {
      set({ isRunning: false });
    }
  },

  publishToCatalog: (id) => {
    set((s) => ({
      generatedStrategies: s.generatedStrategies.map((strat) =>
        strat.id === id ? { ...strat, isPublished: true } : strat
      ),
    }));
    persistSettings({ generatedStrategies: get().generatedStrategies });
  },
}));
