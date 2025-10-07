# SmartDesk - Room Booking System

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL
- Git

### Backend Setup
```bash
cd backend
npm install
npm run build
npm run seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
1. Create PostgreSQL database named `smartdesk`
2. Update `.env` with your database credentials
3. Run migrations: `npm run migrate`
4. Seed data: `npm run seed`

## Environment Configuration

Copy `.env.example` to `.env` in backend folder and configure:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `PORT` - Server port (default: 3001)

## Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001/api
- Health Check: http://localhost:3001/health

## Features
- Room booking system
- Real-time updates with Socket.io
- Admin dashboard
- User authentication
- Email notifications
- AI chatbot integration