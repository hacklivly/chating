import mongoose from 'mongoose';

const ConversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now },
}, { timestamps: true });

ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);
