import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  type: { type: String, enum: ['text', 'image', 'gif'], default: 'text' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
