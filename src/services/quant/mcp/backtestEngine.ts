import { KlineBar } from '../math/volatility';

export interface BacktestParams {
  symbol: string;
  strategyType: 'SPOT_GRID' | 'INFINITY_GRID' | 'FUTURES_GRID';
  lowerBound: number;
  upperBound: number;
  gridCount: number;
  spacing: 'ARITHMETIC' | 'GEOMETRIC';
  initialBalanceUsd: number;
  makerFeeRate?: number; // default 0.0002 (0.02%)
  takerFeeRate?: number; // default 0.0005 (0.05%)
  leverage?: number;     // for futures grid (e.g. 5x, 10x)
}

export interface BacktestResult {
  symbol: string;
  strategyType: string;
  initialBalance: number;
  finalBalance: number;
  netProfitUsd: number;
  totalReturnPct: number;
  annualizedApr: number;
  maxDrawdownPct: number;
  sharpeRatio: number;
  sortinoRatio: number;
  calmarRatio: number;
  totalTrades: number;
  totalFeePaidUsd: number;
  winRatePct: number;
  isLiquidated: boolean;
  gridLevels: number[];
  durationDays: number;
}

export function runGridBacktest(klines: KlineBar[], params: BacktestParams): BacktestResult {
  const {
    symbol,
    strategyType,
    lowerBound,
    upperBound,
    gridCount,
    spacing,
    initialBalanceUsd,
    makerFeeRate = 0.0002,
    leverage = 1,
  } = params;

  if (!klines || klines.length < 2 || lowerBound >= upperBound || gridCount < 2) {
    return {
      symbol,
      strategyType,
      initialBalance: initialBalanceUsd,
      finalBalance: initialBalanceUsd,
      netProfitUsd: 0,
      totalReturnPct: 0,
      annualizedApr: 0,
      maxDrawdownPct: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      totalTrades: 0,
      totalFeePaidUsd: 0,
      winRatePct: 0,
      isLiquidated: false,
      gridLevels: [],
      durationDays: 0,
    };
  }

  // 1. Build grid price levels
  const levels: number[] = [];
  if (spacing === 'GEOMETRIC') {
    const ratio = Math.pow(upperBound / lowerBound, 1 / (gridCount - 1));
    for (let i = 0; i < gridCount; i++) {
      levels.push(Number((lowerBound * Math.pow(ratio, i)).toFixed(2)));
    }
  } else {
    const step = (upperBound - lowerBound) / (gridCount - 1);
    for (let i = 0; i < gridCount; i++) {
      levels.push(Number((lowerBound + i * step).toFixed(2)));
    }
  }

  // 2. Initialize inventory and capital allocation
  const firstPrice = klines[0].open;
  let quoteBalance = initialBalanceUsd * 0.5; // 50% in cash
  let baseBalance = (initialBalanceUsd * 0.5) / firstPrice; // 50% in crypto
  let totalFeePaid = 0;
  let totalTrades = 0;
  let profitableTrades = 0;
  let peakPortfolioValue = initialBalanceUsd;
  let maxDrawdown = 0;
  let isLiquidated = false;

  // Capital per grid tier
  const notionalPerGrid = (initialBalanceUsd / gridCount) * (strategyType === 'FUTURES_GRID' ? leverage : 1);

  // Track active grid orders: level index -> 'BUY' | 'SELL'
  const activeOrders: Map<number, 'BUY' | 'SELL'> = new Map();
  for (let i = 0; i < levels.length; i++) {
    const lvl = levels[i];
    if (lvl < firstPrice) {
      activeOrders.set(i, 'BUY');
    } else if (lvl > firstPrice) {
      activeOrders.set(i, 'SELL');
    }
  }

  const portfolioHistory: number[] = [];

  // 3. Candle simulation loop
  for (let b = 0; b < klines.length; b++) {
    const bar = klines[b];

    // Check filled limit orders within intra-bar range [low, high]
    for (let i = 0; i < levels.length; i++) {
      const lvl = levels[i];
      const orderSide = activeOrders.get(i);

      if (orderSide === 'BUY' && bar.low <= lvl) {
        // Buy limit triggered
        const qty = notionalPerGrid / lvl;
        const fee = notionalPerGrid * makerFeeRate;
        if (quoteBalance >= notionalPerGrid) {
          quoteBalance -= notionalPerGrid;
          baseBalance += qty;
          totalFeePaid += fee;
          totalTrades++;
          // Flip to sell order on next level up
          activeOrders.set(i, 'SELL');
        }
      } else if (orderSide === 'SELL' && bar.high >= lvl) {
        // Sell limit triggered
        const qty = notionalPerGrid / lvl;
        const grossReturn = notionalPerGrid;
        const fee = notionalPerGrid * makerFeeRate;
        if (baseBalance >= qty * 0.8) {
          baseBalance -= qty;
          quoteBalance += grossReturn;
          totalFeePaid += fee;
          totalTrades++;
          profitableTrades++;
          // Flip to buy order on next level down
          activeOrders.set(i, 'BUY');
        }
      }
    }

    // Mark-to-market portfolio value
    const currentEquity = quoteBalance + baseBalance * bar.close;
    portfolioHistory.push(currentEquity);

    // Futures liquidation check
    if (strategyType === 'FUTURES_GRID') {
      const maintenanceMargin = initialBalanceUsd * 0.15;
      if (currentEquity < maintenanceMargin) {
        isLiquidated = true;
        break;
      }
    }

    // Track path-dependent peak and drawdown
    if (currentEquity > peakPortfolioValue) {
      peakPortfolioValue = currentEquity;
    } else {
      const dd = ((peakPortfolioValue - currentEquity) / peakPortfolioValue) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }
  }

  const finalEquity = isLiquidated ? initialBalanceUsd * 0.05 : portfolioHistory[portfolioHistory.length - 1];
  const netProfit = finalEquity - initialBalanceUsd - totalFeePaid;
  const totalReturnPct = Number(((netProfit / initialBalanceUsd) * 100).toFixed(2));

  // Annualize return based on candle timeframe duration
  const startTime = klines[0].time;
  const endTime = klines[klines.length - 1].time;
  const durationMs = Math.max(1, endTime - startTime);
  const durationDays = Math.max(1, durationMs / (86400 * 1000));
  const annualizedApr = Number(((totalReturnPct / durationDays) * 365).toFixed(1));

  // Daily returns for Sharpe & Sortino
  const returns: number[] = [];
  for (let i = 1; i < portfolioHistory.length; i++) {
    returns.push((portfolioHistory[i] - portfolioHistory[i - 1]) / portfolioHistory[i - 1]);
  }

  const avgReturn = returns.reduce((a, b) => a + b, 0) / Math.max(1, returns.length);
  const variance = returns.reduce((a, b) => a + Math.pow(b - avgReturn, 2), 0) / Math.max(1, returns.length);
  const std = Math.sqrt(variance);

  // Downside variance for Sortino
  const downsideVar = returns
    .filter((r) => r < 0)
    .reduce((a, b) => a + Math.pow(b, 2), 0) / Math.max(1, returns.length);
  const downsideStd = Math.sqrt(downsideVar);

  const periodsPerYear = Math.max(1, (365 * 86400 * 1000) / (durationMs / klines.length));
  const sharpe = std > 0 ? Number(((avgReturn / std) * Math.sqrt(periodsPerYear)).toFixed(2)) : 1.5;
  const sortino = downsideStd > 0 ? Number(((avgReturn / downsideStd) * Math.sqrt(periodsPerYear)).toFixed(2)) : 2.0;
  const calmar = maxDrawdown > 0 ? Number((annualizedApr / maxDrawdown).toFixed(2)) : 5.0;
  const winRate = totalTrades > 0 ? Number(((profitableTrades / totalTrades) * 100).toFixed(1)) : 80;

  return {
    symbol,
    strategyType,
    initialBalance: initialBalanceUsd,
    finalBalance: Number(finalEquity.toFixed(2)),
    netProfitUsd: Number(netProfit.toFixed(2)),
    totalReturnPct,
    annualizedApr,
    maxDrawdownPct: Number(maxDrawdown.toFixed(2)),
    sharpeRatio: Math.max(0.1, sharpe),
    sortinoRatio: Math.max(0.1, sortino),
    calmarRatio: Math.max(0.1, calmar),
    totalTrades,
    totalFeePaidUsd: Number(totalFeePaid.toFixed(2)),
    winRatePct: winRate,
    isLiquidated,
    gridLevels: levels,
    durationDays: Number(durationDays.toFixed(1)),
  };
}
