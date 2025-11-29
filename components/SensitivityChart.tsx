
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartData, SensitivityVariable } from '../types';

interface SensitivityChartProps {
  data: ChartData[];
  xAxisKey: keyof ChartData;
  activeVariable: SensitivityVariable;
}

const variableLabels: Record<SensitivityVariable, string> = {
    stockPrice: 'Stock Price ($)',
    strikePrice: 'Strike Price ($)',
    timeToMaturity: 'Time to Maturity (Years)',
    volatility: 'Volatility (%)',
    riskFreeRate: 'Risk-Free Rate (%)'
}

const formatXAxis = (tick: number, variable: SensitivityVariable) => {
    switch(variable) {
        case 'volatility':
        case 'riskFreeRate':
            return `${(tick * 100).toFixed(1)}%`;
        case 'timeToMaturity':
            return `${(tick*365).toFixed(0)}d`;
        default:
            return `$${tick.toFixed(2)}`;
    }
};

const SensitivityChart: React.FC<SensitivityChartProps> = ({ data, xAxisKey, activeVariable }) => {
  const [visibleLines, setVisibleLines] = useState({
    callPrice: true,
    putPrice: true,
    delta: true,
    gamma: true,
  });

  const handleLegendClick = (e: any) => {
    const { dataKey } = e;
    setVisibleLines(prev => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <div className="h-96 w-full mt-4">
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 20,
            bottom: 25,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
            dataKey={xAxisKey} 
            stroke="#A0AEC0" 
            tick={{ fontSize: 12 }} 
            tickFormatter={(tick) => formatXAxis(tick, activeVariable)}
            label={{ value: variableLabels[activeVariable], position: 'bottom', dy:10, fill: '#A0AEC0' }}
          />
          <YAxis 
            stroke="#A0AEC0" 
            tick={{ fontSize: 12 }} 
            yAxisId="left"
            tickFormatter={(tick) => `$${tick.toFixed(2)}`}
            label={{ value: 'Option Price', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }}
          />
          <YAxis 
            stroke="#A0AEC0" 
            tick={{ fontSize: 12 }} 
            yAxisId="right" 
            orientation="right"
            label={{ value: 'Greeks', angle: 90, position: 'insideRight', fill: '#A0AEC0' }}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1A202C', border: '1px solid #2D3748', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#E2E8F0' }}
            formatter={(value: number, name: string) => [`${value.toFixed(4)}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            labelFormatter={(label) => formatXAxis(label, activeVariable)}
          />
          <Legend wrapperStyle={{fontSize: "14px", cursor: 'pointer'}} verticalAlign="top" onClick={handleLegendClick} />
          <Line yAxisId="left" type="monotone" dataKey="callPrice" name="Call Price" stroke={visibleLines.callPrice ? "#2DD4BF" : "#2DD4BF20"} strokeWidth={2} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="putPrice" name="Put Price" stroke={visibleLines.putPrice ? "#F472B6" : "#F472B620"} strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="delta" name="Delta" stroke={visibleLines.delta ? "#FBBF24" : "#FBBF2420"} strokeWidth={2} dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="gamma" name="Gamma" stroke={visibleLines.gamma ? "#A78BFA" : "#A78BFA20"} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensitivityChart;
