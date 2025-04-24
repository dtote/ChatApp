import express from "express";
import Conversation from "../models/conversation.model.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();
const router = express.Router();

const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";
const HUGGINGFACE_API_KEY = process.env.HUGGINFACE_API_KEY;

router.post("/", async (req, res) => {
  try {
    const { conversationId, limit = 50 } = req.body;
    const { selectedKeySize } = req.query;
    console.log("Conversation id:", conversationId);
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'messages',
        options: {
          sort: { createdAt: -1 }, 
          limit: limit,
        }
      })
      .lean();
    
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // Concatenar todos los mensajes en un solo bloque de texto
    let concatenatedMessages = '';

    const decryptedMessages = await Promise.all(conversation.messages.map(async (msg) => {
      try {
        // Descifrar el mensaje (solo el texto plano)
        const decryptionResponse = await axios.post('https://kyber-api-1.onrender.com/decrypt', {
          kem_name: selectedKeySize,
          ciphertext: msg.message,
          shared_secret: msg.sharedSecret
        });
      
        const decryptedText = decryptionResponse.data.original_message;
      
        console.log("1: ", decryptedText);
        concatenatedMessages += decryptedText + ' ';
      
        return decryptedText; 
      } catch (error) {
        console.error(`Error al procesar el mensaje: ${error}`);
        return '';
      }
    }));
   
      const response = await axios.post(
        HUGGINGFACE_API_URL,
        { inputs: concatenatedMessages },
        {
          headers: {
            Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

    const summary = response.data[0]?.summary_text || "No summary generated.";
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing conversation:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to summarize conversation." });
  }
});

export default router;
