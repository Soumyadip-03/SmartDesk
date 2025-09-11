# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Copy backend source code (including prisma schema)
COPY backend/ ./

# Install all dependencies (including dev for Prisma)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]