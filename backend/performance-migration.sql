-- Performance optimization indexes for SmartDesk
-- Run this after updating schema.prisma

-- Booking performance indexes
CREATE INDEX IF NOT EXISTS "bookings_room_date_status_idx" ON "bookings" ("B_NO", "R_NO", "Date", "Status");
CREATE INDEX IF NOT EXISTS "bookings_time_status_idx" ON "bookings" ("Date", "Start_Time", "End_Time", "Status");
CREATE INDEX IF NOT EXISTS "bookings_active_idx" ON "bookings" ("Status", "Start_Time", "End_Time");

-- Room status index
CREATE INDEX IF NOT EXISTS "rooms_building_status_idx" ON "rooms" ("B_NO", "R_Status");

-- Notification performance indexes (already exist but ensure they're optimal)
CREATE INDEX IF NOT EXISTS "notifications_user_created_idx" ON "notifications" ("F_ID", "Created_At");
CREATE INDEX IF NOT EXISTS "notifications_user_read_idx" ON "notifications" ("F_ID", "Is_Read");

-- Analyze tables for query planner optimization
ANALYZE "bookings";
ANALYZE "rooms";
ANALYZE "notifications";