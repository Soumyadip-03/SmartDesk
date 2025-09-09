import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Create notification
export const createNotification = async (facultyId, type, title, message, bookingId = null, urgent = false) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        facultyId,
        type,
        title,
        message,
        bookingId,
        urgent
      }
    });

    // Send email if user has email notifications enabled
    const user = await prisma.user.findUnique({
      where: { facultyId },
      include: { settings: true }
    });

    if (user?.settings?.notifications && user.email) {
      await sendEmailNotification(user.email, title, message);
      await prisma.notification.update({
        where: { id: notification.id },
        data: { emailSent: true }
      });
    }

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Send email notification
const sendEmailNotification = async (email, title, message) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'SmartDesk <noreply@smartdesk.com>',
      to: email,
      subject: `SmartDesk: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>${message}</p>
          <hr>
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated message from SmartDesk Room Booking System.
          </p>
        </div>
      `
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
};

// Notification templates
export const NotificationTypes = {
  BOOKING_CONFIRMED: 'BOOKING_CONFIRMED',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED', 
  ROOM_SWAPPED: 'ROOM_SWAPPED',
  BOOKING_REMINDER: 'BOOKING_REMINDER',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT'
};

export const createBookingNotification = async (facultyId, type, booking, additionalInfo = '') => {
  const templates = {
    [NotificationTypes.BOOKING_CONFIRMED]: {
      title: 'Booking Confirmed',
      message: `Your booking for Room ${booking.roomNumber}, Building ${booking.buildingNumber} on ${new Date(booking.date).toLocaleDateString()} from ${booking.startTime} to ${booking.endTime} has been confirmed. ${additionalInfo}`
    },
    [NotificationTypes.BOOKING_CANCELLED]: {
      title: 'Booking Cancelled',
      message: `Your booking for Room ${booking.roomNumber}, Building ${booking.buildingNumber} on ${new Date(booking.date).toLocaleDateString()} has been cancelled. ${additionalInfo}`
    },
    [NotificationTypes.ROOM_SWAPPED]: {
      title: 'Room Booking Swapped',
      message: `Your room booking has been swapped. ${additionalInfo}`
    },
    [NotificationTypes.BOOKING_REMINDER]: {
      title: 'Booking Reminder',
      message: `Reminder: You have a booking for Room ${booking.roomNumber}, Building ${booking.buildingNumber} starting at ${booking.startTime} today.`
    }
  };

  const template = templates[type];
  if (template) {
    return await createNotification(
      facultyId,
      type,
      template.title,
      template.message,
      booking.id,
      type === NotificationTypes.BOOKING_CONFLICT
    );
  }
};