-- Drop existing database if exists
DROP DATABASE IF EXISTS smartdesk;

-- Create new database
CREATE DATABASE smartdesk;

-- Connect to the database
\c smartdesk;

-- =========================
-- Establishments
-- =========================
CREATE TABLE Establishments (
    E_ID VARCHAR(100) PRIMARY KEY,
    E_Name VARCHAR(100) NOT NULL,
    E_Email VARCHAR(100) UNIQUE
);

-- =========================
-- Buildings
-- =========================
CREATE TABLE Buildings (
    B_NO SERIAL PRIMARY KEY,
    B_Name VARCHAR(100) NOT NULL,
    E_ID VARCHAR(100) NOT NULL REFERENCES Establishments(E_ID) ON DELETE CASCADE
);

-- =========================
-- Rooms
-- =========================
CREATE TABLE Rooms (
    B_NO INT NOT NULL REFERENCES Buildings(B_NO) ON DELETE CASCADE,
    R_NO INT NOT NULL,
    Capacity INT,
    R_Type VARCHAR(50),
    R_Status VARCHAR(20),
    R_Tag VARCHAR(50),
    PRIMARY KEY (B_NO, R_NO)
);

-- =========================
-- Users
-- =========================
CREATE TABLE Users (
    F_ID SERIAL PRIMARY KEY,
    F_Name VARCHAR(100) NOT NULL,
    E_ID VARCHAR(100) REFERENCES Establishments(E_ID) ON DELETE SET NULL,
    F_Username VARCHAR(50) UNIQUE NOT NULL,
    F_Email VARCHAR(100) UNIQUE NOT NULL,
    F_Password VARCHAR(200) NOT NULL,
    F_Department VARCHAR(100),
    F_Role VARCHAR(50),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Phone_Number VARCHAR(20),
    Profile_Picture TEXT
);

-- =========================
-- User Settings
-- =========================
CREATE TABLE User_Settings (
    F_ID INT PRIMARY KEY REFERENCES Users(F_ID) ON DELETE CASCADE,
    Theme VARCHAR(50),
    Notifications BOOLEAN DEFAULT TRUE,
    Language VARCHAR(50),
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Bookings
-- =========================
CREATE TABLE Bookings (
    Booking_ID SERIAL PRIMARY KEY,
    F_ID INT NOT NULL REFERENCES Users(F_ID) ON DELETE CASCADE,
    B_NO INT NOT NULL,
    R_NO INT NOT NULL,
    Date DATE NOT NULL,
    Start_Time TIMESTAMPTZ NOT NULL,
    End_Time TIMESTAMPTZ NOT NULL,
    Status VARCHAR(20) DEFAULT 'pending',
    Subject VARCHAR(200),
    Number_Of_Students INT,
    Notes TEXT NULL,
    Created_At TIMESTAMPTZ DEFAULT now(),
    Updated_At TIMESTAMPTZ DEFAULT now(),
    FOREIGN KEY (B_NO, R_NO) REFERENCES Rooms(B_NO, R_NO) ON DELETE CASCADE,
    CONSTRAINT unique_booking UNIQUE (B_NO, R_NO, Date, Start_Time, End_Time)
);

-- =========================
-- Wishlist
-- =========================
CREATE TABLE Wishlist (
    F_ID INT NOT NULL REFERENCES Users(F_ID) ON DELETE CASCADE,
    B_NO INT NOT NULL,
    R_NO INT NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (F_ID, B_NO, R_NO),
    FOREIGN KEY (B_NO, R_NO) REFERENCES Rooms(B_NO, R_NO) ON DELETE CASCADE
);

-- =========================
-- Notifications
-- =========================
CREATE TABLE Notifications (
    Notification_ID SERIAL PRIMARY KEY,
    F_ID INT NOT NULL REFERENCES Users(F_ID) ON DELETE CASCADE,
    Type VARCHAR(50),
    Title VARCHAR(200),
    Message TEXT,
    Is_Read BOOLEAN DEFAULT FALSE,
    Urgent BOOLEAN DEFAULT FALSE,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- Audit Logs
-- =========================
CREATE TABLE Audit_Logs (
    Audit_ID SERIAL PRIMARY KEY,
    F_ID INT NOT NULL REFERENCES Users(F_ID) ON DELETE CASCADE,
    F_Email VARCHAR(100), -- snapshot email (not FK)
    Action VARCHAR(200) NOT NULL,
    IP_Address VARCHAR(45),
    User_Agent TEXT,
    Session_ID VARCHAR(100),
    Success BOOLEAN,
    Failure_Reason TEXT,
    Details TEXT,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Expire_At TIMESTAMP,
    CONSTRAINT unique_log UNIQUE (F_ID, Session_ID, Created_At)
);