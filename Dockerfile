# Single-image build for the ProductOps × GTM tracker.
# Builds the React client + Express server, then runs the server which also
# serves the built client. Works on any container host (Render, Azure, Fly,
# Cloud Run, etc.).
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

# Install dependencies (dev deps are needed to build).
COPY package*.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

# Build client + server.
COPY . .
RUN npm run build

# The overlay store lives here; mount a persistent volume at /app/data in prod
# so edits survive redeploys (otherwise they reset each deploy).
RUN mkdir -p /app/data
ENV OVERLAY_FILE=/app/data/overlay.json

# Hosts inject PORT; the server reads process.env.PORT and falls back to 8787.
EXPOSE 8787
CMD ["node", "server/dist/index.js"]
