import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import FriendRequestNotification from "@/models/FriendRequestNotification";
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    await DbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    const { userId } = await req.json();
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ error: "Invalid user ID format" }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check if users exist
    const [sender, recipient] = await Promise.all([
      User.findById(session.user.id),
      User.findById(userId)
    ]);

    if (!recipient) {
      return new Response(
        JSON.stringify({ error: "Recipient not found" }), 
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    if (session.user.id === userId) {
      return new Response(
        JSON.stringify({ error: "Cannot send friend request to yourself" }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check existing friendship
    if (sender.friends?.includes(userId)) {
      return new Response(
        JSON.stringify({ error: "Already friends with this user" }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check existing request
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { requester: session.user.id, recipient: userId },
        { requester: userId, recipient: session.user.id }
      ],
      status:  "pending"
    });

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: "Friend request already exists" }), 
        { 
          status: 409, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create friend request
    const friendRequest = await FriendRequest.create({
      requester: session.user.id,
      recipient: userId,
      status: 'pending'
    });

    // Create a friend request notification
    const notification = new FriendRequestNotification({
      user: userId,
      requester: session.user.id,
      message: `${sender.firstName} ${sender.lastName} sent you a friend request.`,
      read: false
    });
    
    await notification.save();

    return new Response(
      JSON.stringify({ 
        message: "Friend request sent successfully",
        requestId: friendRequest._id 
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Friend Request Error:', error);
    
    if (error.name === 'ValidationError') {
      return new Response(
        JSON.stringify({ 
          error: "Validation error", 
          details: Object.values(error.errors).map(err => err.message)
        }), 
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}