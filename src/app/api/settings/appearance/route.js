import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request) {
  await DbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email })
      .select('theme chatBackground');

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      theme: user.theme || 'system',
      chatBackground: user.chatBackground || '/backgroundimages/default.jpg'
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch appearance settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  await DbConnect();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updates = await request.json();
    
    // Validate theme
    if (updates.theme && !['light', 'dark', 'system'].includes(updates.theme)) {
      return NextResponse.json(
        { error: "Invalid theme value" },
        { status: 400 }
      );
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: updates },
      { new: true }
    ).select('theme chatBackground');

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      theme: user.theme,
      chatBackground: user.chatBackground
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update appearance settings" },
      { status: 500 }
    );
  }
}