# ==============
# 🏗️ Stage 1 — Builder
# ==============
FROM node:18-slim AS builder

WORKDIR /app

# Use this ARG to control Playwright install (default: true)
ARG INSTALL_PLAYWRIGHT=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Install Chromium deps (runtime only)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy and install packages
COPY package*.json ./
RUN npm install --production

# Install Playwright + Chromium only if needed
COPY . .
RUN if [ "$INSTALL_PLAYWRIGHT" = "true" ]; then \
      npx playwright install chromium && \
      mkdir -p /ms-playwright && \
      cp -r /ms-playwright /playwright-browsers; \
    else \
      mkdir -p /playwright-browsers; \
    fi


# ==============
# 🏁 Stage 2 — Final
# ==============
FROM node:18-slim

WORKDIR /app

# Set browser path
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
ENV NODE_ENV=production

# Create app user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Install only Chromium deps (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libxcomposite1 libxdamage1 libxrandr2 libatk-bridge2.0-0 \
    libgtk-3-0 libx11-xcb1 libnss3 libasound2 libxshmfence1 \
    libxkbcommon0 libpangocairo-1.0-0 libpango-1.0-0 libatk1.0-0 \
    libdrm2 libcups2 libxfixes3 libgbm1 libxext6 libxrender1 \
    libdbus-1-3 fonts-liberation ca-certificates wget xdg-utils \
 && rm -rf /var/lib/apt/lists/*

# Copy build files
COPY --from=builder /app /app
COPY --from=builder /playwright-browsers /ms-playwright

# Permissions
RUN chown -R appuser:appgroup /app /ms-playwright
USER appuser

EXPOSE 8080
CMD ["npm", "start"]
