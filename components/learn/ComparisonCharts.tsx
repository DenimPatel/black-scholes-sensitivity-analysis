
import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateBlackScholes } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { FigureCard, ToggleGroup } from './Prose';

const STEPS = 80;
const PALETTE = ['#2DD4BF', '#38BDF8', '#A78BFA', '#FBBF24', '#F472B6'];

type Mode = 'strike' | 'maturity' | 'volatility';

const ComparisonCharts: React.FC = () => {
  const { params } = useModelParams();
  const [mode, setMode] = useState<Mode>('strike');

  const { data, series, min, max } = useMemo(() => {
    const { stockPrice: S0, strikePrice: K0 } = params;
    const min = S0 * 0.6;
    const max = S0 * 1.4;

    let defs: { key: string; label: string; override: Record<string, number> }[] = [];
    if (mode === 'strike') {
      defs = [0.8, 0.9, 1.0, 1.1, 1.2].map((f, i) => ({
        key: `s${i}`,
        label: `K = ${(K0 * f).toFixed(0)}`,
        override: { strikePrice: K0 * f },
      }));
    } else if (mode === 'maturity') {
      defs = [0.05, 0.15, 0.4, 1.0, 2.0].map((T, i) => ({
        key: `s${i}`,
        label: T < 0.5 ? `T = ${(T * 365).toFixed(0)}d` : `T = ${T.toFixed(1)}y`,
        override: { timeToMaturity: T },
      }));
    } else {
      defs = [0.1, 0.2, 0.3, 0.4, 0.5].map((v, i) => ({
        key: `s${i}`,
        label: `σ = ${(v * 100).toFixed(0)}%`,
        override: { volatility: v },
      }));
    }

    const rows: Record<string, number>[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const s = min + (i * (max - min)) / STEPS;
      const row: Record<string, number> = { s };
      for (const def of defs) {
        row[def.key] = calculateBlackScholes({ ...params, stockPrice: s, ...def.override }).callPrice;
      }
      rows.push(row);
    }

    return {
      data: rows,
      series: defs.map((d, i) => ({ key: d.key, label: d.label, color: PALETTE[i % PALETTE.length] })),
      min,
      max,
    };
  }, [params, mode]);

  const reading: Record<Mode, string> = {
    strike:
      'Each line is the same call with a different strike. Higher strikes cost more to exercise, so their curves sit lower and bend later — the diagonal "fan" is the option price as a function of moneyness.',
    maturity:
      'Each line is the same call with a different time to expiry. More time means more room for favorable moves, so longer options are pricier — and flatter — than shorter ones. The gap above the 37d line is extra time value you pay for the clock.',
    volatility:
      'Each line is the same call with a different volatility assumption. Higher σ widens the payoff fan, which raises the option\u2019s value — this is vega in action, and it is why traders "buy vol" or "sell vol".',
  };

  return (
    <FigureCard
      title="Comparison views"
      footer={<p>{reading[mode]}</p>}
    >
      <div className="mb-4">
        <ToggleGroup
          label="Overlay different…"
          options={[
            { value: 'strike', label: 'Strike prices' },
            { value: 'maturity', label: 'Maturities' },
            { value: 'volatility', label: 'Volatilities' },
          ]}
          value={mode}
          onChange={(v) => setMode(v as Mode)}
        />
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#37415188" />
            <XAxis
              dataKey="s"
              type="number"
              domain={[min, max]}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#4B5563"
              label={{ value: 'Stock price S', position: 'insideBottom', dy: 8, fill: '#9CA3AF' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#4B5563"
              label={{ value: 'Call price ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem' }}
              labelFormatter={(label) => `S = $${Number(label).toFixed(2)}`}
              formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
            />
            {series.map((s) => (
              <Line
                key={s.key}
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </FigureCard>
  );
};

export default ComparisonCharts;
