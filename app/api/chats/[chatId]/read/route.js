import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Message from "@/models/Message";
import { NextResponse } from "next/server";

export async function POST(request, props) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = props.params;

  try {
    await DbConnect();

    // Update all unread messages in the chat
    await Message.updateMany(
      {
        conversation: chatId,
        sender: { $ne: session.user.id },
        readBy: { $ne: session.user.id }
      },
      {
        $addToSet: { readBy: session.user.id }
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
