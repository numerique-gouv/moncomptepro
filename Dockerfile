FROM node:lts-slim AS base
RUN corepack enable npm
WORKDIR /app

FROM base AS prod-deps
RUN corepack enable
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=cache,target=/root/.npm \
  npm ci --omit=dev

# Need curl for healthcheck
RUN apt-get update && \
    apt-get install -y curl

FROM base AS build
RUN corepack enable
ENV CYPRESS_INSTALL_BINARY=0
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=cache,target=/root/.npm \
  npm ci
COPY tsconfig.json vite.config.mjs ./
COPY assets/ ./assets/
COPY public/ ./public/
COPY src/ ./src/
COPY package*.json ./
RUN npx run-s build:*

#
#
#

FROM base

# Install wget for healthcheck
RUN apt-get update && apt-get install --no-install-recommends -y wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src /app/src
COPY --from=build /app/src /app/src

# Healthcheck
HEALTHCHECK --interval=5s CMD wget --no-verbose --tries=1 http://localhost:3000/help -q -O /dev/null || exit 1

CMD [ "npm", "start" ]
