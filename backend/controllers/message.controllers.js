import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
import axios from 'axios';
import User from "../models/user.model.js";
import { logDetailedError } from "../utils/logErrorDetails.js";
import { ENV_CONFIG } from "../config/environment.js";
import cloudinary from "../utils/cloudinary.js";
import { cryptoCache } from "../utils/cache.js";
import { cryptoMonitor } from "../utils/monitor.js";

const axiosRetry = async (url, data, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await axios.post(url, data);
    } catch (error) {
      console.log(`🔄 [axiosRetry] Attempt ${i + 1}/${retries} failed:`, error.response?.status);

      // Si es rate limiting, esperar más tiempo con backoff exponencial más largo
      if (error.response?.status === 429) {
        // Backoff exponencial más largo: 5s, 10s, 20s, 40s, 80s
        const waitTime = Math.pow(2, i) * 5000; // 5s, 10s, 20s, 40s, 80s
        console.log(`⏳ [axiosRetry] Rate limited, waiting ${waitTime / 1000}s before retry`);
        await new Promise(r => setTimeout(r, waitTime));
      } else {
        // Para otros errores, esperar 2 segundos
        await new Promise(r => setTimeout(r, 2000));
      }

      if (i === retries - 1) throw error;
    }
  }
};

const signWithRetry = async (data) => {
  // Verificar caché primero
  const cached = cryptoCache.get('sign', data);
  if (cached) {
    console.log('📦 [signWithRetry] Cache hit for sign operation');
    cryptoMonitor.recordOperation('sign', true, true);
    return cached;
  }

  try {
    // Si no está en caché, hacer la llamada
    const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/sign`, data);
    cryptoCache.set('sign', data, result);
    cryptoMonitor.recordOperation('sign', true, false);
    return result;
  } catch (error) {
    const errorType = error.response?.status === 429 ? 'rate_limit' : 'other';
    cryptoMonitor.recordOperation('sign', false, false, errorType);
    throw error;
  }
};

const encryptWithRetry = async (data) => {
  const cached = cryptoCache.get('encrypt', data);
  if (cached) {
    console.log('📦 [encryptWithRetry] Cache hit for encrypt operation');
    cryptoMonitor.recordOperation('encrypt', true, true);
    return cached;
  }

  try {
    const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/encrypt`, data);
    cryptoCache.set('encrypt', data, result);
    cryptoMonitor.recordOperation('encrypt', true, false);
    return result;
  } catch (error) {
    const errorType = error.response?.status === 429 ? 'rate_limit' : 'other';
    cryptoMonitor.recordOperation('encrypt', false, false, errorType);
    throw error;
  }
};

const decryptWithRetry = async (data) => {
  const cached = cryptoCache.get('decrypt', data);
  if (cached) {
    console.log('📦 [decryptWithRetry] Cache hit for decrypt operation');
    return cached;
  }

  const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/decrypt`, data);
  cryptoCache.set('decrypt', data, result);
  return result;
};

const verifyWithRetry = async (data) => {
  const cached = cryptoCache.get('verify', data);
  if (cached) {
    console.log('📦 [verifyWithRetry] Cache hit for verify operation');
    return cached;
  }

  const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/verify`, data);
  cryptoCache.set('verify', data, result);
  return result;
};

const bulkDecryptResponse = async (data) => {
  const cached = cryptoCache.get('bulkDecrypt', data);
  if (cached) {
    console.log('📦 [bulkDecryptResponse] Cache hit for bulkDecrypt operation');
    return cached;
  }

  const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/bulkDecrypt`, data);
  cryptoCache.set('bulkDecrypt', data, result);
  return result;
};

const bulkVerifyResponse = async (data) => {
  const cached = cryptoCache.get('bulkVerify', data);
  if (cached) {
    console.log('📦 [bulkVerifyResponse] Cache hit for bulkVerify operation');
    return cached;
  }

  const result = await axiosRetry(`${ENV_CONFIG.PQCLEAN_API_URL}/bulkVerify`, data);
  cryptoCache.set('bulkVerify', data, result);
  return result;
};

export const sendMessage = async (req, res) => {
  try {
    const { message, selectedKeySize } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    const file = req.file;

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;

    if (file) {
      const extension = file.originalname.split('.').pop() || '';
      const cleanBaseName = file.originalname
        .split('.')[0]
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40);

      fileName = `${cleanBaseName}.${extension}`;
      fileUrl = file.path;
      try {
        const publicId = file.filename || file.public_id;
        if (publicId) {
          const cloudinaryInfo = await cloudinary.api.resource(publicId, {
            resource_type: 'auto'
          });

          // 🔧 SEARCH SIZE IN CLOUDINARY RESPONSE
          fileSize = cloudinaryInfo.bytes || cloudinaryInfo.size || file.size;
        }
      } catch (cloudinaryError) {
        console.log('📁 Error getting Cloudinary info:', cloudinaryError);
        fileSize = file.size; // Fallback to Multer size
      }

      console.log('📁 File uploaded:', fileName, `(${(fileSize / 1024).toFixed(1)} KB)`);
    }

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

    console.log("Id de la conversacion:", conversation._id);
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: ciphertext,
      sharedSecret: shared_secret,
      signature,
      publicKeyDSA: req.user.publicKeyDSA,
      fileUrl: file ? file.path : null,
      fileName: file ? fileName : null,
      fileSize: file ? fileSize : null,
      verified: false,
    });

    // Now that the message is already saved, you can push its ID
    conversation.messages.push(newMessage._id);
    await conversation.save();

    const decryptionResponse = await decryptWithRetry({
      kem_name: selectedKeySize,
      ciphertext: newMessage.message,
      shared_secret: newMessage.sharedSecret
    });

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: decryptionResponse.data.original_message,
        sharedSecret: newMessage.sharedSecret,
        fileUrl: newMessage.fileUrl,
        fileName: newMessage.fileName,
        fileSize: newMessage.fileSize,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }


    res.status(201).json({
      ...newMessage._doc,
      message: decryptionResponse.data.original_message,
    });
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
    });

    if (!conversation) return res.status(200).json([]);

    const receiver = await User.findById(userToChatId);
    if (!receiver || !receiver.secretKey) {
      return res.status(400).json({ error: "Receiver not found or missing secret key." });
    }

    const messages = await Message.find({ _id: { $in: conversation.messages } })
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    if (!messages.length) return res.status(200).json([]);

    // 1. Preparar el bulkDecrypt
    const bulkDecryptInput = messages.map(msg => ({
      ciphertext: msg.message,
      shared_secret: msg.sharedSecret
    }));

    let bulkDecryptResult;
    try {
      bulkDecryptResult = await bulkDecryptResponse({
        kem_name: "ML-KEM-512",
        messages: bulkDecryptInput
      });
    } catch (error) {
      if (error.response?.status === 429) {
        return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
      }
      console.error("Error in bulkDecrypt:", error.message);
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }

    const decryptedMessagesArray = bulkDecryptResult.data.results;

    // 2. Preparar el bulkVerify
    const bulkVerifyInput = decryptedMessagesArray.map((decrypted, index) => ({
      message: decrypted.original_message,
      signature: messages[index].signature,
      public_key: messages[index].publicKeyDSA,
      ml_dsa_variant: "ML-DSA-44"
    }));

    let bulkVerifyResult;
    try {
      bulkVerifyResult = await bulkVerifyResponse({
        messages: bulkVerifyInput
      });
    } catch (error) {
      if (error.response?.status === 429) {
        return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
      }
      console.error("Error in bulkVerify:", error.message);
      return res.status(503).json({ error: "Service temporarily unavailable. Please try again later." });
    }

    const verificationResults = bulkVerifyResult.data.results;

    // 3. Combinar descifrados + verificaciones
    const finalMessages = messages.map((msg, index) => ({
      ...msg,
      message: decryptedMessagesArray[index].original_message,
      verified: verificationResults[index].verified,
      fileUrl: msg.fileUrl || null,
      fileName: msg.fileName || null,
      fileSize: msg.fileSize || null
    }));

    res.status(200).json(finalMessages.reverse());
  } catch (error) {
    logDetailedError("getMessages", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const reactMessage = async (req, res) => {
  const { emoji, userId } = req.body;
  const messageId = req.params.id;

  const message = await Message.findById(messageId);
  if (!message) return res.status(404).send("Message not found");

  const existingReaction = message.reactions.find(
    (r) => r.userId === userId && r.emoji === emoji
  );

  if (existingReaction) {
    // Remove reaction (toggle)
    message.reactions = message.reactions.filter(
      (r) => !(r.userId === userId && r.emoji === emoji)
    );
  } else {
    // Add reaction
    message.reactions.push({ emoji, userId });
  }

  await message.save();
  res.send(message.reactions);
};