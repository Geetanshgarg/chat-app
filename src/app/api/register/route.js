import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";
import { z } from 'zod';
import { NextResponse } from "next/server";

const registrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and dashes'),
});

export async function POST(request) {
  try {
    const data = await request.json();
    const validation = registrationSchema.safeParse(data);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ message: validation.error.errors[0].message }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { firstName, lastName, email, password, username } = validation.data;

    await DbConnect();

    // Check both email and username availability
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      const message = existingUser.email === email ? 'Email already registered' : 'Username already taken';
      return new Response(
        JSON.stringify({ message }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create user with all data
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      username,
    };

    const newUser = new User(userData);
    await newUser.save();

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return new Response(
      JSON.stringify({
        message: 'Registration successful',
        user: userResponse
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Registration Error:', error);
    return new Response(
      JSON.stringify({ message: 'Registration failed', error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}