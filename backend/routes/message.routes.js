import express from 'express';
import { sendMessage, getMessages, reactMessage } from '../controllers/message.controllers.js';
import multer from "multer";
import { protectRoute } from '../middleware/protectRoute.js';
import path from 'path';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';

const dynamicStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let resourceType = 'auto';
    const mime = file.mimetype;
    const cleanBaseName = file.originalname
      .split('.')[0]
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);

    const rawExtension = file.originalname.split('.').pop() || '';
    const cleanExtension = rawExtension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

    if (mime.startsWith('image/')) resourceType = 'image';
    else if (mime.startsWith('video/')) resourceType = 'video';
    else if (mime === 'application/pdf') resourceType = 'raw';
    else if (mime === 'text/plain' || extension === 'txt') resourceType = 'raw';
    else resourceType = 'raw';

    const config = {
      folder: 'chat_uploads',
      resource_type: resourceType,
      public_id: `${cleanBaseName}`,
      use_filename: false,
      unique_filename: true,
      format: cleanExtension,
      access_mode: 'public',
      type: 'upload',
    };

    // Solo incluir allowed_formats si no es raw
    if (resourceType !== 'raw') {
      config.allowed_formats = ['jpg', 'png', 'pdf', 'mp4', 'gif', 'webp', 'jpeg', 'webm'];
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