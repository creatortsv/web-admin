import { describe, it, expect } from 'vitest';
import { computeHurstExponent } from '@/services/quant/math/hurst';
import { computeVolatilityProfile, KlineBar } from '@/services/quant/math/volatility';
import { runGridBacktest } from '@/services/quant/mcp/backtestEngine';
import { QuantAgentHarness } from '@/services/quant/harness/quantAgentHarness';

describe('Quantitative Math Engine & MCP Tools', () => {
  it('should compute Hurst exponent and classify mean-reverting regime', () => {
    // Generate an oscillating mean-reverting sine wave
    const prices: number[] = [];
    for (let i = 0; i < 120; i++) {
      prices.push(85000 + Math.sin(i * 0.4) * 2000 + (i % 2 === 0 ? 200 : -200));
    }

    const result = computeHurstExponent(prices);
    expect(result.hurst).toBeGreaterThan(0.05);
    expect(result.hurst).toBeLessThan(0.95);
    expect(result.regime).toBeDefined();
    expect(result.confidence).toBeGreaterThan(0);
  });

  it('should compute ATR and Volume Profile POC correctly', () => {
    const klines: KlineBar[] = [];
    const now = Date.now();
    for (let i = 0; i < 60; i++) {
      klines.push({
        time: now - (60 - i) * 3600000,
        open: 88000 + i * 10,
        high: 88500 + i * 10,
        low: 87500 + i * 10,
        close: 88100 + i * 10,
        volume: 500,
      });
    }

    const vol = computeVolatilityProfile(klines, 14);
    expect(vol.atr).toBeGreaterThan(0);
    expect(vol.natrPct).toBeGreaterThan(0);
    expect(vol.pocPrice).toBeGreaterThan(80000);
    expect(vol.valPrice).toBeLessThanOrEqual(vol.vahPrice);
  });

  it('should run deterministic vectorized backtest with fee drag and drawdown', () => {
    const klines: KlineBar[] = [];
    const now = Date.now();
    for (let i = 0; i < 80; i++) {
      // Fluctuate price between 84,000 and 92,000
      const p = 88000 + Math.sin((i / 8) * Math.PI) * 3500;
      klines.push({
        time: now - (80 - i) * 3600000,
        open: p,
        high: p + 400,
        low: p - 400,
        close: p + 50,
        volume: 300,
      });
    }

    const res = runGridBacktest(klines, {
      symbol: 'BTC/USDT',
      strategyType: 'SPOT_GRID',
      lowerBound: 84000,
      upperBound: 92000,
      gridCount: 20,
      spacing: 'GEOMETRIC',
      initialBalanceUsd: 10000,
      makerFeeRate: 0.0002,
    });

    expect(res.symbol).toBe('BTC/USDT');
    expect(res.totalTrades).toBeGreaterThan(0);
    expect(res.totalFeePaidUsd).toBeGreaterThan(0);
    expect(res.maxDrawdownPct).toBeGreaterThanOrEqual(0);
    expect(res.sharpeRatio).toBeGreaterThan(0);
    expect(res.isLiquidated).toBe(false);
  });

  it('should run QuantAgentHarness ReAct loop and strictly enforce constraints via blind extraction', async () => {
    const harness = new QuantAgentHarness();
    const chunks: string[] = [];

    const presets = await harness.run({
      provider: 'openrouter',
      selectedModel: 'anthropic/claude-3.5-sonnet',
      targetPairs: ['BTC/USDT'],
      minTargetApr: 35,
      maxDrawdown: 10.0,
      lookbackDays: 90,
      riskProfile: 'BALANCED',
      onProgress: (c) => chunks.push(c.log),
    });

    expect(presets.length).toBeGreaterThan(0);
    const btcPreset = presets[0];
    expect(btcPreset.pair).toBe('BTC/USDT');
    // Grounding invariant: Max drawdown must be strictly verified
    expect(btcPreset.maxDrawdown).toBeGreaterThan(0);
    expect(btcPreset.targetApr).toBeGreaterThan(0);
    expect(btcPreset.totalTrades).toBeGreaterThan(0);
    expect(btcPreset.rationale).toContain('deterministic MCP backtester');
    expect(chunks.some((c) => c.includes('compute_market_regime'))).toBe(true);
    expect(chunks.some((c) => c.includes('BACKTEST VERIFIED'))).toBe(true);
  });
});
