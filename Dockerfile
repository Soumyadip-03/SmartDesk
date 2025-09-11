# Use Node.js 18
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies first
RUN npm ci --only=production

# Install Prisma CLI
RUN npm install prisma --save-dev

# Copy backend source code (including prisma schema)
COPY backend/ ./

# Generate Prisma client
RUN npx prisma generate

# Verify Prisma client exists
RUN ls -la node_modules/.prisma/client/

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]