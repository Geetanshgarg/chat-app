'use client';

import { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, ImageIcon } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import Image from 'next/image';

export default function UploadDialog({ isOpen, onClose, onUploadComplete, currentImage }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    setError('');
    const file = acceptedFiles[0];
    
    if (!file) return;

    // File validation
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    if (file.size > 500000) { // 500KB
      setError('File size must be less than 500KB');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setPreview(data.url);
      onUploadComplete(data.url);
      toast.success('Image uploaded successfully');
      onClose();
    } catch (error) {
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete, onClose]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxSize: 500000,
    multiple: false
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Profile Picture</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors duration-200 ease-in-out
              ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
              ${error ? 'border-red-500' : ''}
            `}
          >
            <input {...getInputProps()} />
            
            {preview ? (
              <div className="relative w-32 h-32 mx-auto">
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 text-gray-400">
                  <Upload className="w-full h-full" />
                </div>
                <div className="text-sm text-gray-600">
                  {isDragActive ? (
                    <p>Drop the file here</p>
                  ) : (
                    <span>Drag & drop an image here, or <span className = "text">click to select</span></span>
                  )}
                </div>
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG up to 500KB
            </p>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mt-2">
              {error}
            </p>
          )}
          
          
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={uploading || !preview}
            onClick={() => onUploadComplete(preview)}
          >
            {uploading ? 'Uploading...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}