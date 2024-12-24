import { NextResponse } from "next/server";
import DbConnect from "@/lib/dbcon";
import ChatNotification from "@/models/ChatNotification";
import mongoose from 'mongoose';

export async function POST(req) {
  try {
    const { userId, chatId, senderId, messageSnippet } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(userId) || 
        !mongoose.Types.ObjectId.isValid(chatId) || 
        !mongoose.Types.ObjectId.isValid(senderId)) {
      return new Response(
        JSON.stringify({ message: "Invalid ID format." }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    const notification = new ChatNotification({
      user: userId,
      chatId,
      sender: senderId,
      messageSnippet
    });

    await notification.save();

    return new Response(
      JSON.stringify({ message: "Chat notification created successfully." }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat Notification API Error:', error);
    return new Response(
      JSON.stringify({ message: "Server error" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}