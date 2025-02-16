import jwt from 'jsonwebtoken';
import { keygen, sign } from './crystalsDilithium.js';

const generateTokenAndSetCookie = (userId, res) => {
  let n = Math.floor(Math.random() * 10) + 5;
  let q = Math.pow(2, 23) - Math.pow(2, 13) + 1;
  const { pk, sk } = keygen(n, n, q); // Genera las claves

 

  const result = sign(sk, userId.toString()); // Firma el id del usuario

  let sigma = result[0];
  let beta = result[1];
  // console.log('pk', pk);
  // console.log('sigma', result[0]);
  // console.log('beta', result[1]);

  const token = jwt.sign({userId, sigma, beta, pk}, process.env.JWT_SECRET, { 
    expiresIn: '30d'
  });

  res.cookie('jwt', token, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días
    httpOnly: true, // Prevenir ataques XSS
    sameSite: "strict", // Prevenir ataques CSRF
    secure: false // La cookie solo funciona en HTTPS
    });
}

export default generateTokenAndSetCookie;
