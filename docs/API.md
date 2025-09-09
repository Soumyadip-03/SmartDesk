# SmartDesk API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login user with email and password.

### POST /api/auth/register  
Register new user account.

### GET /api/auth/csrf-token
Get CSRF token for secure requests.

## Profile Endpoints

### GET /api/profile
Get current user profile.

### PUT /api/profile
Update user profile information.

## Booking Endpoints

### GET /api/bookings
Get user's bookings.

### POST /api/bookings
Create new room booking.

### DELETE /api/bookings/:id
Cancel/delete booking.

## Wishlist Endpoints

### GET /api/wishlist
Get user's wishlist items.

### POST /api/wishlist
Add room to wishlist.

### DELETE /api/wishlist/:id
Remove room from wishlist.

## Notification Endpoints

### GET /api/notifications
Get user notifications.

### PUT /api/notifications/:id/read
Mark notification as read.

### DELETE /api/notifications/:id
Delete notification.