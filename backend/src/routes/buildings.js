import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all buildings
router.get('/', async (req, res) => {
  try {
    const buildings = await prisma.building.findMany({
      orderBy: { bNo: 'asc' }
    });
    
    res.json(buildings);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    res.status(500).json({ error: 'Failed to fetch buildings' });
  }
});

// Get specific building with rooms
router.get('/:buildingNumber', async (req, res) => {
  try {
    const { buildingNumber } = req.params;
    
    const building = await prisma.building.findUnique({
      where: { bNo: parseInt(buildingNumber) },
      include: {
        rooms: {
          orderBy: { rNo: 'asc' }
        }
      }
    });
    
    if (!building) {
      return res.status(404).json({ error: 'Building not found' });
    }
    
    res.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    res.status(500).json({ error: 'Failed to fetch building' });
  }
});

// Get rooms for a specific building
router.get('/:buildingNumber/rooms', async (req, res) => {
  try {
    const { buildingNumber } = req.params;
    
    const rooms = await prisma.room.findMany({
      where: { bNo: parseInt(buildingNumber) },
      orderBy: { rNo: 'asc' }
    });
    
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching building rooms:', error);
    res.status(500).json({ error: 'Failed to fetch building rooms' });
  }
});

export default router;