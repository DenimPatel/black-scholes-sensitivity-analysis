
import React, { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateGreeks } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { Greeks, SensitivityVariable } from '../../types';
import { ToggleGroup } from './Prose';

const STEPS = 100;

const variableMeta: Record<SensitivityVariable, { label: string; format: (v: number) => string }> = {
  stockPrice: { label: 'Stock price S', format: (v) => `$${v.toFixed(0)}` },
  strikePrice: { label: 'Strike price K', format: (v) => `$${v.toFixed(0)}` },
  timeToMaturity: { label: 'Time to maturity T', format: (v) => (v < 0.5 ? `${(v * 365).toFixed(0)}d` : `${v.toFixed(2)}y`) },
  volatility: { label: 'Volatility σ', format: (v) => `${(v * 100).toFixed(0)}%` },
  riskFreeRate: { label: 'Risk-free rate r', format: (v) => `${(v * 100).toFixed(1)}%` },
};

interface TileDef {
  key: string;
  title: string;
  caption: string;
  series: { dataKey: keyof Greeks & string; name: string; color: string }[];
  valueGetters: (g: Greeks) => number[];
}

const tileDefs: TileDef[] = [
  {
    key: 'delta',
    title: 'Call delta',
    caption:
      'S-shaped: ~0 deep out-of-the-money, 0.5 at the strike, ~1 deep in. The shorter the expiry, the steeper the S — this is also the share of the stock an ATM call behaves like.',
    series: [{ dataKey: 'callDelta', name: 'Δ (call)', color: '#2DD4BF' }],
    valueGetters: (g) => [g.callDelta],
  },
  {
    key: 'putDelta',
    title: 'Put delta',
    caption:
      'The call delta shifted down by one: it runs from 0 to −1. Shorting Δ shares of the stock makes a call "delta-neutral" — that is the whole idea behind hedging.',
    series: [{ dataKey: 'putDelta', name: 'Δ (put)', color: '#F472B6' }],
    valueGetters: (g) => [g.putDelta],
  },
  {
    key: 'gamma',
    title: 'Gamma',
    caption:
      'Bell-shaped, peaking at the strike — gamma is biggest exactly where delta changes fastest. It is identical for calls and puts, and it blows up as an ATM option approaches expiry.',
    series: [{ dataKey: 'gamma', name: 'Γ', color: '#A78BFA' }],
    valueGetters: (g) => [g.gamma],
  },
  {
    key: 'vega',
    title: 'Vega',
    caption:
      'Also bell-shaped, peaking at the strike, and it grows with time to expiry: the far-from-expiry, at-the-money option is the one that most "participates" in volatility.',
    series: [{ dataKey: 'vega', name: 'ν (per 1% σ)', color: '#38BDF8' }],
    valueGetters: (g) => [g.vega],
  },
  {
    key: 'theta',
    title: 'Theta (call & put)',
    caption:
      'Time decay: usually negative for long options, largest in magnitude for short-dated ATM options. Notice the put line: deep in the money it bends positive (the −rKe^{−rT} term).',
    series: [
      { dataKey: 'callTheta', name: 'θ (call, per day)', color: '#2DD4BF' },
      { dataKey: 'putTheta', name: 'θ (put, per day)', color: '#F472B6' },
    ],
    valueGetters: (g) => [g.callTheta, g.putTheta],
  },
  {
    key: 'callRho',
    title: 'Call rho',
    caption:
      'Sensitivity to the risk-free rate. Nearly zero for out-of-the-money calls, and it climbs as the call goes in and lives longer — rate moves matter most to deep, long-dated calls.',
    series: [{ dataKey: 'callRho', name: 'ρ (call, per 1% r)', color: '#FBBF24' }],
    valueGetters: (g) => [g.callRho],
  },
  {
    key: 'putRho',
    title: 'Put rho',
    caption:
      'The mirror image: negative, because a falling rate helps puts. Same shape, flipped — put rho grows in magnitude for deep, long-dated puts.',
    series: [{ dataKey: 'putRho', name: 'ρ (put, per 1% r)', color: '#FB923C' }],
    valueGetters: (g) => [g.putRho],
  },
];

const GreeksGrid: React.FC<{ variant?: 'full' | 'compact' }> = ({ variant = 'full' }) => {
  const { params } = useModelParams();
  const [variable, setVariable] = useState<SensitivityVariable>('stockPrice');

  const baseValue = params[variable];

  const { data, min, max, baseGreeks } = useMemo(() => {
    let range: { min: number; max: number };
    switch (variable) {
      case 'stockPrice':
        range = { min: params.stockPrice * 0.8, max: params.stockPrice * 1.2 };
        break;
      case 'strikePrice':
        range = { min: params.strikePrice * 0.8, max: params.strikePrice * 1.2 };
        break;
      case 'timeToMaturity':
        range = { min: 0.01, max: 2 };
        break;
      case 'volatility':
        range = { min: 0.05, max: 0.6 };
        break;
      case 'riskFreeRate':
        range = { min: 0, max: 0.1 };
        break;
    }
    const rows: Record<string, number>[] = [];
    for (let i = 0; i <= STEPS; i++) {
      const value = range.min + (i * (range.max - range.min)) / STEPS;
      const g = calculateGreeks({ ...params, [variable]: value });
      rows.push({
        x: value,
        callDelta: g.callDelta,
        putDelta: g.putDelta,
        gamma: g.gamma,
        vega: g.vega,
        callTheta: g.callTheta,
        putTheta: g.putTheta,
        callRho: g.callRho,
        putRho: g.putRho,
      });
    }
    return { data: rows, min: range.min, max: range.max, baseGreeks: calculateGreeks(params) };
  }, [params, variable]);

  const formatX = variableMeta[variable].format;

  // Row of the sweep closest to the current input value (used as the marker).
  const markerRow = data.reduce(
    (best, row) => (Math.abs(row.x - baseValue) < Math.abs(best.x - baseValue) ? row : best),
    data[0],
  );

  const tiles = tileDefs.map((tile) => ({
    ...tile,
    value: tile.valueGetters(baseGreeks),
  }));

  return (
    <div>
      <div className="mb-4">
        <ToggleGroup
          label="Sweep one input, hold the rest"
          options={Object.entries(variableMeta).map(([value, meta]) => ({ value, label: meta.label }))}
          value={variable}
          onChange={(v) => setVariable(v as SensitivityVariable)}
        />
      </div>

      <div className={variant === 'full' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4' : 'grid grid-cols-1 md:grid-cols-2 gap-4'}>
        {tiles.map((tile) => (
          <div key={tile.key} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <h4 className="text-sm font-semibold text-white">{tile.title}</h4>
              <span className="text-xs font-mono text-cyan-300 whitespace-nowrap">
                {tile.value.map((v) => v.toFixed(4)).join(' / ')}
              </span>
            </div>
            {tile.series.length > 1 && (
              <div className="flex gap-3 mb-1">
                {tile.series.map((s) => (
                  <span key={s.name} className="flex items-center gap-1 text-[11px] text-gray-400">
                    <span className="inline-block w-3 h-0.5 rounded" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            )}
            <div className={variant === 'full' ? 'h-40' : 'h-32'}>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="2 3" stroke="#37415166" vertical={false} />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={[min, max]}
                    tick={{ fontSize: 10, fill: '#6B7280' }}
                    tickFormatter={formatX}
                    stroke="#4B5563"
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} stroke="#4B5563" width={44} tickFormatter={(v: number) => (Math.abs(v) >= 1000 ? v.toFixed(0) : v.toFixed(Math.abs(v) < 0.1 ? 3 : 2))} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      return (
                        <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs shadow-xl space-y-0.5">
                          <p className="text-gray-400">{variableMeta[variable].label} = {formatX(Number(label))}</p>
                          {payload.map((p) => (
                            <p key={p.dataKey} style={{ color: p.stroke as string }}>
                              {p.name}: {(p.value as number).toFixed(4)}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <ReferenceDot x={markerRow.x} y={markerRow[tile.series[0].dataKey]} r={4} fill="#F8FAFC" stroke="#111827" strokeWidth={1.5} ifOverflow="visible" />
                  {tile.series.map((s) => (
                    <Line key={s.dataKey} dataKey={s.dataKey} name={s.name} stroke={s.color} strokeWidth={2} dot={false} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {variant === 'full' && <p className="text-xs text-gray-400 leading-5 mt-3">{tile.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GreeksGrid;
