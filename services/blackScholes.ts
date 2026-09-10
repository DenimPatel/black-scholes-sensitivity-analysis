import { BlackScholesParams, BlackScholesResults, Greeks, MonteCarloResult, MonteCarloConvergencePoint, OptionType } from '../types';
import { mulberry32, standardNormals } from '../utils/random';

// Standard normal cumulative distribution function (CDF) using the error function
export const standardNormalCdf = (x: number): number => {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
};

// Error function approximation
const erf = (x: number): number => {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
};


// Standard normal probability density function (PDF)
export const standardNormalPdf = (x: number): number => {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
};

export const calculateD1D2 = (params: BlackScholesParams): { d1: number, d2: number } => {
  const { stockPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = params;
  
  if (volatility <= 0 || timeToMaturity <= 0) {
    return { d1: stockPrice > strikePrice ? Infinity : -Infinity, d2: stockPrice > strikePrice ? Infinity : -Infinity };
  }

  const d1 = (Math.log(stockPrice / strikePrice) + (riskFreeRate + (volatility * volatility) / 2) * timeToMaturity) / (volatility * Math.sqrt(timeToMaturity));
  const d2 = d1 - volatility * Math.sqrt(timeToMaturity);
  
  return { d1, d2 };
}

export const calculateBlackScholes = (params: BlackScholesParams): BlackScholesResults => {
  const { stockPrice, strikePrice, timeToMaturity, riskFreeRate } = params;
  const { d1, d2 } = calculateD1D2(params);

  const N_d1 = standardNormalCdf(d1);
  const N_d2 = standardNormalCdf(d2);
  const N_minus_d1 = standardNormalCdf(-d1);
  const N_minus_d2 = standardNormalCdf(-d2);
  
  const callPrice = stockPrice * N_d1 - strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * N_d2;
  const putPrice = strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * N_minus_d2 - stockPrice * N_minus_d1;

  return {
    callPrice: callPrice > 0 ? callPrice : 0,
    putPrice: putPrice > 0 ? putPrice : 0,
  };
};


export const calculateGreeks = (params: BlackScholesParams): Greeks => {
  const { stockPrice, strikePrice, timeToMaturity, volatility, riskFreeRate } = params;
  const { d1, d2 } = calculateD1D2(params);
  
  const N_d1 = standardNormalCdf(d1);
  const N_d2 = standardNormalCdf(d2);
  const N_minus_d2 = standardNormalCdf(-d2);
  const pdf_d1 = standardNormalPdf(d1);

  // Delta
  const callDelta = N_d1;
  const putDelta = N_d1 - 1;

  // Gamma
  const gamma = pdf_d1 / (stockPrice * volatility * Math.sqrt(timeToMaturity));

  // Vega (per 1% change in volatility)
  const vega = (stockPrice * pdf_d1 * Math.sqrt(timeToMaturity)) / 100;

  // Theta (per day)
  const callTheta = (-(stockPrice * pdf_d1 * volatility) / (2 * Math.sqrt(timeToMaturity)) - riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * N_d2) / 365;
  const putTheta = (-(stockPrice * pdf_d1 * volatility) / (2 * Math.sqrt(timeToMaturity)) + riskFreeRate * strikePrice * Math.exp(-riskFreeRate * timeToMaturity) * N_minus_d2) / 365;

  // Rho (per 1% change in risk-free rate)
  const callRho = (strikePrice * timeToMaturity * Math.exp(-riskFreeRate * timeToMaturity) * N_d2) / 100;
  const putRho = (-strikePrice * timeToMaturity * Math.exp(-riskFreeRate * timeToMaturity) * N_minus_d2) / 100;

  return {
    callDelta,
    putDelta,
    gamma,
    vega,
    callTheta,
    putTheta,
    callRho,
    putRho,
  };
};

// ---------------------------------------------------------------------------
// Payoff / price decomposition
// ---------------------------------------------------------------------------

// Payoff of an option at expiry (before premium).
export const payoffAtExpiry = (type: OptionType, stockPriceAtExpiry: number, strikePrice: number): number => {
  return type === 'call'
    ? Math.max(0, stockPriceAtExpiry - strikePrice)
    : Math.max(0, strikePrice - stockPriceAtExpiry);
};

// P&L at expiry for a position, including the premium paid/received.
export const pnlAtExpiry = (
  type: OptionType,
  position: 'long' | 'short',
  stockPriceAtExpiry: number,
  strikePrice: number,
  premium: number,
): number => {
  const value = payoffAtExpiry(type, stockPriceAtExpiry, strikePrice);
  return position === 'long' ? value - premium : premium - value;
};

export const intrinsicValue = (type: OptionType, stockPrice: number, strikePrice: number): number => {
  return payoffAtExpiry(type, stockPrice, strikePrice);
};

export const timeValue = (type: OptionType, optionPrice: number, stockPrice: number, strikePrice: number): number => {
  return optionPrice - intrinsicValue(type, stockPrice, strikePrice);
};

// No-arbitrage bounds on today's European option price.
export const noArbitrageBounds = (params: BlackScholesParams): {
  call: { min: number; max: number };
  put: { min: number; max: number };
} => {
  const { stockPrice: S, strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;
  const discountedK = K * Math.exp(-r * T);
  return {
    call: { min: Math.max(0, S - discountedK), max: S },
    put: { min: Math.max(0, discountedK - S), max: discountedK },
  };
};

// Put-call parity: C - P = S - K e^{-rT}.
export const putCallParity = (params: BlackScholesParams) => {
  const { stockPrice: S, strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;
  const { callPrice, putPrice } = calculateBlackScholes(params);
  const lhs = callPrice - putPrice;
  const rhs = S - K * Math.exp(-r * T);
  return { callPrice, putPrice, lhs, rhs, residual: lhs - rhs };
};

// ---------------------------------------------------------------------------
// Risk-neutral terminal distribution & Monte Carlo
// ---------------------------------------------------------------------------

// Terminal prices under the risk-neutral measure: S_T = S * exp((r - sigma^2/2) T + sigma sqrt(T) Z), Z ~ N(0,1).
export const sampleTerminalPrices = (params: BlackScholesParams, n: number, seed: number): number[] => {
  const { stockPrice: S, timeToMaturity: T, volatility: v, riskFreeRate: r } = params;
  const normal = standardNormals(mulberry32(seed));
  const prices = new Array<number>(n);
  const sqrtT = Math.sqrt(T);
  for (let i = 0; i < n; i++) {
    prices[i] = S * Math.exp((r - 0.5 * v * v) * T + v * sqrtT * normal());
  }
  return prices;
};

export const monteCarloPrice = (
  params: BlackScholesParams,
  type: OptionType,
  paths: number,
  seed: number,
): MonteCarloResult => {
  const { strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;
  const terminalPrices = sampleTerminalPrices(params, paths, seed);
  const discount = Math.exp(-r * T);

  let sum = 0;
  const payoffs = new Array<number>(paths);
  for (let i = 0; i < paths; i++) {
    payoffs[i] = payoffAtExpiry(type, terminalPrices[i], K);
    sum += payoffs[i];
  }
  const mean = sum / paths;

  let varSum = 0;
  for (let i = 0; i < paths; i++) {
    const d = payoffs[i] - mean;
    varSum += d * d;
  }
  const sd = Math.sqrt(varSum / Math.max(1, paths - 1));
  const estimate = mean * discount;
  const stdErr = (sd * discount) / Math.sqrt(paths);

  return {
    estimate,
    stdErr,
    lower: estimate - stdErr,
    upper: estimate + stdErr,
    paths,
    seed,
    terminalPrices,
  };
};

// Nested-sample convergence study: the same seed at increasing path counts reuses
// the first n paths, so estimates are correlated and the convergence is smooth.
export const monteCarloConvergence = (
  params: BlackScholesParams,
  type: OptionType,
  totalPaths: number,
  pathCounts: number[],
  seed: number,
): { series: MonteCarloConvergencePoint[]; terminalPrices: number[] } => {
  const { strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;
  const terminalPrices = sampleTerminalPrices(params, totalPaths, seed);
  const discount = Math.exp(-r * T);
  const payoffs = new Array<number>(totalPaths);
  for (let i = 0; i < totalPaths; i++) {
    payoffs[i] = payoffAtExpiry(type, terminalPrices[i], K);
  }

  const series: MonteCarloConvergencePoint[] = [];
  let sum = 0;
  let sumSq = 0;
  for (let n = 1; n <= totalPaths; n++) {
    const count = pathCounts[series.length];
    if (count !== n) continue;
    sum += payoffs[n - 1];
    sumSq += payoffs[n - 1] * payoffs[n - 1];
    const mean = sum / n;
    const variance = Math.max(0, sumSq / n - mean * mean);
    const estimate = mean * discount;
    const stdErr = (Math.sqrt(variance) * discount) / Math.sqrt(n);
    series.push({ paths: n, estimate, stdErr, lower: estimate - stdErr, upper: estimate + stdErr });
  }
  return { series, terminalPrices };
};

// Histogram helper: bins values into `binCount` equal-width bins and returns
// bar data { x: bin midpoint, y: count, x1: bin left, x2: bin right }.
export const buildHistogram = (
  values: number[],
  binCount: number,
): { bars: { x: number; y: number; x1: number; x2: number }[]; min: number; max: number } => {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (min === max) max = min + 1;
  const width = (max - min) / binCount;
  const counts = new Array<number>(binCount).fill(0);
  for (const v of values) {
    let idx = Math.floor((v - min) / width);
    if (idx >= binCount) idx = binCount - 1;
    if (idx < 0) idx = 0;
    counts[idx]++;
  }
  const bars = counts.map((y, i) => ({
    x: min + (i + 0.5) * width,
    y,
    x1: min + i * width,
    x2: min + (i + 1) * width,
  }));
  return { bars, min, max };
};
