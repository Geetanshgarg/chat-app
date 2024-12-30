import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import { NextResponse } from "next/server";
import ChatNotification from '@/models/ChatNotification'; // Import ChatNotification model

export async function GET(request, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = params; // Correct destructuring
  console.log(`GET request received for chatId: ${chatId}`); // Added log

  try {
    await DbConnect();

    const messages = await Message.find({ conversation: chatId })
      .populate("sender", "firstName lastName image _id")
      .sort({ createdAt: 1 });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages." },
      { status: 500 }
    );
  }
}

export async function POST(request, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = params;

  try {
    await DbConnect();
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty" },
        { status: 400 }
      );
    }

    // First validate the chat exists and user is a participant
    const chat = await Chat.findById(chatId)
      .populate("participants", "firstName lastName image username");

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const isMember = chat.participants.some(
      p => p._id.toString() === session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "Not authorized to send messages in this chat" },
        { status: 403 }
      );
    }

    // Create and save the message with correct field names
    const message = new Message({
      text: content.trim(), // Changed from content to text
      conversation: chatId, // Changed from chat to conversation
      sender: session.user.id,
      readBy: [session.user.id]
    });

    await message.save();
    await message.populate("sender", "firstName lastName image username");

    // Update the chat's lastMessage
    chat.lastMessage = message._id;
    chat.messages.push(message._id);
    await chat.save();

    // Return populated message
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName image username");

    return NextResponse.json(populatedMessage, { status: 201 });
  } catch (error) {
    console.error("Message creation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send message", 
        details: error.message,
        validationErrors: error.errors 
      },
      { status: 500 }
    );
  }
}