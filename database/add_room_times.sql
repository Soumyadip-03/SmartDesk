-- Add start_time and end_time columns to rooms table
ALTER TABLE rooms 
ADD COLUMN "Start_Time" TIMESTAMPTZ,
ADD COLUMN "End_Time" TIMESTAMPTZ;