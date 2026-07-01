FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json ./
RUN npm install

COPY index.html vite.config.ts tsconfig.json ./
COPY scripts ./scripts
COPY public ./public
COPY src ./src

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

FROM node:20-bookworm-slim

WORKDIR /app

RUN npm install -g serve@14

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

# Railway injects PORT; exec keeps serve as PID 1 for correct signal handling.
CMD ["sh", "-c", "exec serve -s dist -l tcp://0.0.0.0:${PORT:-3000}"]
