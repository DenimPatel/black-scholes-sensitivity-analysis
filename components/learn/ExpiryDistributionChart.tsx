
import React, { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  buildHistogram,
  calculateBlackScholes,
  calculateD1D2,
  pnlAtExpiry,
  sampleTerminalPrices,
  standardNormalCdf,
} from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { OptionType } from '../../types';
import { FigureCard, StatRow, ToggleGroup } from './Prose';

const SAMPLES = 5000;
const SEED = 42;
const BINS = 60;

const ExpiryDistributionChart: React.FC = () => {
  const { params } = useModelParams();
  const [view, setView] = useState<'price' | 'pnl'>('price');
  const [option, setOption] = useState<OptionType>('call');

  const { stockPrice: S, strikePrice: K, timeToMaturity: T, riskFreeRate: r } = params;

  const data = useMemo(() => {
    const terminalPrices = sampleTerminalPrices(params, SAMPLES, SEED);
    const { bars } = buildHistogram(terminalPrices, BINS);
    const { callPrice, putPrice } = calculateBlackScholes(params);
    const premium = option === 'call' ? callPrice : putPrice;

    const { d2 } = calculateD1D2(params);
    const nD2 = standardNormalCdf(d2);
    const nMinusD2 = 1 - nD2;

    let aboveK = 0;
    let aboveBreakeven = 0;
    let pnlSum = 0;
    for (const s of terminalPrices) {
      if (s > K) aboveK++;
      const pnl = pnlAtExpiry(option, 'long', s, K, premium);
      if (pnl > 0) aboveBreakeven++;
      pnlSum += pnl;
    }

    return {
      data: bars.map((b) => ({ x: b.x, pct: (b.y / SAMPLES) * 100 })),
      min: bars.length ? bars[0].x1 : 0,
      max: bars.length ? bars[bars.length - 1].x2 : 1,
      nD2,
      nMinusD2,
      pITM: aboveK / SAMPLES,
      pProfit: aboveBreakeven / SAMPLES,
      expectedPayoff: pnlSum / SAMPLES + premium,
      expectedPnl: pnlSum / SAMPLES,
      premium,
      forward: S * Math.exp(r * T),
      breakeven: option === 'call' ? K + premium : K - premium,
    };
  }, [params, option, S, K, T, r]);

  const isCall = option === 'call';

  return (
    <FigureCard
      title="The world the option lives in"
      footer={
        <p>
          Under the model's risk-neutral measure the stock lands where a lognormal distribution says: the curve is
          skewed right, the most likely landing point is below the forward price, and the fat right tail is where
          calls pay off. Change the sliders and watch the whole landscape shift.
        </p>
      }
    >
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-4 items-end">
        <ToggleGroup
          label="View"
          options={[
            { value: 'price', label: 'Where the stock lands' },
            { value: 'pnl', label: 'Profit & loss' },
          ]}
          value={view}
          onChange={(v) => setView(v as 'price' | 'pnl')}
        />
        {view === 'pnl' && (
          <ToggleGroup
            label="Long position"
            options={[
              { value: 'call', label: 'Call' },
              { value: 'put', label: 'Put' },
            ]}
            value={option}
            onChange={(v) => setOption(v as OptionType)}
          />
        )}
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={data.data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[data.min, data.max]}
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#D7D3D3"
              label={{ value: 'Stock price at expiry', position: 'insideBottom', dy: 8, fill: '#605D5D' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              stroke="#D7D3D3"
              label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#605D5D' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const pct = payload[0].value as number;
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
                    <p className="text-slate-400">Stock at expiry: <span className="text-white">${Number(label).toFixed(1)}</span></p>
                    <p className="text-white">{pct.toFixed(2)}% of paths</p>
                  </div>
                );
              }}
            />
            <Area
              type="stepAfter"
              dataKey="pct"
              stroke="#006786"
              strokeWidth={1.5}
              fill="#006786"
              fillOpacity={0.15}
              isAnimationActive={false}
            />
            {view === 'price' ? (
              <>
                <ReferenceArea
                  x1={K}
                  x2={data.max}
                  fill="#006786"
                  fillOpacity={0.1}
                  ifOverflow="extendDomain"
                />
                <ReferenceLine
                  x={data.forward}
                  stroke="#C8963A"
                  strokeDasharray="4 4"
                  label={{ value: 'Forward S·e^(rT)', position: 'insideTopLeft', angle: 90, fill: '#C8963A', fontSize: 11 }}
                />
                <ReferenceLine
                  x={K}
                  stroke="#7B4B90"
                  strokeDasharray="4 4"
                  label={{ value: 'Strike K', position: 'insideTopRight', angle: 90, fill: '#7B4B90', fontSize: 11 }}
                />
              </>
            ) : (
              <>
                <ReferenceArea
                  x1={data.min}
                  x2={data.breakeven}
                  fill="#FF458E"
                  fillOpacity={0.08}
                  ifOverflow="extendDomain"
                />
                <ReferenceArea
                  x1={data.breakeven}
                  x2={data.max}
                  fill="#2F8365"
                  fillOpacity={0.08}
                  ifOverflow="extendDomain"
                />
                <ReferenceLine
                  x={data.breakeven}
                  stroke="#C8963A"
                  strokeDasharray="4 4"
                  label={{ value: 'Breakeven', position: 'insideTopLeft', angle: 90, fill: '#C8963A', fontSize: 11 }}
                />
                <ReferenceLine
                  x={K}
                  stroke="#7B4B90"
                  strokeDasharray="4 4"
                  label={{ value: 'Strike K', position: 'insideTopRight', angle: 90, fill: '#7B4B90', fontSize: 11 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StatRow
          stats={[
            {
              label: `P(S_T ${isCall ? '>' : '<'} K) — the shaded area`,
              value: `${((isCall ? data.nD2 : data.nMinusD2) * 100).toFixed(1)}%`,
              hint: isCall ? 'N(d₂): the right tail past the strike' : 'N(−d₂): the left tail below the strike',
            },
            {
              label: 'Probability of profit',
              value: `${(data.pProfit * 100).toFixed(1)}%`,
              hint: 'Long position; stock must finish past breakeven',
            },
            {
              label: 'Expected payoff at expiry',
              value: `$${data.expectedPayoff.toFixed(2)}`,
              hint: 'Risk-neutral average of (S_T − K)⁺, not discounted',
            },
            {
              label: 'Expected P&L',
              value: `${data.expectedPnl >= 0 ? '+' : '-'}$${Math.abs(data.expectedPnl).toFixed(2)}`,
              tone: data.expectedPnl >= 0 ? 'good' : 'bad',
              hint: '= e^(rT) × premium − premium — you pay the premium to get the payoff',
            },
          ]}
        />
      </div>
    </FigureCard>
  );
};

export default ExpiryDistributionChart;
