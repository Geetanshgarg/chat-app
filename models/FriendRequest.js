import mongoose from 'mongoose';

const FriendRequestSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who sends the friend request
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }, // The user who receives the friend request
  status: { 
    type: String, 
    enum: ['accepted', 'declined' , 'pending'], 
    default: 'pending' 
  },
}, { 
  timestamps: true 
});
FriendRequestSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const FriendRequest = mongoose.models.FriendRequest || mongoose.model('FriendRequest', FriendRequestSchema);
export default FriendRequest;