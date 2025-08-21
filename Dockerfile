FROM node:20-slim AS builder  
WORKDIR /app

# Install pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . . 
RUN pnpm run build

RUN pnpm prune --prod

FROM node:20-slim
WORKDIR /app
RUN corepack enable
COPY --from=builder /app ./
CMD ["pnpm", "start"]
