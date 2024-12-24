import mongoose from 'mongoose';

const FriendRequestNotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who receives the friend request
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who sent the friend request
  message: { 
    type: String, 
    required: true 
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

const FriendRequestNotification = mongoose.models.FriendRequestNotification || mongoose.model('FriendRequestNotification', FriendRequestNotificationSchema);
export default FriendRequestNotification;