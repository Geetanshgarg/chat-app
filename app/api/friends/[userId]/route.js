import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(request, props) {
  const params = await props.params;
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = params; // Removed 'await' here

  try {
    await DbConnect();

    // Fetch the user's friends
    const user = await User.findById(userId).populate("friends", "-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user.friends, { status: 200 });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return NextResponse.json({ error: "Failed to fetch friends." }, { status: 500 });
  }
}