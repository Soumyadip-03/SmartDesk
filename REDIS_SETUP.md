# Redis Setup for SmartDesk

## Windows Installation

### Option 1: Using WSL (Recommended)
```bash
# Install WSL if not already installed
wsl --install

# In WSL terminal:
sudo apt update
sudo apt install redis-server
sudo service redis-server start
```

### Option 2: Using Docker
```bash
# Install Docker Desktop
# Run Redis container:
docker run -d --name redis-smartdesk -p 6379:6379 redis:alpine
```

### Option 3: Windows Native (Memurai)
1. Download Memurai from https://www.memurai.com/
2. Install and start the service
3. Default port: 6379

## Verify Redis Connection
```bash
redis-cli ping
# Should return: PONG
```

## Backend Setup
```bash
cd backend
npm install
npm start
```

## Performance Benefits with Redis:
- **Persistent cache** across server restarts
- **Distributed caching** for multiple server instances  
- **Sub-100ms** cache operations
- **Automatic expiration** of stale data
- **Memory efficient** with built-in compression
- **Global deployment** - Works on any cloud platform
- **Zero configuration** - Just set REDIS_URL

## Production Deployment Options

### 1. Redis Cloud (Recommended - Free Tier Available)
- Visit: https://redis.com/redis-enterprise-cloud/
- Create free account (30MB free)
- Get connection URL: `rediss://default:password@host:port`

### 2. Upstash (Serverless Redis)
- Visit: https://upstash.com/
- 10,000 requests/day free
- Get connection URL from dashboard

### 3. Railway
- Add Redis plugin to your Railway project
- Automatic connection URL provided

### 4. Render
- Add Redis service to your Render account
- Copy connection details

### 5. Vercel KV (For Vercel deployments)
- Built-in Redis-compatible storage
- Automatic configuration

## Environment Setup
```bash
# Copy production template
cp .env.production .env

# Update REDIS_URL with your cloud Redis URL
# Example: REDIS_URL="rediss://default:abc123@redis-12345.cloud.redislabs.com:12345"
```

## Fallback
If Redis is unavailable, the system automatically falls back to in-memory cache without breaking functionality.