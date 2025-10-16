-- CreateTable
CREATE TABLE "establishments" (
    "E_ID" TEXT NOT NULL,
    "E_Name" TEXT NOT NULL,
    "E_Email" TEXT,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("E_ID")
);

-- CreateTable
CREATE TABLE "buildings" (
    "B_NO" SERIAL NOT NULL,
    "B_Name" TEXT NOT NULL,
    "E_ID" TEXT NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("B_NO")
);

-- CreateTable
CREATE TABLE "rooms" (
    "B_NO" INTEGER NOT NULL,
    "R_NO" TEXT NOT NULL,
    "Capacity" INTEGER,
    "R_Type" TEXT,
    "R_Status" TEXT,
    "R_Tag" TEXT,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("B_NO","R_NO")
);

-- CreateTable
CREATE TABLE "users" (
    "F_ID" TEXT NOT NULL,
    "F_Name" TEXT NOT NULL,
    "E_ID" TEXT,
    "F_Username" TEXT NOT NULL,
    "F_Email" TEXT NOT NULL,
    "F_Password" TEXT NOT NULL,
    "F_Department" TEXT,
    "F_Role" TEXT,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Phone_Number" TEXT,
    "Profile_Picture" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("F_ID")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "F_ID" TEXT NOT NULL,
    "Theme" TEXT,
    "Notifications" BOOLEAN DEFAULT true,
    "Language" TEXT,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("F_ID")
);

-- CreateTable
CREATE TABLE "bookings" (
    "Booking_ID" SERIAL NOT NULL,
    "F_ID" TEXT NOT NULL,
    "B_NO" INTEGER NOT NULL,
    "R_NO" TEXT NOT NULL,
    "Date" DATE NOT NULL,
    "Start_Time" TIMESTAMPTZ NOT NULL,
    "End_Time" TIMESTAMPTZ NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'pending',
    "Subject" TEXT,
    "Number_Of_Students" INTEGER,
    "Notes" TEXT,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Updated_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("Booking_ID")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "F_ID" TEXT NOT NULL,
    "B_NO" INTEGER NOT NULL,
    "R_NO" TEXT NOT NULL,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("F_ID","B_NO","R_NO")
);

-- CreateTable
CREATE TABLE "notifications" (
    "Notification_ID" SERIAL NOT NULL,
    "F_ID" TEXT NOT NULL,
    "Type" TEXT,
    "Title" TEXT,
    "Message" TEXT,
    "Is_Read" BOOLEAN NOT NULL DEFAULT false,
    "Urgent" BOOLEAN NOT NULL DEFAULT false,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("Notification_ID")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "Audit_ID" SERIAL NOT NULL,
    "F_ID" TEXT NOT NULL,
    "F_Email" TEXT,
    "Action" TEXT NOT NULL,
    "IP_Address" TEXT,
    "User_Agent" TEXT,
    "Session_ID" TEXT,
    "Success" BOOLEAN,
    "Failure_Reason" TEXT,
    "Details" TEXT,
    "Created_At" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Expire_At" TIMESTAMPTZ,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("Audit_ID")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_E_Email_key" ON "establishments"("E_Email");

-- CreateIndex
CREATE INDEX "rooms_B_NO_R_Status_idx" ON "rooms"("B_NO", "R_Status");

-- CreateIndex
CREATE UNIQUE INDEX "users_F_Username_key" ON "users"("F_Username");

-- CreateIndex
CREATE UNIQUE INDEX "users_F_Email_key" ON "users"("F_Email");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_B_NO_R_NO_Date_Start_Time_End_Time_key" ON "bookings"("B_NO", "R_NO", "Date", "Start_Time", "End_Time");

-- CreateIndex
CREATE INDEX "bookings_B_NO_R_NO_Date_Status_idx" ON "bookings"("B_NO", "R_NO", "Date", "Status");

-- CreateIndex
CREATE INDEX "bookings_Date_Start_Time_End_Time_Status_idx" ON "bookings"("Date", "Start_Time", "End_Time", "Status");

-- CreateIndex
CREATE INDEX "bookings_Status_Start_Time_End_Time_idx" ON "bookings"("Status", "Start_Time", "End_Time");

-- CreateIndex
CREATE INDEX "notifications_F_ID_Created_At_idx" ON "notifications"("F_ID", "Created_At");

-- CreateIndex
CREATE INDEX "notifications_F_ID_Is_Read_idx" ON "notifications"("F_ID", "Is_Read");

-- CreateIndex
CREATE UNIQUE INDEX "audit_logs_F_ID_Session_ID_Created_At_key" ON "audit_logs"("F_ID", "Session_ID", "Created_At");

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_E_ID_fkey" FOREIGN KEY ("E_ID") REFERENCES "establishments"("E_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_B_NO_fkey" FOREIGN KEY ("B_NO") REFERENCES "buildings"("B_NO") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_E_ID_fkey" FOREIGN KEY ("E_ID") REFERENCES "establishments"("E_ID") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_F_ID_fkey" FOREIGN KEY ("F_ID") REFERENCES "users"("F_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_F_ID_fkey" FOREIGN KEY ("F_ID") REFERENCES "users"("F_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_B_NO_R_NO_fkey" FOREIGN KEY ("B_NO", "R_NO") REFERENCES "rooms"("B_NO", "R_NO") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_F_ID_fkey" FOREIGN KEY ("F_ID") REFERENCES "users"("F_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_B_NO_R_NO_fkey" FOREIGN KEY ("B_NO", "R_NO") REFERENCES "rooms"("B_NO", "R_NO") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_F_ID_fkey" FOREIGN KEY ("F_ID") REFERENCES "users"("F_ID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_F_ID_fkey" FOREIGN KEY ("F_ID") REFERENCES "users"("F_ID") ON DELETE CASCADE ON UPDATE CASCADE;