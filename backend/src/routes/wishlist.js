import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';


const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { fId: req.user.facultyId },
      select: {
        fId: true,
        rNo: true,
        bNo: true,
        createdAt: true,
        room: {
          select: {
            rNo: true,
            bNo: true,
            rType: true,
            rStatus: true,
            capacity: true
          }
        }
      }
    });
    
    const validWishlist = wishlist.filter(item => item.room !== null);
    res.json(validWishlist);
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { roomNumber, buildingNumber } = req.body;
    
    // Check if already exists
    const exists = await prisma.wishlist.count({
      where: {
        fId: req.user.facultyId,
        rNo: roomNumber,
        bNo: parseInt(buildingNumber)
      }
    });
    
    if (exists > 0) {
      return res.status(409).json({ error: 'Already in wishlist' });
    }
    
    const wishlistItem = await prisma.wishlist.create({
      data: { 
        fId: req.user.facultyId, 
        rNo: roomNumber,
        bNo: parseInt(buildingNumber)
      }
    });
    res.json(wishlistItem);
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:roomNumber/:buildingNumber', authenticateToken, async (req, res) => {
  try {
    const { roomNumber, buildingNumber } = req.params;
    const result = await prisma.wishlist.deleteMany({
      where: {
        fId: req.user.facultyId,
        rNo: roomNumber,
        bNo: parseInt(buildingNumber)
      }
    });
    
    if (result.count === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }
    
    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Wishlist delete error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;