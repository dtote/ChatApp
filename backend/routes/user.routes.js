import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUserforSidebars, getUserProfilePic, getUserPopupData, getPublicKey, deleteUser, getUserInfoWithFallback } from "../controllers/user.controllers.js";
const router = express.Router();

router.get("/", protectRoute, getUserforSidebars);

// Ruta para eliminar un usuario (solo administradores)
router.delete("/:userId", protectRoute, deleteUser);

// Ruta para obtener información del usuario con fallback
router.get("/:userId/info", protectRoute, getUserInfoWithFallback);

// Rutas existentes
router.get("/:id/profile-pic", protectRoute, getUserProfilePic);
router.get("/:id/popup-data", protectRoute, getUserPopupData);
router.get("/:id/publicKey", protectRoute, getPublicKey);

export default router;