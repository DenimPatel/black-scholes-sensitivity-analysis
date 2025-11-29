import React from 'react';
import InfoIcon from './InfoIcon';
import { BlackScholesParams } from '../types';

interface ControlsProps {
  params: BlackScholesParams;
  setParams: React.Dispatch<React.SetStateAction<BlackScholesParams>>;
}

interface SliderConfig {
    id: keyof BlackScholesParams;
    label: string;
    min: number;
    max: number;
    step: number;
    format: (value: number) => string;
    description: string;
}

const controlConfig: SliderConfig[] = [
    { id: 'stockPrice', label: 'Stock Price (S)', min: 1, max: 1000, step: 0.1, format: (v) => `$${v.toFixed(2)}`, description: 'The current market price of the underlying asset (e.g., stock).' },
    { id: 'strikePrice', label: 'Strike Price (K)', min: 1, max: 1000, step: 0.1, format: (v) => `$${v.toFixed(2)}`, description: 'The price at which the option holder can buy (for a call) or sell (for a put) the underlying asset.' },
    { id: 'timeToMaturity', label: 'Time to Maturity (T)', min: 0.01, max: 2, step: 0.01, format: (v) => `${(v * 365).toFixed(0)} days`, description: 'The time remaining until the option expires, expressed in years.' },
    { id: 'volatility', label: 'Volatility (σ)', min: 0.01, max: 1, step: 0.01, format: (v) => `${(v * 100).toFixed(1)}%`, description: 'A measure of how much the asset price is expected to fluctuate, expressed as an annualized standard deviation.' },
    { id: 'riskFreeRate', label: 'Risk-Free Rate (r)', min: 0.00, max: 0.15, step: 0.001, format: (v) => `${(v * 100).toFixed(1)}%`, description: 'The theoretical rate of return of an investment with zero risk, typically the interest rate on government bonds.' },
]

const Controls: React.FC<ControlsProps> = ({ params, setParams }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prevParams) => ({
      ...prevParams,
      [name]: parseFloat(value),
    }));
  };

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
      <h3 className="text-2xl font-semibold text-white mb-6">Model Parameters</h3>
      <div className="space-y-6">
        {controlConfig.map(config => (
             <div key={config.id}>
                <label htmlFor={config.id} className="flex justify-between items-center text-sm font-medium text-gray-300 mb-1">
                    <span className="flex items-center">
                        {config.label}
                        <InfoIcon description={config.description} />
                    </span>
                    <span className="text-cyan-400 font-semibold">{config.format(params[config.id])}</span>
                </label>
                <input
                    id={config.id}
                    name={config.id}
                    type="range"
                    min={config.min}
                    max={config.max}
                    step={config.step}
                    value={params[config.id]}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
            </div>
        ))}
      </div>
    </div>
  );
};

export default Controls;