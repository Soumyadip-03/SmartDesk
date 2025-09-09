# SmartDesk Backend

## Setup Instructions

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Database Setup**
   - Install PostgreSQL
   - Create a database named `smartdesk`
   - Update `.env` file with your database credentials

3. **Environment Variables**
   Update `.env` file:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/smartdesk"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   ```

4. **Database Migration**
   ```bash
   npm run db:generate
   npm run db:push
   ```

5. **Seed Database (Optional)**
   ```bash
   node prisma/seed.js
   ```

6. **Start Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Buildings
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building by ID
- `GET /api/buildings/:id/rooms` - Get rooms in building

### Bookings (Protected)
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `DELETE /api/bookings/:id` - Cancel booking

### Wishlist (Protected)
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:buildingId` - Remove from wishlist