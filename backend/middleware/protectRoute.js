import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  
  try {

    const token = req.cookies.jwt;

    console.log("Token:", token);
    if (!token) {
      return res.status(401).send('Acceso no autorizado');
    }
  
    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
  
    const user = await User.findById(userId).select("-password");

    req.user = user;

    next();

  } catch (error){
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default protectRoute;