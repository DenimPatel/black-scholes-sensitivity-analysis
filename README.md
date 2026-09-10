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

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
