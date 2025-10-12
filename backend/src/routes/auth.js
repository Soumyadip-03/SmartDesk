import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sanitizeInput } from '../utils/sanitize.js';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
  try {
    const { email, name, establishmentId, facultyId, password } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    const sanitizedEstablishmentId = sanitizeInput(establishmentId);
    const sanitizedFacultyId = sanitizeInput(facultyId);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Validate required fields
    if (!sanitizedEmail || !sanitizedName || !sanitizedEstablishmentId || !sanitizedFacultyId || !password) {
      return res.status(400).json({ error: 'All fields are required: email, name, establishment ID, faculty ID, and password' });
    }
    
    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { fEmail: sanitizedEmail }
    });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email is already registered. Please use a different email address.' });
    }
    
    // Check if faculty ID already exists
    const existingFacultyId = await prisma.user.findUnique({
      where: { fId: sanitizedFacultyId }
    });
    if (existingFacultyId) {
      return res.status(400).json({ error: 'Faculty ID is already taken. Please use a different faculty ID.' });
    }
    
    // Verify establishment exists
    const establishmentRecord = await prisma.establishment.findUnique({
      where: { eId: sanitizedEstablishmentId }
    });
    if (!establishmentRecord) {
      return res.status(400).json({ error: 'Establishment ID does not exist. Please check with your administrator.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: { 
        fEmail: sanitizedEmail, 
        fName: sanitizedName, 
        fId: sanitizedFacultyId, 
        fPassword: hashedPassword,
        eId: sanitizedEstablishmentId,
        fUsername: sanitizedName.toLowerCase().replace(/\s+/g, ''),
        fRole: 'moderator'
      },
      include: {
        establishment: true
      }
    });
    
    // Log successful registration
    await prisma.auditLog.create({
      data: {
        fId: user.fId,
        fEmail: user.fEmail,
        action: 'REGISTER',
        ipAddress,
        userAgent,
        success: true,
        details: `User registered: ${user.fName} (${user.fRole})`,
        createdAt: new Date()
      }
    });
    
    const token = jwt.sign({ facultyId: user.fId }, process.env.JWT_SECRET);
    
    res.json({ 
      token, 
      user: { 
        facultyId: user.fId, 
        email: user.fEmail, 
        name: user.fName, 
        username: user.fUsername,
        establishment: user.establishment.eName, 
        establishmentId: user.eId,
        role: user.fRole || 'moderator',
        department: user.fDepartment,
        phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : null,
        profilePicture: user.profilePicture
      } 
    });
  } catch (error) {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    // Log failed registration attempt
    try {
      await prisma.auditLog.create({
        data: {
          fId: 'unknown',
          fEmail: req.body.email || 'unknown',
          action: 'FAILED_REGISTER',
          ipAddress,
          userAgent,
          success: false,
          failureReason: error.message,
          details: `Registration failed: ${error.message}`
        }
      }).catch(() => {}); // Ignore audit log errors
    } catch (auditError) {
      // Ignore audit logging errors
    }
    
    console.error('Registration failed:', error.message);
    res.status(500).json({ error: `Registration failed: ${error.message}. Please try again or contact support.` });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email);
    console.log('Login attempt received');
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const sessionId = jwt.sign({ timestamp: Date.now() }, process.env.JWT_SECRET);
    
    if (!sanitizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    console.log('Searching for email:', sanitizedEmail);
    
    // Debug: Check if we can find ANY users
    const allUsers = await prisma.user.findMany({
      select: { fEmail: true, fId: true, fName: true },
      take: 5
    });
    console.log('Total users found in database:', allUsers.length);
    console.log('Sample users:', allUsers);
    
    const user = await prisma.user.findUnique({ 
      where: { fEmail: sanitizedEmail },
      include: { establishment: true }
    });
    
    console.log('User found:', !!user);
    if (user) {
      console.log('User details:', { fId: user.fId, fEmail: user.fEmail, fName: user.fName });
    }
    
    if (!user) {
      console.log('Failed login attempt - user not found');
      
      // Log failed login attempt for non-existent user
      try {
        await prisma.auditLog.create({
          data: {
            fId: 'unknown',
            fEmail: sanitizedEmail,
            action: 'FAILED_LOGIN',
            ipAddress,
            userAgent,
            sessionId,
            success: false,
            failureReason: 'Email not registered',
            details: 'Failed login attempt - email is not registered'
          }
        }).catch(() => {}); // Ignore errors for unknown users
      } catch (auditError) {
        // Ignore audit logging errors
      }
      
      return res.status(401).json({ error: 'Email is not registered. Please sign up first or check your email address.' });
    }
    
    if (!await bcrypt.compare(password, user.fPassword)) {
      console.log('Failed login attempt - wrong password');
      
      // Log failed login attempt for wrong password
      await prisma.auditLog.create({
        data: {
          fId: user.fId,
          fEmail: sanitizedEmail,
          action: 'FAILED_LOGIN',
          ipAddress,
          userAgent,
          sessionId,
          success: false,
          failureReason: 'Incorrect password',
          details: 'Failed login attempt - incorrect password provided'
        }
      });
      
      return res.status(401).json({ error: 'Incorrect password. Please check your password and try again.' });
    }
    
    // Check for existing active sessions
    const recentLogin = await prisma.auditLog.findFirst({
      where: {
        fId: user.fId,
        action: 'LOGIN',
        success: true,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // If there's a recent login from different IP/device, notify
    if (recentLogin && (recentLogin.ipAddress !== ipAddress || recentLogin.userAgent !== userAgent)) {
      await prisma.notification.create({
        data: {
          fId: user.fId,
          type: 'security',
          title: 'New Login Detected',
          message: `Someone logged into your account from a different device. If this wasn't you, please change your password immediately.`,
          urgent: true,
          isRead: false
        }
      });
    }
    
    // Log successful login
    await prisma.auditLog.create({
      data: {
        fId: user.fId,
        fEmail: user.fEmail,
        action: 'LOGIN',
        ipAddress,
        userAgent,
        sessionId,
        success: true,
        details: `Successful login: ${user.fName} (${user.fRole})`,
        createdAt: new Date()
      }
    });
    
    const token = jwt.sign({ facultyId: user.fId }, process.env.JWT_SECRET);
    
    console.log('Successful login - Role:', user.fRole);
    
    res.json({ 
      token, 
      user: { 
        id: user.fId,
        facultyId: user.fId, 
        email: user.fEmail, 
        name: user.fName, 
        username: user.fUsername,
        establishment: user.establishment?.eName || 'Unknown', 
        establishmentId: user.eId,
        role: user.fRole || 'moderator',
        department: user.fDepartment,
        phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : null,
        profilePicture: user.profilePicture
      } 
    });
  } catch (error) {
    console.error('Login server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// CSRF token endpoint
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: 'dummy-token' });
});

// Debug endpoint to test Prisma
router.get('/debug-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const sampleUser = await prisma.user.findFirst({
      select: { fEmail: true, fId: true, fName: true }
    });
    
    // Show partial connection string for debugging
    const dbUrl = process.env.DATABASE_URL || 'Missing';
    const maskedUrl = dbUrl.includes('@') ? 
      dbUrl.split('@')[1] : 'Invalid format';
    
    res.json({
      totalUsers: userCount,
      sampleUser: sampleUser,
      databaseHost: maskedUrl,
      hasConnectionString: !!process.env.DATABASE_URL
    });
  } catch (error) {
    res.status(500).json({
      error: 'Prisma connection failed',
      details: error.message
    });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { fId: decoded.facultyId },
      select: { 
        fId: true, 
        fEmail: true, 
        fName: true, 
        fDepartment: true, 
        phoneNumber: true,
        fUsername: true,
        profilePicture: true,
        fRole: true,
        eId: true,
        establishment: {
          select: { eName: true }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const responseData = {
      facultyId: user.fId,
      email: user.fEmail,
      name: user.fName,
      department: user.fDepartment,
      username: user.fUsername,
      role: user.fRole,
      establishmentId: user.eId,
      establishment: user.establishment.eName,
      phoneNumber: user.phoneNumber ? user.phoneNumber.toString() : null,
      profilePicture: user.profilePicture
    };
    res.json(responseData);
  } catch (error) {
    console.error('Profile get error:', error);
    res.status(401).json({ error: 'Invalid token', details: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, department, phoneNumber, username, profilePicture } = req.body;
    const sanitizedName = name ? sanitizeInput(name) : null;
    const sanitizedDepartment = department ? sanitizeInput(department) : null;
    const sanitizedUsername = username ? sanitizeInput(username) : null;
    
    console.log('📝 Profile update request:', {
      facultyId: decoded.facultyId,
      name,
      department,
      phoneNumber,
      username,
      profilePicture
    });
    
    const updatedUser = await prisma.user.update({
      where: { fId: decoded.facultyId },
      data: { 
        fName: sanitizedName, 
        fDepartment: sanitizedDepartment, 
        phoneNumber: phoneNumber ? phoneNumber.toString() : null,
        fUsername: sanitizedUsername,
        profilePicture: profilePicture || null
      },
      select: { 
        fId: true, 
        fEmail: true, 
        fName: true, 
        fDepartment: true, 
        phoneNumber: true,
        fUsername: true,
        profilePicture: true,
        fRole: true,
        eId: true,
        establishment: {
          select: { eName: true }
        }
      }
    });
    
    console.log('✅ Database updated successfully:', {
      facultyId: updatedUser.facultyId,
      department: updatedUser.department,
      phoneNumber: updatedUser.phoneNumber?.toString()
    });
    
    const responseData = {
      facultyId: updatedUser.fId,
      email: updatedUser.fEmail,
      name: updatedUser.fName,
      department: updatedUser.fDepartment,
      username: updatedUser.fUsername,
      role: updatedUser.fRole,
      establishment: updatedUser.establishment.eName,
      establishmentId: updatedUser.eId,
      phoneNumber: updatedUser.phoneNumber ? updatedUser.phoneNumber.toString() : null,
      profilePicture: updatedUser.profilePicture
    };
    res.json(responseData);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

// Get user settings
router.get('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const settings = await prisma.userSettings.findUnique({
      where: { fId: decoded.facultyId }
    });
    
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        theme: 'dark',
        notifications: false,
        language: 'en'
      });
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { language, theme, notifications } = req.body;
    
    const updatedSettings = await prisma.userSettings.upsert({
      where: { fId: decoded.facultyId },
      update: { language, theme, notifications },
      create: { 
        fId: decoded.facultyId, 
        language: language || 'en',
        theme: theme || 'dark',
        notifications: notifications || false
      }
    });
    
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Logout endpoint
router.post('/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    const user = await prisma.user.findUnique({
      where: { fId: decoded.facultyId },
      select: { fEmail: true, fName: true, fId: true }
    });
    
    if (user) {
      // Log logout
      await prisma.auditLog.create({
        data: {
          fId: user.fId,
          fEmail: user.fEmail,
          action: 'LOGOUT',
          ipAddress,
          userAgent,
          success: true,
          details: `User logged out: ${user.fName}`,
          createdAt: new Date()
        }
      });
      console.log('User logged out:', user.fEmail);
    }
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.log('Logout failed: Invalid token');
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Delete account
router.delete('/delete-account', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user info before deletion for logging
    const user = await prisma.user.findUnique({
      where: { fId: decoded.facultyId },
      select: { fEmail: true, fName: true, fId: true }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Delete user (cascade will delete all related data)
    await prisma.user.delete({
      where: { fId: decoded.facultyId }
    });
    
    console.log('Account deleted:', user.fEmail);
    
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    
    // Get current user
    const user = await prisma.user.findUnique({
      where: { fId: decoded.facultyId }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.fPassword);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await prisma.user.update({
      where: { fId: decoded.facultyId },
      data: { fPassword: hashedNewPassword }
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;