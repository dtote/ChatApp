import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  publicKey: { type: String, required: true }, 
  privateKey: { type: String, required: true }, 
  publicKeyDSA: { type: String, required: false},
  privateKeyDSA: { type: String, required: false},
}, { timestamps: true }) ;

const Community = mongoose.model("Community", communitySchema);

export default Community;

