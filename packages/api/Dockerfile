FROM oven/bun:1 AS build

WORKDIR /app

# Cache packages
COPY package.json package.json
COPY bun.lock bun.lock
COPY turbo.json turbo.json
COPY tsconfig.base.json tsconfig.base.json

COPY /packages/api/package.json ./packages/api/package.json
COPY /packages/api ./packages/api
COPY /packages/templates ./packages/templates

RUN cd ./packages/templates && bun install
RUN bun run build:packages:templates

RUN bun install

ENV NODE_ENV=production

RUN bun run build:packages:api

FROM oven/bun:canary as runner

WORKDIR /app

# Install Caddy from the official static binary
COPY --from=caddy:2 /usr/bin/caddy /usr/bin/caddy

COPY --from=build /app/packages/api/dist ./packages/api/dist
COPY --from=build /app/packages/templates/dist ./packages/templates/dist
COPY --from=build /app/packages/api/package.json ./packages/api/package.json
COPY --from=build /app/package.json ./package.json
# COPY --from=build /app/packages/api/src/Core/DB/migrations ./packages/api/dist/src/Core/DB/migrations
COPY --from=build /app/packages/api/app-db-migrations.sh ./packages/api/app-db-migrations.sh
RUN chmod +x /app/packages/api/app-db-migrations.sh

RUN bun install

COPY Caddyfile /etc/caddy/Caddyfile

ENV NODE_ENV=production
