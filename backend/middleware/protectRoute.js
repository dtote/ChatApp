import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { verifySignature } from '../utils/crystalsDilithium.js';
export const protectRoute = async (req, res, next) => {
  
  try {

    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).send('Acceso no autorizado');
    }
  
    const { userId, sigma, beta, pk } = jwt.verify(token, process.env.JWT_SECRET);
  
    // console.log('pk:', pk);
    // console.log('userId:', userId);
    // console.log('sigma:', sigma);
    // console.log('beta:', beta);

    if (!verifySignature(pk, userId, sigma, beta)) {
      return res.status(401).send('Firma inválida');
    }
  
    const user = await User.findById(userId).select("-password");

    req.user = user;

    next();

  } catch (error){
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default protectRoute;