import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import FriendRequestNotification from "@/models/FriendRequestNotification";
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const { userId, requesterId, message } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(requesterId)) {
      return new Response(
        JSON.stringify({ message: "Invalid user ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    const notification = new FriendRequestNotification({
      user: userId,
      requester: requesterId,
      message
    });

    await notification.save();

    return new Response(
      JSON.stringify({ message: "Friend request notification created successfully." }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Friend Request Notification API Error:', error);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}