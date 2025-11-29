
export interface BlackScholesParams {
  stockPrice: number;
  strikePrice: number;
  timeToMaturity: number; // in years
  volatility: number; // as a decimal (e.g., 0.2 for 20%)
  riskFreeRate: number; // as a decimal (e.g., 0.05 for 5%)
}

export interface BlackScholesResults {
  callPrice: number;
  putPrice: number;
}

export interface Greeks {
  callDelta: number;
  putDelta: number;
  gamma: number;
  vega: number;
  callTheta: number;
  putTheta: number;
  callRho: number;
  putRho: number;
}

export interface ChartData {
  variable: number;
  callPrice: number;
  putPrice: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  rho: number;
}

export type SensitivityVariable = 'stockPrice' | 'strikePrice' | 'timeToMaturity' | 'volatility' | 'riskFreeRate';
