import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await DbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { friendUsername } = await req.json();
    
    const currentUser = await User.findOne({ username: session.user.username });
    const friend = await User.findOne({ username: friendUsername });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Find existing chat
    let chat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [currentUser._id, friend._id],
        $size: 2
      }
    }).populate("participants");

    // Create new chat if none exists
    if (!chat) {
      chat = await Chat.create({
        participants: [currentUser._id, friend._id],
        isGroup: false
      });
      chat = await chat.populate("participants");
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error("Error finding/creating chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
