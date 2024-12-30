import mongoose from 'mongoose';
import Message from './Message';  // Import the Message model

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isGroup: { type: Boolean, default: false },
  name: { type: String }, // Add name for group chats
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
}, {
  timestamps: true,
});

// Make sure Message model is registered before using it in relations
mongoose.models = mongoose.models || {};
if (!mongoose.models.Message) {
  mongoose.model('Message', Message.schema);
}

const Chat = mongoose.models.Chat || mongoose.model('Chat', ChatSchema);

export default Chat;
