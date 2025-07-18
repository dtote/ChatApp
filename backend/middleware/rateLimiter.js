import rateLimit from 'express-rate-limit';

// Rate limiter para operaciones criptográficas
export const cryptoRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 30, // Máximo 30 peticiones por minuto por IP
  message: {
    error: 'Too many cryptographic operations. Please wait a moment before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many cryptographic operations. Please wait a moment before trying again.',
      retryAfter: 60
    });
  }
});

// Rate limiter para mensajes
export const messageRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // Máximo 20 mensajes por minuto por usuario
  keyGenerator: (req) => req.user?._id || req.ip, // Usar ID de usuario si está autenticado
  message: {
    error: 'Too many messages sent. Please wait a moment before sending another message.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many messages sent. Please wait a moment before sending another message.',
      retryAfter: 60
    });
  }
});

// Rate limiter para autenticación
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo 5 intentos de login por 15 minutos
  message: {
    error: 'Too many login attempts. Please wait 15 minutes before trying again.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please wait 15 minutes before trying again.',
      retryAfter: 900
    });
  }
});

// Rate limiter general para API
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // Máximo 100 peticiones por minuto por IP
  message: {
    error: 'Too many requests. Please wait a moment before trying again.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests. Please wait a moment before trying again.',
      retryAfter: 60
    });
  }
}); 