import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, friendId, isGroup, groupName } = body;

    await DbConnect();
    
    const chatData = {
      participants: isGroup ? [userId, ...friendId] : [userId, friendId],
      isGroup: !!isGroup,
      name: groupName
    };

    const chat = await Chat.create(chatData);
    await chat.populate("participants", "firstName lastName image");

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}