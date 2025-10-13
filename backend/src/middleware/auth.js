import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided in request');
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    try {
      // Fetch user details from database
      const user = await prisma.user.findUnique({
        where: { fId: decoded.facultyId },
        select: { fId: true, fEmail: true, fName: true, fRole: true }
      });
      
      if (!user) {
        console.log('User not found for facultyId:', decoded.facultyId);
        return res.status(403).json({ error: 'User not found' });
      }
      
      req.user = {
        facultyId: user.fId,
        email: user.fEmail,
        name: user.fName,
        role: user.fRole
      };
      next();
    } catch (error) {
      console.error('Database error in auth:', error);
      return res.status(500).json({ error: 'Database error' });
    }
  });
};