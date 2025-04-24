import User from "../models/user.model.js";

export const getUserforSidebars = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const filteredUser = await User.find({ _id: { $ne: loggedInUserId } }).select(-"password");

    res.status(200).json({ filteredUser });
  } catch (error) {
    console.log("Error in getUserforSidebars controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }

}

// Controlador para obtener el profilePic de un usuario por su ID
export const getUserProfilePic = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('profilePic');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({ profilePic: user.profilePic });
  } catch (error) {
    console.error('Error en getUserProfilePic:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getUserPopupData = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId).select('email username publicKey');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      email: user.email,
      username: user.username,
      publicKey: user.publicKey,
    });
  } catch (error) {
    console.error('Error en getUserPopupData:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const getPublicKey = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.publicKey) {
    return res.status(404).json({ error: 'Public key not found' });
  }
  res.json({ publicKey: user.publicKey });
}