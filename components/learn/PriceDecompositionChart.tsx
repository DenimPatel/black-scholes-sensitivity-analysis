
import React, { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateBlackScholes, intrinsicValue, timeValue } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { FigureCard, StatRow } from './Prose';

const STEPS = 100;

const PriceDecompositionChart: React.FC = () => {
  const { params } = useModelParams();
  const { stockPrice: S0, strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;

  const { data, atSpot } = useMemo(() => {
    const min = K * 0.55;
    const max = K * 1.45;
    const rows: {
      s: number;
      callIntrinsic: number;
      callTimeValue: number;
      putIntrinsic: number;
      putTimeValue: number;
      callBound: number;
    }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const s = min + (i * (max - min)) / STEPS;
      const p = calculateBlackScholes({ ...params, stockPrice: s });
      rows.push({
        s,
        callIntrinsic: intrinsicValue('call', s, K),
        callTimeValue: timeValue('call', p.callPrice, s, K),
        putIntrinsic: intrinsicValue('put', s, K),
        putTimeValue: timeValue('put', p.putPrice, s, K),
        callBound: Math.max(0, s - K * Math.exp(-r * T)),
      });
    }

    const spot = calculateBlackScholes(params);
    const spotRow = rows.reduce((best, row) => (Math.abs(row.s - S0) < Math.abs(best.s - S0) ? row : best), rows[0]);
    return {
      data: rows,
      atSpot: {
        min,
        max,
        callIntrinsic: intrinsicValue('call', S0, K),
        callTimeValue: timeValue('call', spot.callPrice, S0, K),
        callPrice: spot.callPrice,
        putIntrinsic: intrinsicValue('put', S0, K),
        putTimeValue: timeValue('put', spot.putPrice, S0, K),
        putPrice: spot.putPrice,
        bound: spotRow.callBound,
      },
    };
  }, [params, S0, K, T, r]);

  return (
    <FigureCard
      title="Anatomy of an option price"
      footer={
        <p>
          The option price splits into <span className="text-slate-900 font-semibold">intrinsic value</span> (what it's worth if it
          settled right now) and <span className="text-slate-900 font-semibold">time value</span> (what the market charges for the
          chance that it gets better before expiry). Time value is the option's "fuel": it is largest at the strike
          and burns out at expiry.
        </p>
      }
    >
      <div className="h-96 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
            <XAxis
              dataKey="s"
              type="number"
              domain={[atSpot.min, atSpot.max]}
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#D7D3D3"
              label={{ value: 'Stock price S', position: 'insideBottom', dy: 8, fill: '#605D5D' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#D7D3D3"
              label={{ value: 'Option price ($)', angle: -90, position: 'insideLeft', fill: '#605D5D' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const callTot = (payload.find((p) => p.dataKey === 'callIntrinsic')?.value as number) +
                  (payload.find((p) => p.dataKey === 'callTimeValue')?.value as number);
                const putTot = (payload.find((p) => p.dataKey === 'putIntrinsic')?.value as number) +
                  (payload.find((p) => p.dataKey === 'putTimeValue')?.value as number);
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
                    <p className="text-slate-400">S = <span className="text-white">${Number(label).toFixed(2)}</span></p>
                    <p className="text-[var(--color-accent-700)]">Call: ${callTot.toFixed(2)} (intrinsic ${(payload.find((p) => p.dataKey === 'callIntrinsic')?.value as number).toFixed(2)})</p>
                    <p className="text-[var(--color-accent-2-600)]">Put: ${putTot.toFixed(2)} (intrinsic ${(payload.find((p) => p.dataKey === 'putIntrinsic')?.value as number).toFixed(2)})</p>
                    <p className="text-amber-300">No-arbitrage call floor: ${(payload.find((p) => p.dataKey === 'callBound')?.value as number).toFixed(2)}</p>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} verticalAlign="top" />
            <Area
              type="monotone"
              dataKey="callIntrinsic"
              name="Call — intrinsic"
              stroke="#006786"
              strokeWidth={1.5}
              stackId="call"
              fill="#006786"
              fillOpacity={0.55}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="callTimeValue"
              name="Call — time value"
              stroke="#99E0FF"
              strokeWidth={1}
              stackId="call"
              fill="#006786"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="putIntrinsic"
              name="Put — intrinsic"
              stroke="#D6006C"
              strokeWidth={1.5}
              stackId="put"
              fill="#D6006C"
              fillOpacity={0.55}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="putTimeValue"
              name="Put — time value"
              stroke="#FFC0D0"
              strokeWidth={1}
              stackId="put"
              fill="#D6006C"
              fillOpacity={0.25}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="callBound"
              name="No-arbitrage call floor"
              stroke="#C8963A"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
            {S0 >= atSpot.min && S0 <= atSpot.max && (
              <ReferenceDot
                x={S0}
                y={atSpot.callPrice}
                r={5}
                fill="#006786"
                stroke="#201E1D"
                strokeWidth={2}
                label={{ value: 'Current', position: 'top', fill: '#99E0FF', fontSize: 11 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StatRow
          stats={[
            {
              label: 'Call price now',
              value: `$${atSpot.callPrice.toFixed(2)}`,
              hint: `= ${atSpot.callIntrinsic.toFixed(2)} intrinsic + ${atSpot.callTimeValue.toFixed(2)} time value`,
            },
            {
              label: 'Share that is time value',
              value: `${(atSpot.callPrice > 0 ? (atSpot.callTimeValue / atSpot.callPrice) * 100 : 0).toFixed(0)}%`,
              hint: 'All of it is gone at expiry',
            },
            {
              label: 'Put price now',
              value: `$${atSpot.putPrice.toFixed(2)}`,
              hint: `= ${atSpot.putIntrinsic.toFixed(2)} intrinsic + ${atSpot.putTimeValue.toFixed(2)} time value`,
            },
            {
              label: 'No-arbitrage call floor',
              value: `$${atSpot.bound.toFixed(2)}`,
              hint: 'max(0, S − K·e^(−rT)) — the price can never fall below this line',
            },
          ]}
        />
      </div>
    </FigureCard>
  );
};

export default PriceDecompositionChart;
