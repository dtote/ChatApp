import express from 'express';
import {sendMessage, getMessages, reactMessage} from '../controllers/message.controllers.js';
import multer from "multer";
import {protectRoute} from '../middleware/protectRoute.js';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_uploads',
    resource_type: 'auto',
    upload_preset: 'ml_default',
    allowed_formats: ['jpg', 'png', 'pdf', 'mp4'],
    access_mode: 'public', // <- AGREGAR ESTA LÍNEA
    public_id: (req, file) => file.fieldname + '-' + Date.now(),
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage); 
router.post("/:id/react", reactMessage);
export default router;