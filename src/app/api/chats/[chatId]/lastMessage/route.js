import Dbconnect from "@/lib/dbcon";
import { Chat } from "@/models/Chat";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401 
      });
    }

    const { chatId } = params;
    const messageData = await req.json();

    await Dbconnect();

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $set: {
          lastMessage: {
            type: messageData.type,
            content: messageData.content,
            sender: session.user.id,
            createdAt: new Date(),
            duration: messageData.duration
          }
        }
      },
      { new: true }
    );

    if (!updatedChat) {
      return new Response(JSON.stringify({ error: "Chat not found" }), { 
        status: 404 
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      chat: updatedChat 
    }), { 
      status: 200 
    });

  } catch (error) {
    console.error('Error updating last message:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { 
      status: 500 
    });
  }
} 