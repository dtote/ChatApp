import express from "express";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import Conversation from "../models/conversation.model.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Buscar el usuario o comunidad con ese nombre
    const user = await User.findOne({ username: name }); // o name, según tu esquema
    const community = !user ? await Community.findOne({ name }) : null;

    const participantId = user?._id || community?._id;

    if (!participantId) {
      return res.status(404).json({ error: "No user or community found with that name" });
    }

    // Buscar conversación donde el participante esté incluido
    const conversation = await Conversation.findOne({ participants: participantId });

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
