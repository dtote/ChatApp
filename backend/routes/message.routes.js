import express from 'express';
import {sendMessage, getMessages, reactMessage} from '../controllers/message.controllers.js';
import multer from "multer";
import {protectRoute} from '../middleware/protectRoute.js';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const dynamicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto';
    const mime = file.mimetype;
  
    if (mime.startsWith('image/')) resourceType = 'image';
    else if (mime.startsWith('video/')) resourceType = 'video';
    else if (mime === 'application/pdf') resourceType = 'raw';
  
    const config = {
      folder: 'chat_uploads',
      resource_type: resourceType,
      public_id: file.fieldname + '-' + Date.now(),
      access_mode: 'public'
    };
  
    // Solo incluir allowed_formats si no es raw
    if (resourceType !== 'raw') {
      config.allowed_formats = ['jpg', 'png', 'pdf', 'mp4'];
    }
  
    return config;
  }
  
});

const upload = multer({ storage: dynamicStorage });

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage); 
router.post("/:id/react", reactMessage);
export default router;