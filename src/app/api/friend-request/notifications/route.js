import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import FriendRequestNotification from "@/models/FriendRequestNotification";
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ message: "Invalid user ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    const notifications = await FriendRequestNotification.find({ user: userId})
      .populate('requester', 'firstName lastName username image')
      .sort('-createdAt');

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get Friend Request Notifications Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch friend request notifications." },
      { status: 500 }
    );
  }
}