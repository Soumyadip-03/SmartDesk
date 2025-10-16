import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get room statistics by type
router.get('/room-types', async (req, res) => {
  try {
    const roomTypes = await prisma.room.groupBy({
      by: ['rType'],
      _count: { rType: true }
    });
    
    const formattedData = roomTypes.map(type => ({
      type: type.rType || 'Undefined',
      count: type._count.rType
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch room types:', error);
    res.status(500).json({ error: 'Failed to fetch room types' });
  }
});

// Get room statistics by status
router.get('/room-status', async (req, res) => {
  try {
    const roomStatus = await prisma.room.groupBy({
      by: ['rStatus'],
      _count: { rStatus: true }
    });
    
    const formattedData = roomStatus.map(status => ({
      status: status.rStatus || 'Unknown',
      count: status._count.rStatus
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch room status:', error);
    res.status(500).json({ error: 'Failed to fetch room status' });
  }
});

// Get room capacity distribution
router.get('/room-capacity', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      select: { capacity: true }
    });
    
    const capacityRanges = {
      'Small (1-25)': 0,
      'Medium (26-50)': 0,
      'Large (51+)': 0
    };
    
    rooms.forEach(room => {
      const capacity = room.capacity || 0;
      if (capacity <= 25) capacityRanges['Small (1-25)']++;
      else if (capacity <= 50) capacityRanges['Medium (26-50)']++;
      else capacityRanges['Large (51+)']++;
    });
    
    const formattedData = Object.entries(capacityRanges).map(([range, count]) => ({
      range,
      count
    }));
    
    res.json(formattedData);
  } catch (error) {
    console.error('Failed to fetch room capacity:', error);
    res.status(500).json({ error: 'Failed to fetch room capacity' });
  }
});

// Get active sessions (current bookings) - real-time, no cache
router.get('/active-sessions', async (req, res) => {
  try {
    const now = new Date();
    const activeSessions = await prisma.booking.count({
      where: {
        status: 'confirmed',
        startTime: { lte: now },
        endTime: { gte: now }
      }
    });
    
    res.json({ count: activeSessions });
  } catch (error) {
    console.error('Failed to fetch active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Get maintenance status (rooms under maintenance)
router.get('/maintenance', async (req, res) => {
  try {
    const maintenanceRooms = await prisma.room.count({
      where: {
        rStatus: 'Maintenance'
      }
    });
    
    res.json({ count: maintenanceRooms });
  } catch (error) {
    console.error('Failed to fetch maintenance data:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance data' });
  }
});

export default router;