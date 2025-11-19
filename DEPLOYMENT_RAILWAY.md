# Deploying to Railway

This document describes how to deploy the repository to Railway using GitHub Actions.

What the workflow does
- On push to `main`, the workflow installs dependencies, builds the frontend (if a `build` script exists), installs the Railway CLI, logs in using a repo secret, and runs `railway up` to deploy.

Required repository secret
- `RAILWAY_TOKEN` — a Project Token from your Railway project (preferred for non-interactive CI deploys). Create it in Railway under your Project Settings -> Tokens (or Project Tokens) and add it in GitHub: `Settings` -> `Secrets and variables` -> `Actions` -> `New repository secret`.

Note: An account-level API key (sometimes called `RAILWAY_API_KEY`) may not allow non-interactive `railway up` deploys in CI; prefer creating and using a project-scoped token named `RAILWAY_TOKEN`.

How to connect the repo to Railway
1. Sign in to Railway (https://railway.app).
2. Create a new project and choose the option to connect an existing GitHub repo (or create a project and deploy from CLI).
3. If you choose to connect the repo through the Railway web UI, Railway can deploy on pushes automatically. If you prefer deployment via Actions (this repo's workflow), create a Project Token and add it to GitHub as `RAILWAY_TOKEN`.

Notes and troubleshooting
- If the first run of the workflow fails, check the Actions logs in GitHub — the Railway CLI may require an initial interactive connection or a project id. You can run `railway init` locally to create or link a project and commit the generated `.railway` files if you want the workflow to deploy to that specific project.
- If you prefer not to use the Railway CLI, you can connect the GitHub repository directly in the Railway dashboard (recommended for simplest setup).
- The workflow assumes Node 18 and that `npm ci` works. If your project uses `yarn` or `pnpm`, edit the workflow accordingly.

Using a Dockerfile (recommended for native builds)
- If your project depends on native modules (for example `better-sqlite3`) or requires a specific Node version (the error logs showed a module requiring Node 20 and Python for node-gyp), adding a Dockerfile ensures the build environment contains the right Node version and build tools.
- I added a `Dockerfile` that uses Node 20 and installs Python + build-essential so `npm ci` and `npm run build` can succeed during Railway's build. Railway will use your Dockerfile to build the image if present.

Notes about vulnerabilities
- The base Debian Node images may show reported vulnerabilities in some scanners; that's expected for many base images. If you need to harden the image, consider using a minimal base (e.g., `node:20-slim`) and applying targeted security updates, or use a multi-stage Dockerfile that strips build-time packages out of the final image.

Advanced: deploy a Docker image instead
- If you prefer deploying a container image, create a workflow that builds/pushes a Docker image to a registry (GitHub Container Registry or Docker Hub) and configure Railway to pull that image.

If you want, I can:
- Update this repo to commit `.railway` helper files by running `railway init` locally and committing the files (you'd still need to supply the API key), or
- Adjust the workflow to build/push a Docker image to GHCR and provide instructions to configure Railway to pull from it.
