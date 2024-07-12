import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  
  try {

    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ error: "You need to be logged in to access this route" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await User.findById(decoded.userId).select("-password");

    req.user = user;

    next();

  } catch {
    console.log("Error in protectRoute middleware", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

export default protectRoute;