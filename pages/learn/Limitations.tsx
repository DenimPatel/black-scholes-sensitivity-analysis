import React from 'react';
import LearnPage from '../../components/learn/LearnPage';
import { Callout, Glossary, Lead, Prose } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';

const assumptions = [
  {
    title: 'The stock follows geometric Brownian motion with constant volatility',
    whatBreaks: 'Real prices jump (earnings, crises, flash crashes) and volatility moves — high-vol regimes cluster. The lognormal bell from Step 3 is a convenient fiction; the market\u2019s actual terminal distribution has fatter tails and a volatility that itself changes over time.',
  },
  {
    title: 'Trading is continuous, frictionless, and at any size',
    whatBreaks: 'Brokerage, bid-ask spreads, and market impact make continuous rebalancing impossible and infinitely expensive to approximate closely. The famous delta-hedging recipe (short Δ shares) assumes you can trade every instant at zero cost — in reality you rebalance discretely and pay the spread each time.',
  },
  {
    title: 'No arbitrage opportunities exist',
    whatBreaks: 'The model prices as if nothing is free. Real markets are noisy and imperfect; temporary mispricings appear, which is why quoted prices drift from the formula — and why the gap between model and market can itself become a trade (see implied volatility below).',
  },
  {
    title: 'The risk-free rate is constant and known',
    whatBreaks: 'Rates are stochastic and change with policy, inflation, and the state of the world. Long-dated options are priced against a whole yield curve, not one number. This is exactly the rho the Greeks page told you was small — for short options. For long ones, it is the whole story.',
  },
  {
    title: 'No dividends or cash flows on the underlying',
    whatBreaks: 'A dividend is money the stockholder gets and the option holder does not, so it lowers the call\u2019s value and raises the put\u2019s. The fix is a known dividend yield q replacing r — until dividend policy itself becomes uncertain.',
  },
  {
    title: 'Volatility is constant over the option\u2019s life (a specific case of #1)',
    whatBreaks: 'This is the assumption with its own market: implied volatility is the σ that makes the formula reproduce a quoted price, and it is not constant — it bends into a "smile" across strikes (skew when downside risk is priced), and it varies with maturity. The whole volatility-surface industry exists because a single σ is wrong in every direction at once.',
  },
  {
    title: 'European exercise only, at exactly expiry',
    whatBreaks: 'American options can be exercised early, which changes the value — and even European-style contracts can be effectively exercised early via close substitutes. Pricing American options needs dynamic programming, not a single closed-form expectation.',
  },
];

const glossaryTerms = [
  {
    term: 'Option',
    def: (
      <span>
        A contract giving the holder the <em>right, but not the obligation</em>, to buy (call) or sell (put) an asset
        at a fixed price on or before a fixed date. Step 1.
      </span>
    ),
  },
  {
    term: 'European vs American',
    def: (
      <span>
        European options exercise only at expiry; American options allow exercise any time before. Black-Scholes prices
        the European case; American options need numerical methods.
      </span>
    ),
  },
  {
    term: 'Premium',
    def: 'The price paid (long) or received (short) for the option today — the option price itself.',
  },
  {
    term: 'Strike price (K)',
    def: 'The fixed price at which the option can buy or sell the asset. All moneyness is measured against K.',
  },
  {
    term: 'Moneyness',
    def: (
      <span>
        Where the stock stands relative to the strike: in the money (ITM, exercising gains), at the money (ATM),
        or out of the money (OTM). For a call ITM means <InlineMath>S &gt; K</InlineMath>; for a put,
        <InlineMath>S &lt; K</InlineMath>.
      </span>
    ),
  },
  {
    term: 'Breakeven',
    def: (
      <span>
        The terminal stock price at which P&L is exactly zero: breakeven = <InlineMath>{'K \\pm \\text{premium}'}</InlineMath>{' '}
        (plus for a call, minus for a put, with signs flipped for short positions).
      </span>
    ),
  },
  {
    term: 'Intrinsic value',
    def: (
      <span>
        What the option is worth if exercised immediately: <InlineMath>\max(S - K, 0)</InlineMath> for a call. Certain,
        real, and zero at or below the strike.
      </span>
    ),
  },
  {
    term: 'Time value',
    def: 'The excess of the option price over intrinsic value — the charge for the chance the stock moves in your favor before expiry. It is largest at the money and dies at expiry.',
  },
  {
    term: 'Forward price',
    def: (
      <span>
        The risk-neutral expected landing spot of the stock: <InlineMath>{'F = S\\, e^{rT}'}</InlineMath>. The lognormal
        distribution's mean; the most likely landing spot is slightly below it.
      </span>
    ),
  },
  {
    term: 'Geometric Brownian motion (GBM)',
    def: (
      <span>
        The assumed stock process: log-returns are normal with drift <InlineMath>r - \sigma^2/2</InlineMath> and
        volatility <InlineMath>\sigma</InlineMath>. Prices stay positive and are lognormally distributed at every
        horizon.
      </span>
    ),
  },
  {
    term: 'Lognormal',
    def: 'The distribution of a variable whose logarithm is normal. Positive, right-skewed — the shape of terminal stock prices under GBM.',
  },
  {
    term: 'Risk-neutral measure',
    def: (
      <span>
        The probability measure under which every asset grows at the risk-free rate and option prices are discounted
        expected payoffs. It is a pricing device fixed by no-arbitrage, not a forecast of what will actually happen.
      </span>
    ),
  },
  {
    term: 'Theta (θ)',
    def: 'Time decay: the change in option price per unit of time passing. Usually negative for long options; can go positive for deep in-the-money puts.',
  },
  {
    term: 'Delta (Δ)',
    def: (
      <span>
        Sensitivity to the stock price: <InlineMath>{'\\Delta_{call} = N(d_1)'}</InlineMath>. Also the hedge ratio — short
        Δ shares to neutralize stock moves.
      </span>
    ),
  },
  {
    term: 'Delta-neutral',
    def: 'A portfolio whose total delta is zero, so a small stock move leaves its value roughly unchanged. The primitive of hedging.',
  },
  {
    term: 'Hedging',
    def: 'Taking offsetting positions to reduce unwanted risk. The central use of the Greeks: delta hedges stock moves, vega hedges volatility moves.',
  },
  {
    term: 'Arbitrage',
    def: 'A trade that makes a strictly positive, riskless profit with no capital at risk. The absence of arbitrage is the assumption that lets the risk-neutral measure exist.',
  },
  {
    term: 'No-arbitrage bound',
    def: (
      <span>
        A price floor or ceiling forced by replication alone, e.g. call price ≥ <InlineMath>{'\\max(0,\\ S - K e^{-rT})'}</InlineMath>. True under any model — if a price leaves the bound, there is a free lunch.
      </span>
    ),
  },
  {
    term: 'Put-call parity',
    def: (
      <span>
        The identity <InlineMath>{'C - P = S - K e^{-rT}'}</InlineMath>. An arbitrage fact linking call and put prices,
        satisfied by any consistent model.
      </span>
    ),
  },
  {
    term: 'Implied volatility',
    def: 'The σ that, plugged into the formula, returns a traded price. Market quotes converted into σ — the language of the volatility surface.',
  },
  {
    term: 'Volatility smile / skew',
    def: (
      <span>
        The U-shape (smile) or tilted shape (skew) of implied volatility across strikes. Fat downside tails make
        OTM puts demand higher implied σ than the flat line the formula assumes.
      </span>
    ),
  },
  {
    term: 'Monte Carlo simulation',
    def: 'Pricing by simulating many random risk-neutral paths and averaging discounted payoffs. Error shrinks like 1/√n; the method survives when no closed form exists.',
  },
  {
    term: 'Standard error (SE)',
    def: 'The sampling noise of an estimate: sample SD divided by √n. The honest companion of every Monte Carlo number.',
  },
];

const Limitations: React.FC = () => {
  return (
    <LearnPage
      step={8}
      title="What the model assumes — and what breaks it"
      tagline="Black-Scholes is the ideal case. Every real market deviates from it, and knowing where is half the skill."
      prev={{ to: '/learn/monte-carlo', label: 'Step 7 · Monte Carlo pricing' }}
    >
      <Prose>
        <Lead>
          Everything so far has been about the model's interior: how its five inputs compose into a price. This final
          step faces outward. The Black-Scholes formula is a <span className="text-white font-semibold">perfect
          answer to an idealized question</span>, and the idealization is where the danger lives. Each assumption
          below is listed with the real-world failure that breaks it — not to dismiss the model, but to know exactly
          which part of reality it is holding still.
        </Lead>

        <Callout kind="watch">
          <p>
            The formula is not wrong; it is <em>exact for a world that does not exist</em>. Professionals use it
            anyway, because the Greeks are still the best local language for real risks — but they always track the
            distance between the assumed world and the observed one. That distance has market prices, and its own
            vocabulary (implied volatility, smile, skew).
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">The assumptions, and the cracks in each</h2>
          <ol className="space-y-5">
            {assumptions.map((a, i) => (
              <li key={a.title} className="bg-gray-800/40 border border-gray-700 rounded-xl p-4">
                <p className="font-semibold text-white text-sm leading-6">
                  {i + 1}. {a.title}
                </p>
                <p className="text-sm text-rose-300/90 mt-2 leading-6">
                  <span className="font-semibold">What breaks it — </span>
                  {a.whatBreaks}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <Callout kind="idea">
          <p>
            Assumptions 1, 2 and 7 are the ones that actually bite in practice: the market's distribution has fatter
            tails than the lognormal, hedging is real-world expensive, and American early exercise changes the
            mathematics entirely. That is why the simulation tools of Step 7 — which can price arbitrary payoffs
            under arbitrary (non-GBM) processes — are not a laboratory curiosity but the industry's everyday
            replacement for the formula's regime.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">If I remember one thing from this page</h2>
          <p>
            The formula's output is a <span className="text-white">price in an ideal world</span>, the market's quoted
            price is <span className="text-white">a fact about this world</span>, and the difference between them — the
            implied volatility surface, the smile, the skew — is where real information about real risk lives. You now
            have the vocabulary to read it, and the charts on this site to feel it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-white mb-3">Glossary — the whole tour in one place</h2>
          <p>
            Every term introduced over the eight steps, collected here for reference.
          </p>
          <Glossary terms={glossaryTerms} />
        </div>

        <Callout kind="try">
          <p>
            Go back to the <span className="text-white font-semibold">strike fan</span> on Step 4 and sweep{' '}
            <span className="text-white font-semibold">S</span> at very high volatility. In the real world that right
            tail is even fatter than the lognormal — imagine the same picture with market-implied σ drawn from the
            skew. You are now seeing what a vol trader sees.
          </p>
        </Callout>
      </Prose>
    </LearnPage>
  );
};

export default Limitations;