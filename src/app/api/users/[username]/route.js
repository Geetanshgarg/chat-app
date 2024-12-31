import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export async function GET(req, props) {
  try {
    const params = await props.params;
    await DbConnect();
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    
    // Find both the requested user and the current user
    const [requestedUser, currentUser] = await Promise.all([
      User.findOne({ username }).select("-password"),
      User.findById(session.user.id).populate('friends')
    ]);

    if (!requestedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add isFriend property safely
    const userObject = requestedUser.toObject();
    userObject.isFriend = false; // default value

    if (currentUser && currentUser.friends) {
      userObject.isFriend = currentUser.friends.some(friend => 
        friend._id.toString() === requestedUser._id.toString()
      );
    }

    return NextResponse.json(userObject);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}
