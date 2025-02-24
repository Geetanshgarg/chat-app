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

    if (query?.trim()) {
      // Search users by name, username, or email
      const users = await User.find({
        _id: { $ne: session.user.id },
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .select('firstName lastName username email avatarUrl avatar')
      .limit(10);

      return NextResponse.json({ 
        success: true,
        users: users.map(user => ({
          ...user.toObject(),
          avatarUrl: user.avatarUrl || `/api/avatar/${user._id}`
        }))
      });
    }

    return NextResponse.json({ success: true, users: [] });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
