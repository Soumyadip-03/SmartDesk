-- Migration script to update existing database to use TIMESTAMPTZ
-- Run this script to update your existing database

-- Update Users table
ALTER TABLE Users 
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN Updated_At TYPE TIMESTAMPTZ USING Updated_At AT TIME ZONE 'Asia/Kolkata';

-- Update User_Settings table
ALTER TABLE User_Settings 
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN Updated_At TYPE TIMESTAMPTZ USING Updated_At AT TIME ZONE 'Asia/Kolkata';

-- Update Bookings table
ALTER TABLE Bookings 
ALTER COLUMN Start_Time TYPE TIMESTAMPTZ USING (Date + Start_Time) AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN End_Time TYPE TIMESTAMPTZ USING (Date + End_Time) AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN Updated_At TYPE TIMESTAMPTZ USING Updated_At AT TIME ZONE 'Asia/Kolkata';

-- Update Wishlist table
ALTER TABLE Wishlist 
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata';

-- Update Notifications table
ALTER TABLE Notifications 
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata';

-- Update Audit_Logs table
ALTER TABLE Audit_Logs 
ALTER COLUMN Created_At TYPE TIMESTAMPTZ USING Created_At AT TIME ZONE 'Asia/Kolkata',
ALTER COLUMN Expire_At TYPE TIMESTAMPTZ USING Expire_At AT TIME ZONE 'Asia/Kolkata';

-- Update default values to use now() function
ALTER TABLE Users ALTER COLUMN Created_At SET DEFAULT now();
ALTER TABLE Users ALTER COLUMN Updated_At SET DEFAULT now();
ALTER TABLE User_Settings ALTER COLUMN Created_At SET DEFAULT now();
ALTER TABLE User_Settings ALTER COLUMN Updated_At SET DEFAULT now();
ALTER TABLE Bookings ALTER COLUMN Created_At SET DEFAULT now();
ALTER TABLE Bookings ALTER COLUMN Updated_At SET DEFAULT now();
ALTER TABLE Wishlist ALTER COLUMN Created_At SET DEFAULT now();
ALTER TABLE Notifications ALTER COLUMN Created_At SET DEFAULT now();
ALTER TABLE Audit_Logs ALTER COLUMN Created_At SET DEFAULT now();