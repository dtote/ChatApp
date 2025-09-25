import Community from "../models/community.model.js";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";

// Function to get user information with fallback
const getUserInfoWithFallback = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (user) {
      return {
        _id: user._id,
        username: user.username,
        profilePic: user.profilePic,
        email: user.email,
        isDeleted: false
      };
    } else {
      // User doesn't exist (was deleted), return default data
      // We don't need to search in messages or do migration
      return {
        _id: userId,
        username: 'Deleted User',
        profilePic: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
        email: null,
        isDeleted: true
      };
    }
  } catch (error) {
    // In case of error, return default data
    return {
      _id: userId,
      username: 'Deleted User',
      profilePic: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
      email: null,
      isDeleted: true
    };
  }
};

// Get all communities with deleted user handling
export const getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('messages');

    // Process each community to handle deleted users
    const processedCommunities = await Promise.all(
      communities.map(async (community) => {
        // Process members
        const processedMembers = await Promise.all(
          community.members.map(userId => getUserInfoWithFallback(userId))
        );

        // Process administrators
        const processedAdmins = await Promise.all(
          community.admins.map(userId => getUserInfoWithFallback(userId))
        );

        return {
          ...community.toObject(),
          members: processedMembers,
          admins: processedAdmins
        };
      })
    );

    res.status(200).json(processedCommunities);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching communities', error: error.message });
  }
};

// Get a specific community with deleted user handling
export const getCommunityById = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findById(id).populate('messages');

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Process members
    const processedMembers = await Promise.all(
      community.members.map(userId => getUserInfoWithFallback(userId))
    );

    // Process administrators
    const processedAdmins = await Promise.all(
      community.admins.map(userId => getUserInfoWithFallback(userId))
    );

    const processedCommunity = {
      ...community.toObject(),
      members: processedMembers,
      admins: processedAdmins
    };

    res.status(200).json(processedCommunity);
  } catch (error) {
    console.error('Error in getCommunityById:', error);
    res.status(500).json({ message: 'Error fetching community', error: error.message });
  }
};

// Unirse a una comunidad
export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const community = await Community.findByIdAndUpdate(
      id,
      { $addToSet: { members: userId } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    console.error('Error in joinCommunity:', error);
    res.status(500).json({ message: 'Error joining community', error: error.message });
  }
};

// Salir de una comunidad
export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const community = await Community.findByIdAndUpdate(
      id,
      { $pull: { members: userId } },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json(community);
  } catch (error) {
    console.error('Error in leaveCommunity:', error);
    res.status(500).json({ message: 'Error leaving community', error: error.message });
  }
};

// Eliminar una comunidad
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const community = await Community.findByIdAndDelete(id);

    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.status(200).json({ message: 'Community deleted successfully' });
  } catch (error) {
    console.error('Error in deleteCommunity:', error);
    res.status(500).json({ message: 'Error deleting community', error: error.message });
  }
}; 