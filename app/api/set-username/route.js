import { use } from 'react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import DbConnect from "@/lib/dbcon";
import User from "@/models/User";

function generateSlug(username) {
    return username
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

export async function POST(req) {
    try {
        // Get session
        const session = await getServerSession(authOptions);
        if (!session) {
            return new Response(
                JSON.stringify({ message: "Unauthorized" }), 
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Parse and validate username
        const { username } = await req.json();
        const slug = generateSlug(username);
        
        if (!slug || slug.length < 3 || slug.length > 20) {
            return new Response(
                JSON.stringify({ message: "Invalid username format" }), 
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Connect and check existing
        await DbConnect();
        
        // Check both username and slug
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { slug: slug }
            ]
        });

        if (existingUser) {
            return new Response(
                JSON.stringify({ message: "Username already taken" }), 
                { status: 409, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Update user with both username and slug
        const updatedUser = await User.findByIdAndUpdate(
            session.user.id,
            { 
                username: username,
                slug: slug 
            },
            { new: true }
        ).select('-password');

        return new Response(
            JSON.stringify({ 
                message: "Username set successfully",
                user: updatedUser,
                slug: slug
            }), 
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('API Error:', error);
        return new Response(
            JSON.stringify({ message: "Server error" }), 
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}