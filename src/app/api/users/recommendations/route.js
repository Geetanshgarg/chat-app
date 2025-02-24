import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import DbConnect from "@/lib/dbcon";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await DbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (query) {
      // Search users by name, username, or email
      const users = await User.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .select('firstName lastName username avatar email')
      .limit(10);

      return NextResponse.json({ users });
    } else {
      // Get recommended users (excluding current user)
      const recommendations = await User.find({
        _id: { $ne: session.user.id }
      })
        .select('_id firstName lastName username avatar')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

      return NextResponse.json({ 
        success: true,
        recommendations 
      });
    }
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}