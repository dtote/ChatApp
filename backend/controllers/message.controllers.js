import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import axios from 'axios';
import User from "../models/user.model.js";
import { logDetailedError } from "../utils/logErrorDetails.js";

const axiosRetry = async (url, data, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

const signWithRetry = (data) => axiosRetry('https://kyber-api-1.onrender.com/sign', data);
const encryptWithRetry = (data) => axiosRetry('https://kyber-api-1.onrender.com/encrypt', data);
const decryptWithRetry = (data) => axiosRetry('https://kyber-api-1.onrender.com/decrypt', data);
const verifyWithRetry = (data) => axiosRetry('https://kyber-api-1.onrender.com/verify', data);


export const sendMessage = async (req, res) => {
  try {
    const { message, selectedKeySize } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const file = req.file;

    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.publicKey) {
      return res.status(400).json({ error: "Receiver not found or missing public key." });
    }

    const signResponse = await signWithRetry({
      message,
      ml_dsa_variant: "ML-DSA-44",
      private_key: req.user.secretKeyDSA
    });

    const { signature } = signResponse.data;

    console.log("🔏 Mensaje firmado:", message);
    console.log("🔏 Firma generada:", signature);

    const encryptionResponse = await encryptWithRetry({
      kem_name: "ML-KEM-512",
      message,
      public_key: receiver.publicKey
    });

    const { ciphertext, shared_secret } = encryptionResponse.data;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({ participants: [senderId, receiverId] });
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      message: ciphertext,
      sharedSecret: shared_secret,
      signature,
      publicKeyDSA: req.user.publicKeyDSA,
      fileUrl: file ? file.path : null,
      verified: false
    });

    if (newMessage) conversation.messages.push(newMessage._id);

    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: ciphertext,
        sharedSecret: newMessage.sharedSecret,
        fileUrl: newMessage.fileUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const decryptionResponse = await decryptWithRetry({
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
    const { selectedKeySize } = req.query;
    const senderId = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    const receiver = await User.findById(userToChatId);
    if (!receiver || !receiver.secretKey) {
      return res.status(400).json({ error: "Receiver not found or missing secret key." });
    }

    const decryptedMessages = await Promise.all(conversation.messages.map(async (msg) => {
      try {
        const decryptionResponse = await decryptWithRetry({
          kem_name: "ML-KEM-512",
          ciphertext: msg.message,
          shared_secret: msg.sharedSecret
        });

        const decryptedText = decryptionResponse.data.original_message;

        console.log("🔓 Mensaje descifrado:", decryptedText);
        console.log("🔎 Firma recibida:", msg.signature);
        console.log("🔎 Clave pública usada:", msg.publicKeyDSA);

        const verifyResponse = await verifyWithRetry({
          message: decryptedText,
          signature: msg.signature,
          public_key: msg.publicKeyDSA,
          ml_dsa_variant: "ML-DSA-44"
        });

        msg.verified = !!verifyResponse.data.verified;
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
    logDetailedError("getMessages", error);
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

