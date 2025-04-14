import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import axios from 'axios';
import User from "../models/user.model.js";
import { shared } from "@tensorflow/tfjs-node";
// Controlador para enviar mensajes con PDF adjunto
export const sendMessage = async (req, res) => {
  try {
    console.log("🌐 RUTA LLAMADA:", req.method, req.originalUrl);
    console.log("🧍 Usuario autenticado:", req.user);
    console.log("📨 Params:", req.params);
    console.log("📨 Query:", req.query);
    console.log("📨 Body:", req.body);

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
	

    // Cifrar el mensaje usando la API de cifrado
    const encryptionResponse = await axios.post('https://kyber-api-1.onrender.com/encrypt', {
      kem_name: selectedKeySize,
      message: message,
      public_key: receiver.publicKey,  // clave pública en base64
    });

    const { ciphertext, shared_secret } = encryptionResponse.data;
    console.log("Encrypted message:", ciphertext);
    console.log("Shared secret:", shared_secret);
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
      fileUrl: file ? `/uploads/${file.filename}` : null  // URL del archivo PDF (si se adjunta)
    });

    // Guardar el nuevo mensaje y actualizar la conversación
    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    await Promise.all([conversation.save(), newMessage.save()]);

    // Descifrar el mensaje para mostrarlo en el chat del remitente

    try {
      const encryptionResponse = await axios.post('https://kyber-api-1.onrender.com/encrypt', {
        kem_name: selectedKeySize,
        message: message,
        public_key: receiver.publicKey,  // clave pública en base64
      });
    
      //console.log("Respuesta de la API:", encryptionResponse.data);
    } catch (error) {
      if (error.response) {
        console.error("Error en la respuesta:", error.response.status, error.response.data);
      } else if (error.request) {
        console.error("No hubo respuesta de la API:", error.request);
      } else {
        console.error("Error en la configuración de la petición:", error.message);
      }
    }
    
    const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
      kem_name: selectedKeySize,
      ciphertext: ciphertext,  // mensaje cifrado
      shared_secret: shared_secret,  // clave privada del receptor
    });


    const decrypted_message = decryptionResponse.data.original_message;

    //console.log("Decrypted message:", decrypted_message);
    //console.log("Fecha Actual:", new Date());
    // Crear el objeto de mensaje completo para devolverlo
    const messageResponse = {
      _id: newMessage._id,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      message: decrypted_message, // mensaje descifrado
      sharedSecret: newMessage.sharedSecret, // clave secreta compartida
      fileUrl: newMessage.fileUrl, // URL del archivo adjunto
      createdAt: new Date(), // Fecha de creación (puedes ajustar si usas otro campo de tiempo)
      updatedAt: new Date(),
    };

    // Funcionalidad de SOCKET IO
    const receiverSocketId = getReceiverSocketId(receiverId);
    //console.log("Receiver Socket ID:", receiverSocketId);
    if (receiverSocketId) {
      const messageResponse2 = {
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
      io.to(receiverSocketId).emit("newMessage", messageResponse2);
    }

    res.status(201).json(messageResponse);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    console.log("🌐 RUTA LLAMADA:", req.method, req.originalUrl);
    console.log("🧍 Usuario autenticado:", req.user);
    console.log("📨 Params:", req.params);
    console.log("📨 Query:", req.query);
    console.log("📨 Body:", req.body);
    
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
        // console.log("Decrypting message:", msg.message);
        // console.log("M value:", msg.M);
        // console.log("Secret key:", secretKeyBase64);
        //console.log("Mensaje:", msg);
        // Enviar solicitud a la API para descifrar el mensaje
        console.log("Sending decryption request with data:", {
          kem_name: selectedKeySize,
          ciphertext: msg.message,  // mensaje cifrado
          shared_secret: msg.sharedSecret,  // clave secreta en base64
        });

        try {
          const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
            kem_name: selectedKeySize,
            ciphertext: msg.message,  // mensaje cifrado
            shared_secret: msg.sharedSecret     // clave secreta en base64
          });
  
        
          console.log("Respuesta de la API:", decryptionResponse.data);
        } catch (error) {
          if (error.response) {
            console.error("Error en la respuesta:", error.response.status, error.response.data);
          } else if (error.request) {
            console.error("No hubo respuesta de la API:", error.request);
          } else {
            console.error("Error en la configuración de la petición:", error.message);
          }
        }
        
        //console.log("Decryption response:", decryptionResponse.data);
        // Devolver el mensaje descifrado junto con el archivo PDF (si existe)
        return {
          ...msg._doc,
          message: decryptionResponse.data.original_message,  // mensaje descifrado
          fileUrl: msg.fileUrl || null  // devolver la URL del archivo PDF si existe
        };
      } catch (error) {
        const decryptionResponse1 = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
          kem_name: selectedKeySize,
          ciphertext: msg.message,  // mensaje cifrado
          shared_secret: msg.sharedSecret       // clave secreta en base64
        });
        
        return {
          ...msg._doc,
          message: decryptionResponse1.data.original_message,  // mensaje descifrado
          fileUrl: msg.fileUrl || null  // devolver la URL del archivo PDF si existe
        };
        // console.log("Error decrypting message: ", error.message);
        // return {
          // ...msg._doc,
          // fileUrl: msg.fileUrl || null  // en caso de error, devolver el mensaje con el archivo adjunto (si lo hay)
        // };
      }
    }));

    res.status(200).json(decryptedMessages);
  } catch (error) {
    console.error("Error in getMessages:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


