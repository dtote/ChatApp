import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female"]
  },
  profilePic: {
    type: String,
    default: ""
  },
  faceDescriptor: {
    type: Array,
  },
  communities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Community' }],  // Comunidades a las que pertenece
  publicKey: {
    type: String,  
    required: true
  },
  secretKey: {
    type: String,  
    required: true
  },
  publicKeyDSA: {
    type: String,
    required: true
  },
  secretKeyDSA: {
    type: String,  
    required: true
  },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
