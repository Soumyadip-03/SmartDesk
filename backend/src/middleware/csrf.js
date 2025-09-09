import crypto from 'crypto';

const csrfTokens = new Map();

export const generateCSRFToken = (req, res, next) => {
  const token = crypto.randomBytes(32).toString('hex');
  const userId = req.user?.userId || req.ip;
  csrfTokens.set(userId, token);
  req.csrfToken = token;
  res.setHeader('X-CSRF-Token', token);
  next();
};

export const validateCSRFToken = (req, res, next) => {
  if (req.method === 'GET') return next();
  
  // Skip CSRF for auth routes (login/register)
  if (req.path.includes('/auth/')) return next();
  
  const token = req.headers['x-csrf-token'];
  const userId = req.user?.userId || req.ip;
  const storedToken = csrfTokens.get(userId);
  
  if (!token || token !== storedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};