import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { fId: req.user.facultyId },
      select: {
        notificationId: true,
        type: true,
        title: true,
        message: true,
        isRead: true,
        urgent: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await prisma.notification.count({
      where: { 
        fId: req.user.facultyId,
        isRead: false
      }
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { 
        notificationId: parseInt(req.params.id),
        fId: req.user.facultyId 
      },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { 
        fId: req.user.facultyId,
        isRead: false
      },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Clear all notifications
router.delete('/clear-all', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.deleteMany({
      where: { fId: req.user.facultyId }
    });
    res.json({ message: 'All notifications cleared' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await prisma.notification.delete({
      where: { 
        notificationId: parseInt(req.params.id),
        fId: req.user.facultyId 
      }
    });
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Helper function to create notifications for all users
const createNotificationForAllUsers = async (type, title, message, urgent = false) => {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: { fId: true }
    });
    
    // Create notifications for all users
    const notifications = users.map(user => ({
      fId: user.fId,
      type,
      title,
      message,
      urgent,
      isRead: false
    }));
    
    await prisma.notification.createMany({
      data: notifications
    });
    
    console.log(`Created ${notifications.length} notifications for room booking`);
  } catch (error) {
    console.error('Failed to create notifications:', error);
  }
};

export { createNotificationForAllUsers };

export default router;