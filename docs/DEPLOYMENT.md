# SmartDesk Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- PostgreSQL database setup

### Steps

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Environment Variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials
   - Set JWT_SECRET

3. **Database Setup:**
   ```bash
   # Run migrations
   docker-compose exec backend npm run db:push
   
   # Seed database
   docker-compose exec backend npm run db:seed
   ```

## Manual Deployment

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
# Serve dist/ folder with nginx
```

### Database
```bash
cd database
createdb smartdesk
psql smartdesk < schema.sql
```