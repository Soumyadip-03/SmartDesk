import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all rooms with dynamic availability status
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: [
        { bNo: 'asc' },
        { rNo: 'asc' }
      ],
      include: {
        building: true
      }
    });
    
    // Get current time
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check for active bookings for each room
    const roomsWithStatus = await Promise.all(rooms.map(async (room) => {
      // Skip if room is in maintenance
      if (room.rStatus === 'Maintenance') {
        return { ...room, dynamicStatus: 'Maintenance' };
      }
      
      // Check for active bookings
      const activeBooking = await prisma.booking.findFirst({
        where: {
          rNo: room.rNo,
          bNo: room.bNo,
          date: today,
          status: 'confirmed',
          startTime: { lte: now },
          endTime: { gte: now }
        }
      });
      
      return {
        ...room,
        dynamicStatus: activeBooking ? 'Booked' : 'Available'
      };
    }));
    
    res.json(roomsWithStatus);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Update room type (Admin only)
router.put('/:roomNumber/:buildingNumber/type', async (req, res) => {
  try {
    const { roomNumber, buildingNumber } = req.params;
    const { roomType } = req.body;
    
    if (!roomNumber || !buildingNumber) {
      return res.status(400).json({ error: 'Room number and building number are required' });
    }
    
    const updatedRoom = await prisma.room.update({
      where: { 
        bNo_rNo: {
          rNo: roomNumber,
          bNo: parseInt(buildingNumber)
        }
      },
      data: { rType: roomType },
      include: {
        building: true
      }
    });
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room type:', error);
    res.status(500).json({ error: 'Failed to update room type' });
  }
});

// Update room status (Admin only)
router.put('/:roomNumber/:buildingNumber/status', async (req, res) => {
  try {
    const { roomNumber, buildingNumber } = req.params;
    const { roomStatus } = req.body;
    
    if (!roomNumber || !buildingNumber) {
      return res.status(400).json({ error: 'Room number and building number are required' });
    }
    
    const updatedRoom = await prisma.room.update({
      where: { 
        bNo_rNo: {
          rNo: roomNumber,
          bNo: parseInt(buildingNumber)
        }
      },
      data: { rStatus: roomStatus },
      include: {
        building: true
      }
    });
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({ error: 'Failed to update room status' });
  }
});

// Update room capacity (Admin only)
router.put('/:roomNumber/:buildingNumber/capacity', async (req, res) => {
  try {
    const { roomNumber, buildingNumber } = req.params;
    const { capacity } = req.body;
    
    if (!roomNumber || !buildingNumber) {
      return res.status(400).json({ error: 'Room number and building number are required' });
    }
    
    const updatedRoom = await prisma.room.update({
      where: { 
        bNo_rNo: {
          rNo: roomNumber,
          bNo: parseInt(buildingNumber)
        }
      },
      data: { capacity: parseInt(capacity) },
      include: {
        building: true
      }
    });
    
    res.json(updatedRoom);
  } catch (error) {
    console.error('Error updating room capacity:', error);
    res.status(500).json({ error: 'Failed to update room capacity' });
  }
});

export default router;