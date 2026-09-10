
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { calculateBlackScholes, calculateGreeks } from '../services/blackScholes';
import { BlackScholesResults, Greeks } from '../types';
import Controls from '../components/Controls';
import Results from '../components/Results';
import GreeksGrid from '../components/learn/GreeksGrid';
import { useModelParams } from '../state/ParamsContext';

const Dashboard: React.FC = () => {
  const { params, setParams } = useModelParams();

  const { results, greeks } = useMemo(() => {
    const results: BlackScholesResults = calculateBlackScholes(params);
    const greeks: Greeks = calculateGreeks(params);
    return { results, greeks };
  }, [params]);

  return (
    <div>
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">
          Black-Scholes Sensitivity Analysis
        </h1>
        <p className="text-lg text-gray-400">Interactive Option Pricing Dashboard</p>
      </header>

      <div className="text-center mb-8 text-sm text-gray-400 bg-gray-800/50 border border-gray-700 p-4 rounded-2xl leading-6">
        <p>
          <span className="font-semibold text-cyan-400">New here?</span> Start with the{' '}
          <Link to="/learn" className="text-cyan-400 hover:underline font-semibold">
            8-step guided tour
          </Link>{' '}
          — it builds the intuition from zero, with a chart for every idea. Already familiar? Hover or click the
          tiles under <strong>Calculated Values</strong> and the info icons on <strong>Model Parameters</strong> to
          see the full derivations.
        </p>
      </div>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <Controls params={params} setParams={setParams} />
        </div>

        <div className="lg:col-span-2 space-y-8">
          <Results results={results} greeks={greeks} params={params} />
          <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
            <h3 className="text-2xl font-semibold text-white mb-2">Sensitivity Visualization</h3>
            <p className="text-sm text-gray-400 mb-5">
              One Greek per tile, one input swept across the chart — the white dot marks your current setting.
            </p>
            <GreeksGrid variant="compact" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
