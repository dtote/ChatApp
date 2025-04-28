import express from "express";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import Conversation from "../models/conversation.model.js";
import {protectRoute} from '../middleware/protectRoute.js';


const router = express.Router();

router.get("/search", protectRoute, async (req, res) => {

  try {
    const { name } = req.query;
    const userId = req.user._id;  // Asegúrate de tener auth middleware para req.user

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const user = await User.findOne({ username: name });
    const community = !user ? await Community.findOne({ name }) : null;

    if (!user && !community) {
      return res.status(404).json({ error: "No user or community found with that name" });
    }

    if (user) {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, user._id] },
      });

      if (!conversation) {
        return res.status(404).json({ error: "No conversation found with that user" });
      }

      return res.json({ conversationIds: [conversation._id], type: "user" });
    }

    if (community) {
      return res.json({ conversationIds: [community._id], type: "community" });
    }
  } catch (error) {
    console.error("Error searching conversation:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
