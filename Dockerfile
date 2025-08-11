FROM node:20-slim AS builder  
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm prune --production

FROM node:20-slim
WORKDIR /app
COPY --from=builder /app ./
CMD ["npm", "start"]
