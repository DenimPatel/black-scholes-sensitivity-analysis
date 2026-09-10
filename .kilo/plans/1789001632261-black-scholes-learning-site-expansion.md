# Black-Scholes Learning Site Expansion

## Summary

Turn the current single-page dashboard into a multi-page site (react-router): the existing dashboard stays at `/` as a quick playground, and 8 new numbered Learn pages teach Black-Scholes from scratch for a university-grad first-timer. Every page pairs short narrative ("what you're looking at" + "why it matters") with interactive visualizations driven by the shared parameter state. No backend; only new dependency is `react-router-dom`.

## Current state (verified in code)

- React 19 + Vite 6 + TS SPA; Tailwind via CDN in `index.html`; KaTeX + Recharts 3 already installed.
- `App.tsx:9-16`: params state (5 sliders via `components/Controls.tsx`), 10 expandable `InfoCard`s with full KaTeX derivations (`components/Results.tsx`), single `SensitivityChart`.
- `services/blackScholes.ts`: normal CDF/PDF (erf approx), d1/d2, call/put prices, all greeks (call/put delta, gamma, vega, theta call/put, rho call/put).
- Gaps to fix while expanding:
  - `ChartData` in `types.ts:26-35` computes vega/theta/rho but `SensitivityChart.tsx` never plots them; delta+gamma share one right axis with different scales.
  - Risk-free-rate chart range is hard-coded 0.01–0.1 while the slider allows 0 (App.tsx:44-49, inconsistent with `Controls.tsx` ranges).
  - No teaching content, payoff, parity, distribution, or simulation anywhere.

## Decisions

1. **Router**: `react-router-dom` (v7), `BrowserRouter` with `basename="/black-scholes-sensitivity-analysis"` (must match Vite `base` in `vite.config.ts:9`). Add `public/404.html` with the standard GitHub Pages SPA fallback script so deep links reload correctly in production (Vite copies `public/` → `dist/`).
2. **Routes** (Learn pages numbered in pedagogical order):
   - `/` — Dashboard (existing UI, moved to `pages/Dashboard.tsx`)
   - `/learn` — **Intro**: what an option is (right, not obligation), call vs put, European vs American, long/short, moneyness (ITM/ATM/OTM), the five inputs with intuition, how to navigate the site
   - `/learn/payoff` — **Payoff at expiry**: interactive payoff diagram + payoff table for all 8 positions, breakeven & max-loss markers
   - `/learn/distribution` — **The risk-neutral world**: lognormal terminal-price distribution, N(d2) = P(ITM), P&L distribution, probability of profit, "why price ≠ plain expected payoff"
   - `/learn/price-structure` — **Intrinsic + time value**: decomposition chart + comparison charts (strike ladder / maturity fan / volatility fan) + no-arbitrage bounds
   - `/learn/time-decay` — **Time decay**: price vs remaining-T fan, theta = slope, why ATM short-dated decay accelerates
   - `/learn/greeks` — **Greeks**: small-multiples grid (all 7 greeks vs any parameter), per-greek explainers, quick-reference table, put-call parity checker
   - `/learn/monte-carlo` — **Monte Carlo pricing**: GBM simulation estimate vs closed form, convergence with ±SE error bars
   - `/learn/limitations` — **What Black-Scholes assumes & what breaks it**, each assumption paired with its real-world failure; glossary (≥15 terms)
3. **Shared state**: `ParamsProvider` React context mounted **above** `<Routes>` so the five parameters survive navigation. Every Learn page renders the existing `Controls` (compact variant) in a sidebar so charts react live in place. New per-page state is local only (e.g., MC path count/seed, comparison mode, position toggle).
4. **Charts**: reuse Recharts only. Payoff/parity/decomposition → `ComposedChart` with `ReferenceLine`/`ReferenceDot`; distribution & MC histograms → `BarChart`; greeks grid = one small `LineChart` per greek (fixes the current scale-mixing problem). No new charting lib.
5. **Deterministic simulation**: `utils/random.ts` with `mulberry32` seeded PRNG + Box–Muller normals; fixed default seed; a "Re-run simulation" button reseeds. All derived data via `useMemo` keyed on `[params, relevantLocalState]`.

## Service additions (`services/blackScholes.ts`)

- `OptionType = 'call' | 'put'`, `PositionType = 'long' | 'short'` (in `types.ts`)
- `payoffAtExpiry(type, position, S_T, K)` — payoff before premium
- `intrinsicValue(type, S, K)`, `timeValue(type, price, S, K)`
- `noArbBounds(params)` — e.g. call: `max(0, S - K·e^{-rT}) ≤ C ≤ S`; put: `max(0, K·e^{-rT} - S) ≤ P ≤ K·e^{-rT}`
- `putCallParity(params)` — returns `{lhs: C - P, rhs: S - K·e^{-rT}, residual}`
- `sampleTerminalPrices(params, n, seed)` — GBM terminal prices: `S_T = S·exp((r - σ²/2)T + σ√T·Z)`
- `monteCarloPrice(params, {paths, seed})` — `{estimate, stdErr, terminalPrices}` (discounted mean payoff)
- Keep all existing exports unchanged (Results derivations depend on them).

## New components

- `state/ParamsContext.tsx` — context + hook `useParams()`
- `utils/random.ts` — `mulberry32(seed)`, `boxMuller(rng)`
- `components/learn/Layout.tsx` — sticky top nav (Dashboard + 8 Learn links, active highlight), footer, mobile-collapsing nav
- `components/learn/LearnPage.tsx` — numbered section title, sidebar `Controls`, prev/next page footer, consistent max-width prose column
- `components/learn/Prose.tsx` — `Callout` variants ("Key idea", "Watch out", "Watch the chart") + `GlossaryTerm` helpers
- `components/Equation.tsx` — add `inline?: boolean` prop (`displayMode: false`) for math inside sentences
- 8 visualizations (all take params from context):
  - `components/learn/PayoffDiagram.tsx` — call/put × long/short toggle; payoff line, premium line, breakeven `ReferenceDot` (K ± premium), profit/loss shading (`Area`), current-S and K markers
  - `components/learn/ExpiryDistributionChart.tsx` — histogram of `S_T` (n=5,000, fixed seed) with forward price and K lines, N(d2) region shaded; P&L histogram with breakeven shade; readout panel: P(ITM)=N(d2), probability of profit, expected P&L
  - `components/learn/PriceDecompositionChart.tsx` — stacked `Area` of intrinsic + time value vs S for call & put, plus no-arbitrage bound line for the call
  - `components/learn/ComparisonCharts.tsx` — mode selector: strike ladder (K ∈ {0.8,…,1.2}·S) | maturity fan (T ∈ {0.04,…,2}) | volatility fan (σ ∈ {0.05,…,0.6}); overlaid call-price curves
  - `components/learn/TimeDecayChart.tsx` — price vs remaining T across a T-ladder (0.04→2), current-T `ReferenceLine`, live theta readout, note that curve slope = theta
  - `components/learn/GreeksGrid.tsx` — 7 small multiples (call delta, put delta, gamma, vega, theta, call rho, put rho) vs a shared variable selector (S, K, T, σ, r, ranges matching `Controls.tsx`), `ReferenceDot` at the current parameter value, one-line "why it looks like this" under each tile; `variant="compact"` used on the Dashboard
  - `components/learn/PutCallParityChart.tsx` — C − P vs S − K·e^{−rT} as two lines across S (and r), residual readout (always ≈ 0); recompute as sliders move
  - `components/learn/MonteCarloChart.tsx` — left: MC estimates at paths = 100/400/1k/2.5k/5k/10k/50k with ±1·SE error bars (fixed seed) vs analytic price reference line; right: terminal-price histogram; readout: estimate ± SE, analytic, |error|

## Content requirements (written for a first-time university grad)

For every visualization on every page:
- 1–2 sentences of "what you're looking at" **before** the plot, a short "why it matters / what it tells you" paragraph **after**, key formulas as inline/display KaTeX, and a "try this" nudge (e.g., "drag σ and watch the tail fatten").

Page-specific must-haves:
- **Intro**: option definitions; the five inputs reusing the `Controls` descriptions; moneyness defined with a numeric example at the current S/K; no-arbitrage intuition (why an option can't cost 0 or more than the stock).
- **Payoff**: all-8-positions payoff table; breakeven = K ± premium; "price = today's fair value of tomorrow's payoff" setup for the distribution page.
- **Distribution**: lognormal forward distribution; forward price `F = S·e^{rT}` marked; N(d2) explained as risk-neutral P(S_T > K) and shown to match the shaded histogram fraction; P(profit) = P(S_T > breakeven); expected discounted payoff = price.
- **Price structure**: C = intrinsic + time value, time value → 0 at expiry; no-arbitrage lower bound drawn; each comparison mode gets a "what this tells you" (strike sensitivity ↔ moneyness, maturity ↔ time value, volatility ↔ vega fan).
- **Time decay**: theta as slope; ATM short-dated decay spikes (gamma × vega interaction); put/call differences near expiry.
- **Greeks**: quick-reference table (greek, unit, sign, where it peaks, what traders hedge with it); notes: delta = N(d1), N(d2) = P(ITM), vega always positive for plain European options, theta is usually negative for long options but a deep-ITM put's theta can be positive, rho small for OTM options, delta-hedging = short Δ shares.
- **Monte Carlo**: GBM terminal formula; law of large numbers + SE = payoff-SD/√n; MC estimate brackets analytic within SE; "why we need MC" (exotics, path dependence,American-style options — see limitations).
- **Limitations**: numbered assumption list, each with "what breaks it" (jumps & crashes, vol smile/skew, American early exercise, dividends & frictions, stochastic rates); glossary of ≥15 terms (moneyness, forward, risk-neutral measure, implied vol, smile/skew, delta-neutral, hedging, arbitrage, no-arbitrage bound, GBM, lognormal, breakeven, time value, theta, European/American).
- Update the "Pro Tip" banner (`App.tsx:81-85`) to point first-time readers to `/learn`.

## File map

New:
- `pages/Dashboard.tsx`, `pages/learn/{Intro,Payoff,Distribution,PriceStructure,TimeDecay,Greeks,MonteCarlo,Limitations}.tsx`
- `state/ParamsContext.tsx`, `utils/random.ts`
- `components/learn/Layout.tsx`, `LearnPage.tsx`, `Prose.tsx`, and the 8 chart components above
- `public/404.html` (GH Pages SPA fallback)

Edited:
- `App.tsx` → router shell (BrowserRouter + Layout + ParamsProvider + Routes); dashboard body moves to `pages/Dashboard.tsx`, its `SensitivityChart` replaced by `GreeksGrid variant="compact"`
- `services/blackScholes.ts` (additions above), `types.ts` (new types)
- `index.html` — title/meta ("Interactive Black-Scholes Guide")
- `README.md` — page list + what each Learn route teaches
- `components/SensitivityChart.tsx` — deleted after dashboard swap

Do not touch: `vite.config.ts` base, the importmap in `index.html` (AI Studio artifact), `index.tsx` entry, `.github/workflows/deploy.yml`.

## Implementation order

1. Scaffold: add `react-router-dom`; convert `App.tsx` to router shell + `Layout` + `public/404.html` + placeholder routes.
2. Lift params into `ParamsContext`; extract dashboard to `pages/Dashboard.tsx`; swap dashboard chart for `GreeksGrid` (compact).
3. Services + `utils/random.ts` + `Equation` inline prop.
4. `LearnPage`/`Prose`/`Callout` scaffold with sidebar `Controls` and prev/next nav.
5. Pages + components in pedagogical order: Intro → Payoff → Distribution → PriceStructure → TimeDecay → Greeks (+ parity) → MonteCarlo → Limitations (+ glossary).
6. Polish: nav labels, banner copy, README, mobile responsiveness.

## Validation

- `npx tsc --noEmit` and `npm run build` pass.
- `npm run dev`, walk all 9 routes; drag every slider on a Learn page and confirm all charts update live with no raw LaTeX visible.
- Correctness spot-checks:
  - Payoff: breakeven marker lands exactly at K ± premium; call lower-bound line touches price at intrinsic.
  - Parity: residual readout < 1e-9 while dragging every slider through its full range.
  - Distribution: P(ITM) readout matches the shaded histogram fraction; N(d2) value equals `standardNormalCdf(d2)`.
  - Time decay: theta readout ≈ numerical slope of the current-T curve.
  - Monte Carlo: at 50k paths, |estimate − analytic| ≤ ~3·SE; estimate converges (error bars shrink toward analytic line).
- `npm run preview`: verify `dist/404.html` exists and its script rewrites deep links (exact GH Pages behavior only fully testable after deploy — note in final message); test `/learn/greeks` direct load locally.
- Responsive check at ~375px width (nav collapses, charts stack, sidebar controls usable).

## Risks / notes

- GH Pages deep links 404 without `public/404.html`; Vite copies `public/*` to `dist/` automatically — verify in `dist` after build.
- Slider drag on Learn pages recomputes everything via `useMemo`; keep MC histogram at n=5,000 fixed seed and the convergence curve at a fixed path-count set (not path-count-dependent on input) so each recompute stays < ~10 ms.
- All new pages must use standard Tailwind CDN utility classes only (no config in repo; no `@apply`/custom names).
- KaTeX CSS is imported once in `Equation.tsx` — reuse that component everywhere, never call `katex` directly elsewhere.
- React 19 + recharts 3 already work together in this repo for `LineChart`/axes; `ComposedChart`, `Area`, `ReferenceLine`, `ReferenceDot`, `BarChart` are same-library and low-risk.
