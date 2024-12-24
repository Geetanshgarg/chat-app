import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";

export async function POST(request) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return new Response(
        JSON.stringify({ message: 'Required fields missing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to database
    await DbConnect();

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(
        JSON.stringify({ message: 'Email already registered' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword
    };

    const newUser = new User(userData);
    await newUser.save();

    return new Response(
      JSON.stringify({ message: 'Registration successful' }),
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