# SmartDesk - Room Booking System

A modern room booking system built with React, Node.js, and PostgreSQL.

## Project Structure

```
SmartDesk/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── package.json   # Frontend dependencies
│   └── index.html     # Entry point
├── backend/           # Node.js backend API
│   ├── src/          # API routes and middleware
│   ├── package.json  # Backend dependencies
│   └── server.js     # Server entry point
├── database/         # Database related files
│   ├── schema.prisma # Prisma schema
│   ├── schema.sql    # PostgreSQL schema
│   └── seed.js       # Database seeding
├── config/           # Configuration files
│   ├── docker-compose.yml
│   ├── tailwind.config.js
│   └── vite.config.ts
└── docs/             # Documentation
```

## Quick Start

1. **Database Setup:**
   ```bash
   cd database
   createdb smartdesk
   npx prisma db push --schema=schema.prisma
   ```

2. **Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Features

- User authentication & profiles
- Room booking system
- Wishlist functionality
- Real-time notifications
- Admin dashboard
- Responsive design

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, Prisma
- **Database:** PostgreSQL
- **Auth:** JWT tokens