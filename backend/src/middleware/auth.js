import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    try {
      // Fetch user details from database
      const user = await prisma.user.findUnique({
        where: { fId: decoded.facultyId },
        select: { fId: true, fEmail: true, fName: true, fRole: true }
      });
      
      if (!user) {
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
      return res.status(500).json({ error: 'Database error' });
    }
  });
};