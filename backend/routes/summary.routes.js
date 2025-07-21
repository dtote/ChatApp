import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import { GoogleGenAI } from "@google/genai";
import Conversation from "../models/conversation.model.js";
import Community from "../models/community.model.js";
import { ENV_CONFIG } from "../config/environment.js";

// Helper function to extract topics from conversation
const extractTopics = (messages) => {
  const allText = messages.map(msg => msg.original_message).join(' ').toLowerCase();
  const topics = [];

  // Simple topic detection
  if (allText.includes('how are you') || allText.includes('feeling')) {
    topics.push('well-being check');
  }
  if (allText.includes('work') || allText.includes('job')) {
    topics.push('work-related');
  }
  if (allText.includes('family') || allText.includes('home')) {
    topics.push('personal life');
  }
  if (allText.includes('weather') || allText.includes('day')) {
    topics.push('casual conversation');
  }

  return topics.length > 0 ? `Topics discussed: ${topics.join(', ')}.` : 'General conversation.';
};

// Helper function to get key topics from conversation
const getKeyTopics = (messages) => {
  const allText = messages.map(msg => msg.original_message).join(' ').toLowerCase();
  const keyPhrases = [];

  // Extract key phrases
  if (allText.includes('how are you feeling')) {
    keyPhrases.push('well-being inquiry');
  }
  if (allText.includes('feel great') || allText.includes('feel good')) {
    keyPhrases.push('positive mood');
  }
  if (allText.includes('today')) {
    keyPhrases.push('current status');
  }
  if (allText.includes('really')) {
    keyPhrases.push('detailed feelings');
  }

  return keyPhrases.length > 0 ? keyPhrases.join(', ') : 'general chat';
};

// Helper function to create manual summary
const createManualSummary = (decryptedResults) => {
  const messageCount = decryptedResults.length;
  const topics = extractTopics(decryptedResults);
  const keyTopics = getKeyTopics(decryptedResults);
  return `Conversation summary: ${messageCount} messages exchanged. ${topics} Key topics: ${keyTopics}`;
};

dotenv.config();
const router = express.Router();

// Use Gemini for conversation summarization
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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
    const decryptionResponse = await axios.post(`${ENV_CONFIG.PQCLEAN_API_URL}/bulkDecrypt`, {
      kem_name: selectedKeySize || "ML-KEM-512",
      messages: messagesForDecryption,
    });

    const decryptedResults = decryptionResponse.data.results;

    // Format messages for better conversation summarization
    let formattedConversation = "";
    decryptedResults.forEach((result, index) => {
      // Add speaker labels and format as conversation
      const speaker = index % 2 === 0 ? "User" : "Other";
      formattedConversation += `${speaker}: ${result.original_message}\n`;
    });

    let summary = "";

    // Use Gemini for conversation summarization
    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const model = ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: [{
          role: "user",
          parts: [{
            text: `Please provide a summary of this conversation. If it's short (under 10 messages), use 1-2 sentences. If it's longer, use 2-3 sentences but keep it concise and focus on the main topics discussed:\n\n${formattedConversation}`
          }]
        }]
      });

      const response = await model;
      summary = response?.candidates?.[0]?.content?.parts?.[0]?.text || "No summary generated.";
      console.log('🤖 [Summary] Gemini response:', summary);
    } catch (geminiError) {
      console.log('🤖 [Summary] Gemini failed, using manual summary:', geminiError.message);
      summary = createManualSummary(decryptedResults);
    }

    res.json({ summary });
  } catch (error) {
    console.error("Error summarizing conversation:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to summarize conversation." });
  }
});

export default router;
