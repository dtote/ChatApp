import Community from "../models/community.model.js";
import User from "../models/user.model.js";
import { logDetailedError } from "../utils/logErrorDetails.js";

export const createCommunity = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const creatorId = req.user._id;

    const newCommunity = await Community.create({
      name,
      description,
      image,
      creator: creatorId,
      members: [creatorId]
    });

    res.status(201).json(newCommunity);
  } catch (error) {
    logDetailedError("createCommunity", error);
    res.status(500).json({ error: "Error al crear la comunidad" });
  }
};

export const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
      .populate('creator', 'username profilePic')
      .populate('members', 'username profilePic');
    
    res.status(200).json(communities);
  } catch (error) {
    logDetailedError("getCommunities", error);
    res.status(500).json({ error: "Error al obtener las comunidades" });
  }
};

export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id)
      .populate('creator', 'username profilePic')
      .populate('members', 'username profilePic');
    
    if (!community) {
      return res.status(404).json({ error: "Comunidad no encontrada" });
    }

    res.status(200).json(community);
  } catch (error) {
    logDetailedError("getCommunityById", error);
    res.status(500).json({ error: "Error al obtener la comunidad" });
  }
};

export const sendMessageToCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const senderId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: "Comunidad no encontrada" });
    }

    if (!community.members.includes(senderId)) {
      return res.status(403).json({ error: "No eres miembro de esta comunidad" });
    }

    community.messages.push({
      sender: senderId,
      content: message,
      timestamp: new Date()
    });

    await community.save();

    res.status(201).json({
      message: message,
      sender: senderId,
      timestamp: new Date()
    });
  } catch (error) {
    logDetailedError("sendMessageToCommunity", error);
    res.status(500).json({ error: "Error al enviar mensaje a la comunidad" });
  }
};

export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: "Comunidad no encontrada" });
    }

    if (community.creator.toString() !== userId.toString()) {
      return res.status(403).json({ error: "No tienes permiso para eliminar esta comunidad" });
    }

    await Community.findByIdAndDelete(id);

    res.status(200).json({ message: "Community deleted successfully" });
  } catch (error) {
    logDetailedError("deleteCommunity", error);
    res.status(500).json({ error: "Error al eliminar la comunidad" });
  }
}; 