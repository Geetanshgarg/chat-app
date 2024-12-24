import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who receives the notification
  type: { 
    type: String, 
    enum: ['friend_request', 'friend_accept', 'other'], 
    required: true 
  },
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }, // The user who initiated the action
  message: { 
    type: String 
  },
  read: { 
    type: Boolean, 
    default: false 
  },
}, { 
  timestamps: true 
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export default Notification;