# Dockerfile for NutriSnap (Next.js)
# Multi-stage build

# ---- Builder ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ---- Runtime ----
FROM node:20-alpine
WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Expose port (Cloud Run uses $PORT env)
ENV PORT=8080
EXPOSE 8080

# Start the Next.js server
CMD ["npm", "run", "start"]
