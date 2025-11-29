
import React from 'react';
import { BlackScholesResults, Greeks } from '../types';
import InfoCard from './InfoCard';

interface ResultsProps {
  results: BlackScholesResults;
  greeks: Greeks;
}

const Results: React.FC<ResultsProps> = ({ results, greeks }) => {
  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
      <h3 className="text-2xl font-semibold text-white mb-4">Calculated Values</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <InfoCard title="Call Price" value={`$${results.callPrice.toFixed(3)}`} description="Theoretical value of a call option." />
        <InfoCard title="Put Price" value={`$${results.putPrice.toFixed(3)}`} description="Theoretical value of a put option." />
        <InfoCard title="Call Delta" value={greeks.callDelta.toFixed(4)} description="Rate of change of option price w.r.t. asset price." />
        <InfoCard title="Put Delta" value={greeks.putDelta.toFixed(4)} description="Rate of change of option price w.r.t. asset price." />
        <InfoCard title="Gamma" value={greeks.gamma.toFixed(4)} description="Rate of change of Delta w.r.t. asset price." />
        <InfoCard title="Vega" value={greeks.vega.toFixed(4)} description="Sensitivity to a 1% change in volatility." />
        <InfoCard title="Call Theta" value={greeks.callTheta.toFixed(4)} description="Sensitivity to the passage of one day (time decay)." />
        <InfoCard title="Put Theta" value={greeks.putTheta.toFixed(4)} description="Sensitivity to the passage of one day (time decay)." />
        <InfoCard title="Call Rho" value={greeks.callRho.toFixed(4)} description="Sensitivity to a 1% change in interest rate." />
        <InfoCard title="Put Rho" value={greeks.putRho.toFixed(4)} description="Sensitivity to a 1% change in interest rate." />
      </div>
    </div>
  );
};

export default Results;
