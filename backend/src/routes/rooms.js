import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all rooms with dynamic availability status
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: [{ bNo: 'asc' }, { rNo: 'asc' }],
      include: { building: true }
    });
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get all active bookings
    const activeBookings = await prisma.booking.findMany({
      where: {
        date: today,
        status: 'confirmed',
        startTime: { lte: now },
        endTime: { gte: now }
      },
      select: { bNo: true, rNo: true }
    });
    
    // Create lookup map
    const bookedRooms = new Set(activeBookings.map(b => `${b.bNo}-${b.rNo}`));
    
    const roomsWithStatus = rooms.map(room => {
      let dynamicStatus = room.rStatus === 'Maintenance' ? 'Maintenance' : 
                         bookedRooms.has(`${room.bNo}-${room.rNo}`) ? 'Booked' : 'Available';
      
      return { ...room, dynamicStatus };
    });
    
    res.json(roomsWithStatus);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Update room type (Admin only)
router.put('/:roomNumber/:buildingNumber/type', authenticateToken, async (req, res) => {
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
router.put('/:roomNumber/:buildingNumber/status', authenticateToken, async (req, res) => {
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
router.put('/:roomNumber/:buildingNumber/capacity', authenticateToken, async (req, res) => {
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