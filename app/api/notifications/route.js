import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Updated import path
import Notification from "@/models/Notification";
import DbConnect from "@/lib/dbcon";

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized." }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    const notifications = await Notification.find({ user: session.user.id }).sort({ createdAt: -1 });

    return new Response(
      JSON.stringify(notifications),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Notifications API Error:', error);
    return new Response(
      JSON.stringify({ message: "Internal server error." }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}