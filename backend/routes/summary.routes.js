import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import Conversation from "../models/conversation.model.js";
import Community from "../models/community.model.js";

dotenv.config();
const router = express.Router();

const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/facebook/bart-large-cnn";
const HUGGINGFACE_API_KEY = process.env.HUGGINFACE_API_KEY;

router.post("/", async (req, res) => {
  try {
    const { ids, type, limit = 50 } = req.body;
    const { selectedKeySize } = req.query;

    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: "IDs are required." });
    }

    let messages = [];

    if (type === "user") {
      const conversations = await Conversation.find({ _id: { $in: ids } })
        .populate({
          path: "messages",
          options: { sort: { createdAt: -1 }, limit: limit },
        })
        .lean();

      conversations.forEach(conv => {
        if (conv.messages) messages = messages.concat(conv.messages);
      });
    } else if (type === "community") {
      const community = await Community.findById(ids[0])
        .populate({
          path: "messages",
          options: { sort: { createdAt: -1 }, limit: limit },
        })
        .lean();

      if (community && community.messages) {
        messages = community.messages;
      }
    }

    if (!messages.length) {
      return res.status(404).json({ error: "No messages found." });
    }

    const messagesForDecryption = messages.map(msg => ({
      ciphertext: msg.message,
      shared_secret: msg.sharedSecret,
    }));

    // 🔵 Llamamos a la nueva API bulkDecrypt
    const decryptionResponse = await axios.post("http://localhost:5001/bulkDecrypt", {
      kem_name: selectedKeySize || "ML-KEM-512",
      messages: messagesForDecryption,
    });

    const decryptedResults = decryptionResponse.data.results;

    let concatenatedMessages = "";
    decryptedResults.forEach(result => {
      concatenatedMessages += result.original_message + " ";
    });

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
