import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    trim: true,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  messageType: {
    type: String,
    enum: ['text', 'voice'],
    required: true
  },
  duration: {
    type: Number,
    default: null
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  seenAt: {
    type: Map,
    of: Date,
    default: new Map()
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true }
});

// Add virtual for formatted timestamp
messageSchema.virtual('formattedTime').get(function() {
  return this.createdAt.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
});

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;