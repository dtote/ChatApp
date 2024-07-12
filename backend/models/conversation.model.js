import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  
  participants: {
    type: Array,
  },
  messages: {
    type: Array,
    ref: 'Message',
    default: []
  }
  //createAt, updateAt
}, { timestamps: true });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;