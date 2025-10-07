# SmartDesk - Complete Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Security Implementation](#security-implementation)
9. [Real-Time Features](#real-time-features)
10. [Development Workflow](#development-workflow)

---

## 🎯 Project Overview

**SmartDesk** is a modern, real-time room booking system designed for educational institutions and corporate environments. It provides an intuitive interface for users to book rooms, manage schedules, and receive notifications.

### Key Highlights
- **Real-time updates** - Room status changes instantly across all connected clients
- **Smart scheduling** - Automatic status updates based on booking times
- **Wishlist system** - Save favorite rooms for quick access
- **Admin dashboard** - Comprehensive management interface
- **Responsive design** - Works seamlessly on desktop, tablet, and mobile
- **Secure authentication** - JWT-based auth with CSRF protection

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **State Management:** React Hooks (useState, useEffect, useContext)
- **Icons:** Lucide React
- **HTTP Client:** Fetch API
- **Real-time:** Socket.io Client

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Database ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Real-time:** Socket.io
- **Security:** Helmet, CORS, CSRF protection
- **Process Manager:** PM2 (production)

### Database
- **Primary:** PostgreSQL 14+
- **Schema Management:** Prisma Migrate
- **Connection Pooling:** Prisma built-in

### DevOps
- **Version Control:** Git
- **Containerization:** Docker (optional)
- **Reverse Proxy:** Nginx
- **SSL:** Let's Encrypt
- **Monitoring:** PM2, Custom logging

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐
│   Frontend      │
│   (React)       │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│   Nginx         │
│   (Reverse      │
│    Proxy)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend       │◄────►│  PostgreSQL  │
│   (Express)     │      │  Database    │
└────────┬────────┘      └──────────────┘
         │
         ▼
┌─────────────────┐
│   Socket.io     │
│   (WebSocket)   │
└─────────────────┘
```

### Request Flow
1. User interacts with React frontend
2. Frontend sends HTTP/WebSocket requests
3. Nginx routes requests to backend
4. Backend validates authentication & CSRF
5. Backend processes request with Prisma
6. Database returns data
7. Backend sends response
8. Socket.io broadcasts real-time updates
9. Frontend updates UI

---

## ✨ Features

### User Features
- **Authentication**
  - Register with email/password
  - Login with JWT tokens
  - Profile management
  - Password change
  - Account deletion

- **Room Booking**
  - View all buildings and rooms
  - Real-time room availability
  - Book rooms instantly or schedule for later
  - Swap rooms during active booking
  - Cancel/delete bookings
  - View booking history

- **Wishlist**
  - Add favorite rooms to wishlist
  - Quick access to preferred rooms
  - Remove from wishlist
  - Book directly from wishlist

- **Notifications**
  - Real-time notifications
  - Booking reminders (start/end)
  - Room status changes
  - Mark as read/unread
  - Clear all notifications

- **Settings**
  - Theme toggle (dark/light)
  - Notification preferences
  - Sound settings
  - Language selection

### Admin Features
- **Dashboard**
  - System overview
  - Active bookings
  - User statistics
  - Room utilization

- **Room Management**
  - Update room types
  - Change room status
  - Set capacity
  - Maintenance mode

- **User Management**
  - View all users
  - Manage permissions
  - View user activity

- **Analytics**
  - Booking trends
  - Popular rooms
  - Usage statistics
  - Failed login attempts

### Real-Time Features
- **Live Room Status** - Updates every 5 seconds
- **Instant Notifications** - Via WebSocket
- **Booking Updates** - Real-time across all clients
- **Status Indicators** - Live connection status

---

## 📁 Project Structure

```
SmartDesk/
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── AccountInterface.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── BookingsInterface.tsx
│   │   │   ├── BuildingCard.tsx
│   │   │   ├── BuildingDetail.tsx
│   │   │   ├── ChatBotToggle.tsx
│   │   │   ├── CompactRoomBookingModal.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── NotificationPanel.tsx
│   │   │   ├── RealTimeUpdates.tsx
│   │   │   ├── SettingsInterface.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── WishlistInterface.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── ThemeContext.tsx
│   │   ├── services/            # API services
│   │   │   ├── api.ts
│   │   │   └── socket.ts
│   │   ├── utils/               # Utilities
│   │   │   ├── assets.ts
│   │   │   └── safeLogger.ts
│   │   ├── App.tsx              # Main app component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Static assets
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── routes/              # API routes
│   │   │   ├── auth.js
│   │   │   ├── bookings.js
│   │   │   ├── buildings.js
│   │   │   ├── notifications.js
│   │   │   ├── profile.js
│   │   │   ├── rooms.js
│   │   │   └── wishlist.js
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js
│   │   │   └── csrf.js
│   │   ├── socket/              # Socket.io handlers
│   │   │   └── socketHandler.js
│   │   ├── utils/               # Utilities
│   │   │   └── bookingScheduler.js
│   │   └── server.js            # Server entry point
│   ├── prisma/
│   │   └── schema.prisma        # Database schema
│   ├── package.json
│   └── .env                     # Environment variables
│
├── database/
│   ├── schema.sql               # SQL schema
│   ├── seed.cjs                 # Database seeding
│   └── README.md
│
├── config/
│   ├── docker-compose.yml       # Docker configuration
│   └── nginx.conf               # Nginx configuration
│
├── docs/
│   └── (archived documentation)
│
├── .env.production              # Production env template
├── PROJECT_DOCUMENTATION.md     # This file
└── DEPLOYMENT_GUIDE.md          # Deployment instructions
```

---

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
users (
  F_ID VARCHAR PRIMARY KEY,
  F_Name VARCHAR,
  E_ID VARCHAR,
  F_Username VARCHAR UNIQUE,
  F_Email VARCHAR UNIQUE,
  F_Password VARCHAR,
  F_Department VARCHAR,
  F_Role VARCHAR,
  Created_At TIMESTAMPTZ,
  Updated_At TIMESTAMPTZ,
  Phone_Number VARCHAR,
  Profile_Picture VARCHAR
)
```

#### Buildings
```sql
buildings (
  B_NO SERIAL PRIMARY KEY,
  B_Name VARCHAR,
  E_ID VARCHAR REFERENCES establishments(E_ID)
)
```

#### Rooms
```sql
rooms (
  B_NO INT,
  R_NO VARCHAR,
  Capacity INT,
  R_Type VARCHAR,
  R_Status VARCHAR,
  R_Tag VARCHAR,
  PRIMARY KEY (B_NO, R_NO),
  FOREIGN KEY (B_NO) REFERENCES buildings(B_NO)
)
```

#### Bookings
```sql
bookings (
  Booking_ID SERIAL PRIMARY KEY,
  F_ID VARCHAR REFERENCES users(F_ID),
  B_NO INT,
  R_NO VARCHAR,
  Date DATE,
  Start_Time TIMESTAMPTZ,
  End_Time TIMESTAMPTZ,
  Status VARCHAR DEFAULT 'pending',
  Subject VARCHAR,
  Number_Of_Students INT,
  Notes TEXT,
  Created_At TIMESTAMPTZ,
  Updated_At TIMESTAMPTZ,
  FOREIGN KEY (B_NO, R_NO) REFERENCES rooms(B_NO, R_NO)
)
```

#### Wishlist
```sql
wishlist (
  F_ID VARCHAR,
  B_NO INT,
  R_NO VARCHAR,
  Created_At TIMESTAMPTZ,
  PRIMARY KEY (F_ID, B_NO, R_NO),
  FOREIGN KEY (F_ID) REFERENCES users(F_ID),
  FOREIGN KEY (B_NO, R_NO) REFERENCES rooms(B_NO, R_NO)
)
```

#### Notifications
```sql
notifications (
  Notification_ID SERIAL PRIMARY KEY,
  F_ID VARCHAR REFERENCES users(F_ID),
  Type VARCHAR,
  Title VARCHAR,
  Message TEXT,
  Is_Read BOOLEAN DEFAULT false,
  Urgent BOOLEAN DEFAULT false,
  Created_At TIMESTAMPTZ
)
```

---

## 🔌 API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "facultyId": "FAC001",
  "establishmentId": "EST001"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "FAC001",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/login
Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "FAC001",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### Booking Endpoints

#### GET /api/bookings
Get all bookings for authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
[
  {
    "bookingId": 1,
    "rNo": "101",
    "bNo": 1,
    "date": "2025-01-15",
    "startTime": "09:00:00",
    "endTime": "10:00:00",
    "status": "confirmed",
    "subject": "Mathematics Lecture"
  }
]
```

#### POST /api/bookings
Create a new booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
X-CSRF-Token: <csrf_token>
```

**Request:**
```json
{
  "roomNumber": "101",
  "buildingNumber": "1",
  "date": "2025-01-15",
  "startTime": "09:00",
  "endTime": "10:00",
  "courseSubject": "Mathematics",
  "numberOfStudents": "30",
  "notes": "Need projector"
}
```

#### POST /api/bookings/swap
Swap to a different room during active booking.

**Request:**
```json
{
  "roomNumber": "102",
  "buildingNumber": "1",
  "currentRoom": "101",
  "courseSubject": "Mathematics",
  "numberOfStudents": "30"
}
```

#### DELETE /api/bookings/:id
Delete a booking.

**Headers:**
```
Authorization: Bearer <jwt_token>
X-CSRF-Token: <csrf_token>
```

### Room Endpoints

#### GET /api/buildings
Get all buildings.

**Response:**
```json
[
  {
    "bNo": 1,
    "bName": "Building - 01",
    "rooms": []
  }
]
```

#### GET /api/buildings/:buildingNumber/rooms
Get all rooms in a building.

**Response:**
```json
[
  {
    "rNo": "101",
    "bNo": 1,
    "rType": "Lecture Room",
    "rStatus": "Available",
    "capacity": 60
  }
]
```

#### PUT /api/rooms/:roomNumber/:buildingNumber/status
Update room status (Admin only).

**Request:**
```json
{
  "roomStatus": "Maintenance"
}
```

### Wishlist Endpoints

#### GET /api/wishlist
Get user's wishlist.

**Response:**
```json
[
  {
    "rNo": "101",
    "bNo": 1,
    "room": {
      "rType": "Lecture Room",
      "rStatus": "Available",
      "capacity": 60
    }
  }
]
```

#### POST /api/wishlist
Add room to wishlist.

**Request:**
```json
{
  "roomNumber": "101",
  "buildingNumber": "1"
}
```

#### DELETE /api/wishlist/:roomNumber/:buildingNumber
Remove room from wishlist.

### Notification Endpoints

#### GET /api/notifications
Get all notifications for user.

**Response:**
```json
[
  {
    "notificationId": 1,
    "type": "booking",
    "title": "Booking Reminder",
    "message": "Your booking starts in 15 minutes",
    "isRead": false,
    "urgent": true,
    "createdAt": "2025-01-15T08:45:00Z"
  }
]
```

#### PUT /api/notifications/:id/read
Mark notification as read.

#### DELETE /api/notifications/clear-all
Clear all notifications.

---

## 🔒 Security Implementation

### Authentication
- **JWT Tokens** - Secure, stateless authentication
- **Password Hashing** - bcrypt with salt rounds
- **Token Expiration** - Configurable expiry time
- **Refresh Tokens** - (Optional) For extended sessions

### CSRF Protection
- **Token Generation** - Unique token per session
- **Token Validation** - Required for all state-changing operations
- **Header-based** - Sent via X-CSRF-Token header

### Input Sanitization
- **XSS Prevention** - HTML entity encoding
- **SQL Injection** - Prisma parameterized queries
- **Validation** - Email, password, and input format checks

### Authorization
- **Role-based Access** - Admin, moderator, user roles
- **Route Protection** - Middleware-based auth checks
- **Resource Ownership** - Users can only modify their own data

### Security Headers
- **Helmet.js** - Sets secure HTTP headers
- **CORS** - Configured for specific origins
- **Rate Limiting** - Prevents brute force attacks

---

## ⚡ Real-Time Features

### WebSocket Implementation
- **Socket.io** - Bidirectional communication
- **Room-based Broadcasting** - Updates only relevant clients
- **Authentication** - JWT-based socket authentication
- **Reconnection** - Automatic reconnection on disconnect

### Real-Time Events

#### Room Status Changes
```javascript
// Server emits
socket.emit('roomStatusChanged', {
  buildingNumber: '1',
  roomNumber: '101',
  status: 'Booked'
});

// Client listens
socket.on('roomStatusChanged', (data) => {
  updateRoomStatus(data);
});
```

#### Booking Updates
```javascript
// Server emits
socket.emit('bookingUpdated', {
  booking: { /* booking data */ }
});

// Client listens
socket.on('bookingUpdated', (data) => {
  updateBookingList(data.booking);
});
```

#### Notifications
```javascript
// Server emits
socket.emit('newNotification', {
  notification: { /* notification data */ }
});

// Client listens
socket.on('newNotification', (data) => {
  showNotification(data.notification);
});
```

### Scheduler
- **Interval:** 5 seconds
- **Functions:**
  - Update booking status (confirmed → ongoing → finished)
  - Update room status based on active bookings
  - Send booking reminders
  - Emit real-time updates

---

## 💻 Development Workflow

### Local Development Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd SmartDesk
```

2. **Install Dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Setup Database**
```bash
# Create database
createdb smartdesk

# Run migrations
cd backend
npx prisma migrate dev

# Seed database
npm run seed
```

4. **Configure Environment**
```bash
# Backend .env
DATABASE_URL="postgresql://user:password@localhost:5432/smartdesk"
JWT_SECRET="your-secret-key"
ADMIN_PASSWORD="admin123"
```

5. **Start Development Servers**
```bash
# Backend (Terminal 1)
cd backend
npm run dev

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Development Commands

#### Backend
```bash
npm run dev          # Start development server
npm run seed         # Seed database
npm run migrate      # Run migrations
npm test             # Run tests
```

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

### Code Style
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Type safety in frontend
- **JSDoc** - Documentation comments

### Git Workflow
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and commit: `git commit -m "Add new feature"`
3. Push to remote: `git push origin feature/new-feature`
4. Create pull request
5. Code review and merge

---

## 📊 Performance Optimizations

### Frontend
- **Code Splitting** - Lazy loading components
- **Memoization** - React.memo for expensive components
- **Debouncing** - Input handlers and API calls
- **Caching** - Room data cached for quick access
- **Optimistic Updates** - UI updates before server response

### Backend
- **Connection Pooling** - Prisma connection pool
- **Query Optimization** - Indexed columns, efficient queries
- **Caching** - Redis for frequently accessed data (optional)
- **Compression** - Gzip compression for responses
- **Clustering** - PM2 cluster mode for multiple instances

### Database
- **Indexes** - On frequently queried columns
- **Query Planning** - EXPLAIN ANALYZE for slow queries
- **Vacuum** - Regular maintenance
- **Partitioning** - For large tables (future)

---

## 🧪 Testing

### Unit Tests
- **Backend** - Jest for API routes
- **Frontend** - Vitest for components
- **Coverage** - Aim for 80%+ coverage

### Integration Tests
- **API Tests** - Supertest for endpoint testing
- **Database Tests** - Test database operations
- **Socket Tests** - Test WebSocket events

### E2E Tests
- **Playwright/Cypress** - Full user flow testing
- **Critical Paths** - Login, booking, notifications

---

## 📈 Monitoring & Logging

### Application Logs
- **Winston** - Structured logging
- **Log Levels** - Error, warn, info, debug
- **Log Rotation** - Daily rotation, 14-day retention

### Performance Monitoring
- **PM2 Monitoring** - CPU, memory, requests
- **Database Monitoring** - Query performance
- **Error Tracking** - Sentry (optional)

### Health Checks
- **Endpoint** - `/api/health`
- **Database** - Connection check
- **External Services** - SMTP, etc.

---

## 🎓 Learning Resources

### Technologies Used
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

### Best Practices
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [React Best Practices](https://react.dev/learn)
- [Security Best Practices](https://owasp.org)

---

**Version:** 1.0.0  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready
