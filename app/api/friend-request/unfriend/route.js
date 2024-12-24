import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '@/models/User';
import mongoose from 'mongoose';
import DbConnect from '@/lib/dbcon';
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized.' },
        { status: 401 }
      );
    }

    const { friendId } = await req.json();

    // Validate the presence of friendId
    if (!friendId || typeof friendId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid or missing friend ID.' },
        { status: 400 }
      );
    }

    // Validate the format of friendId
    if (!mongoose.Types.ObjectId.isValid(friendId)) {
      return NextResponse.json(
        { message: 'Invalid friend ID format.' },
        { status: 400 }
      );
    }

    const userId = session.user.id;

    // Prevent users from unfriending themselves
    if (userId === friendId) {
      return NextResponse.json(
        { message: 'You cannot unfriend yourself.' },
        { status: 400 }
      );
    }

    // Connect to the database
    // Assuming DbConnect is a utility to connect to MongoDB
    await DbConnect();

    // Find both users
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId),
    ]);

    if (!friend) {
      return NextResponse.json(
        { message: 'Friend user not found.' },
        { status: 404 }
      );
    }

    // Check if they are friends
    if (!user.friends.includes(friendId)) {
      return NextResponse.json(
        { message: 'You are not friends with this user.' },
        { status: 400 }
      );
    }

    // Remove each other from friends lists
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    friend.friends = friend.friends.filter(id => id.toString() !== userId);

    await Promise.all([user.save(), friend.save()]);

    return NextResponse.json(
      { message: 'Successfully unfriended the user.' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Unfriend API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error.' },
      { status: 500 }
    );
  }
}