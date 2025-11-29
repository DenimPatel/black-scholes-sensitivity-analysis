
import React, { useState } from 'react';
import { BlackScholesResults, Greeks, BlackScholesParams } from '../types';
import { calculateD1D2, standardNormalCdf, standardNormalPdf } from '../services/blackScholes';
import InfoCard from './InfoCard';

interface ResultsProps {
  results: BlackScholesResults;
  greeks: Greeks;
  params: BlackScholesParams;
}

const Results: React.FC<ResultsProps> = ({ results, greeks, params }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleCardClick = (title: string) => {
    setExpandedCard(expandedCard === title ? null : title);
  };

  const { stockPrice: S, strikePrice: K, timeToMaturity: T, volatility: v, riskFreeRate: r } = params;
  
  const { d1, d2 } = calculateD1D2(params);
  const N_d1 = standardNormalCdf(d1);
  const N_d2 = standardNormalCdf(d2);
  const N_minus_d1 = standardNormalCdf(-d1);
  const N_minus_d2 = standardNormalCdf(-d2);
  const pdf_d1 = standardNormalPdf(d1);


  const getD1D2Calc = () => {
    return `d_1 = \\frac{\\ln(\\frac{S}{K}) + (r + \\frac{v^2}{2})T}{v\\sqrt{T}} \\\\
   = \\frac{\\ln(\\frac{${S.toFixed(2)}}{${K.toFixed(2)}}) + (${r.toFixed(3)} + \\frac{${v.toFixed(3)}^2}{2})${T.toFixed(3)}}{${v.toFixed(3)}\\sqrt{${T.toFixed(3)}}} \\\\
   = ${d1.toFixed(4)} \\\\ \\\\
d_2 = d_1 - v\\sqrt{T} \\\\
   = ${d1.toFixed(4)} - ${v.toFixed(3)}\\sqrt{${T.toFixed(3)}} \\\\
   = ${d2.toFixed(4)}`;
  };

  const getCallPriceCalc = () => {
    const term1 = S * N_d1;
    const term2 = K * Math.exp(-r * T) * N_d2;
    return `C = S \\cdot N(d_1) - K \\cdot e^{-rT} \\cdot N(d_2) \\\\
${getD1D2Calc()} \\\\
N(d_1) = ${N_d1.toFixed(4)} \\\\
N(d_2) = ${N_d2.toFixed(4)} \\\\ \\\\
C = ${S.toFixed(2)} \\cdot ${N_d1.toFixed(4)} - ${K.toFixed(2)} \\cdot e^{-${r.toFixed(3)} \\cdot ${T.toFixed(3)}} \\cdot ${N_d2.toFixed(4)} \\\\
   = ${term1.toFixed(4)} - ${term2.toFixed(4)} \\\\
   = \\$${results.callPrice.toFixed(3)}`;
  };
  
  const getPutPriceCalc = () => {
    const term1 = K * Math.exp(-r * T) * N_minus_d2;
    const term2 = S * N_minus_d1;
    return `P = K \\cdot e^{-rT} \\cdot N(-d_2) - S \\cdot N(-d_1) \\\\
${getD1D2Calc()} \\\\
N(-d_1) = ${N_minus_d1.toFixed(4)} \\\\
N(-d_2) = ${N_minus_d2.toFixed(4)} \\\\ \\\\
P = ${K.toFixed(2)} \\cdot e^{-${r.toFixed(3)} \\cdot ${T.toFixed(3)}} \\cdot ${N_minus_d2.toFixed(4)} - ${S.toFixed(2)} \\cdot ${N_minus_d1.toFixed(4)} \\\\
  = ${term1.toFixed(4)} - ${term2.toFixed(4)} \\\\
  = \\$${results.putPrice.toFixed(3)}`;
  };

  const getDeltaCalc = (type: 'call' | 'put') => {
    if (type === 'call') {
      return `\\Delta_C = N(d_1) \\\\
${getD1D2Calc()} \\\\
N(d_1) = ${N_d1.toFixed(4)} \\\\
\\Delta_C = ${greeks.callDelta.toFixed(4)}`;
    }
    return `\\Delta_P = N(d_1) - 1 \\\\
${getD1D2Calc()} \\\\
N(d_1) = ${N_d1.toFixed(4)} \\\\
\\Delta_P = ${N_d1.toFixed(4)} - 1 = ${greeks.putDelta.toFixed(4)}`;
  }

  const getGammaCalc = () => `\\Gamma = \\frac{\\phi(d_1)}{S \\cdot v \\cdot \\sqrt{T}} \\\\
${getD1D2Calc()} \\\\
\\phi(d_1) \\text{ [pdf]} = ${pdf_d1.toFixed(4)} \\\\
\\Gamma = \\frac{${pdf_d1.toFixed(4)}}{${S.toFixed(2)} \\cdot ${v.toFixed(3)} \\cdot \\sqrt{${T.toFixed(3)}}} \\\\
      = ${greeks.gamma.toFixed(4)}`;
  
  const getVegaCalc = () => `\\nu \\text{ (per 1\\%)} = \\frac{S \\cdot \\phi(d_1) \\cdot \\sqrt{T}}{100} \\\\
${getD1D2Calc()} \\\\
\\phi(d_1) \\text{ [pdf]} = ${pdf_d1.toFixed(4)} \\\\
\\nu = \\frac{${S.toFixed(2)} \\cdot ${pdf_d1.toFixed(4)} \\cdot \\sqrt{${T.toFixed(3)}}}{100} \\\\
     = ${greeks.vega.toFixed(4)}`;

  const getThetaCalc = (type: 'call' | 'put') => {
    if (type === 'call') {
      return `\\Theta_C \\text{ (per day)} = \\frac{-(\\frac{S \\cdot \\phi(d_1) \\cdot v}{2\\sqrt{T}}) - rK e^{-rT} N(d_2)}{365} \\\\
${getD1D2Calc()} \\\\
\\phi(d_1) = ${pdf_d1.toFixed(4)}, N(d_2) = ${N_d2.toFixed(4)} \\\\
\\Theta_C = ${greeks.callTheta.toFixed(4)}`;
    }
    return `\\Theta_P \\text{ (per day)} = \\frac{-(\\frac{S \\cdot \\phi(d_1) \\cdot v}{2\\sqrt{T}}) + rK e^{-rT} N(-d_2)}{365} \\\\
${getD1D2Calc()} \\\\
\\phi(d_1) = ${pdf_d1.toFixed(4)}, N(-d_2) = ${N_minus_d2.toFixed(4)} \\\\
\\Theta_P = ${greeks.putTheta.toFixed(4)}`;
  }
  
  const getRhoCalc = (type: 'call' | 'put') => {
    if (type === 'call') {
      return `\\rho_C \\text{ (per 1\\%)} = \\frac{K \\cdot T \\cdot e^{-rT} \\cdot N(d_2)}{100} \\\\
${getD1D2Calc()} \\\\
N(d_2) = ${N_d2.toFixed(4)} \\\\
\\rho_C = ${greeks.callRho.toFixed(4)}`;
    }
    return `\\rho_P \\text{ (per 1\\%)} = \\frac{-K \\cdot T \\cdot e^{-rT} \\cdot N(-d_2)}{100} \\\\
${getD1D2Calc()} \\\\
N(-d_2) = ${N_minus_d2.toFixed(4)} \\\\
\\rho_P = ${greeks.putRho.toFixed(4)}`;
  }

  const cards = [
    { title: "Call Price", value: `$${results.callPrice.toFixed(3)}`, description: "The theoretical premium of a European call option. It represents the price an investor would pay for the right to buy the underlying asset at the strike price on the expiration date.", calculation: getCallPriceCalc() },
    { title: "Put Price", value: `$${results.putPrice.toFixed(3)}`, description: "The theoretical premium of a European put option. It represents the price an investor would pay for the right to sell the underlying asset at the strike price on the expiration date.", calculation: getPutPriceCalc() },
    { title: "Call Delta", value: greeks.callDelta.toFixed(4), description: "Measures the rate of change of the call option's price with respect to a $1 change in the underlying asset's price. Ranges from 0 to 1.", calculation: getDeltaCalc('call') },
    { title: "Put Delta", value: greeks.putDelta.toFixed(4), description: "Measures the rate of change of the put option's price with respect to a $1 change in the underlying asset's price. Ranges from -1 to 0.", calculation: getDeltaCalc('put') },
    { title: "Gamma", value: greeks.gamma.toFixed(4), description: "Measures the rate of change in an option's Delta with respect to a $1 change in the underlying asset price. It indicates how much the Delta will change as the asset price changes.", calculation: getGammaCalc() },
    { title: "Vega", value: greeks.vega.toFixed(4), description: "Measures the sensitivity of an option's price to a 1% change in the implied volatility of the underlying asset. Higher Vega indicates greater sensitivity to volatility changes.", calculation: getVegaCalc() },
    { title: "Call Theta", value: greeks.callTheta.toFixed(4), description: "Measures the rate of decline in the value of a call option as time passes (time decay), assuming all other factors remain constant. It's usually negative.", calculation: getThetaCalc('call') },
    { title: "Put Theta", value: greeks.putTheta.toFixed(4), description: "Measures the rate of decline in the value of a put option as time passes (time decay), assuming all other factors remain constant. It's usually negative.", calculation: getThetaCalc('put') },
    { title: "Call Rho", value: greeks.callRho.toFixed(4), description: "Measures the sensitivity of a call option's price to a 1% change in the risk-free interest rate. It shows how much the option price will change as interest rates change.", calculation: getRhoCalc('call') },
    { title: "Put Rho", value: greeks.putRho.toFixed(4), description: "Measures the sensitivity of a put option's price to a 1% change in the risk-free interest rate. It shows how much the option price will change as interest rates change.", calculation: getRhoCalc('put') },
  ];

  return (
    <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-700">
      <h3 className="text-2xl font-semibold text-white mb-4">Calculated Values</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <InfoCard
            key={card.title}
            title={card.title}
            value={card.value}
            description={card.description}
            calculation={card.calculation}
            isExpanded={expandedCard === card.title}
            onClick={() => handleCardClick(card.title)}
          />
        ))}
      </div>
    </div>
  );
};

export default Results;
