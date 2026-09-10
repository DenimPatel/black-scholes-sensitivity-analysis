
import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import ComparisonCharts from '../../components/learn/ComparisonCharts';
import PriceDecompositionChart from '../../components/learn/PriceDecompositionChart';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';

const PriceStructure: React.FC = () => {
  return (
    <LearnPage
      stepId="price-structure"
      step={4}
      title="Anatomy of the price"
      tagline="Intrinsic value, time value, no-arbitrage bounds, and what each input actually does."
      prev={{ to: '/learn/distribution', label: 'Step 3 · The risk-neutral world' }}
      next={{ to: '/learn/time-decay', label: 'Step 5 · Time decay' }}
    >
      <Prose>
        <Lead>
          You have seen the landscape the stock lands in, and you have seen the payoff that pays out there. Let's put
          the price itself on the table and take it apart: every option price is a stack of two layers, and every
          input in the model pushes on that stack in a place you can see.
        </Lead>

        <WhatYouSee>
          <p>
            The call and put are each drawn as a <span className="text-[var(--color-accent-700)]">solid band (intrinsic value)</span> with a
            <span className="text-[var(--color-accent-400)]"> lighter cap on top (time value)</span>. The dashed amber line is the{' '}
            <span className="text-amber-600">no-arbitrage floor</span> for the call:{' '}
            <InlineMath>{'\\max(0,\\ S - K e^{-rT})'}</InlineMath> — no trader can price the call below it, or someone
            buys the call, borrows against the strike, and locks in a riskless profit.
          </p>
        </WhatYouSee>

        <PriceDecompositionChart />

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The two layers</h2>
          <p>
            <span className="text-slate-900 font-semibold">Intrinsic value</span> is what the option is worth if it
            settled right now: <InlineMath>{'\\max(S - K, 0)'}</InlineMath> for the call. An in-the-money option's
            solid band is that number; it is real, exercisable, certain.
          </p>
          <p>
            <span className="text-slate-900 font-semibold">Time value</span> is everything else: the charge for the chance
            that the stock moves into your favor before expiry. It is the part that is uncertain, and it is the part
            that dies at expiry. Notice where it is largest — at the strike — because at-the-money is where the
            option has the most "to become": the coin is most nearly in the air.
          </p>
        </div>

        <Callout kind="idea">
          <p>
            "Price = intrinsic + time value" sounds like bookkeeping, but it is an arbitrage fact: an option that
            trades <em>below</em> its intrinsic value is a free lunch (buy the option, exercise immediately). The
            chart's amber line is the put-side of the same logic. Everything between the floor and the model price is
            time value, and time value is what all the Greeks in Step 6 are measures of.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">What each input does to the curve</h2>
          <p>
            The comparison view below overlays the call price across a fan of inputs, holding the others at your
            slider values. This is the fastest way to develop the feel you will need later: the shape of each fan is
            a Greek letter wearing a trench coat.
          </p>
        </div>

        <WhatYouSee>
          <p>
            Pick a fan. <span className="text-slate-900 font-semibold">Strikes</span> show how the price slides down as
            the hurdle rises (moneyness). <span className="text-slate-900 font-semibold">Maturities</span> show the
            clock: longer options sit higher and flatter, and the gap between them is time value.{' '}
            <span className="text-slate-900 font-semibold">Volatilities</span> fan around the at-the-money point — the
            only place a curve with zero time value is flat everywhere, and vol still lifts it.
          </p>
        </WhatYouSee>

        <ComparisonCharts />

        <Callout kind="watch">
          <p>
            In the vol fan, the curves all meet at the wings: deep in or out of the money, extra σ barely changes the
            price, because the outcome is already nearly decided. All of vega's action is in the middle. If you can
            see that in the chart, you already have the intuition for half of Step 6.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The full formula, now that it has a body</h2>
          <p>
            With the layers visible, the Black–Scholes call price reads as a statement about the stack:
          </p>
          <div className="glass-card p-4 text-sm text-slate-600 leading-7 space-y-2">
            <p>
              <InlineMath>{'C = \\underbrace{S\\,N(d_1)}_{\\text{intrinsic, grown at rate } r} - \\underbrace{K e^{-rT}\\,N(d_2)}_{\\text{strike paid only if you exercise}}'}</InlineMath>
            </p>
            <p className="text-slate-400">
              You carry the value of the stock, weighted by the chance you'll finish in the money (N(d₁) — slightly more
              than the raw probability, because the stock path you're exposed to is tilted in your favor). And you
              carry the strike, discounted, weighted by the chance you actually have to pay it (N(d₂)). The difference
              — what remains when the two nearly cancel — is the time value. The put is its mirror, and step 6 shows
              the exact identity that ties them together.
            </p>
          </div>
        </div>
      </Prose>
    </LearnPage>
  );
};

export default PriceStructure;
