import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import Notification from "@/models/Notification";

export async function POST(req) {
  try {
    // Parse JSON body
    const { notificationId } = await req.json();

    if (!notificationId || typeof notificationId !== 'string') {
      return new Response(
        JSON.stringify({ message: "Invalid notification ID" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get session
    const session = await getServerSession(authOptions);
    if (!session) {
      return new Response(
        JSON.stringify({ message: "Unauthorized" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await DbConnect();

    // Find and update the notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: session.user.id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return new Response(
        JSON.stringify({ message: "Notification not found" }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification marked as read", notification }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mark Notification Read API Error:', error);
    return new Response(
      JSON.stringify({ message: "Server error" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}