import express from 'express';
import Community from '../models/community.model.js';
import Message from '../models/message.model.js';
import protectRoute from '../middleware/protectRoute.js';
import axios from 'axios';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../utils/cloudinary.js';
import { getReceiverSocketId } from "../socket/socket.js";
import { io } from "../socket/socket.js";
import User from "../models/user.model.js";
import { createCommunity, getCommunities, getCommunityById, sendMessageToCommunity, deleteCommunity } from "../controllers/community.controllers.js";

const router = express.Router();

// Configuración Cloudinary para multer

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

// 1. Crear una nueva comunidad
router.post('/', protectRoute, createCommunity);

// 2. Obtener todas las comunidades
router.get('/', getCommunities);

// 3. Obtener una comunidad por ID
router.get('/:id', getCommunityById);

// 4. Obtener los mensajes de la comunidad, desencriptarlos y verificarlos
router.get('/:id/messages', async (req, res) => {
  const { id: communityId } = req.params;

  try {
    // Obtener la comunidad con sus mensajes
    const community = await Community.findById(communityId).populate('messages');
    if (!community) return res.status(404).json({ error: 'Community not found' });

    // Verificar que la comunidad tenga su clave privada
    const secretKeyBase64 = community.privateKey;
    if (!secretKeyBase64) {
      return res.status(400).json({ error: "Community does not have a private key." });
    }

    // Procesar todos los mensajes de la comunidad
    const decryptedMessages = await Promise.all(community.messages.map(async (msg) => {
      try {
        // 1. Desencriptar el mensaje
        const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
          kem_name: "ML-KEM-512",
          ciphertext: msg.message,
          shared_secret: msg.sharedSecret,
        });

        const decryptedText = decryptionResponse.data.original_message;

        // 2. Verificar la firma si hay firma y clave pública
        let verified = false;
        if (msg.signature && msg.publicKeyDSA) {
          try {
            const verifyResponse = await axios.post('https://kyber-api-1.onrender.com/verify', {
              message: decryptedText,
              signature: msg.signature,
              public_key: msg.publicKeyDSA,
              ml_dsa_variant: "ML-DSA-44"
            });
            verified = verifyResponse.data.verified;
            msg.verified = verified;
            await msg.save(); // Guardar estado de verificación
          } catch (verifyErr) {
            console.error("Error verifying signature:", verifyErr.message);
          }
        }

        return {
          ...msg._doc,
          message: decryptedText,
          verified,
          fileUrl: msg.fileUrl || null
        };
      } catch (error) {
        console.error("Error decrypting or verifying message:", error.message);
        return {
          ...msg._doc,
          message: "[Error al descifrar o verificar]",
          verified: false,
          fileUrl: msg.fileUrl || null
        };
      }
    }));

    // Responder con todos los mensajes descifrados y verificados
    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error in getting community messages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 4. Unir un usuario a una comunidad
router.post('/:id/join', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // Asegúrate de que el ID del usuario se envía en el cuerpo

  try {
      const community = await Community.findByIdAndUpdate(
          id,
          { $addToSet: { members: userId } }, // Usa $addToSet para evitar duplicados
          { new: true }
      );

      if (!community) {
          return res.status(404).json({ message: 'Community not found' });
      }

      res.status(200).json(community);
  } catch (error) {
      res.status(500).json({ message: 'Error joining community', error });
  }
});

// 5. Añadir un administrador a la comunidad
router.post('/:id/admins', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // ID del usuario que se convertirá en administrador

  try {
      const community = await Community.findByIdAndUpdate(
          id,
          { $addToSet: { admins: userId } },
          { new: true }
      );

      if (!community) {
          return res.status(404).json({ message: 'Community not found' });
      }

      res.status(200).json(community);
  } catch (error) {
      res.status(500).json({ message: 'Error adding admin', error });
  }
});

// 6. Enviar un mensaje a la comunidad
router.post('/:id/messages', protectRoute, upload.single('file'), sendMessageToCommunity);

// 7. Salir de una comunidad
router.post('/:id/leave', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body; // Asegúrate de que el ID del usuario se envía en el cuerpo

  try {
      const community = await Community.findByIdAndUpdate(
          id,
          { $pull: { members: userId } }, // Usa $pull para eliminar al usuario
          { new: true }
      );

      if (!community) {
          return res.status(404).json({ message: 'Community not found' });
      }

      res.status(200).json(community);
  } catch (error) {
      res.status(500).json({ message: 'Error leaving community', error });
  }
});

// 8. Eliminar una comunidad
router.delete('/:id', protectRoute, deleteCommunity);

export default router;