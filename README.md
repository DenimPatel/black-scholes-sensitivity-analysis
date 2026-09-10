<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

[![Deploy to GitHub Pages](https://github.com/DenimPatel/black-scholes-sensitivity-analysis/actions/workflows/deploy.yml/badge.svg)](https://github.com/DenimPatel/black-scholes-sensitivity-analysis/actions/workflows/deploy.yml)

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZIjuPg_K4Wn4zhQ6Ev7z9d2KAEPtQt_M

## Deployment

This site is published to
[GitHub Pages](https://denimpatel.github.io/black-scholes-sensitivity-analysis/)
via the
[`deploy.yml`](.github/workflows/deploy.yml) workflow. On every push to
`main` it builds the Vite app and deploys with the official
`actions/deploy-pages` action. The Pages *Build and deployment* source is set
to **GitHub Actions**.

## The site

A single dashboard plus an 8-step guided tour, all driven by five shared
sliders (stock price S, strike K, time to maturity T, volatility σ, risk-free
rate r). Every chart reacts live to the same parameter state.

| Route | Page | What it teaches |
|---|---|---|
| `/` | Dashboard | The calculator: prices, Greeks, and a per-Greek sensitivity grid |
| `/learn` | 1 · Intro | What an option is, call vs put, European vs American, moneyness, the five inputs |
| `/learn/payoff` | 2 · Payoff | The payoff at expiry for all four positions, breakeven, max loss/profit |
| `/learn/distribution` | 3 · The risk-neutral world | The lognormal terminal distribution, N(d₂) = P(ITM), probability of profit |
| `/learn/price-structure` | 4 · Anatomy of the price | Intrinsic + time value, no-arbitrage bounds, strike/maturity/volatility comparison fans |
| `/learn/time-decay` | 5 · Time decay | Price vs remaining time, theta as the slope of the curve |
| `/learn/greeks` | 6 · The Greeks | All seven Greeks as small multiples, quick-reference table, put-call parity |
| `/learn/monte-carlo` | 7 · Monte Carlo | GBM simulation converging to the closed form, ±1 SE error bars |
| `/learn/limitations` | 8 · Assumptions | What Black-Scholes assumes, what breaks each assumption, and a full glossary |

Deep links work on GitHub Pages via the SPA fallback in [`public/404.html`](public/404.html).

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
