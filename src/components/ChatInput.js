"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationTimerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const duration = Math.round(recordingDuration);
        
        // Create FormData and append the audio blob
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice-message.wav');

        try {
          const uploadRes = await fetch('/api/messages/voice', {
            method: 'POST',
            body: formData
          });

          if (!uploadRes.ok) throw new Error('Failed to upload voice message');
          
          const { url } = await uploadRes.json();
          onSend(url, 'voice', duration);
          
          // Reset recording state
          setRecordingDuration(0);
          setIsRecording(false);
        } catch (error) {
          console.error('Error uploading voice message:', error);
          toast.error('Failed to send voice message');
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      clearInterval(durationTimerRef.current);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim(), 'text');
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {!isRecording ? (
          <>
            <div className="flex-1 relative">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                disabled={disabled || isRecording}
                className={cn(
                  "min-h-10 py-5 px-4",
                  "focus-visible:ring-1 focus-visible:ring-offset-0",
                  "transition-all duration-200"
                )}
              />
            </div>
            <Button 
              type="button"
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={startRecording}
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <div className="flex-1 flex items-center gap-4 bg-accent/10 rounded-md px-4 py-2">
              {/* Recording indicator */}
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm font-medium">
                  Recording {recordingDuration.toFixed(1)}s
                </span>
              </div>
              {/* Simple recording visualization */}
              <div className="flex-1 flex items-center gap-1">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-foreground/60 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 4}px`,
                      animationDelay: `${i * 0.1}s`
                    }}
                  />
                ))}
              </div>
            </div>
            <Button 
              type="button"
              size="icon"
              variant="destructive"
              className="shrink-0"
              onClick={stopRecording}
            >
              <Square className="h-5 w-5" />
            </Button>
          </>
        )}

        {!isRecording && (
          <Button 
            type="submit"
            size="icon"
            className="shrink-0"
            disabled={!message.trim() || disabled}
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </form>
    </div>
  );
}
