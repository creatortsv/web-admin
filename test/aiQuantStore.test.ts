import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * The AI Quant store used to seed two published presets, to hint at a local port when a call failed
 * and to flip `isPublished` locally. Publication is a backend decision (SC-12 answers
 * `Unimplemented` / `ai_preset_publication_disabled`); the store never reports it done itself.
 * [Policy Ref: Contract §2.1 - no fake data and no fake success; Standards §6.4 - zero fallback mocking]
 */
const STORAGE_KEY = 'venom_ai_quant_settings';

interface RecordingStorage {
  readonly writes: Array<{ key: string; value: string }>;
}

function stubBrowser(initial: Record<string, string> = {}): RecordingStorage {
  const data = new Map(Object.entries(initial));
  const recording: RecordingStorage = { writes: [] };
  const storage = {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      recording.writes.push({ key, value });
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('window', { localStorage: storage });
  return recording;
}

async function loadStore() {
  vi.resetModules();
  return import('../src/stores/useAiQuantStore');
}

const preset = {
  id: 'preset-1',
  name: 'Backend preset',
  pair: 'BTC/USDT',
  strategyType: 'SPOT_GRID' as const,
  targetApr: 10,
  maxDrawdown: 5,
  gridCount: 10,
  spacingType: 'ARITHMETIC' as const,
  priceRange: { lower: 1, upper: 2 },
  sharpeRatio: 1,
  rationale: 'from the backend',
  isPublished: false,
  createdAt: '2026-10-03 00:00:00 UTC',
};

function sseResponse(payloads: unknown[]): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const payload of payloads) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(stream, { status: 200 });
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('initial state', () => {
  it('has no seeded strategy and no invented last run', async () => {
    stubBrowser();
    const { useAiQuantStore } = await loadStore();
    const state = useAiQuantStore.getState();
    expect(state.generatedStrategies).toEqual([]);
    expect(state.lastRunAt).toBeNull();
  });

  it('ignores strategies and a last run left in browser storage by earlier builds', async () => {
    stubBrowser({
      [STORAGE_KEY]: JSON.stringify({
        lastRunAt: '2026-08-31 00:00:00 UTC',
        generatedStrategies: [{ ...preset, id: 'ai_strat_btc_alpha', isPublished: true }],
      }),
    });
    const { useAiQuantStore } = await loadStore();
    const state = useAiQuantStore.getState();
    expect(state.generatedStrategies).toEqual([]);
    expect(state.lastRunAt).toBeNull();
  });
});

describe('runSynthesis failure', () => {
  it('surfaces the real error and no hardcoded port or service hint', async () => {
    stubBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => new Response('', { status: 404, statusText: 'Not Found' })));
    const { useAiQuantStore } = await loadStore();

    await useAiQuantStore.getState().runSynthesis();

    const state = useAiQuantStore.getState();
    const visible = [state.statusMessage, ...state.executionLogs].join('\n');
    expect(state.statusMessage).toContain('Not Found');
    expect(visible).not.toContain(':8085');
    expect(visible).not.toContain('svc-mcp-quant');
    expect(visible).not.toMatch(/Ensure .* is running/);
  });

  it('surfaces a network failure unchanged and no hardcoded hint', async () => {
    stubBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed'); }));
    const { useAiQuantStore } = await loadStore();

    await useAiQuantStore.getState().runSynthesis();

    const state = useAiQuantStore.getState();
    const visible = [state.statusMessage, ...state.executionLogs].join('\n');
    expect(state.statusMessage).toContain('fetch failed');
    expect(visible).not.toContain(':8085');
    expect(visible).not.toContain('svc-mcp-quant');
  });
});

describe('runSynthesis success', () => {
  it('keeps the synthesized presets in memory only and writes none of them to browser storage', async () => {
    const recording = stubBrowser();
    vi.stubGlobal('fetch', vi.fn(async () => sseResponse([{ presets: [preset] }])));
    const { useAiQuantStore } = await loadStore();

    await useAiQuantStore.getState().runSynthesis();

    expect(useAiQuantStore.getState().generatedStrategies.map((s) => s.id)).toEqual(['preset-1']);
    const persisted = recording.writes.map((write) => write.value).join('\n');
    expect(persisted).not.toContain('generatedStrategies');
    expect(persisted).not.toContain('lastRunAt');
    expect(persisted).not.toContain('preset-1');
  });
});

describe('publishToCatalog', () => {
  async function storeWithPreset() {
    const recording = stubBrowser();
    const fetchMock = vi.fn(async () => new Response('', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const module = await loadStore();
    module.useAiQuantStore.setState({ generatedStrategies: [preset] });
    return { ...module, recording, fetchMock };
  }

  it('never marks a preset published locally', async () => {
    const { useAiQuantStore } = await storeWithPreset();
    useAiQuantStore.getState().publishToCatalog('preset-1');
    expect(useAiQuantStore.getState().generatedStrategies.map((s) => s.isPublished)).toEqual([false]);
  });

  it('reports that publication is unavailable instead of success, and persists nothing', async () => {
    const { useAiQuantStore, PRESET_PUBLICATION_UNAVAILABLE, recording } = await storeWithPreset();
    useAiQuantStore.getState().publishToCatalog('preset-1');
    const state = useAiQuantStore.getState();
    expect(PRESET_PUBLICATION_UNAVAILABLE).toBeTruthy();
    expect(state.statusMessage).toBe(PRESET_PUBLICATION_UNAVAILABLE);
    expect(state.executionLogs.some((line) => line.includes(PRESET_PUBLICATION_UNAVAILABLE))).toBe(true);
    expect(recording.writes).toEqual([]);
  });
});
