# Use an official Node 20 image so native modules and packages that require
# newer Node versions build correctly.
FROM node:20-bullseye

# Install python and build tools for node-gyp / native modules
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests first to leverage Docker cache for installs
COPY package*.json ./

# Install deps (including dev deps needed for build) and rebuild native modules
RUN npm ci

# Copy the rest of the source
COPY . .

# Build frontend (if present)
RUN if npm run | grep -q "build"; then npm run build; fi

# The app listens on the port in process.env.PORT (Railway sets this). Expose a common port.
EXPOSE 3000

# Start the server. Adjust if your start script or entrypoint differs.
CMD ["node", "server.js"]
