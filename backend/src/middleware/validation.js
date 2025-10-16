import Joi from 'joi';

// Input validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required().max(255),
    password: Joi.string().min(6).max(128).required()
  }),
  
  register: Joi.object({
    email: Joi.string().email().required().max(255),
    name: Joi.string().min(2).max(100).required(),
    establishmentId: Joi.string().min(2).max(50).required(),
    facultyId: Joi.string().min(2).max(50).required(),
    password: Joi.string().min(6).max(128).required()
  }),
  
  roomUpdate: Joi.object({
    roomType: Joi.string().valid('Undefined', 'Lecture Room', 'Computer Lab', 'Seminar Hall', 'Laboratory', 'Auditorium', 'Conference Room', 'Faculty Room').optional(),
    roomStatus: Joi.string().valid('Available', 'Booked', 'Maintenance').optional(),
    capacity: Joi.number().integer().min(0).max(500).optional()
  }),
  
  booking: Joi.object({
    roomNumber: Joi.string().required(),
    buildingNumber: Joi.string().required(),
    date: Joi.date().iso().min('now').required(),
    startTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
  })
};

// Validation middleware
export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schemas[schema].validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.details[0].message 
      });
    }
    next();
  };
};

// Sanitize input
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};