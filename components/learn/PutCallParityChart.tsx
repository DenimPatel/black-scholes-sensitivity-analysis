
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
import { calculateBlackScholes, putCallParity } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { FigureCard, StatRow, ToggleGroup } from './Prose';

const STEPS = 100;
type SweepVar = 'S' | 'r';

const PutCallParityChart: React.FC = () => {
  const { params } = useModelParams();
  const [sweepVar, setSweepVar] = useState<SweepVar>('S');

  const { data, min, max, parity, maxResidual } = useMemo(() => {
    const { stockPrice: S0, riskFreeRate: r0 } = params;
    const range = sweepVar === 'S' ? { min: S0 * 0.5, max: S0 * 1.5 } : { min: 0, max: 0.15 };
    const rows: { x: number; lhs: number; rhs: number }[] = [];
    let maxResidual = 0;
    for (let i = 0; i <= STEPS; i++) {
      const x = range.min + (i * (range.max - range.min)) / STEPS;
      const p = sweepVar === 'S'
        ? { ...params, stockPrice: x }
        : { ...params, riskFreeRate: x };
      const { callPrice, putPrice } = calculateBlackScholes(p);
      const { strikePrice: K, timeToMaturity: T, riskFreeRate: r, stockPrice: S } = p;
      const rhs = S - K * Math.exp(-r * T);
      maxResidual = Math.max(maxResidual, Math.abs(callPrice - putPrice - rhs));
      rows.push({ x, lhs: callPrice - putPrice, rhs });
    }
    return { data: rows, min: range.min, max: range.max, parity: putCallParity(params), maxResidual };
  }, [params, sweepVar]);

  const isS = sweepVar === 'S';
  const formatX = (v: number) => (isS ? `$${v.toFixed(0)}` : `${(v * 100).toFixed(1)}%`);

  return (
    <FigureCard
      title="Put-call parity, live"
      footer={
        <p>
          The two lines overlap so tightly that they look like one — the largest gap across the whole sweep is{' '}
          <span className="text-[var(--color-accent-700)] font-mono">{maxResidual.toExponential(2)}</span>, i.e. rounding error. The
          identity is not an approximation Black-Scholes happens to satisfy: it is an arbitrage fact that holds for{' '}
          <em>any</em> model, since a call plus discounted strike cash is a portfolio that behaves exactly like a put
          plus one share of the stock at expiry.
        </p>
      }
    >
      <div className="mb-4">
        <ToggleGroup
          label="Sweep"
          options={[
            { value: 'S', label: 'Stock price S' },
            { value: 'r', label: 'Risk-free rate r' },
          ]}
          value={sweepVar}
          onChange={(v) => setSweepVar(v as SweepVar)}
        />
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[min, max]}
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={formatX}
              stroke="#D7D3D3"
              label={{ value: isS ? 'Stock price S' : 'Risk-free rate r', position: 'insideBottom', dy: 8, fill: '#605D5D' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(1)}`}
              stroke="#D7D3D3"
              domain={['auto', 'auto']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const lhs = payload.find((p) => p.dataKey === 'lhs')?.value as number | undefined;
                const rhs = payload.find((p) => p.dataKey === 'rhs')?.value as number | undefined;
                if (lhs === undefined || rhs === undefined) return null;
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
                    <p className="text-slate-400">{isS ? `S = $${Number(label).toFixed(2)}` : `r = ${(Number(label) * 100).toFixed(2)}%`}</p>
                    <p className="text-[var(--color-accent-700)]">C − P: ${lhs.toFixed(4)}</p>
                    <p className="text-amber-300">S − K·e^(−rT): ${rhs.toFixed(4)}</p>
                    <p className="text-slate-400">difference: {(lhs - rhs).toExponential(1)}</p>
                  </div>
                );
              }}
            />
            <Line dataKey="lhs" name="C − P" stroke="#006786" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line
              dataKey="rhs"
              name="S − K·e^(−rT)"
              stroke="#C8963A"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StatRow
          stats={[
            { label: 'C − P (at current inputs)', value: `$${parity.lhs.toFixed(4)}`, hint: 'Call minus put' },
            { label: 'S − K·e^(−rT) (at current inputs)', value: `$${parity.rhs.toFixed(4)}`, hint: 'Forward moneyness' },
            {
              label: 'Residual',
              value: parity.residual.toExponential(2),
              tone: Math.abs(parity.residual) < 1e-9 ? 'good' : 'bad',
              hint: 'Identity holds to machine precision',
            },
            { label: 'Worst gap on this sweep', value: maxResidual.toExponential(2), hint: 'Still pure floating-point noise' },
          ]}
        />
      </div>
    </FigureCard>
  );
};

export default PutCallParityChart;
