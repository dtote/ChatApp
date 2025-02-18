import express from 'express';
import multer from 'multer';
import { signup, signupFacial, login, loginFacial, logout } from '../controllers/auth.controllers.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Guardar imágenes en el directorio uploads

router.post("/signup", signup);
router.post("/signupFacial", upload.none(), signupFacial);
router.post("/login", login);
router.post("/loginFacial", upload.single('faceImage'),loginFacial);
router.post("/logout", logout); 

export default router;
