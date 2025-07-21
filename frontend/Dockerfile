
# ===== Stage 1: Build =====
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build the Next.js app
RUN npm run build


# ===== Stage 2: Run =====
FROM node:18-alpine AS runner

# Create app user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Only copy necessary files for production
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules node_modules

# Use non-root user
USER appuser

ENV NODE_ENV=production
EXPOSE 3000

# Start Next.js in production mode
CMD ["npm", "start"]
