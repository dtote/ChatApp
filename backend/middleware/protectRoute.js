import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Leer token desde el header Authorization: Bearer <token>
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ error: "Acceso no autorizado, token no proporcionado" });
    }

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error en protectRoute middleware:", error);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
};

export default protectRoute;
