-- Migration script to update room numbers to integers for ascending order

-- First, add a temporary column for the new room number
ALTER TABLE rooms ADD COLUMN new_room_number INTEGER;

-- Update existing rooms with integer room numbers
-- This assumes existing room numbers might be strings like 'R101', 'Room-102', etc.
UPDATE rooms SET new_room_number = 
  CASE 
    WHEN room_number ~ '^[0-9]+$' THEN room_number::INTEGER
    WHEN room_number ~ '^[Rr]([0-9]+)$' THEN substring(room_number from '[0-9]+')::INTEGER
    WHEN room_number ~ '^Room.?([0-9]+)$' THEN substring(room_number from '[0-9]+')::INTEGER
    ELSE ROW_NUMBER() OVER (PARTITION BY building_number ORDER BY room_number) + 100
  END;

-- Drop the old room_number column and rename the new one
ALTER TABLE rooms DROP COLUMN room_number;
ALTER TABLE rooms RENAME COLUMN new_room_number TO room_number;

-- Recreate the primary key constraint
ALTER TABLE rooms ADD PRIMARY KEY (room_number, building_number);

-- Create an index for efficient ordering by room number
CREATE INDEX idx_rooms_room_number_asc ON rooms (building_number, room_number ASC);

-- Verify the migration
SELECT building_number, room_number, name 
FROM rooms 
ORDER BY building_number, room_number ASC;