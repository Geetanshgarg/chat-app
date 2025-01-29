import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from '@supabase/supabase-js';

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Make sure this is in your .env.local
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const BUCKET_NAME = 'voice-messages';

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert the file to a Buffer if it's a Blob/File
    let fileData = audioFile;
    if (audioFile instanceof Blob) {
      const arrayBuffer = await audioFile.arrayBuffer();
      fileData = Buffer.from(arrayBuffer);
    }

    // Generate unique filename
    const fileName = `${session.user.id}/${Date.now()}.wav`;
    
    // Upload using admin client
    const { data, error: uploadError } = await supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .upload(fileName, fileData, {
        contentType: 'audio/wav',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({ 
      url: publicUrl,
      success: true 
    });

  } catch (error) {
    console.error('Voice message upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}; 