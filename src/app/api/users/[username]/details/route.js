import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await DbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    
    const user = await User.findOne({ username })
      .select([
        "username",
        "firstName",
        "lastName",
        "email",
        "image",
        "bio",
        "isOnline",
        "lastSeen",
        "createdAt",
        "updatedAt"
      ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Format the response
    const formattedUser = {
      name: `${user.firstName} ${user.lastName}`,
      username: user.username,
      email: user.email,
      image: user.image,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeen: user.lastSeen,
      joinedAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
