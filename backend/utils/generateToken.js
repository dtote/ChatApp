import jwt from 'jsonwebtoken';
import { keygen, sign } from './crystalsDilithium.js';

const generateTokenAndSetCookie = (userId, res) => {
  // console.log('pk', pk);
  // console.log('sigma', result[0]);
  // console.log('beta', result[1]);

  const token = jwt.sign({userId}, process.env.JWT_SECRET, { 
    expiresIn: '30d'
  });

  res.cookie('jwt', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true, // Prevenir ataques XSS
    sameSite: "None", // Prevenir ataques CSRF
    secure: process.env.NODE_ENV === "production" ? true : false // La cookie solo funciona en HTTPS
    });
}

export default generateTokenAndSetCookie;
