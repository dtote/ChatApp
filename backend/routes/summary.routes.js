import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import Conversation from "../models/conversation.model.js";

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
        path: "messages",
        options: {
          sort: { createdAt: -1 },
          limit: limit,
        },
      })
      .lean();

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found." });
    }

    // 🔵 Preparamos la lista de mensajes para desencriptar en lote
    const messagesForDecryption = conversation.messages.map((msg) => ({
      ciphertext: msg.message,
      shared_secret: msg.sharedSecret,
    }));

    // 🔵 Llamamos a la nueva API bulkDecrypt
    const decryptionResponse = await axios.post("https://kyber-api-1.onrender.com/bulkDecrypt", {
      kem_name: selectedKeySize || "ML-KEM-512",
      messages: messagesForDecryption,
    });

    const decryptedResults = decryptionResponse.data.results;

    // 🔵 Concatenamos todos los textos descifrados
    let concatenatedMessages = "";
    decryptedResults.forEach((result) => {
      concatenatedMessages += result.original_message + " ";
    });

    // 🔵 Hacemos el resumen usando HuggingFace
    const huggingfaceResponse = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: concatenatedMessages },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const summary = huggingfaceResponse.data[0]?.summary_text || "No summary generated.";
    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing conversation:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to summarize conversation." });
  }
});

export default router;
