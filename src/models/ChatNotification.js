import mongoose from 'mongoose';

const ChatNotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who receives the chat notification
  chatId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chat', 
    required: true 
  }, // The related chat
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who sent the message
  messageSnippet: { 
    type: String, 
    required: true 
  }, // A snippet of the message
  read: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const ChatNotification = mongoose.models.ChatNotification || mongoose.model('ChatNotification', ChatNotificationSchema);
export default ChatNotification;