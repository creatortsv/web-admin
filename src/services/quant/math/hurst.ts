/**
 * Hurst Exponent (H) Calculation via Rescaled Range (R/S) Analysis.
 * 
 * Interpretation:
 * - H < 0.45: Mean-Reverting / Anti-persistent (Ideal for Spot Grid & Arbitrage)
 * - 0.45 <= H <= 0.55: Geometric Brownian Motion / Random Walk
 * - H > 0.55: Persistent / Strong Trending (Ideal for Infinity Grid or Momentum breakout)
 */
export interface HurstResult {
  hurst: number;
  regime: 'MEAN_REVERTING' | 'RANDOM_WALK' | 'TRENDING';
  confidence: number;
  description: string;
}

export function computeHurstExponent(prices: number[]): HurstResult {
  if (!prices || prices.length < 50) {
    return {
      hurst: 0.5,
      regime: 'RANDOM_WALK',
      confidence: 0.5,
      description: 'Insufficient sample size for rescaled range analysis (minimum 50 required).',
    };
  }

  // Calculate log returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0 && prices[i] > 0) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }
  }

  const n = returns.length;
  // Test sub-period window sizes (e.g. 10, 20, 40, 80, ...)
  const minWindow = 10;
  const maxWindow = Math.floor(n / 2);
  const windows: number[] = [];
  let w = minWindow;
  while (w <= maxWindow) {
    windows.push(w);
    w = Math.floor(w * 1.6);
  }

  if (windows.length < 3) {
    windows.push(minWindow, Math.floor((minWindow + maxWindow) / 2), maxWindow);
  }

  const logWindows: number[] = [];
  const logRS: number[] = [];

  for (const win of windows) {
    const numSubsets = Math.floor(n / win);
    if (numSubsets === 0) continue;

    let sumRS = 0;
    for (let s = 0; s < numSubsets; s++) {
      const subset = returns.slice(s * win, (s + 1) * win);
      const mean = subset.reduce((acc, v) => acc + v, 0) / win;

      // Standard deviation
      const variance = subset.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / win;
      const std = Math.sqrt(variance);

      if (std === 0) continue;

      // Cumulative deviations from mean
      let cum = 0;
      let maxDev = -Infinity;
      let minDev = Infinity;
      for (const val of subset) {
        cum += val - mean;
        if (cum > maxDev) maxDev = cum;
        if (cum < minDev) minDev = cum;
      }

      const range = maxDev - minDev;
      sumRS += range / std;
    }

    const avgRS = sumRS / numSubsets;
    if (avgRS > 0) {
      logWindows.push(Math.log(win));
      logRS.push(Math.log(avgRS));
    }
  }

  if (logWindows.length < 2) {
    return {
      hurst: 0.5,
      regime: 'RANDOM_WALK',
      confidence: 0.5,
      description: 'Degenerate regression: insufficient sub-period windows.',
    };
  }

  // Ordinary Least Squares linear regression: logRS = H * logWindows + C
  const meanX = logWindows.reduce((a, b) => a + b, 0) / logWindows.length;
  const meanY = logRS.reduce((a, b) => a + b, 0) / logRS.length;

  let num = 0;
  let den = 0;
  for (let i = 0; i < logWindows.length; i++) {
    num += (logWindows[i] - meanX) * (logRS[i] - meanY);
    den += Math.pow(logWindows[i] - meanX, 2);
  }

  let rawHurst = den !== 0 ? num / den : 0.5;
  // Bound to mathematically plausible domain [0.05, 0.95]
  rawHurst = Math.max(0.05, Math.min(0.95, Number(rawHurst.toFixed(3))));

  let regime: 'MEAN_REVERTING' | 'RANDOM_WALK' | 'TRENDING' = 'RANDOM_WALK';
  let description = 'Neutral regime with near-random Brownian path.';

  if (rawHurst < 0.45) {
    regime = 'MEAN_REVERTING';
    description = `Anti-persistent mean-reversion detected (H = ${rawHurst}). High probability of oscillating within volume boundaries. Optimal for Spot Grid.`;
  } else if (rawHurst > 0.55) {
    regime = 'TRENDING';
    description = `Persistent momentum regime detected (H = ${rawHurst}). Long memory autocorrelation. Recommend Infinity Grid with dynamic floor.`;
  }

  const confidence = Number((Math.min(1.0, Math.abs(rawHurst - 0.5) * 4 + 0.5)).toFixed(2));

  return {
    hurst: rawHurst,
    regime,
    confidence,
    description,
  };
}
