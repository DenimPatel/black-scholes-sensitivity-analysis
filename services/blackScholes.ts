
import { BlackScholesParams, BlackScholesResults, Greeks } from '../types';

// Standard normal cumulative distribution function (CDF) using the error function
const standardNormalCdf = (x: number): number => {
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
const standardNormalPdf = (x: number): number => {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
};

const calculateD1D2 = (params: BlackScholesParams): { d1: number, d2: number } => {
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
