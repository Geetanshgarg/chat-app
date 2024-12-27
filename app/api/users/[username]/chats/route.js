import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params;

  try {
    await DbConnect();
    const chats = await Chat.find({
      participants: userId
    }).populate("participants", "firstName lastName image");

    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}