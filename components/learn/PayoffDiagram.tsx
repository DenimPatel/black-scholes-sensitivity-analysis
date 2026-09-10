
import React, { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateBlackScholes, pnlAtExpiry } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { OptionType, PositionType } from '../../types';
import { FigureCard, StatRow, ToggleGroup } from './Prose';

const STEPS = 120;

const PayoffDiagram: React.FC = () => {
  const { params } = useModelParams();
  const [option, setOption] = useState<OptionType>('call');
  const [position, setPosition] = useState<PositionType>('long');

  const { stockPrice: S, strikePrice: K } = params;

  const model = useMemo(() => {
    const { callPrice, putPrice } = calculateBlackScholes(params);
    const premium = option === 'call' ? callPrice : putPrice;
    const min = Math.max(0.5, K * 0.5);
    const max = K * 1.6;
    const data: { s: number; pnl: number }[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const s = min + (i * (max - min)) / STEPS;
      data.push({ s, pnl: pnlAtExpiry(option, position, s, K, premium) });
    }
    const breakeven = option === 'call' ? K + premium : K - premium;
    return { premium, min, max, data, breakeven };
  }, [params, option, position, K]);

  const stats = useMemo(() => {
    const { premium, breakeven } = model;
    if (position === 'long') {
      return [
        { label: 'Premium paid', value: `$${premium.toFixed(2)}`, hint: 'Price you pay today' },
        { label: 'Breakeven at expiry', value: `$${breakeven.toFixed(2)}`, hint: 'P&L = $0 here' },
        {
          label: option === 'call' ? 'Max loss' : 'Max profit',
          value: option === 'call' ? `-$${premium.toFixed(2)}` : `$${(K - premium).toFixed(2)}`,
          tone: option === 'call' ? 'bad' : 'good',
          hint: option === 'call' ? 'If the stock finishes at or below K' : 'If the stock finishes at $0',
        },
        {
          label: option === 'call' ? 'Max profit' : 'Max loss',
          value: option === 'call' ? 'Unlimited' : `-$${premium.toFixed(2)}`,
          tone: option === 'call' ? 'good' : 'bad',
          hint: option === 'call' ? 'Stock can rise without bound' : 'If the stock finishes at or above K',
        },
      ];
    }
    return [
      { label: 'Premium received', value: `$${premium.toFixed(2)}`, hint: 'Price you collect today' },
      { label: 'Breakeven at expiry', value: `$${breakeven.toFixed(2)}`, hint: 'P&L = $0 here' },
      { label: 'Max profit', value: `$${premium.toFixed(2)}`, tone: 'good', hint: option === 'call' ? 'If the stock finishes at or below K' : 'If the stock finishes at or above K' },
      {
        label: 'Max loss',
        value: option === 'call' ? 'Unlimited' : `-$${(K - premium).toFixed(2)}`,
        tone: 'bad',
        hint: option === 'call' ? 'The stock can rise without bound' : 'If the stock finishes at $0',
      },
    ];
  }, [model, option, position, K]);

  return (
    <FigureCard
      title="Payoff at expiry"
      footer={
        <>
          <p>
            This is the position's profit or loss on expiration <em>after</em> the premium, as a function of where the
            stock lands. For a buyer, the curve never goes below −premium: that limited downside in exchange for
            uncapped upside calls is what makes options interesting.
          </p>
        </>
      }
    >
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-4">
        <ToggleGroup
          label="Option"
          options={[
            { value: 'call', label: 'Call' },
            { value: 'put', label: 'Put' },
          ]}
          value={option}
          onChange={(v) => setOption(v as OptionType)}
        />
        <ToggleGroup
          label="Position"
          options={[
            { value: 'long', label: 'Long (buy)' },
            { value: 'short', label: 'Short (sell)' },
          ]}
          value={position}
          onChange={(v) => setPosition(v as PositionType)}
        />
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart data={model.data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
            <XAxis
              dataKey="s"
              type="number"
              domain={[model.min, model.max]}
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#D7D3D3"
              label={{ value: 'Stock price at expiry', position: 'insideBottom', dy: 8, fill: '#605D5D' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#605D5D' }}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="#D7D3D3"
              label={{ value: 'P&L at expiry ($)', angle: -90, position: 'insideLeft', fill: '#605D5D' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || payload.length === 0) return null;
                const pnl = payload[0].value as number;
                return (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
                    <p className="text-slate-400">Stock at expiry: <span className="text-white">${Number(label).toFixed(2)}</span></p>
                    <p className={`font-semibold ${pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      P&L: {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                    </p>
                  </div>
                );
              }}
            />
            <Area type="monotone" dataKey="pnl" stroke="none" fill="#006786" fillOpacity={0.12} isAnimationActive={false} />
            <ReferenceLine y={0} stroke="#605D5D" strokeWidth={1.5} />
            <ReferenceLine
              x={K}
              stroke="#7B4B90"
              strokeDasharray="4 4"
              label={{ value: 'Strike K', position: 'top', fill: '#7B4B90', fontSize: 11 }}
            />
            <ReferenceLine
              x={S}
              stroke="#62C5EE"
              strokeDasharray="4 4"
              label={{ value: 'S today', position: 'top', fill: '#62C5EE', fontSize: 11 }}
            />
            {model.breakeven >= model.min && model.breakeven <= model.max && (
              <ReferenceDot
                x={model.breakeven}
                y={0}
                r={5}
                fill="#C8963A"
                stroke="#201E1D"
                strokeWidth={2}
                label={{ value: 'Breakeven', position: 'top', fill: '#C8963A', fontSize: 11, dy: -8 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4">
        <StatRow stats={stats} />
      </div>
    </FigureCard>
  );
};

export default PayoffDiagram;
