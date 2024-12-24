import mongoose from 'mongoose';

// ...existing code...
const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // Add name for group chats
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, {
  timestamps: true,
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
