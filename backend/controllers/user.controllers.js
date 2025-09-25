import User from "../models/user.model.js";

export const getUserforSidebars = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select(-"password");

    res.status(200).json({ filteredUser });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// Función para eliminar un usuario y actualizar sus mensajes
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete user directly
    // Messages remain but without sender information
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to get user information with fallback
export const getUserInfoWithFallback = async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to get the user
    const user = await User.findById(userId);

    if (user) {
      // User exists, return their data
      res.status(200).json({
        username: user.username,
        profilePic: user.profilePic,
        email: user.email,
        publicKey: user.publicKey,
        isDeleted: false
      });
    } else {
      // User doesn't exist (was deleted), return default data
      // We don't need to search in messages or do migration
      res.status(200).json({
        username: 'Deleted User',
        profilePic: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
        email: null,
        publicKey: null,
        isDeleted: true
      });
    }
  } catch (error) {
    // In case of error, return default data
    res.status(200).json({
      username: 'Deleted User',
      profilePic: 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg',
      email: null,
      publicKey: null,
      isDeleted: true
    });
  }
};

// Controller to get user profile picture by ID
export const getUserProfilePic = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('profilePic');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ profilePic: user.profilePic });
  } catch (error) {
    console.error('Error in getUserProfilePic:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserPopupData = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('email username publicKey');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      email: user.email,
      username: user.username,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error('Error in getUserPopupData:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPublicKey = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.publicKey) {
    return res.status(404).json({ error: 'Public key not found' });
  }
  res.json({ publicKey: user.publicKey });
}