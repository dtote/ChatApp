import express from "express";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import Conversation from "../models/conversation.model.js";
import {protectRoute} from '../middleware/protectRoute.js';


const router = express.Router();

// Proteger esta ruta
router.get("/search", protectRoute, async (req, res) => {
  try {
    const { name } = req.query;
    const authUserId = req.user._id; // ID del usuario autenticado

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Buscar usuario o comunidad por nombre
    const user = await User.findOne({ username: name });
    const community = !user ? await Community.findOne({ name }) : null;

    const participantId = user?._id || community?._id;

    if (!participantId) {
      return res.status(404).json({ error: "No user or community found with that name" });
    }

    // Buscar conversación donde estén ambos participantes
    const conversation = await Conversation.findOne({
      participants: { $all: [authUserId, participantId] },
    });

    if (!conversation) {
      return res.status(404).json({ error: "No conversation found with that participant" });
    }

    return res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error("Error searching conversation:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
