import express from 'express';  
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get user login patterns
router.get('/user-activity/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await prisma.auditLog.findMany({
      where: { fId: userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch user activity:', error);
    res.status(500).json({ error: 'Failed to fetch user activity' });
  }
});

// Get failed login attempts
router.get('/security/failed-logins', async (req, res) => {
  try {
    const failedLogins = await prisma.auditLog.findMany({
      where: { 
        action: 'FAILED_LOGIN',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
      select: {
        auditId: true,
        fEmail: true,
        ipAddress: true,
        failureReason: true,
        details: true,
        createdAt: true
      }
    });
    res.json(failedLogins);
  } catch (error) {
    console.error('Failed to fetch failed logins:', error);
    res.status(500).json({ error: 'Failed to fetch failed logins' });
  }
});

// Get session analysis
router.get('/sessions/active', async (req, res) => {
  try {
    const activeSessions = await prisma.auditLog.groupBy({
      by: ['fId', 'fEmail'],
      where: {
        action: 'LOGIN',
        success: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      _count: { action: true }
    });
    
    // Get user details for each session
    const sessionsWithDetails = await Promise.all(
      activeSessions.map(async (session) => {
        const user = await prisma.user.findUnique({
          where: { fId: session.fId },
          select: { fName: true, fRole: true }
        });
        return {
          ...session,
          facultyId: session.fId,
          email: session.fEmail,
          userName: user?.fName || 'Unknown',
          role: user?.fRole || 'Unknown'
        };
      })
    );
    
    res.json(sessionsWithDetails);
  } catch (error) {
    console.error('Failed to fetch active sessions:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
});

// Cleanup old logs
router.post('/cleanup', async (req, res) => {
  try {
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const result = await prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: oneYearAgo
        }
      }
    });
    res.json({ message: `Cleaned up ${result.count} old logs` });
  } catch (error) {
    console.error('Failed to cleanup logs:', error);
    res.status(500).json({ error: 'Failed to cleanup logs' });
  }
});

// Get all audit logs for admin dashboard
router.get('/all-logs', async (req, res) => {
  try {
    const { limit = 100, action } = req.query;
    const where = action ? { action } : {};
    
    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      include: {
        user: {
          select: {
            fName: true,
            fRole: true
          }
        }
      }
    });
    res.json(logs);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;