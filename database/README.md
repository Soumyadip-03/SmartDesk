# SmartDesk Database

This directory contains all database-related files for the SmartDesk application.

## Files

- `schema.prisma` - Prisma database schema
- `schema.sql` - PostgreSQL schema (alternative)
- `seed.js` - Database seeding script
- `.env` - Database environment variables

## Setup

1. Install PostgreSQL
2. Create database: `createdb smartdesk`
3. Update `.env` with your database credentials
4. Run migrations: `npx prisma db push`
5. Seed database: `node seed.js`

## Database Schema

- **users** - User authentication and profiles
- **bookings** - Room bookings per user
- **wishlist** - User wishlist items
- **notifications** - User notifications
- **user_settings** - User preferences