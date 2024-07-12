import Conversation from "../models/conversation.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { message} = req.body;
    const { id: receiverId } = req.params;
    const {senderId} = req.user._id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    console.log("conversation", conversation);
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    if(newMessage) {
      conversation.messages.push(newMessage);
      await conversation.save();
      res.status(201).json({newMessage});
    }
 } catch (error) {
   console.log("Error in sendMessage controller", error.message);
   res.status(500).json({ error: "Internal Server Error" });
 }
}