# ========================
# 🏗️ Stage 1: Builder
# ========================
FROM node:18-slim AS builder

WORKDIR /app

# Arguments and environment
ARG INSTALL_PLAYWRIGHT=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Only needed libraries for Chromium (runtime only)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy and install deps
COPY package*.json ./
RUN npm install --production

# Copy app files
COPY . .

# Install Chromium (Playwright) if required
RUN if [ "$INSTALL_PLAYWRIGHT" = "true" ]; then \
    npx playwright install chromium && \
    mkdir -p /ms-playwright && \
    cp -r /root/.cache/ms-playwright/chromium* /ms-playwright/; \
  fi

# ========================
# 🏁 Stage 2: Final Image
# ========================
FROM node:18-slim

WORKDIR /app

ENV NODE_ENV=production
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Add user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Install Chromium runtime deps only (no dev tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy app and browser
COPY --from=builder /app /app
COPY --from=builder /ms-playwright /ms-playwright

RUN chown -R appuser:appgroup /app /ms-playwright
USER appuser

EXPOSE 8080
CMD ["npm", "start"]
