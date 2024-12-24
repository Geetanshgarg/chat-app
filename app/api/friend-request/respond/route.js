import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import FriendRequest from "@/models/FriendRequest";
import User from "@/models/User";
import DbConnect from "@/lib/dbcon";
import mongoose from "mongoose";
import FriendRequestNotification from "@/models/FriendRequestNotification";

export async function POST(req, context) {
  try {
    // Parse the JSON body of the request
    const { requestId, action } = await req.json();

    // Validate presence and type of requestId
    if (!requestId || typeof requestId !== 'string') {
      return new Response(
        JSON.stringify({ message: "Invalid or missing request ID." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate action
    if (!['accepted', 'declined'].includes(action)) {
      return new Response(
        JSON.stringify({ message: "Invalid action. Must be 'accepted' or 'declined'." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return new Response(
        JSON.stringify({ message: "Invalid request ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get the current session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized." }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    // Find the friend request by ID
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return new Response(
        JSON.stringify({ message: "Friend request not found." }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure the current user is the recipient of the friend request
    if (friendRequest.recipient.toString() !== session.user.id) {
      return new Response(
        JSON.stringify({ message: "You are not authorized to respond to this friend request." }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Ensure the friend request is still pending
    if (friendRequest.status !== 'pending') {
      return new Response(
        JSON.stringify({ message: `Friend request has already been ${friendRequest.status}.` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'accepted') {
      // Add each user to the other's friends list using $addToSet to avoid duplicates
      await User.findByIdAndUpdate(friendRequest.requester, {
        $addToSet: { friends: session.user.id }
      });

      await User.findByIdAndUpdate(session.user.id, {
        $addToSet: { friends: friendRequest.requester }
      });

      // Update the friend request status to 'accepted'
      friendRequest.status = 'accepted';
    } else if (action === 'declined') {
      // Update the friend request status to 'declined'
      friendRequest.status = 'declined';
    }

    // Save the updated friend request
    await friendRequest.save();
    // Remove or update the notification
    await FriendRequestNotification.findOneAndDelete({
      user: session.user.id,
      requester: friendRequest.requester
    });
    return new Response(
      JSON.stringify({ message: `Friend request successfully ${action}.` }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Respond Friend Request API Error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}