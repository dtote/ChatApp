import mongoose, { mongo } from "mongoose";

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  publicKeyDSA: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sharedSecret: {
    type: String,  // Clave secreta compartida entre el remitente y el receptor
    required: true,
  },
  fileUrl: {
    type: String,  // URL donde se almacena el PDF
    default: null,
  },
  verified: { type: Boolean, default: false },
  //createAt, updateAt
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;