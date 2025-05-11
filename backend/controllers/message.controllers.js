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
      verified: false,
    });

    // Ahora que el mensaje ya está guardado, puedes pushear su ID
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    

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
    });

    if (!conversation) return res.status(200).json([]);

    const receiver = await User.findById(userToChatId);
    if (!receiver || !receiver.secretKey) {
      return res.status(400).json({ error: "Receiver not found or missing secret key." });
    }

    const messages = await Message.find({ _id: { $in: conversation.messages } })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    if (!messages.length) return res.status(200).json([]);

    // 1. Preparar el bulkDecrypt
    const bulkDecryptInput = messages.map(msg => ({
      ciphertext: msg.message,
      shared_secret: msg.sharedSecret
    }));

    const bulkDecryptResponse = await axios.post('https://kyber-api-1.onrender.com/bulkDecrypt', {
      kem_name: "ML-KEM-512",
      messages: bulkDecryptInput
    });

    const decryptedMessagesArray = bulkDecryptResponse.data.results;

    // 2. Preparar el bulkVerify
    const bulkVerifyInput = decryptedMessagesArray.map((decrypted, index) => ({
      message: decrypted.original_message,
      signature: messages[index].signature,
      public_key: messages[index].publicKeyDSA,
      ml_dsa_variant: "ML-DSA-44"
    }));

    const bulkVerifyResponse = await axios.post('https://kyber-api-1.onrender.com/bulkVerify', {
      messages: bulkVerifyInput
    });

    const verificationResults = bulkVerifyResponse.data.results;

    // 3. Combinar descifrados + verificaciones
    const finalMessages = messages.map((msg, index) => ({
      ...msg,
      message: decryptedMessagesArray[index].original_message,
      verified: verificationResults[index].verified,
      fileUrl: msg.fileUrl || null
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