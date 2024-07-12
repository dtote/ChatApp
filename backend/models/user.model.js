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
  gender : {
    type: String,
    required: true,
    enum: ["male", "female"]
  },
  profilePic: {
    type: String,
    default: "",
  }
} , { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;