
import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateBlackScholes, calculateGreeks } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { FigureCard, StatRow } from './Prose';

const STEPS = 100;

const formatYears = (t: number) => (t < 0.5 ? `${(t * 365).toFixed(0)}d` : `${t.toFixed(2)}y`);

const TimeDecayChart: React.FC = () => {
  const { params } = useModelParams();
  const { timeToMaturity: T0 } = params;

  const { data, min, max, greeks } = useMemo(() => {
    const min = 0.01; // ~4 days
    const max = Math.max(2, T0 * 1.2);
    const rows: { t: number; call: number; put: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const t = min + (i * (max - min)) / STEPS;
      const p = calculateBlackScholes({ ...params, timeToMaturity: t });
      rows.push({ t, call: p.callPrice, put: p.putPrice });
    }
    return { data: rows, min, max, greeks: calculateGreeks(params) };
  }, [params, T0]);

  const atCurrent = data.reduce(
    (best, row) => (Math.abs(row.t - T0) < Math.abs(best.t - T0) ? row : best),
    data[0],
  );

  const annualSlopeCall: number | null =
    atCurrent.t > 0 && min < T0 && T0 < max
      ? callSlopeAt(data, T0)
      : null;

  return (
    <FigureCard
      title="The clock is an input"
      footer={
        <p>
          An option is only worth its payoff <em>at</em> expiry. The value you pay today must melt away as expiry
          approaches — that melt is <span className="text-white">theta</span>. Watch the curve: it is flat far from
          expiry and bends sharply as it nears the short end. That knee is where time decay hurts (or helps) most.
        </p>
      }
    >
      <div className="h-96 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#37415188" />
            <XAxis
              dataKey="t"
              type="number"
              domain={[min, max]}
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(v) => formatYears(v)}
              stroke="#4B5563"
              label={{ value: 'Time to maturity T', position: 'insideBottom', dy: 10, fill: '#9CA3AF' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickFormatter={(v) => `$${v.toFixed(1)}`}
              stroke="#4B5563"
              label={{ value: 'Option price ($)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const call = payload.find((p) => p.dataKey === 'call')?.value as number | undefined;
                const put = payload.find((p) => p.dataKey === 'put')?.value as number | undefined;
                return (
                  <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
                    <p className="text-gray-400">T = {formatYears(Number(label))}</p>
                    <p className="text-teal-300">Call: ${call?.toFixed(2)}</p>
                    <p className="text-pink-300">Put: ${put?.toFixed(2)}</p>
                  </div>
                );
              }}
            />
            <ReferenceLine
              x={T0}
              stroke="#FBBF24"
              strokeDasharray="4 4"
              label={{ value: 'Current T', position: 'insideTopLeft', angle: 90, fill: '#FBBF24', fontSize: 11 }}
            />
            <Line dataKey="call" name="Call price" stroke="#2DD4BF" strokeWidth={2} dot={false} isAnimationActive={false} />
            <Line dataKey="put" name="Put price" stroke="#F472B6" strokeWidth={2} dot={false} isAnimationActive={false} />
            <ReferenceDot
              x={atCurrent.t}
              y={atCurrent.call}
              r={5}
              fill="#2DD4BF"
              stroke="#111827"
              strokeWidth={2}
              label={{ value: 'You are here', position: 'top', fill: '#99F6E4', fontSize: 11 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StatRow
          stats={[
            {
              label: 'Call theta (per day)',
              value: `$${greeks.callTheta.toFixed(4)}`,
              tone: 'bad',
              hint: 'How much of the call you lose each day, all else equal',
            },
            {
              label: 'Slope of call curve at T₀',
              value: annualSlopeCall === null ? '—' : `$${annualSlopeCall.toFixed(2)} / yr`,
              hint: '≈ theta × 365 — the two views of the same number',
            },
            {
              label: 'Put theta (per day)',
              value: `$${greeks.putTheta.toFixed(4)}`,
              tone: greeks.putTheta >= 0 ? 'good' : 'bad',
              hint: 'Can be positive for deep in-the-money puts (see Step 6)',
            },
            {
              label: 'Time left on the option',
              value: formatYears(T0),
              hint: 'Everything else held fixed as T is swept in this chart',
            },
          ]}
        />
      </div>
    </FigureCard>
  );
};

// Central-difference slope of the call curve at the current maturity.
function callSlopeAt(data: { t: number; call: number }[], t: number): number {
  const below = data.reduce((best, row) => (row.t <= t && row.t > best.t ? row : best), { t: 0, call: 0 });
  const above = data.reduce((best, row) => (row.t >= t && (best.t === 0 || row.t < best.t) ? row : best), {
    t: Infinity,
    call: 0,
  });
  if (below.t === 0 || above.t === Infinity || above.t === below.t) return 0;
  return (above.call - below.call) / (above.t - below.t);
}

export default TimeDecayChart;
