import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, props) {
  try {
    await DbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = (await props.params);
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Updated query to populate lastMessage
    const chats = await Chat.find({
      participants: user._id
    })
    .populate("participants", "username firstName lastName image")
    .populate({
      path: "lastMessage",
      select: "text createdAt readBy",
      populate: {
        path: "sender",
        select: "firstName lastName _id"
      }
    })
    .populate({
      path: "messages",
      select: "sender readBy createdAt",
      populate: {
        path: "sender",
        select: "_id"
      }
    })
    .sort({ updatedAt: -1 });

    return NextResponse.json(chats);
    
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" }, 
      { status: 500 }
    );
  }
}