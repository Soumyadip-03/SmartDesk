# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./

# Install all dependencies (including dev for Prisma)
RUN npm ci

# Copy backend source code
COPY backend/ ./

# Copy database schema
COPY database/schema.prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "start"]