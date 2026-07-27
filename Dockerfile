FROM node:22-slim AS builder  
WORKDIR /app

# Install pnpm
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

COPY . . 
RUN npx prisma generate
RUN pnpm run build

RUN pnpm prune --prod

FROM node:22-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

RUN corepack enable
COPY --from=builder /app ./
CMD ["pnpm", "start"]
