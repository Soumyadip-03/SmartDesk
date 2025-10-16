import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendBookingConfirmation(userEmail, bookingDetails) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'SmartDesk - Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Booking Confirmed!</h2>
          <p>Your room booking has been confirmed with the following details:</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Room:</strong> ${bookingDetails.roomNumber}</p>
            <p><strong>Building:</strong> ${bookingDetails.buildingNumber}</p>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
            <p><strong>Purpose:</strong> ${bookingDetails.purpose}</p>
            <p><strong>Students:</strong> ${bookingDetails.numberOfStudents}</p>
          </div>
          
          <p>Thank you for using SmartDesk!</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Booking confirmation email sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send booking confirmation email:', error);
    }
  }

  async sendBookingCancellation(userEmail, bookingDetails) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'SmartDesk - Booking Cancelled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ef4444;">Booking Cancelled</h2>
          <p>Your room booking has been cancelled:</p>
          
          <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <p><strong>Room:</strong> ${bookingDetails.roomNumber}</p>
            <p><strong>Building:</strong> ${bookingDetails.buildingNumber}</p>
            <p><strong>Date:</strong> ${new Date(bookingDetails.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
          </div>
          
          <p>If you need to book another room, please visit SmartDesk.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Booking cancellation email sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send booking cancellation email:', error);
    }
  }

  async sendBookingReminder(userEmail, bookingDetails) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: userEmail,
      subject: 'SmartDesk - Booking Reminder',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Booking Reminder</h2>
          <p>This is a reminder that your booking starts in 15 minutes:</p>
          
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p><strong>Room:</strong> ${bookingDetails.roomNumber}</p>
            <p><strong>Building:</strong> ${bookingDetails.buildingNumber}</p>
            <p><strong>Time:</strong> ${bookingDetails.startTime} - ${bookingDetails.endTime}</p>
            <p><strong>Purpose:</strong> ${bookingDetails.purpose}</p>
          </div>
          
          <p>Please make your way to the room.</p>
          <p style="color: #6b7280; font-size: 12px;">This is an automated message. Please do not reply.</p>
        </div>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Booking reminder email sent to:', userEmail);
    } catch (error) {
      console.error('Failed to send booking reminder email:', error);
    }
  }
}

export default new EmailService();