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
RUN yarn config set strict-ssl false && \
    yarn config set registry $YARN_REGISTRY && \
    yarn install --production --ignore-scripts --prefer-offline


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
