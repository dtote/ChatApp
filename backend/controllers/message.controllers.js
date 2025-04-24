import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import axios from 'axios';
import User from "../models/user.model.js";
import { logDetailedError } from "../utils/logErrorDetails.js";

// Controlador para enviar mensajes con PDF adjunto
export const sendMessage = async (req, res) => {
  try {
    const { message, selectedKeySize } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;  // ID del remitente (autenticado)
    const file = req.file;  // Archivo PDF adjunto
    // console.log(receiverId);
    // console.log(message);
    // console.log(senderId);
    // Obtener la clave pública del receptor desde la base de datos
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.publicKey) {
      return res.status(400).json({ error: "Receiver not found or missing public key." });
    }
	
    // Firmar el mensaje
    const signResponse = await axios.post('https://kyber-api-1.onrender.com/sign', {
      message,
      ml_dsa_variant: "ML-DSA-44",
      private_key: req.user.secretKeyDSA  
    });
    const { signature } = signResponse.data;

    // Cifrar el mensaje usando la API de cifrado
    const encryptionResponse = await axios.post('https://kyber-api-1.onrender.com/encrypt', {
      kem_name: selectedKeySize,
      message: message,
      public_key: receiver.publicKey,  // clave pública en base64
    });

    const { ciphertext, shared_secret } = encryptionResponse.data;
    //console.log("Encrypted message:", ciphertext);
    //console.log("Shared secret:", shared_secret);
    // Verificar si ya existe una conversación entre los participantes
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // Crear el nuevo mensaje con el archivo adjunto (si existe)
    const newMessage = new Message({
      senderId,
      receiverId,
      message: ciphertext, // mensaje cifrado
      sharedSecret: shared_secret, // clave secreta compartida
      signature, // Guardar la firma
      publicKeyDSA: req.user.publicKeyDSA, // Guardar la clave pública DSA
      fileUrl: file ? `/uploads/${file.filename}` : null, // URL del archivo PDF (si se adjunta)
      verified: false
    });

    // Guardar el nuevo mensaje y actualizar la conversación
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);


    // Funcionalidad de SOCKET IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    //console.log("Receiver Socket ID:", receiverSocketId);
    if (receiverSocketId) {
      const messageResponse = {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: ciphertext, // mensaje descifrado
        sharedSecret: newMessage.sharedSecret, // clave secreta compartida
        fileUrl: newMessage.fileUrl, // URL del archivo adjunto
        createdAt: new Date(), // Fecha de creación (puedes ajustar si usas otro campo de tiempo)
        updatedAt: new Date(),
      }
      console.log("Emitting new message to receiver...");
      io.to(receiverSocketId).emit("newMessage", messageResponse);
    }

    const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
      kem_name: selectedKeySize,
      ciphertext: newMessage.message,
      shared_secret: newMessage.sharedSecret
    });

    res.status(201).json({ ...newMessage._doc, message: decryptionResponse.data.original_message });
  } catch (error) {
    logDetailedError("sendMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const { selectedKeySize } = req.query
    const senderId = req.user._id;

    // Obtener la conversación entre el remitente y el receptor
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    // Obtener la clave secreta del receptor (usuario que solicita los mensajes)
    const receiver = await User.findById(userToChatId);  
    if (!receiver || !receiver.secretKey) {
      return res.status(400).json({ error: "Receiver not found or missing secret key." });
    }

   
    // Descifrar cada mensaje y devolver también la URL del archivo PDF (si existe)
    const decryptedMessages = await Promise.all(conversation.messages.map(async (msg) => {
      try {
        // Descifrar el mensaje (solo el texto plano)
        const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
          kem_name: selectedKeySize,
          ciphertext: msg.message,
          shared_secret: msg.sharedSecret
        });

        const decryptedText = decryptionResponse.data.original_message;

        // Verificar la firma digital con ML-DSA
        const verifyResponse = await axios.post('https://kyber-api-1.onrender.com/verify', {
          message: decryptedText,
          signature: msg.signature,
          public_key: msg.publicKeyDSA,
          ml_dsa_variant: "ML-DSA-44"
        });

        //console.log("Verificación ML-DSA:", verifyResponse.data);
        const verified = verifyResponse.data.verified;

        msg.verified = !!verified;
        await msg.save();

        return {
          ...msg._doc,
          message: decryptedText,
          verified: msg.verified,
          fileUrl: msg.fileUrl || null
        };
      } catch (error) {
        logDetailedError("Error al verificar mensajes", error);

        return {
          ...msg._doc,
          message: "[Mensaje no verificado]",
          verified: false,
          fileUrl: msg.fileUrl || null
        };
      }
    }));


    res.status(200).json(decryptedMessages);
  } catch (error) {
    logDetailedError("GetMessage", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const reactMessage = async (req, res) => {
  const { emoji, userId } = req.body;
  const messageId = req.params.id;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).send("Mensaje no encontrado");

  const existingReaction = message.reactions.find(
    (r) => r.userId === userId && r.emoji === emoji
  );

  if (existingReaction) {
    // Quitar reacción (toggle)
    message.reactions = message.reactions.filter(
      (r) => !(r.userId === userId && r.emoji === emoji)
    );
  } else {
    // Añadir reacción
    message.reactions.push({ emoji, userId });
  }

  await message.save();
  res.send(message.reactions);
};

