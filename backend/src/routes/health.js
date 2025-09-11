import express from 'express';

const router = express.Router();

// GET /api/health/chatbot - Check AI chatbot status
router.get('/chatbot', (req, res) => {
  const isActive = !!process.env.GEMINI_API_KEY;
  
  res.json({
    chatbot: {
      status: isActive ? 'active' : 'inactive',
      provider: 'Gemini AI',
      hasApiKey: isActive,
      endpoint: '/api/chatbot'
    },
    timestamp: new Date().toISOString()
  });
});

export default router;