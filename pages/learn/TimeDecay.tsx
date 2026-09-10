
import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import TimeDecayChart from '../../components/learn/TimeDecayChart';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';

const TimeDecay: React.FC = () => {
  return (
    <LearnPage
      stepId="time-decay"
      step={5}
      title="Time decay"
      tagline="Options are clocks. This is what the melting looks like — and theta, the meter for it."
      prev={{ to: '/learn/price-structure', label: 'Step 4 · Anatomy of the price' }}
      next={{ to: '/learn/greeks', label: 'Step 6 · The Greeks' }}
    >
      <Prose>
        <Lead>
          An option's payoff only exists at one instant: expiry. Between now and then, time value — that lighter cap
          from Step 4 — is slowly spent. No stock move, no news, no volatility surprise: an option still loses value
          while you hold it. That bleed is called <span className="text-slate-900 font-semibold">time decay</span>, and it
          is the single most counterintuitive thing about options for people coming from stocks.
        </Lead>

        <WhatYouSee>
          <p>
            The two curves are the call and put price as a function of <em>remaining time</em>, with everything else
            frozen at your slider values. The yellow line marks <span className="text-amber-600">your</span> current
            maturity, and the dot is where your option sits on the curve. The steeper the curve at that point, the more
            value you are losing per day — that slope, measured in dollars per year, is 365 × theta.
          </p>
        </WhatYouSee>

        <TimeDecayChart />

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Why the curve is shaped that way</h2>
          <p>
            Far out on the right, a year-or-more option is essentially a forward-looking bet: shaving off a month
            barely changes the odds, so the curve is flat and theta is near zero. As you slide left toward expiry, the
            same one-day loss in time matters more and more, because uncertainty <em>per remaining day</em> grows. The
            curve's knee is around a few weeks: that is where most retail theta pain (or seller profit) happens.
          </p>
          <p>
            At expiry the time value hits exactly zero for every option, no exceptions. The two vertical asymptotes
            are the only straight part of the picture: at settlement the option is worth exactly its intrinsic value
            from Step 2, and nothing else.
          </p>
        </div>

        <Callout kind="idea">
          <p>
            Theta has a sign, and it depends on who you are. A <span className="text-[var(--color-accent-700)]">long option</span>'s
            time decay is a cost: daily, all else frozen, the value drops by |θ|. A <span className="text-rose-600">short
            option</span>'s theta is the mirror image: it is the premium you are harvesting while the clock runs. The
            whole "sell premium" strategy in options is nothing more than being the other side of this curve — which is
            also why it has tail risk from Step 2.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Theta is not uniform</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <span className="text-slate-700">At the money</span>, short-dated options decay fastest: maximum
              uncertainty per remaining day, and nowhere else. That is the knee in the chart.
            </li>
            <li>
              <span className="text-slate-700">Deep in the money</span>, the option behaves almost like the stock
              itself — theta is small because there is almost no time value left to lose.
            </li>
            <li>
              <span className="text-slate-700">Deep out of the money</span>, the option is so far from the strike that
              extra time buys almost no new chance — theta is also small, which is why lottery tickets hold their
              (tiny) price surprisingly well.
            </li>
          </ul>
        </div>

        <Callout kind="watch">
          <p>
            One exception that bites: a <span className="text-slate-900 font-semibold">deep in-the-money put</span>'s theta
            can go <em>positive</em>. Its price contains a discounted-strike component,{' '}
            <InlineMath>{'K e^{-rT}'}</InlineMath>, and as that discount factor <em>grows</em> with time, the put's
            value can rise even with no stock move. Check the put line on the dashboard's greeks grid — it bends up
            exactly where the text says it should.
          </p>
        </Callout>

        <Callout kind="try">
          <p>
            Drag <span className="text-slate-900 font-semibold">time to maturity</span> from 2 years down to one month
            while watching the dashboard's call theta. The daily bleed goes from negligible to brutal — this is why
            "the option expires in a week and the stock hasn't moved yet" is the classic retail-loss story, and why
            sellers of short-dated premium are the ones collecting it.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default TimeDecay;
