import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";
import { chatThemes } from "@/config/chatThemes";

export async function GET(req, { params }) {
  try {
    const { chatId } = params;
    await DbConnect();
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const theme = chatThemes[chat.theme] || chatThemes.default;
    return NextResponse.json({ theme });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch theme" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = params;
    const { themeId } = await req.json();

    await DbConnect();
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    chat.theme = themeId;
    await chat.save();

    // Notify other clients about theme change
    global.io?.to(chatId).emit('theme-changed', {
      theme: chatThemes[themeId]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update theme" }, { status: 500 });
  }
}
