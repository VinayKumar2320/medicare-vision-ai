# Deploying to Railway

This document describes how to deploy the repository to Railway using GitHub Actions.

What the workflow does
- On push to `main`, the workflow installs dependencies, builds the frontend (if a `build` script exists), installs the Railway CLI, logs in using a repo secret, and runs `railway up` to deploy.

Required repository secret
- `RAILWAY_API_KEY` — an API key from your Railway account. You can create one in Railway under Account Settings -> API Keys. Add it in GitHub: `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

How to connect the repo to Railway
1. Sign in to Railway (https://railway.app).
2. Create a new project and choose the option to connect an existing GitHub repo (or create a project and deploy from CLI).
3. If you choose to connect the repo through the Railway web UI, Railway can deploy on pushes automatically. If you prefer deployment via Actions (this repo's workflow), create an API key and add the `RAILWAY_API_KEY` secret to GitHub.

Notes and troubleshooting
- If the first run of the workflow fails, check the Actions logs in GitHub — the Railway CLI may require an initial interactive connection or a project id. You can run `railway init` locally to create or link a project and commit the generated `.railway` files if you want the workflow to deploy to that specific project.
- If you prefer not to use the Railway CLI, you can connect the GitHub repository directly in the Railway dashboard (recommended for simplest setup).
- The workflow assumes Node 18 and that `npm ci` works. If your project uses `yarn` or `pnpm`, edit the workflow accordingly.

Advanced: deploy a Docker image instead
- If you prefer deploying a container image, create a workflow that builds/pushes a Docker image to a registry (GitHub Container Registry or Docker Hub) and configure Railway to pull that image.

If you want, I can:
- Update this repo to commit `.railway` helper files by running `railway init` locally and committing the files (you'd still need to supply the API key), or
- Adjust the workflow to build/push a Docker image to GHCR and provide instructions to configure Railway to pull from it.
