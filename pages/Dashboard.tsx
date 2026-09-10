
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { calculateBlackScholes, calculateGreeks } from '../services/blackScholes';
import { BlackScholesResults, Greeks } from '../types';
import Results from '../components/Results';
import GreeksGrid from '../components/learn/GreeksGrid';
import { useModelParams } from '../state/ParamsContext';

const Dashboard: React.FC = () => {
  const { params } = useModelParams();

  const { results, greeks } = useMemo(() => {
    const results: BlackScholesResults = calculateBlackScholes(params);
    const greeks: Greeks = calculateGreeks(params);
    return { results, greeks };
  }, [params]);

  return (
    <div>
      <header className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">
          Black-Scholes Sensitivity Analysis
        </h1>
        <p className="text-lg text-slate-500">Interactive Option Pricing Dashboard</p>
      </header>

      <div className="text-center mb-8 text-sm text-slate-600 glass-card p-4 leading-6">
        <p>
          <span className="font-semibold text-[var(--color-accent)]">New here?</span> Start with the{' '}
          <Link to="/learn" className="text-[var(--color-accent)] hover:underline font-semibold">
            8-step guided tour
          </Link>{' '}
          — it builds the intuition from zero, with a chart for every idea. Already familiar? Hover or click the
          tiles under <strong>Calculated Values</strong> and the info icons on <strong>Model Parameters</strong> to
          see the full derivations.
        </p>
      </div>

      <div className="space-y-8">
        <Results results={results} greeks={greeks} params={params} />
        <div className="glass-card p-6">
          <h3 className="text-2xl font-semibold mb-2">Sensitivity Visualization</h3>
          <p className="text-sm text-slate-500 mb-5">
            One Greek per tile, one input swept across the chart — the dot marks your current setting.
          </p>
          <GreeksGrid variant="compact" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
