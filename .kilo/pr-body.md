This PR adds a deploy status badge and a short **Deployment** section that documents how the site is published to GitHub Pages.

Context: the repo was migrated from `peaceiris/actions-gh-pages` (which pushed into a `gh-pages` branch) to the official GitHub Pages pipeline (`actions/configure-pages` + `actions/upload-pages-artifact` + `actions/deploy-pages`). The Pages *Build and deployment* source is now set to **GitHub Actions**. Merging this re-triggers the workflow on `main`, which produces a fresh deploy.
