import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import GreeksGrid from '../../components/learn/GreeksGrid';
import PutCallParityChart from '../../components/learn/PutCallParityChart';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';

const reference = [
  {
    greek: 'Δ (call)',
    unit: 'shares of stock',
    sign: '0 → +1',
    peak: 'Deep in-the-money, long-dated',
    hedge: 'Short Δ shares per call to stay delta-neutral',
  },
  {
    greek: 'Δ (put)',
    unit: 'shares of stock',
    sign: '−1 → 0',
    peak: 'Deep out-of-the-money (most negative)',
    hedge: 'Long |Δ| shares per put to hedge a short put',
  },
  {
    greek: 'Γ (gamma)',
    unit: 'Δ change per 1% stock move',
    sign: 'Always ≥ 0',
    peak: 'At-the-money, short-dated',
    hedge: 'The risk that the hedge ratio itself moves — reserved for serious books',
  },
  {
    greek: 'ν (vega)',
    unit: '$ per 1% vol change',
    sign: 'Always > 0 for plain Europeans',
    peak: 'At-the-money, long-dated',
    hedge: 'Volatility swaps and straddles are vega trades',
  },
  {
    greek: 'θ (theta)',
    unit: '$ per day',
    sign: 'Usually < 0 (long); put flips + deep ITM',
    peak: 'Magnitude peaks short-dated, at-the-money',
    hedge: 'Premium sellers harvest it; buyers bleed it',
  },
  {
    greek: 'ρ (call)',
    unit: '$ per 1% rate change',
    sign: 'Usually > 0',
    peak: 'Deep in-the-money, long-dated',
    hedge: 'Interest-rate desks; tiny for short-dated retail options',
  },
  {
    greek: 'ρ (put)',
    unit: '$ per 1% rate change',
    sign: 'Usually < 0',
    peak: 'Deep in-the-money, long-dated (most negative)',
    hedge: 'Mirror of the call: falling rates lift puts',
  },
];

const Greeks: React.FC = () => {
  return (
    <LearnPage
      stepId="greeks"
      step={6}
      title="The Greeks"
      tagline="The seven risk meters traders actually read — and the identity that ties calls to puts."
      prev={{ to: '/learn/time-decay', label: 'Step 5 · Time decay' }}
      next={{ to: '/learn/monte-carlo', label: 'Step 7 · Monte Carlo pricing' }}
    >
      <Prose>
        <Lead>
          The price is a scalar, but it is sensitive to five inputs in seven different ways. The{' '}
          <span className="text-slate-900 font-semibold">Greeks</span> are the partial derivatives of the price with
          respect to each input{' '}
          <InlineMath>{'\\Delta = \\frac{\\partial C}{\\partial S}'}</InlineMath>,{' '}
          <InlineMath>{'\\nu = \\partial C / \\partial \\sigma'}</InlineMath>,{' '}
          <InlineMath>{'\\rho = \\partial C / \\partial r'}</InlineMath>,{' '}
          <InlineMath>{'\\Gamma = \\partial \\Delta / \\partial S'}</InlineMath>, and{' '}
          <InlineMath>{'\\theta = \\partial C / \\partial T'}</InlineMath>. Practitioners do not ask "what is the
          price?" — they ask "what happens if the stock moves, or volatility, or the clock?" Each Greek answers one
          of those questions.
        </Lead>

        <WhatYouSee>
          <p>
            The grid below sweeps one input across a range while holding the other four at your slider values. Each
            tile plots a Greek against that sweep; the <span className="text-slate-700">white dot</span> marks your
            current position on the curve, and the number in each tile's corner is the Greek's value at your inputs.
            Switch the sweep variable to see the same seven Greeks against a different axis.
          </p>
        </WhatYouSee>

        <GreeksGrid />

        <Callout kind="idea">
          <p>
            The two most important identities in the whole model: <InlineMath>{'\\Delta_{call} = N(d_1)'}</InlineMath>{' '}
            and <InlineMath>{'N(d_2) = \\mathbb{Q}(S_T > K)'}</InlineMath>. Delta is not an arbitrary sensitivity — it
            is the probability mass of the hedge-ratio distribution, and it is exactly the number of shares you need
            to short to make a long call locally immune to stock moves. That is the whole delta-hedging game:{' '}
            <span className="text-slate-900">own one call, short Δ shares, and the portfolio barely flinches when S moves.</span>
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The quick-reference table</h2>
          <p>
            Same information as the grid, in the three numbers a desk quotes: unit, sign, and where the Greek
            concentrates. The fourth column is what traders actually use it for.
          </p>
          <div className="overflow-x-auto glass-card">
            <table className="w-full text-sm overflow-hidden">
              <thead>
                <tr className="bg-slate-100 text-slate-600 text-left">
                  <th className="px-4 py-2.5 font-medium">Greek</th>
                  <th className="px-4 py-2.5 font-medium">Unit</th>
                  <th className="px-4 py-2.5 font-medium">Sign</th>
                  <th className="px-4 py-2.5 font-medium">Where it peaks</th>
                  <th className="px-4 py-2.5 font-medium">What it hedges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {reference.map((r) => (
                  <tr key={r.greek} className="align-top">
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{r.greek}</td>
                    <td className="px-4 py-3 text-slate-400">{r.unit}</td>
                    <td className="px-4 py-3 text-slate-400">{r.sign}</td>
                    <td className="px-4 py-3 text-slate-400">{r.peak}</td>
                    <td className="px-4 py-3 text-slate-400 leading-6">{r.hedge}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Callout kind="watch">
          <p>
            Three signs trip people up. <span className="text-slate-900 font-semibold">Vega</span> is strictly positive
            for plain European options — more doubt never reduces the value of a right.{' '}
            <span className="text-slate-900 font-semibold">Theta</span> is usually negative (you lose money as the clock
            runs) but a deep in-the-money put's theta can flip positive, because the discounted strike{' '}
            <InlineMath>{'K e^{-rT}'}</InlineMath> <em>grows</em> as T increases. And <span className="text-slate-900 font-semibold">
            rho</span> is a rounding error for short-dated, out-of-the-money options — the deepest and longest are
            where rates actually move prices.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The identity that checks everything: put-call parity</h2>
          <p>
            Before you trade any of this, there is a free consistency check built into the model:
          </p>
          <div className="glass-card p-4 text-sm text-slate-600 leading-7 space-y-2">
            <p>
              <InlineMath>{'C - P = S - K e^{-rT}'}</InlineMath>
            </p>
            <p className="text-slate-400">
              A call with strike K, minus a put with the same strike, is worth exactly one share of the stock less the
              present value of the strike. It is <em>not</em> a Black-Scholes coincidence — replicating the payoffs
              proves it under any model. Black-Scholes must satisfy it to machine precision, so the chart below is a
              live test that the formulas in this site are mutually consistent. Drag every slider and watch.
            </p>
          </div>
        </div>

        <PutCallParityChart />

        <Callout kind="try">
          <p>
            Set <span className="text-slate-900 font-semibold">S exactly equal to K</span>, then wobble volatility and
            time. The call and put prices move together (both bell-shaped in σ), yet their difference stays glued to
            the parity line — two independently-priced instruments cannot drift apart. That one residual being zero
            is the model proving itself to you.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default Greeks;