import DbConnect from "@/lib/dbcon";
import User from "@/models/User";

export async function POST(req) {
  const { username } = await req.json();

  if (!username) {
    return new Response(JSON.stringify({ message: "Username is required." }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // List of reserved usernames
  const reservedUsernames = ['login', 'register', 'api', 'set-username', 'admin', 'profile', 'favicon.ico'];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return new Response(JSON.stringify({ available: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    await DbConnect();

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return new Response(JSON.stringify({ available: false }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ available: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error checking username:', error);
    return new Response(JSON.stringify({ message: "Server error." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}