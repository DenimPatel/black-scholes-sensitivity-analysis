import React, { useState, useMemo } from 'react';
import { calculateBlackScholes, calculateGreeks } from './services/blackScholes';
import { BlackScholesParams, BlackScholesResults, Greeks, ChartData, SensitivityVariable } from './types';
import Controls from './components/Controls';
import Results from './components/Results';
import SensitivityChart from './components/SensitivityChart';

const App: React.FC = () => {
  const [params, setParams] = useState<BlackScholesParams>({
    stockPrice: 100.0,
    strikePrice: 100.0,
    timeToMaturity: 0.25, // 3 months
    volatility: 0.28, // 28%
    riskFreeRate: 0.05, // 5%
  });

  const [activeChart, setActiveChart] = useState<SensitivityVariable>('stockPrice');

  const { results, greeks } = useMemo(() => {
    const results: BlackScholesResults = calculateBlackScholes(params);
    const greeks: Greeks = calculateGreeks(params);
    return { results, greeks };
  }, [params]);

  const chartData = useMemo<ChartData[]>(() => {
    const data: ChartData[] = [];
    const steps = 50;
    let range = { min: 0, max: 0 };
    const baseValue = params[activeChart];

    switch (activeChart) {
      case 'stockPrice':
        range = { min: baseValue * 0.8, max: baseValue * 1.2 };
        break;
      case 'strikePrice':
        range = { min: baseValue * 0.8, max: baseValue * 1.2 };
        break;
      case 'timeToMaturity':
        range = { min: 0.01, max: 1 };
        break;
      case 'volatility':
        range = { min: 0.05, max: 0.6 };
        break;
      case 'riskFreeRate':
        range = { min: 0.01, max: 0.1 };
        break;
    }

    for (let i = 0; i <= steps; i++) {
      const variableValue = range.min + (i * (range.max - range.min)) / steps;
      const tempParams = { ...params, [activeChart]: variableValue };
      const tempResults = calculateBlackScholes(tempParams);
      const tempGreeks = calculateGreeks(tempParams);
      data.push({
        variable: variableValue,
        callPrice: tempResults.callPrice,
        putPrice: tempResults.putPrice,
        delta: tempGreeks.callDelta,
        gamma: tempGreeks.gamma,
        vega: tempGreeks.vega,
        theta: tempGreeks.callTheta,
        rho: tempGreeks.callRho,
      });
    }
    return data;
  }, [params, activeChart]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
            Black-Scholes Sensitivity Analysis
          </h1>
          <p className="text-lg text-gray-400">
            Interactive Option Pricing Dashboard
          </p>
        </header>

        <div className="text-center mb-8 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 p-4 rounded-2xl">
          <p>
            <span className="font-semibold text-cyan-400">Pro Tip:</span> Hover or click on the tiles under <strong>Calculated Values</strong> and hover over the info icons on <strong>Model Parameters</strong> to learn more.
          </p>
        </div>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <Controls params={params} setParams={setParams} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Results results={results} greeks={greeks} params={params} />
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
              <h3 className="text-2xl font-semibold text-white mb-4">Sensitivity Visualization</h3>
               <div className="mb-4">
                <label className="text-sm font-medium text-gray-400">Analyze sensitivity to:</label>
                <select 
                  value={activeChart}
                  onChange={(e) => setActiveChart(e.target.value as SensitivityVariable)}
                  className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md p-2 text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="stockPrice">Stock Price</option>
                  <option value="strikePrice">Strike Price</option>
                  <option value="timeToMaturity">Time to Maturity</option>
                  <option value="volatility">Volatility</option>
                  <option value="riskFreeRate">Risk-Free Rate</option>
                </select>
              </div>
              <SensitivityChart data={chartData} xAxisKey="variable" activeVariable={activeChart}/>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;