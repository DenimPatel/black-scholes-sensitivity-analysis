import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import MonteCarloChart from '../../components/learn/MonteCarloChart';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import Equation, { InlineMath } from '../../components/Equation';

const MonteCarlo: React.FC = () => {
  return (
    <LearnPage
      step={7}
      title="Monte Carlo pricing"
      tagline="Throw the dice the way the market does — and watch the average find the formula."
      prev={{ to: '/learn/greeks', label: 'Step 6 · The Greeks' }}
      next={{ to: '/learn/limitations', label: 'Step 8 · What the model assumes' }}
    >
      <Prose>
        <Lead>
          Step 3 told you the formula is a discounted expected payoff. If that is true, you should be able to{' '}
          <span className="text-slate-900 font-semibold">price by brute force</span>: simulate thousands of risk-neutral
          terminal stock prices, average the payoffs they produce, discount the average, and land on the Black-Scholes
          price. This page does exactly that, live, and it works — within the expected noise.
        </Lead>

        <Callout kind="idea">
          <p>
            The engine is the same terminal-price formula from Step 3, one draw at a time:
          </p>
          <Equation>{'S_T^{(i)} = S\\, e^{(r - \\sigma^2/2)\\, T + \\sigma\\sqrt{T}\\, Z^{(i)}}, \\qquad Z^{(i)} \\overset{\\text{i.i.d.}}{\\sim} \\mathcal{N}(0,1)'}</Equation>
          <p>
            Simulate <InlineMath>n</InlineMath> of these, price each payoff, discount, and average. The estimate is
            random — but its spread is known, because each simulated path is an independent draw:
          </p>
          <Equation>{'\\mathrm{SE} = \\frac{\\text{sample SD of discounted payoffs}}{\\sqrt{n}}'}</Equation>
          <p>
            That is the law of large numbers in uniform: <span className="text-slate-900">quadruple</span> the paths and
            the noise <span className="text-slate-900">halves</span>. The error bars in the chart are ±1 standard error,
            and the true price sits inside them essentially always.
          </p>
        </Callout>

        <WhatYouSee>
          <p>
            Left: the Monte Carlo estimate and its ±1 SE band at 100 → 51,200 paths (log axis), with the closed-form
            Black-Scholes price as the amber reference line. Right: where all 51,200 simulated terminal prices landed.
            All paths share one <span className="text-slate-700">fixed seed</span>, so the picture updates smoothly with
            the sliders; roll the dice to see what a different random draw looks like.
          </p>
        </WhatYouSee>

        <MonteCarloChart />

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Why the estimate and the formula agree</h2>
          <p>
            The chart's convergence is not a coincidence of these two implementations — it is the definition of the
            risk-neutral measure. By construction, the distribution you simulate from is the one under which
            discounted payoffs are martingales, so the simulated average <em>must</em> climb onto the formula line as
            the sampling noise shrinks. When the error bars are tight enough to bracket the amber line, you have
            <span className="text-slate-900">recomputed Black-Scholes from first principles</span>.
          </p>
          <p>
            Watch the standard-error readout as you drag <span className="text-slate-700">T</span> and{' '}
            <span className="text-slate-700">σ</span>: long-dated, high-volatility options have wide payoff
            distributions, so a fixed number of paths buys less precision. Options that are expensive to price are
            also expensive to <em>simulate</em> — the two difficulties are the same one.
          </p>
        </div>

        <Callout kind="try">
          <p>
            Set <span className="text-slate-900 font-semibold">S far above K</span> (a deep in-the-money call) and reroll
            the dice a few times. The estimate barely moves between rerolls, because almost every path finishes in the
            money: low uncertainty, tiny error bars. Now set <span className="text-slate-900 font-semibold">S far below K</span>{' '}
            — deep OTM, where payoff is zero except for the rare fat tail. The estimate now hops around between
            rerolls. That hop is the true cost of pricing tail risk — and the reason real desks switch to smarter
            sampling (antithetic, importance, quasi-random) for exactly this regime.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Why simulation exists at all</h2>
          <p>
            Nothing on this site <em>needs</em> Monte Carlo — Black-Scholes has a closed form. The method earns its
            keep the moment the closed form does not exist:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <span className="text-slate-700">Exotic payoffs</span> — barriers, average-price (Asian) options,
              lookback options — most have no tidy formula, but every one can still be simulated path by path.
            </li>
            <li>
              <span className="text-slate-700">Path dependence</span> — some options depend on the whole trajectory,
              not just where it lands. Simulation is the only practical way to price them.
            </li>
            <li>
              <span className="text-slate-700">American options</span> — when early exercise is allowed, pricing is a
              decision problem at every moment; the standard tool is binomial/tree or Monte Carlo with dynamic
              programming, never a single expectation. Step 8 will explain why that breaks the simple formula.
            </li>
            <li>
              <span className="text-slate-700">Real markets</span> — stochastic volatility, jumps, and rates (also
              Step 8) make the closed form a lie; simulation keeps working on the true model.
            </li>
          </ul>
        </div>

        <Callout kind="watch">
          <p>
            A Monte Carlo number is a <em>random variable with a known spread</em>, not a price. Never report the
            estimate without its standard error — a desk that quotes "14.712" when the SE is 0.05 is lying to itself.
            The error bars on this page are the whole point: precision is a budget you buy with paths.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default MonteCarlo;