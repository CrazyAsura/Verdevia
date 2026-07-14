# Phase 1: Build
FROM node:20-slim AS builder

WORKDIR /app

ENV NPM_CONFIG_LOGLEVEL=warn

# Copy dependency files
COPY package*.json ./

# Disable strict SSL and configure registry mirror to prevent firewall blocks
ARG YARN_REGISTRY=https://registry.npmmirror.com
RUN yarn config set strict-ssl false && \
    yarn config set registry $YARN_REGISTRY

# Install dependencies
RUN yarn install

# Force readable-stream v4 (required for Node.js v20 compatibility)
RUN yarn add readable-stream@^4.0.0 --ignore-scripts

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Prune to production-only dependencies
RUN yarn config set strict-ssl false && \
    yarn config set registry $YARN_REGISTRY && \
    yarn install --production --ignore-scripts --prefer-offline


# Phase 2: Runtime
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Copy production dependencies and built code
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy and configure the entrypoint (runs as root before USER drop)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh

# Create directories for SQLite, uploads, and public exports if needed
RUN mkdir -p /app/database /app/logs /app/uploads /app/public/exports /app/src && chown -R node:node /app/database /app/logs /app/uploads /app/public/exports /app/src

USER node

EXPOSE 3337

# Entrypoint handles DB check + seed, then hands off to CMD
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["yarn", "start:prod"]
