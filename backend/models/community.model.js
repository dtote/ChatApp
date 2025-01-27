import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // Relación con usuarios
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],   // Administradores
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],  // Mensajes de la comunidad
  publicKey: { type: String, required: true },  // Clave pública de la comunidad
  privateKey: { type: String, required: true },  // Clave privada de la comunidad
}, { timestamps: true }) ;

const Community = mongoose.model("Community", communitySchema);

export default Community;

