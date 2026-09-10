
import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import PayoffDiagram from '../../components/learn/PayoffDiagram';
import { Callout, Lead, Prose, WhatYouSee } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';

const positions = [
  { pos: 'Long call', formula: '\\max(S_T - K,\\ 0) - C', when: 'You bet the stock rises. Payoff 0 below K, then +1 for every dollar above.' },
  { pos: 'Short call', formula: 'C - \\max(S_T - K,\\ 0)', when: 'You collect the premium and take the other side. Unlimited loss if the stock runs away.' },
  { pos: 'Long put', formula: '\\max(K - S_T,\\ 0) - P', when: 'You bet the stock falls. Payoff 0 above K, then +1 for every dollar below.' },
  { pos: 'Short put', formula: 'P - \\max(K - S_T,\\ 0)', when: 'Insurance seller\'s position: premium is capped, loss grows as the stock goes to zero.' },
];

const Payoff: React.FC = () => {
  return (
    <LearnPage
      step={2}
      title="The payoff at expiry"
      tagline="Strip away the pricing and ask the only question that matters at settlement: what do I win?"
      prev={{ to: '/learn', label: 'Step 1 · What is an option?' }}
      next={{ to: '/learn/distribution', label: 'Step 3 · The risk-neutral world' }}
    >
      <Prose>
        <Lead>
          Everything an option does in its lifetime converges to a single moment: expiry. At that moment the contract
          settles into its <span className="text-white font-semibold">payoff</span> — a plain, piecewise-linear
          function of where the stock has landed. Pricing an option is, at bottom, assigning a value <em>today</em> to
          a random payoff <em>tomorrow</em>.
        </Lead>

        <WhatYouSee>
          <p>
            The chart shows your profit or loss at expiry, <em>after</em> the premium, for the position you pick. The
            vertical purple line is the strike K; the blue line is where the stock stands today; the yellow dot is the{' '}
            <span className="text-amber-300">breakeven</span> — the single stock price at which you end up exactly
            whole.
          </p>
        </WhatYouSee>

        <PayoffDiagram />

        <Callout kind="try">
          <p>
            Flip to <span className="text-white font-semibold">short call</span> and watch the tail: the premium you
            collect is the entire roof of your profit, and the loss on the right has no floor. That asymmetry — small
            certain gain, unbounded tail risk — is exactly why the market pays a rich price for calls, and exactly why
            shorting them is how firms blow up.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">All four positions, on one page</h2>
          <p>
            Every traded position is one of these four (or a combination of them). <InlineMath>S_T</InlineMath> is the
            stock at expiry; <InlineMath>C</InlineMath> and <InlineMath>P</InlineMath> are the call and put premiums.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-700 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-gray-800 text-gray-400 text-left">
                  <th className="px-4 py-2.5 font-medium">Position</th>
                  <th className="px-4 py-2.5 font-medium">Payoff at expiry</th>
                  <th className="px-4 py-2.5 font-medium">The intuition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/70">
                {positions.map((p) => (
                  <tr key={p.pos} className="bg-gray-800/30 align-top">
                    <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{p.pos}</td>
                    <td className="px-4 py-3">
                      <InlineMath>{p.formula}</InlineMath>
                    </td>
                    <td className="px-4 py-3 text-gray-400 leading-6">{p.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Why the curve has that shape</h2>
          <p>
            The <InlineMath>\max</InlineMath> in every row is doing all the work. For a call, if the stock dies below{' '}
            <InlineMath>K</InlineMath>, exercising is pointless — walking away costs less than buying high — so the
            payoff is exactly zero, flat. Above <InlineMath>K</InlineMath>, each extra dollar of the stock is worth one
            extra dollar to you, so the payoff rises at a 45° slope. The kink at <InlineMath>K</InlineMath> is where
            the option's optionality switches on.
          </p>
          <p>
            Subtracting the premium slides the whole curve down by a flat amount: it does not change the <em>shape</em>,
            it only decides where you cross the break-even line. The buyer's risk is therefore fixed and visible from
            the chart — the premium. The seller's risk is the mirror: capped upside, tail on the other side.
          </p>
        </div>

        <Callout kind="idea">
          <p>
            At expiry, an option is worth exactly its <span className="text-white">intrinsic value</span>:{' '}
            <InlineMath>{'\\max(S_T - K, 0)'}</InlineMath> for a call. But today the premium is usually{' '}
            <em>greater</em> than today's intrinsic value. Where does that excess come from, and what principle forces
            its exact size? That is the question the next three steps answer.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default Payoff;
