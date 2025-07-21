
# A Smaller version of NODE (base image)
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies separately
COPY package*.json ./

# Avoid running as root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Install dependencies
RUN npm install --production

# Copy application source code
COPY . .

# Change ownership to the non-root user
RUN chown -R appuser:appgroup /app

# Use non-root user for security
USER appuser

# Expose the port you use
EXPOSE 8080

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
