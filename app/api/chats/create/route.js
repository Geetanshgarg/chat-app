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
    const { userId, friendId, isGroup, groupName } = await request.json(); // Accept isGroup and groupName
    console.log("Received create chat request:", { userId, friendId, isGroup, groupName });

    if (isGroup) {
      // Handle group chat creation
      if (!groupName || !Array.isArray(friendId) || friendId.length < 2) {
        return NextResponse.json({ error: "Group name and at least two friends are required." }, { status: 400 });
      }

      const participants = [userId, ...friendId];
      // Verify all participants exist
      const users = await User.find({ _id: { $in: participants } });
      if (users.length !== participants.length) {
        return NextResponse.json({ error: "One or more users not found." }, { status: 404 });
      }

      // Check if a group chat already exists with the same participants
      let chat = await Chat.findOne({
        participants: { $all: participants },
        isGroup: true,
      }).populate("participants", "-password");

      if (chat) {
        return NextResponse.json({ message: "Group chat already exists.", chat }, { status: 200 });
      }

      // Create a new group chat
      chat = new Chat({
        participants,
        isGroup: true,
        name: groupName,
      });

      await chat.save();
      chat = await chat.populate("participants", "firstName lastName image");

      return NextResponse.json({ chat }, { status: 201 });
    }

    if (!userId || !friendId) {
      return NextResponse.json({ error: "User ID and Friend ID are required." }, { status: 400 });
    }

    await DbConnect();

    // Verify both users exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!user || !friend) {
      return NextResponse.json({ error: "One or both users not found." }, { status: 404 });
    }

    // Check if a chat already exists between these users
    let chat = await Chat.findOne({
      participants: { $all: [userId, friendId] },
      isGroup: false,
    }).populate("participants", "-password");

    if (chat) {
      return NextResponse.json({ message: "Chat already exists.", chat }, { status: 200 });
    }

    // Create a new chat
    chat = new Chat({
      participants: [userId, friendId],
      isGroup: false,
    });

    await chat.save();

    // Populate participants' data
    chat = await chat.populate("participants", "firstName lastName image");

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Failed to create chat." }, { status: 500 });
  }
}