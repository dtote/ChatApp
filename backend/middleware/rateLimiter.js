import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Rate limiter for cryptographic operations
export const cryptoRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Maximum 30 requests per minute per IP
  keyGenerator: ipKeyGenerator, // Use helper function for IPv6
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

// Rate limiter for messages
export const messageRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Maximum 20 messages per minute per user
  keyGenerator: (req) => {
    // Si hay usuario autenticado, usar su ID
    if (req.user?._id) {
      return req.user._id.toString();
    }
    // Si no, usar el helper de IPv6 correctamente
    return ipKeyGenerator(req);
  },
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

// Rate limiter for authentication
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Maximum 5 login attempts per 15 minutes
  keyGenerator: ipKeyGenerator, // Use helper function for IPv6
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

// General API rate limiter
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Maximum 100 requests per minute per IP
  keyGenerator: ipKeyGenerator, // Use helper function for IPv6
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