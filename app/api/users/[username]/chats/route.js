import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Chat from "@/models/Chat";
import { NextResponse } from "next/server";

export async function GET(request, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { username}  =  params;
  const user = await User.findOne({ username: username });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = user._id;



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