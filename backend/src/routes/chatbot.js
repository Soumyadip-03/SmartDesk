import express from 'express';
import chatbotService from '../services/chatbotService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chatbot - Send message to AI
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get user context for better responses
    const userContext = {
      role: req.user.role,
      userId: req.user.facultyId,
      userName: req.user.name,
      ...context
    };
    
    console.log('Chatbot user context:', userContext);

    const response = await chatbotService.getContextualResponse(message, userContext);
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      response: 'I\'m experiencing technical difficulties. Please try again in a moment.'
    });
  }
});

export default router;