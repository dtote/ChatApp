import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true, // Prevenir ataques XSS
    sameSite: 'strict', // Prevenir ataques CSRF
    secure: process.env.NODE_ENV !== 'development', // La cookie solo funciona en HTTPS
  });
};

export default generateTokenAndSetCookie;
