import express from 'express';
import chatbotService from '../services/chatbotService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chatbot - Send message to AI
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    console.log('Chatbot request:', { message, userId: req.user?.facultyId });
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userContext = {
      role: req.user?.role || 'faculty',
      userId: req.user?.facultyId || 'unknown',
      userName: req.user?.name || 'User',
      ...context
    };
    
    console.log('Processing chatbot message with context:', userContext);

    let response;
    try {
      response = await chatbotService.getContextualResponse(message, userContext);
      console.log('Chatbot response generated:', response);
    } catch (serviceError) {
      console.error('Chatbot service error:', serviceError.message);
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('know me') || lowerMessage.includes('who am i')) {
        response = `Hi ${userContext.userName}! I'm SmartDesk AI. I can help you with room bookings, building info, and system navigation. What would you like to know?`;
      } else if (lowerMessage.includes('book')) {
        response = 'To book a room: Select Building → Choose Room → Pick Time → Fill Details → Confirm';
      } else if (lowerMessage.includes('building')) {
        response = 'We have 7 buildings (01-07), each with 36 rooms. Which building interests you?';
      } else {
        response = `Hello ${userContext.userName}! I can help with: room bookings, building info, availability, and system navigation. What do you need?`;
      }
    }
    
    res.json({ 
      response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chatbot API error:', error.message);
    res.status(200).json({ 
      response: `Hello! I'm SmartDesk AI Assistant. I can help you with room bookings and system navigation. What would you like to know?`,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;