import express from "express";
import User from "../models/user.model.js";
import Community from "../models/community.model.js";
import Conversation from "../models/conversation.model.js";
import { protectRoute } from '../middleware/protectRoute.js';


const router = express.Router();

router.get("/search", protectRoute, async (req, res) => {

  try {
    const { name } = req.query;
    const userId = req.user._id;  // Make sure you have auth middleware for req.user

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Case-insensitive search
    const user = await User.findOne({ username: { $regex: new RegExp(`^${name}$`, 'i') } });
    const community = !user ? await Community.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }) : null;

    if (!user && !community) {
      return res.status(404).json({
        error: `No user or community found with name "${name}". Please check the spelling and try again.`
      });
    }

    if (user) {
      const conversation = await Conversation.findOne({
        participants: { $all: [userId, user._id] },
      });

      if (!conversation) {
        return res.status(404).json({
          error: `No conversation found with user "${name}". You may need to start a conversation first.`
        });
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
