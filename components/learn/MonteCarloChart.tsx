
import React, { useMemo, useState } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { buildHistogram, calculateBlackScholes, monteCarloConvergence } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';
import { OptionType } from '../../types';
import { FigureCard, StatRow, ToggleGroup } from './Prose';

const TOTAL_PATHS = 51200;
const PATH_COUNTS = [100, 200, 400, 800, 1600, 3200, 6400, 12800, 25600, 51200];
const DEFAULT_SEED = 1337;
const HIST_BINS = 60;

const formatPaths = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `${n}`);

const MonteCarloChart: React.FC = () => {
  const { params } = useModelParams();
  const [option, setOption] = useState<OptionType>('call');
  const [seed, setSeed] = useState(DEFAULT_SEED);

  const { stockPrice: S0, strikePrice: K } = params;

  const model = useMemo(() => {
    const { series, terminalPrices } = monteCarloConvergence(params, option, TOTAL_PATHS, PATH_COUNTS, seed);
    const analytical = option === 'call' ? calculateBlackScholes(params).callPrice : calculateBlackScholes(params).putPrice;

    const data = series.map((s) => ({ ...s, band: [s.lower, s.upper] as [number, number] }));
    const final = series[series.length - 1];
    const error = final.estimate - analytical;

    const { bars } = buildHistogram(terminalPrices, HIST_BINS);
    const histData = bars.map((b) => ({ x: b.x, pct: (b.y / TOTAL_PATHS) * 100 }));

    return {
      data,
      analytical,
      final,
      error,
      histData,
      histMin: bars.length ? bars[0].x1 : 0,
      histMax: bars.length ? bars[bars.length - 1].x2 : 1,
    };
  }, [params, option, seed]);

  return (
    <FigureCard
      title="Price the option from first principles"
      footer={
        <p>
          The left panel prices the option the way practitioners do when no closed form exists: simulate thousands of
          risk-neutral stock paths, average the discounted payoffs. The error bars are ± one standard error — they
          shrink like 1/√n and, as they must, the estimates converge onto the closed-form line. When the payoff has
          no formula in the books, this is the whole game.
        </p>
      }
    >
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-4 items-end">
        <ToggleGroup
          label="Price the"
          options={[
            { value: 'call', label: 'Call' },
            { value: 'put', label: 'Put' },
          ]}
          value={option}
          onChange={(v) => setOption(v as OptionType)}
        />
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Simulation</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSeed(Math.floor(Math.random() * 1e9))}
              className="px-3 py-1 rounded-[var(--radius-md)] text-sm glass-chip text-slate-600 hover:border-[var(--color-accent)] hover:text-[var(--color-accent-700)] transition-colors"
            >
              Reroll the paths
            </button>
            <span className="text-xs text-slate-500 font-mono">seed = {seed}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Estimate vs number of simulated paths
          </p>
          <div className="h-72">
            <ResponsiveContainer>
              <ComposedChart data={model.data} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
                <XAxis
                  dataKey="paths"
                  type="number"
                  scale="log"
                  domain={[100, 51200]}
                  ticks={PATH_COUNTS}
                  tick={{ fontSize: 11, fill: '#605D5D' }}
                  tickFormatter={formatPaths}
                  stroke="#D7D3D3"
                  label={{ value: 'Simulated paths (log scale)', position: 'insideBottom', dy: 10, fill: '#605D5D' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#605D5D' }}
                  tickFormatter={(v) => `$${Number(v).toFixed(2)}`}
                  stroke="#D7D3D3"
                  domain={['auto', 'auto']}
                  label={{ value: 'Estimated price ($)', angle: -90, position: 'insideLeft', fill: '#605D5D' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    const est = payload.find((p) => p.dataKey === 'estimate')?.value as number | undefined;
                    if (est === undefined) return null;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl space-y-1">
                        <p className="text-slate-400">{formatPaths(Number(label))} paths</p>
                        <p className="text-[var(--color-accent-700)]">Estimate: ${est.toFixed(4)}</p>
                        <p className="text-amber-300">Closed form: ${model.analytical.toFixed(4)}</p>
                        <p className="text-slate-400">Gap: {(est - model.analytical).toFixed(4)}</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine
                  y={model.analytical}
                  stroke="#C8963A"
                  strokeDasharray="5 4"
                  label={{ value: 'Closed form', position: 'insideTopRight', fill: '#C8963A', fontSize: 11 }}
                />
                <Area
                  type="monotone"
                  dataKey="band"
                  name="±1 SE"
                  stroke="none"
                  fill="#006786"
                  fillOpacity={0.15}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="estimate"
                  name="MC estimate"
                  stroke="#006786"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#006786', strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">
            Where all {TOTAL_PATHS.toLocaleString()} paths landed at expiry
          </p>
          <div className="h-72">
            <ResponsiveContainer>
              <ComposedChart data={model.histData} margin={{ top: 10, right: 20, bottom: 25, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#44414188" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[model.histMin, model.histMax]}
                  tick={{ fontSize: 11, fill: '#605D5D' }}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                  stroke="#D7D3D3"
                  label={{ value: 'Stock price at expiry', position: 'insideBottom', dy: 10, fill: '#605D5D' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#605D5D' }}
                  tickFormatter={(v) => `${v.toFixed(0)}%`}
                  stroke="#D7D3D3"
                  label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft', fill: '#605D5D' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    return (
                      <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
                        <p className="text-slate-400">Stock at expiry: <span className="text-white">${Number(label).toFixed(1)}</span></p>
                        <p className="text-white">{(payload[0].value as number).toFixed(2)}% of paths</p>
                      </div>
                    );
                  }}
                />
                <ReferenceLine x={S0} stroke="#62C5EE" strokeDasharray="4 4" label={{ value: 'S today', position: 'insideTopLeft', angle: 90, fill: '#62C5EE', fontSize: 11 }} />
                <ReferenceLine x={K} stroke="#7B4B90" strokeDasharray="4 4" label={{ value: 'K', position: 'insideTopRight', angle: 90, fill: '#7B4B90', fontSize: 11 }} />
                <Area
                  type="stepAfter"
                  dataKey="pct"
                  name="Paths"
                  stroke="#D6006C"
                  strokeWidth={1.5}
                  fill="#D6006C"
                  fillOpacity={0.2}
                  isAnimationActive={false}
                />
                </ComposedChart>
              </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <StatRow
          stats={[
            {
              label: 'Closed-form price',
              value: `$${model.analytical.toFixed(4)}`,
              hint: 'Black–Scholes with your current inputs',
            },
            {
              label: `Monte Carlo (${formatPaths(TOTAL_PATHS)} paths)`,
              value: `$${model.final.estimate.toFixed(4)}`,
              hint: `± ${model.final.stdErr.toFixed(4)} (1 SE)`,
            },
            {
              label: 'Gap between the two',
              value: `${model.error >= 0 ? '+' : '-'}$${Math.abs(model.error).toFixed(4)}`,
              tone: Math.abs(model.error) <= model.final.stdErr * 3 ? 'good' : 'bad',
              hint: Math.abs(model.error) <= model.final.stdErr ? 'Within one standard error' : 'Within about three standard errors — normal',
            },
            {
              label: 'Standard error',
              value: `$${model.final.stdErr.toFixed(4)}`,
              hint: 'Scales like 1/√n — quadruple the paths, halve the noise',
            },
          ]}
        />
      </div>
    </FigureCard>
  );
};

export default MonteCarloChart;
