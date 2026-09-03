export interface KlineBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VolatilityProfile {
  atr: number;
  natrPct: number;
  parkinsonVol: number;
  garmanKlassVol: number;
  pocPrice: number;
  valPrice: number;
  vahPrice: number;
}

export function computeVolatilityProfile(klines: KlineBar[], period = 14): VolatilityProfile {
  if (!klines || klines.length === 0) {
    return {
      atr: 0,
      natrPct: 0,
      parkinsonVol: 0,
      garmanKlassVol: 0,
      pocPrice: 0,
      valPrice: 0,
      vahPrice: 0,
    };
  }

  // 1. Calculate True Range for each bar
  const trList: number[] = [];
  for (let i = 0; i < klines.length; i++) {
    const k = klines[i];
    if (i === 0) {
      trList.push(k.high - k.low);
    } else {
      const prevClose = klines[i - 1].close;
      const tr = Math.max(
        k.high - k.low,
        Math.abs(k.high - prevClose),
        Math.abs(k.low - prevClose)
      );
      trList.push(tr);
    }
  }

  // Wilder smoothing for ATR
  let atr = trList.slice(0, period).reduce((a, b) => a + b, 0) / Math.min(period, trList.length);
  for (let i = period; i < trList.length; i++) {
    atr = (atr * (period - 1) + trList[i]) / period;
  }

  const lastClose = klines[klines.length - 1].close;
  const natrPct = lastClose > 0 ? Number(((atr / lastClose) * 100).toFixed(2)) : 0;

  // 2. Parkinson Volatility: sqrt( 1 / (4 * ln(2) * N) * sum( ln(H/L)^2 ) ) * sqrt(365)
  let sumParkinson = 0;
  let sumGK = 0;
  const n = klines.length;

  for (const k of klines) {
    if (k.low > 0 && k.high >= k.low && k.open > 0 && k.close > 0) {
      const hlRatio = Math.log(k.high / k.low);
      sumParkinson += Math.pow(hlRatio, 2);

      const coRatio = Math.log(k.close / k.open);
      sumGK += 0.5 * Math.pow(hlRatio, 2) - (2 * Math.log(2) - 1) * Math.pow(coRatio, 2);
    }
  }

  const parkinsonAnnualized = Math.sqrt((1 / (4 * Math.log(2) * n)) * sumParkinson) * Math.sqrt(365);
  const gkAnnualized = Math.sqrt((1 / n) * Math.max(0, sumGK)) * Math.sqrt(365);

  // 3. Volume Profile: 50 price buckets across min low to max high
  let minPrice = Infinity;
  let maxPrice = -Infinity;
  for (const k of klines) {
    if (k.low < minPrice) minPrice = k.low;
    if (k.high > maxPrice) maxPrice = k.high;
  }

  const numBuckets = 50;
  const bucketStep = (maxPrice - minPrice) / numBuckets;
  const volumeBuckets = new Array(numBuckets).fill(0);

  for (const k of klines) {
    const mid = (k.high + k.low) / 2;
    const idx = Math.min(numBuckets - 1, Math.max(0, Math.floor((mid - minPrice) / bucketStep)));
    volumeBuckets[idx] += k.volume;
  }

  // Find POC (Point of Control - bucket with max volume)
  let maxVol = -1;
  let pocIdx = 0;
  let totalVol = 0;
  for (let i = 0; i < numBuckets; i++) {
    totalVol += volumeBuckets[i];
    if (volumeBuckets[i] > maxVol) {
      maxVol = volumeBuckets[i];
      pocIdx = i;
    }
  }

  const pocPrice = Number((minPrice + (pocIdx + 0.5) * bucketStep).toFixed(2));

  // Value Area (70% of total volume centered around POC)
  const targetVaVol = totalVol * 0.70;
  let currentVaVol = volumeBuckets[pocIdx];
  let lowerIdx = pocIdx;
  let upperIdx = pocIdx;

  while (currentVaVol < targetVaVol && (lowerIdx > 0 || upperIdx < numBuckets - 1)) {
    const nextLowerVol = lowerIdx > 0 ? volumeBuckets[lowerIdx - 1] : -1;
    const nextUpperVol = upperIdx < numBuckets - 1 ? volumeBuckets[upperIdx + 1] : -1;

    if (nextLowerVol >= nextUpperVol && lowerIdx > 0) {
      lowerIdx--;
      currentVaVol += volumeBuckets[lowerIdx];
    } else if (upperIdx < numBuckets - 1) {
      upperIdx++;
      currentVaVol += volumeBuckets[upperIdx];
    } else if (lowerIdx > 0) {
      lowerIdx--;
      currentVaVol += volumeBuckets[lowerIdx];
    } else {
      break;
    }
  }

  const valPrice = Number((minPrice + lowerIdx * bucketStep).toFixed(2));
  const vahPrice = Number((minPrice + (upperIdx + 1) * bucketStep).toFixed(2));

  return {
    atr: Number(atr.toFixed(2)),
    natrPct,
    parkinsonVol: Number((parkinsonAnnualized * 100).toFixed(1)),
    garmanKlassVol: Number((gkAnnualized * 100).toFixed(1)),
    pocPrice,
    valPrice,
    vahPrice,
  };
}
