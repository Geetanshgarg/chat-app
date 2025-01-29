"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function VoiceMessage({ url, isOwn }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio(url));

  useEffect(() => {
    const audio = audioRef.current;

    // Set up audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    // Cleanup
    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [url]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Generate wave bars
  const generateWaveBars = () => {
    return Array.from({ length: 40 }, (_, i) => {
      const height = Math.abs(Math.sin((i / 40) * Math.PI)) * 24 + 4;
      return (
        <div
          key={i}
          className={cn(
            "w-[3px] rounded-full transition-all duration-200",
            isOwn ? "bg-primary-foreground/80" : "bg-foreground/80"
          )}
          style={{
            height: `${height}px`,
            opacity: currentTime / duration > i / 40 ? 1 : 0.4
          }}
        />
      );
    });
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <button
        onClick={togglePlayPause}
        className={cn(
          "p-2 rounded-full",
          isOwn ? "text-primary-foreground" : "text-foreground",
          "hover:bg-black/10"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      <div className="flex flex-col flex-1 gap-1">
        {/* Waveform visualization */}
        <div className="flex items-center gap-[2px] h-8">
          {generateWaveBars()}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
} 