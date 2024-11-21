FROM node:22-slim AS base
RUN corepack enable npm
WORKDIR /app

FROM base AS prod-deps
RUN corepack enable
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=bind,source=packages/email/package.json,target=packages/email/package.json \
  --mount=type=bind,source=packages/core/package.json,target=packages/core/package.json \
  --mount=type=cache,target=/root/.npm \
  npm ci --omit=dev

FROM base AS build
RUN corepack enable
ENV CYPRESS_INSTALL_BINARY=0
RUN --mount=type=bind,source=package.json,target=package.json \
  --mount=type=bind,source=package-lock.json,target=package-lock.json \
  --mount=type=bind,source=packages/email/package.json,target=packages/email/package.json \
  --mount=type=bind,source=packages/core/package.json,target=packages/core/package.json \
  --mount=type=cache,target=/root/.npm \
  npm ci
COPY tsconfig.json vite.config.mjs ./
COPY assets/ ./assets/
COPY public/ ./public/
COPY src/ ./src/
COPY packages/ ./packages/
COPY package*.json ./
RUN npx run-s build:*

FROM base
COPY package.json ./
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY --from=build /app/src /app/src
COPY --from=build /app/packages /app/packages

CMD [ "npm", "start" ]
