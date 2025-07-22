# 🏗️ Stage 1 — Builder
FROM node:18-slim AS builder

WORKDIR /app

# Chromium dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy & install packages
COPY package*.json ./
RUN npm install --production

# Copy code
COPY . .

# 🧠 Install Chromium to app directory directly
RUN npx playwright install

# 🏁 Stage 2 — Final runtime image
FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/app/node_modules/playwright-core/.local-browsers

# Chromium deps only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy all from builder
COPY --from=builder /app /app

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
CMD ["npm", "start"]
