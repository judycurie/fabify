# Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies with clean slate
COPY package*.json ./
RUN npm ci

# Copy project files and compile Vite SPA
COPY . .
RUN npm run build

# Production Runner Stage
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Copy only production artifacts and lightweight server
COPY --from=builder /app/dist ./dist
COPY server.js ./
COPY package.json ./

EXPOSE 8080

CMD ["node", "server.js"]
