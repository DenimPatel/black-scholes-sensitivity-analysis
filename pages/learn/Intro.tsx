
import React from 'react';
import { Link } from 'react-router-dom';
import LearnPage from '../../components/learn/LearnPage';
import { Callout, Lead, Prose, StatRow } from '../../components/learn/Prose';
import { InlineMath } from '../../components/Equation';
import { calculateBlackScholes } from '../../services/blackScholes';
import { useModelParams } from '../../state/ParamsContext';

const statItems = [
  {
    sym: 'S',
    name: 'Stock price',
    def: 'The current market price of the underlying. Moving S is the everyday event; everything else in this list is a fixed parameter of the contract or the world.',
  },
  {
    sym: 'K',
    name: 'Strike price',
    def: 'The agreed exercise price, fixed when the contract is struck. It is the line that separates "winning" from "losing" territory in every chart on this site.',
  },
  {
    sym: 'T',
    name: 'Time to maturity',
    def: 'Years until expiry. Time is not a line on the graph — it is the entire reason time value exists. An option that expires tomorrow is worth almost nothing more than what it is worth right now.',
  },
  {
    sym: 'σ',
    name: 'Volatility',
    def: "The standard deviation of the stock's annualized returns. The model's only window on the future: larger σ fattens the tails of the terminal distribution, and tails are worth money for an option holder.",
  },
  {
    sym: 'r',
    name: 'Risk-free rate',
    def: 'The rate on a theoretically zero-risk asset (a short government bond). It enters as the discount rate and, counterintuitively, helps calls and hurts puts.',
  },
];

const StatList: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
    {statItems.map((s) => (
      <div key={s.sym} className="glass-card p-4">
        <div className="flex items-baseline gap-3 mb-1.5">
          <span className="text-2xl font-mono text-[var(--color-accent-700)]">{s.sym}</span>
          <h3 className="text-sm font-semibold text-slate-900">{s.name}</h3>
        </div>
        <p className="text-sm text-slate-400 leading-6">{s.def}</p>
      </div>
    ))}
  </div>
);

const Intro: React.FC = () => {
  const { params } = useModelParams();
  const { stockPrice: S, strikePrice: K } = params;
  const { callPrice, putPrice } = calculateBlackScholes(params);

  const moneyness = S > K ? 'in the money' : S < K ? 'out of the money' : 'at the money';

  const moneynessExample =
    S > K
      ? `With S = $${S.toFixed(2)} and K = $${K.toFixed(2)}, exercising the call right now would gain $${(S - K).toFixed(2)}: it is in the money (ITM).`
      : S < K
        ? `With S = $${S.toFixed(2)} and K = $${K.toFixed(2)}, exercising the call right now would lose $${(K - S).toFixed(2)}, so the call is out of the money (OTM). Its value comes entirely from hope and time.`
        : `With S = $${S.toFixed(2)} and K = $${K.toFixed(2)}, the call is exactly at the money (ATM): no immediate gain, maximum uncertainty — which, as Step 4 will show, is exactly when it is most expensive.`;

  return (
    <LearnPage
      stepId="intro"
      step={1}
      title="What is an option?"
      tagline="The one contract, the five inputs, and why a formula can price it at all."
      next={{ to: '/learn/payoff', label: 'Step 2 · The payoff at expiry' }}
    >
      <Prose>
        <Lead>
          A <span className="text-slate-900 font-semibold">stock option</span> is a contract that gives its owner the{' '}
          <span className="text-[var(--color-accent-700)]">right, but not the obligation</span>, to buy or sell a fixed number of shares
          of a stock at a fixed price, up to a fixed date. That single sentence contains everything the Black–Scholes
          formula is trying to price.
        </Lead>

        <p>
          There are two kinds. A <span className="text-[var(--color-accent-700)] font-semibold">call</span> gives you the right to{' '}
          <em>buy</em> the stock at the strike; a <span className="text-[var(--color-accent-2-600)] font-semibold">put</span> gives you
          the right to <em>sell</em> it there. And there are two sides to every trade: the buyer (long) pays a premium
          for the privilege and holds the right; the seller (short) receives the premium and must deliver if the buyer
          exercises.
        </p>

        <p>
          Every option on this site is <span className="text-slate-900 font-semibold">European</span>: it can only be
          exercised <em>on</em> the expiration date. American options can be exercised any time before, which makes
          them harder to price (Step 8 covers this). Black and Scholes priced the European case in 1973, and their
          formula is still the backbone of how markets talk about options.
        </p>

        <Callout kind="idea">
          <p>
            An option is a bet on the <em>range</em> of the stock's future, compressed into five inputs: the stock
            price <InlineMath>S</InlineMath>, the strike price <InlineMath>K</InlineMath>, the time to expiry{' '}
            <InlineMath>T</InlineMath>, the volatility <InlineMath>\sigma</InlineMath>, and the risk-free rate{' '}
            <InlineMath>r</InlineMath>. The entire site is about how a fair price is a function of exactly those five
            numbers.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">In the money, at the money, out of the money</h2>
          <p>
            <span className="text-[var(--color-accent-700)] font-semibold">{moneynessExample}</span> Moneyness is just the sign of{' '}
            <InlineMath>
              {'S - K'}
            </InlineMath>
            (a put's payoff runs the other way). The sidebar sliders drive this live: move S across K and watch this
            sentence — and every later chart — flip. A call you can exercise profitably right now is worth at least
            that immediate gain; one that you cannot is worth only its chance of <em>becoming</em> that.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">The five inputs, in plain words</h2>
          <StatList />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">Your option, priced right now</h2>
          <StatRow
            stats={[
              { label: 'Stock price S', value: `$${S.toFixed(2)}`, hint: 'Where the stock trades today' },
              { label: 'Strike price K', value: `$${K.toFixed(2)}`, hint: `The option is ${moneyness}` },
              { label: 'Fair call price', value: `$${callPrice.toFixed(2)}`, hint: 'Black–Scholes, with your current inputs' },
              { label: 'Fair put price', value: `$${putPrice.toFixed(2)}`, hint: 'Same inputs, right to sell' },
            ]}
          />
        </div>

        <Callout kind="watch">
          <p>
            Two traps for first-timers. First, "volatility" is an <em>annualized</em> number: 28% does not mean the
            stock moves 28% this week — it describes the size of a random year. Second, the formula's output is a{' '}
            <em>model</em> price: real markets quote their own prices, and the gap between the two is where trading
            happens. Steps 7 and 8 cover this honestly.
          </p>
        </Callout>

        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">How to read this site</h2>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <Link to="/learn/payoff" className="text-[var(--color-accent)] hover:underline">Step 2</Link> — what you actually win or lose at expiry (the payoff).
            </li>
            <li>
              <Link to="/learn/distribution" className="text-[var(--color-accent)] hover:underline">Step 3</Link> — the probability world the formula assumes, and where N(d₁) and N(d₂) come from.
            </li>
            <li>
              <Link to="/learn/price-structure" className="text-[var(--color-accent)] hover:underline">Step 4</Link> — intrinsic vs time value, and how each input shifts the price.
            </li>
            <li>
              <Link to="/learn/time-decay" className="text-[var(--color-accent)] hover:underline">Step 5</Link> — the option as a melting ice cube: theta.
            </li>
            <li>
              <Link to="/learn/greeks" className="text-[var(--color-accent)] hover:underline">Step 6</Link> — the Greek-letter risk measures traders actually use.
            </li>
            <li>
              <Link to="/learn/monte-carlo" className="text-[var(--color-accent)] hover:underline">Step 7</Link> — price the same option by simulation and watch it converge to the formula.
            </li>
            <li>
              <Link to="/learn/limitations" className="text-[var(--color-accent)] hover:underline">Step 8</Link> — what Black–Scholes assumes, and what happens when the world breaks those assumptions.
            </li>
            <li>
              <Link to="/" className="text-[var(--color-accent)] hover:underline">The dashboard</Link> — everything at once, with full derivations under every number.
            </li>
          </ul>
        </div>
      </Prose>
    </LearnPage>
  );
};

export default Intro;
