import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    await DbConnect();
    const user = await User.findOne({ email });
    return NextResponse.json({ available: !user });
  } catch (error) {
    console.error('Error checking email:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}