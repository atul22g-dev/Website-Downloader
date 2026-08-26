# ---- Stage 1: Build Next.js frontend ----
FROM node:20-alpine AS frontend

ENV NEXT_TELEMETRY_DISABLED=1

WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# ---- Stage 2: Install backend dependencies ----
FROM node:20-alpine AS deps

RUN apk add --no-cache wget

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- Stage 3: Production image ----
FROM node:20-alpine

RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy backend dependencies (smallest layer first for cache)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./

# Copy application source
COPY server.js ./
COPY socket/ ./socket/
COPY wget/ ./wget/
COPY archiver/ ./archiver/
COPY cleanup/ ./cleanup/

# Copy built Next.js frontend
COPY --from=frontend /app/client/.next ./client/.next
COPY --from=frontend /app/client/package.json ./client/

# Copy public assets (ensure dir exists even if empty)
RUN mkdir -p public/sites
COPY public/ ./public/
COPY --from=frontend /app/client/public ./public/

# Create directories for runtime data
RUN mkdir -p downloads public/sites

# Set ownership for non-root user
RUN chown -R appuser:appgroup /app

# Production environment — tuned for Render free tier (512MB RAM)
ENV NODE_ENV=production
ENV PORT=3000
ENV NODE_OPTIONS="--max-old-space-size=384"
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:3000/ || exit 1

USER appuser

CMD ["node", "server.js"]
