// models/Session.js
import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deviceInfo: { type: String, required: true },
    os: { type: String },
    browser: { type: String },
    country: { type: String },
    ip: { type: String },
    createdAt: { type: Date, default: Date.now }
  });

export default mongoose.model('Session', sessionSchema);
