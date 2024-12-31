import mongoose from 'mongoose';
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },    // User's first name
  lastName: { type: String, required: true },     // User's last name
  email: { type: String, required: true, unique: true }, // User's email
  password: { type: String},     // User's password
  username: { 
    type: String, 
    unique: true, 
    sparse: true,
    required: true 
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true
  },
  chatNotifications: { type: Boolean, default: false },
  theme :{type : String , default: "dark"}, // Enable chat notifications
  image: { type: String, default: '/default-profile.png' }, // Profile image
  role: { type: String, enum: ['user', 'admin'], default: 'user' }, // User role
  emailVerified: { type: Date, default: null },    // Email verification timestamp
  bio: { type: String },             // Add this
  location: { type: String },        // Add this
  phone: { type: String },           // Add this
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Friends list
  chatBackground: { type: String, default: '/backgroundimages/1.jpeg' },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

// Add method to check if users are friends
UserSchema.methods.isFriendWith = function(userId) {
  return this.friends.some(friendId => 
    friendId.toString() === userId.toString()
  );
};

const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;