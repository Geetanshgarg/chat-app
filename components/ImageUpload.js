'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Image from 'next/image';

const UPLOAD_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;

export default function ImageUpload({ onUploadComplete, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const uploadWithTimeout = async (formData) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setUploading(true);
    setRetryCount(0);

    const formData = new FormData();
    formData.append('file', file);

    while (retryCount < MAX_RETRIES) {
      try {
        const data = await uploadWithTimeout(formData);
        onUploadComplete(data.url);
        toast.success('Image uploaded successfully');
        return;
      } catch (error) {
        if (error.name === 'AbortError') {
          toast.error('Upload timed out. Retrying...');
          setRetryCount(prev => prev + 1);
        } else {
          toast.error('Failed to upload image');
          break;
        }
      }
    }

    if (retryCount >= MAX_RETRIES) {
      toast.error('Upload failed after multiple attempts');
    }
    
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {currentImage && (
        <div className="relative w-32 h-32">
          <Image
            src={currentImage}
            alt="Profile"
            fill
            className="rounded-full object-cover"
          />
        </div>
      )}
      <Button
        variant="outline"
        disabled={uploading}
        onClick={() => document.getElementById('imageInput').click()}
      >
        {uploading ? `Uploading${retryCount > 0 ? ` (Attempt ${retryCount + 1}/${MAX_RETRIES})` : '...'}` : 'Upload Image'}
      </Button>
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}