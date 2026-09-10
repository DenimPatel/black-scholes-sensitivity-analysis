
import React, { createContext, useContext, useState } from 'react';
import { BlackScholesParams } from '../types';

interface ParamsContextValue {
  params: BlackScholesParams;
  setParams: React.Dispatch<React.SetStateAction<BlackScholesParams>>;
}

export const defaultParams: BlackScholesParams = {
  stockPrice: 100.0,
  strikePrice: 100.0,
  timeToMaturity: 0.25, // 3 months
  volatility: 0.28, // 28%
  riskFreeRate: 0.05, // 5%
};

const ParamsContext = createContext<ParamsContextValue | null>(null);

// Mounted above <Routes> so the five model parameters survive page navigation
// and every learn page's charts react live to the same sliders.
export const ParamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [params, setParams] = useState<BlackScholesParams>(defaultParams);
  return <ParamsContext.Provider value={{ params, setParams }}>{children}</ParamsContext.Provider>;
};

export const useModelParams = (): ParamsContextValue => {
  const ctx = useContext(ParamsContext);
  if (!ctx) {
    throw new Error('useModelParams must be used inside a ParamsProvider');
  }
  return ctx;
};
