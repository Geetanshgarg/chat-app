import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DbConnect();
    const { chatId } = params;

    // Update all unread messages in this chat
    const result = await Message.updateMany(
      {
        conversation: chatId,
        sender: { $ne: session.user.id },
        readBy: { $ne: session.user.id }
      },
      {
        $addToSet: { readBy: session.user.id }
      }
    );

    if (result.modifiedCount > 0) {
      // Get updated messages to send back
      const updatedMessages = await Message.find({
        conversation: chatId,
        readBy: session.user.id
      }).select('_id readBy');

      // Notify other clients about read messages
      global.io?.to(chatId).emit('messages-read', {
        userId: session.user.id,
        chatId,
        updatedMessages
      });
    }

    return NextResponse.json({ 
      success: true, 
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" }, 
      { status: 500 }
    );
  }
}
