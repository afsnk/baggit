FROM node:20-alpine AS builder

WORKDIR /app

COPY ../../pnpm-lock.yaml ../../package*.json ./
COPY ../../pnpm-workspace.yaml ./

RUN npm install -g pnpm

COPY ../../packages/server ./packages/server

RUN pnpm install

RUN pnpm run build:packages:server

# Production build :runner

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/package.json ./package.json

# Copy over service folder and files
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/server/src/db/migrations ./packages/server/dist/src/db/migrations
COPY --from=builder /app/packages/server/package.json ./packages/server/package.json
COPY --from=builder /app/packages/server/app-db-migrations.sh ./packages/server/app-db-migrations.sh
RUN chmod +x /app/packages/server/app-db-migrations.sh


# Make an entry point script that has access to the env to run db migrations
ENV NODE_ENV="staging"

RUN npm install -g pnpm
RUN pnpm install

EXPOSE 9990

RUN ls -al /app/packages/server/dist/
RUN apk add --no-cache bash

# Initialize HSM on startup
ENTRYPOINT ["/app/packages/server/app-db-migrations.sh"]

CMD ["pnpm", "start:packages:server"]
