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

    const { username } = props.params;
    
    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all chats for user
    const chats = await Chat.find({
      participants: user._id
    }).populate("participants", "username firstName lastName image");

    return NextResponse.json(chats);
    
  } catch (error) {
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" }, 
      { status: 500 }
    );
  }
}