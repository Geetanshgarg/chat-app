import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import ChatNotification from "@/models/ChatNotification";
import mongoose from 'mongoose';

export async function GET(req) {
  try {
    const { userId } = req.nextUrl.searchParams;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ message: "Invalid user ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    const notifications = await ChatNotification.find({ user: userId, read: false })
      .populate('sender', 'firstName lastName username image')
      .sort('-createdAt');

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Get Chat Notifications Error:', error);
    return NextResponse.json(
      { error: "Failed to fetch chat notifications." },
      { status: 500 }
    );
  }
}