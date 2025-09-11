# Use Node.js 18
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Copy backend source code (including prisma schema)
COPY backend/ ./

# Install dependencies (including dev for Prisma)
RUN npm install

# Generate Prisma client to correct location
RUN npx prisma generate --schema=./prisma/schema.prisma

# Verify Prisma client exists in correct location
RUN ls -la node_modules/.prisma/client/ || echo "Client not found in expected location"

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]