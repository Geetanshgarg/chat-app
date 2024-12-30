import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import DbConnect from "@/lib/dbcon";
import mongoose from "mongoose";

export async function GET(req, context) {
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return 'none' status
  if (!session) {
    return new Response(JSON.stringify({ status: 'none' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  
  const { params } = context;
  const { userId } = await params;

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return new Response(
      JSON.stringify({ status: 'none' }),
      { status: 203, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    await DbConnect();

    // Check if the profile user exists
    const profileUser = await User.findById(userId);
    if (!profileUser) {
      return new Response(
        JSON.stringify({ status: 'none' }),
        { status: 206, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if users are already friends
    const currentUser = await User.findById(session.user.id);
    if (currentUser.friends.includes(userId)) {
      return new Response(
        JSON.stringify({ status: 'friends' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the current user has sent a friend request to the profile user
    const sentRequest = await FriendRequest.findOne({
      requester: session.user.id,
      recipient: userId,
      status: 'pending'
    });

    if (sentRequest) {
      return new Response(
        JSON.stringify({ status: 'request_sent' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if the profile user has sent a friend request to the current user
    const receivedRequest = await FriendRequest.findOne({
      requester: userId,
      recipient: session.user.id,
      status: 'pending'  
    });

    if (receivedRequest) {
      return new Response(
        JSON.stringify({ status: 'request_received', requestId: receivedRequest._id }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // If none of the above, status is 'none'
    return new Response(
      JSON.stringify({ status: 'none' }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Friend Request Status API Error:', error);
    return new Response(
      JSON.stringify({ status: 'none', message: "Server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}