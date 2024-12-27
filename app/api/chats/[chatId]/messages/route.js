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

    const chat = await Chat.findById(chatId)
      .populate({
        path: "messages",
        populate: { path: "sender", select: "firstName lastName image" },
      })
      .populate("participants", "-password");

    if (!chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    // Check if the user is a member of the chat
    const isMember = chat.participants.some(
      (member) => member._id.toString() === session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this chat." },
        { status: 403 }
      );
    }

    return NextResponse.json(chat.messages, { status: 200 });
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

  const { chatId } = params; // Ensure correct destructuring
  console.log(`POST request received for chatId: ${chatId}`); // Added log

  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Message content cannot be empty." },
        { status: 400 }
      );
    }

    await DbConnect();

    const chat = await Chat.findById(chatId).populate("participants", "-password");

    if (!chat) {
      return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    }

    // Check if the user is a member of the chat
    const isMember = chat.participants.some(
      (member) => member._id.toString() === session.user.id
    );

    if (!isMember) {
      return NextResponse.json(
        { error: "You are not a member of this chat." },
        { status: 403 }
      );
    }

    // Create a new message
    const message = await Message.create({
      sender: session.user.id,
      chat: chatId,
      content: content.trim(),
      createdAt: new Date(),
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.messages.push(message._id);
    await chat.save();

    // Populate sender details
    await message.populate("sender", "firstName lastName image");

    // Create a chat notification for other participants
    const otherParticipants = chat.participants.filter(
      (participant) => participant._id.toString() !== session.user.id
    );

    await ChatNotification.create(
      otherParticipants.map((participant) => ({
        user: participant._id,
        chatId: chat._id,
        sender: session.user.id,
        messageSnippet: content.trim().substring(0, 50),
      }))
    );

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message." },
      { status: 500 }
    );
  }
}