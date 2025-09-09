import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logAuthActivity = async (action, facultyId, userEmail, userIP, userAgent, sessionId, success = true, details = '', failureReason = '') => {
  try {
    // Set expiration date (keep logs for 1 year)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    
    await prisma.auditLog.create({
      data: {
        facultyId,
        email: userEmail,
        action,
        ipAddress: userIP,
        userAgent,
        sessionId,
        success,
        failureReason: success ? null : failureReason,
        details,
        expiresAt
      }
    });
  } catch (error) {
    console.error('Failed to log auth activity:', error);
  }
};

// Helper function to generate session ID
export const generateSessionId = () => {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Cleanup old audit logs
export const cleanupOldLogs = async () => {
  try {
    const result = await prisma.auditLog.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });
    console.log(`Cleaned up ${result.count} expired audit logs`);
    return result.count;
  } catch (error) {
    console.error('Failed to cleanup old logs:', error);
    return 0;
  }
};