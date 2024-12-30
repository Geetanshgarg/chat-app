import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, friendUsername, isGroup, groupName } = await request.json();

    if (!username || (!isGroup && !friendUsername)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await DbConnect();

    // Find both users by username
    const [user, friend] = await Promise.all([
      User.findOne({ username }),
      friendUsername ? User.findOne({ username: friendUsername }) : null
    ]);

    if (!user || (!isGroup && !friend)) {
      return NextResponse.json(
        { error: "One or both users not found" },
        { status: 404 }
      );
    }

    // Check for existing chat more thoroughly
    if (!isGroup) {
      const existingChat = await Chat.findOne({
        isGroup: false,
        participants: {
          $all: [user._id, friend._id],
          $size: 2
        }
      }).populate("participants", "username firstName lastName image");

      if (existingChat) {
        return NextResponse.json({ 
          chat: existingChat,
          existing: true 
        });
      }
    }

    // For group chats, check if a group with same name exists
    if (isGroup && groupName) {
      const existingGroup = await Chat.findOne({
        isGroup: true,
        name: groupName,
        participants: { $in: [user._id] }
      }).populate("participants", "username firstName lastName image");

      if (existingGroup) {
        return NextResponse.json({ 
          chat: existingGroup,
          existing: true 
        });
      }
    }

    // Create new chat only if it doesn't exist
    const chatData = {
      participants: isGroup ? [user._id, ...friendUsername] : [user._id, friend._id],
      isGroup: !!isGroup,
      name: groupName || null,
      createdBy: user._id
    };

    const newChat = await Chat.create(chatData);
    await newChat.populate("participants", "username firstName lastName image");

    return NextResponse.json({ 
      chat: newChat,
      existing: false 
    }, { status: 201 });
  } catch (error) {
    console.error("Chat creation error:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}