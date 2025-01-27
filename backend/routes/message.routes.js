import exp from 'constants';
import express from 'express';
import {sendMessage, getMessages} from '../controllers/message.controllers.js';
import multer from "multer";
import {protectRoute} from '../middleware/protectRoute.js';

// Configuración de multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Carpeta donde se almacenarán los archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, upload.single('file'), sendMessage); 

export default router;