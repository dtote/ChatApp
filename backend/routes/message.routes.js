import express from 'express';
import {sendMessage, getMessages, reactMessage} from '../controllers/message.controllers.js';
import multer from "multer";
import {protectRoute} from '../middleware/protectRoute.js';
import path from 'path';

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); 
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage); 
router.post("/:id/react", reactMessage);
export default router;