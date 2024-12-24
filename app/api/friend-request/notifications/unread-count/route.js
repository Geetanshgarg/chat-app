import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import FriendRequestNotification from "@/models/FriendRequestNotification";
import mongoose from 'mongoose';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    // Extract userId from query parameters
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    // Validate userId existence
    if (!userId) {
      return new Response(
        JSON.stringify({ message: "Missing userId in query parameters." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ message: "Invalid user ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to the database
    await DbConnect();

    // Count unread friend request notifications
    const count = await FriendRequestNotification.countDocuments({ user: userId, read: false });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Get Unread Friend Request Count Error:', error);
    return NextResponse.json(
      { message: "Failed to fetch unread friend request count." },
      { status: 500 }
    );
  }
}