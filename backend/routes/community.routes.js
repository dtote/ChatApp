import express from 'express';
import Community from '../models/community.model.js';
import Message from '../models/message.model.js';
import protectRoute from '../middleware/protectRoute.js';
import axios from 'axios';
import multer from 'multer';
import { getReceiverSocketId, io } from "../socket/socket.js";
const router = express.Router();

// 1. Crear una nueva comunidad
router.post('/', async (req, res) => {
    const { name, description, image } = req.body;
  
    try {
      // Obtener las claves públicas y privadas generadas por Flask
      const { data: keys } = await axios.post('http://127.0.0.1:5001/generate_keys', {
        kem_name: "ML-KEM-512",
      });
      
      if (!keys || !keys.public_key || !keys.secret_key) {
        return res.status(500).json({ error: "Error generating keys" });
      }
      
      // Crear la comunidad con las claves
      const newCommunity = new Community({
        name,
        description,
        image,
        publicKey: keys.public_key,  // Guardar la clave pública
        privateKey: keys.secret_key   // Guardar la clave secreta
      });

      await newCommunity.save();
      res.status(201).json(newCommunity);
    } catch (error) {
      console.error('Error in creating community:', error); // Agrega esta línea
      res.status(500).json({ message: 'Error creating community', error });
    }
  });

// 2. Obtener todas las comunidades
router.get('/', async (req, res) => {
  try {
      const communities = await Community.find().populate('members admins messages');
      res.status(200).json(communities);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching communities', error });
  }
});

// 3. Obtener una comunidad por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const community = await Community.findById(id).populate('members admins messages');
      if (!community) {
          return res.status(404).json({ message: 'Community not found' });
      }
      res.status(200).json(community);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching community', error });
  }
});

// 3. Obtener los mensajes de la comunidad y desencriptarlos
router.get('/:id/messages', async (req, res) => {
  const { id: communityId } = req.params;

  try {
    // Obtener la comunidad con sus mensajes
    const community = await Community.findById(communityId).populate('messages');
    if (!community) return res.status(404).json({ error: 'Community not found' });

    // Obtener la clave secreta de la comunidad
    const secretKeyBase64 = community.privateKey;
    if (!secretKeyBase64) {
      return res.status(400).json({ error: "Community does not have a private key." });
    }

    // Desencriptar cada mensaje utilizando la clave secreta de la comunidad
    const decryptedMessages = await Promise.all(community.messages.map(async (msg) => {
      try {
        // Enviar solicitud a la API para descifrar el mensaje
        console.log("Mensaje:", msg.message);
      
        const decryptionResponse = await axios.post('http://127.0.0.1:5001/decrypt', {
          kem_name: "ML-KEM-512",
          ciphertext: msg.message,  // mensaje cifrado
          shared_secret: msg.sharedSecret,  // clave privada del receptor
        });

        console.log("Decryption response:", decryptionResponse.data);
        // Devolver el mensaje descifrado junto con el archivo PDF (si existe)
        return {
          ...msg._doc,
          message: decryptionResponse.data.original_message,  // mensaje descifrado
          fileUrl: msg.fileUrl || null  // devolver la URL del archivo PDF si existe
        };
      } catch (error) {
        console.error("Error decrypting message: ", error.message);
        return {
          ...msg._doc,
          fileUrl: msg.fileUrl || null  // en caso de error, devolver el mensaje con el archivo adjunto (si lo hay)
        };
      }
    }));

    // Devolver los mensajes desencriptados
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
const upload = multer();
router.post('/:id/messages', upload.none(), protectRoute, async (req, res) => {
  const { id: communityId } = req.params;
  const { message } = req.body;
  const senderId = req.user._id;
  try {
    // Obtener la comunidad
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    // Cifrar el mensaje usando la clave pública de la comunidad
   const encryptionResponse = await axios.post('http://127.0.0.1:5001/encrypt', {
      kem_name: "ML-KEM-512",
      message: message,
      public_key: community.publicKey,  // clave pública en base64
    });

    const { ciphertext, shared_secret } = encryptionResponse.data;

    // Crear y guardar el mensaje
    const newMessage = new Message({
      senderId,
      receiverId: communityId,
      message: ciphertext,
      sharedSecret: shared_secret
    });

    community.messages.push(newMessage._id);
    await Promise.all([newMessage.save(), community.save()]);


    // Solicitar el desencriptado del mensaje a la API
    const decryptionResponse = await axios.post('http://127.0.0.1:5001/decrypt', {
      kem_name: "ML-KEM-512",
      ciphertext: ciphertext,  // mensaje cifrado
      shared_secret: shared_secret,  // clave privada del receptor
    });

    // Obtener el mensaje descifrado
    const decrypted_message = decryptionResponse.data.original_message;

    // Crear el objeto de respuesta con el mensaje desencriptado
    const messageResponse = {
      _id: newMessage._id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      message: decrypted_message,  // mensaje descifrado
      fileUrl: newMessage.fileUrl || null, // URL del archivo adjunto si existe
      createdAt: new Date(),  // Timestamp de la creación del mensaje
      updatedAt: new Date()
    };

 
    // Emitir el mensaje a través de SOCKET.IO si se tiene la conexión del receptor
    const receiverSocketId = getReceiverSocketId(communityId); // Aquí se debe implementar la lógica para obtener la socket ID de la comunidad
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", messageResponse);
    }

    // Devolver el mensaje desencriptado como respuesta
    res.status(201).json(messageResponse);
  } catch (error) {
    console.error("Error in sending message to community:", error.message);
    res.status(500).json({ error: 'Error sending message to community' });
  }
});


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
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
      const community = await Community.findByIdAndDelete(id);
      if (!community) {
          return res.status(404).json({ message: 'Community not found' });
      }

      res.status(200).json({ message: 'Community deleted successfully' });
  } catch (error) {
      res.status(500).json({ message: 'Error deleting community', error });
  }
});

export default router;