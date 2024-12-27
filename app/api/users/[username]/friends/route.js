import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { username } = params;
  const user = await User.findOne({ username: username });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const userId = user._id;

  try {
    await DbConnect();
    const user = await User.findById(userId).populate("friends");
    return NextResponse.json(user.friends);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}