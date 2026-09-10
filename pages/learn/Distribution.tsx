
import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import ExpiryDistributionChart from '../../components/learn/ExpiryDistributionChart';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import Equation, { InlineMath } from '../../components/Equation';

const Distribution: React.FC = () => {
  return (
    <LearnPage
      stepId="distribution"
      step={3}
      title="The risk-neutral world"
      tagline="Where the stock lands, why that is a probability, and where N(d₁) and N(d₂) come from."
      prev={{ to: '/learn/payoff', label: 'Step 2 · The payoff at expiry' }}
      next={{ to: '/learn/price-structure', label: 'Step 4 · Anatomy of the price' }}
    >
      <Prose>
        <Lead>
          You now know what the option pays at expiry. The stock's landing spot is unknown, so the payoff is random.
          To price a <em>known</em> uncertain payoff at a single number, Black and Scholes did something that felt
          radical in 1973: they did not ask "what will the stock do in reality?". They asked what the stock would do
          in a world where <span className="text-slate-900 font-semibold">everyone is indifferent to risk</span> — and
          they showed that world is enough to fix the price.
        </Lead>

        <Callout kind="watch">
          <p>
            "Risk-neutral" does <em>not</em> mean "the market thinks risk isn't real". It is a pricing device: there
            is exactly one probability measure — the <span className="text-slate-900">risk-neutral measure</span> — under
            which every tradable asset grows at the risk-free rate, and option prices are simply discounted expected
            payoffs in that world. No-arbitrage, not belief, makes it work.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The distribution</h2>
          <p>
            In that world the stock follows a geometric Brownian motion, which at expiry means{' '}
            <InlineMath>
              {'S_T = S\\, e^{(r - \\frac{\\sigma^2}{2})T + \\sigma\\sqrt{T}\\,Z}, \\qquad Z \\sim \\mathcal{N}(0,1)'}
            </InlineMath>
            — a lognormal distribution: always positive, skewed right, with a tail that never quite reaches zero
            probability. The yellow line marks the <span className="text-amber-600">forward price</span>{' '}
            <InlineMath>{'F = S\\, e^{rT}'}</InlineMath>, the expected landing spot in this world; note the peak of the curve
            sits a little to its left. Skew means that.
          </p>
        </div>

        <WhatYouSee>
          <p>
            The chart is a live simulation of <span className="text-slate-700">5,000 risk-neutral paths</span> of your
            option (fixed seed, so it updates smoothly with the sliders). The cyan shade is the fraction of paths that
            finish <span className="text-[var(--color-accent-700)]">past the strike</span>. Switch to the <span className="text-slate-900 font-semibold">
            profit &amp; loss</span> view to see the same paths split by whether a long position ends in the green.
          </p>
        </WhatYouSee>

        <ExpiryDistributionChart />

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Where N(d₂) lives</h2>
          <p>
            The shaded area — the probability of expiring past the strike — has a closed form, because the lognormal
            distribution has one. Standardize the event <InlineMath>S_T &gt; K</InlineMath> and it becomes a bell-curve
            tail with
          </p>
          <Equation>{'d_2 = \\frac{\\ln(S/K) + (r - \\sigma^2/2)\\, T}{\\sigma\\sqrt{T}}'}</Equation>
          <p>
            So <InlineMath>{'N(d_2)'}</InlineMath> — the second "N" in the Black–Scholes formula — <em>is</em> the
            shaded area: the risk-neutral probability the call finishes in the money. The readout above the chart
            compares it to the fraction you can count directly from the simulation; they sit on top of each other
            because both are measuring the same region.
          </p>
          <p>
            <InlineMath>{'d_1'}</InlineMath> is the same standardized moneyness with one extra half-volatility term,{' '}
            <InlineMath>{'d_1 = d_2 + \\sigma\\sqrt{T}'}</InlineMath>, and — the surprise of the whole model —{' '}
            <InlineMath>{'N(d_1)'}</InlineMath> is the call's delta, the option's hedge ratio. One standardized
            moneyness, two different uses: N(d₂) prices the payoff, N(d₁) prices the hedge.
          </p>
        </div>

        <Callout kind="idea">
          <p>
            The entire Black–Scholes call formula{' '}
            <InlineMath>{'C = S\\,N(d_1) - K e^{-rT}\\,N(d_2)'}</InlineMath> is now two sentences:
            <em>{"borrow S in present-value units, buy N(d\u2081) shares, and pay K·e^(−rT) with probability N(d\u2082)."} </em>
            Or, in the probability language: expected payoff{' '}
            <InlineMath>{'E^Q[(S_T - K)^+]'}</InlineMath>
            in the world above, discounted by <InlineMath>{'e^{-rT}'}</InlineMath>. Steps 5 and 7 derive the same
            number two other ways — the agreement is the proof that the machinery is consistent.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">What the sliders do to the picture</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="text-slate-700">Volatility</span> widens and flattens the whole curve — more probability
            mass in both tails, which is exactly why options cost more at high σ.
            </li>
            <li>
              <span className="text-slate-700">Time</span> stretches the curve rightward (expected growth at rate r) —
            but remember expected payoff is not price: the discount factor keeps the two from drifting apart.
            </li>
            <li>
              <span className="text-slate-700">The strike</span> is a vertical ruler sliding over a landscape that has not
            changed at all: raise K and the shaded "winning" area simply shrinks.
            </li>
          </ul>
        </div>

        <Callout kind="try">
          <p>
            Set the strike far above S (deep out of the money) and watch the shaded area compress toward zero — then
            switch to the P&L view. A deep OTM option is a small stake in a huge tail: its price looks small, its
            probability of profit looks tiny, and its payoff when it hits is large. That is a lottery ticket, and the
            chart is the whole pitch.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default Distribution;
