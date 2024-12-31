import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import ChatNotification from '@/models/ChatNotification'; // Import ChatNotification model

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DbConnect();
    const { chatId } = params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Add timestamp query parameter for pagination/lazy loading if needed
    const messages = await Message.find({ 
      conversation: chatId 
    })
    .populate("sender", "firstName lastName image _id username")
    .sort({ createdAt: 1 })
    .limit(50); // Limit initial load

    // Mark messages as read in background
    Message.updateMany(
      {
        conversation: chatId,
        sender: { $ne: session.user.id },
        readBy: { $ne: session.user.id }
      },
      { $addToSet: { readBy: session.user.id } }
    ).then(() => {
      global.io?.to(chatId).emit('messages-read', { 
        userId: session.user.id,
        chatId 
      });
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DbConnect();
    const { chatId } = params;
    const { content } = await request.json();

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const message = await Message.create({
      text: content.trim(),
      conversation: chatId,
      sender: session.user.id,
      readBy: [session.user.id]
    });

    await message.populate("sender", "firstName lastName image username");

    // Update chat's last message
    chat.lastMessage = message._id;
    await chat.save();

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}