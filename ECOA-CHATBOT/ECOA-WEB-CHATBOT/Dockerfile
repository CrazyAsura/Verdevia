# Phase 1: Build
FROM node:20-slim AS builder

WORKDIR /app

ENV NPM_CONFIG_LOGLEVEL=warn

# Copy dependency files
COPY package*.json ./

# Disable strict SSL, configure registry mirror, and increase network resilience
ARG YARN_REGISTRY=https://registry.npmmirror.com
RUN yarn config set strict-ssl false && \
    yarn config set registry $YARN_REGISTRY && \
    yarn config set network-timeout 300000 && \
    yarn config set network-concurrency 4 && \
    yarn config set httpTimeout 300000

# Install dependencies with retries and offline fallback
RUN yarn install --frozen-lockfile || \
    (echo "[Retry] First attempt failed, retrying with relaxed settings..." && \
     yarn config set registry https://registry.yarnpkg.com && \
     yarn install --frozen-lockfile --network-timeout 300000)

# Copy source code
COPY . .

# Public Next.js variables are embedded during the production build.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_GRAPHQL_URL=/graphql
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL

# Build the application
# Note: Next.js needs environment variables during build if they are prefixed with NEXT_PUBLIC
RUN yarn build
# Prune dev dependencies (production-only, using offline cache built during install above)
RUN yarn install --production --ignore-scripts --prefer-offline --frozen-lockfile


# Phase 2: Runtime
FROM node:20-slim

WORKDIR /app

ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Keep the same values available at runtime for server-side rendering.
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_GRAPHQL_URL=/graphql
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GRAPHQL_URL=$NEXT_PUBLIC_GRAPHQL_URL

# Copy built assets and production dependencies
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/.next ./.next
COPY --chown=node:node --from=builder /app/public ./public
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Ensure permission of base directory is accessible by node user if needed
# (No slow chown -R /app is required since files were copied as node)

USER node

EXPOSE 3000

# Start the application
CMD ["yarn", "start"]
