import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import FriendRequestNotification from "@/models/FriendRequestNotification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { message: "Invalid user ID format." },
        { status: 400 }
      );
    }

    // Connect to the database
    await DbConnect();

    await FriendRequestNotification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({ message: "Friend requests marked as read." });
  } catch (error) {
    console.error('Mark Friend Requests as Read Error:', error);
    return NextResponse.json(
      { message: "Failed to mark friend requests as read." },
      { status: 500 }
    );
  }
}