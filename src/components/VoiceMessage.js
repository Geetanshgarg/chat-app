"use client";

import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function VoiceMessage({ url, isOwn }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  const waveformRef = useRef(null);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      console.log('Audio duration:', audio.duration); // Debug log
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };

    const handleCanPlayThrough = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration);
        setIsLoading(false);
      }
    };

    const handleTimeUpdate = () => {
      if (!isNaN(audio.currentTime)) {
        setCurrentTime(audio.currentTime);
        currentTimeRef.current = audio.currentTime;
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      currentTimeRef.current = 0;
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    // Generate waveform data
    const generateWaveform = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch audio');
        
        const arrayBuffer = await response.arrayBuffer();
        
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        
        // Set duration from audioBuffer as fallback
        if (!duration && audioBuffer.duration) {
          setDuration(audioBuffer.duration);
        }
        
        const channelData = audioBuffer.getChannelData(0);
        const samples = 40;
        const blockSize = Math.floor(channelData.length / samples);
        const waveform = [];

        for (let i = 0; i < samples; i++) {
          let sum = 0;
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(channelData[i * blockSize + j]);
          }
          waveform.push(sum / blockSize);
        }

        const maxValue = Math.max(...waveform);
        const normalizedWaveform = waveform.map(value => 
          0.3 + (value / maxValue) * 0.7
        );
        
        setWaveformData(normalizedWaveform);
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating waveform:', error);
        setWaveformData(Array(40).fill(0.5));
      }
    };

    // Set source and load audio
    audio.src = url;
    audio.preload = 'metadata';
    audio.load();
    generateWaveform();

    // Cleanup
    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.src = '';
      
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, [url]);

  const handleWaveformInteraction = (e) => {
    if (!audioRef.current || isLoading || !duration) return;

    const rect = waveformRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percentage = x / rect.width;
    const newTime = Math.min(Math.max(0, percentage * duration), duration);
    
    if (isFinite(newTime)) {
      setCurrentTime(newTime);
      if (!isDragging) {
        audioRef.current.currentTime = newTime;
      }
    }
  };

  const handleMouseUp = () => {
    if (isDragging && audioRef.current && isFinite(currentTime)) {
      audioRef.current.currentTime = currentTime;
      setIsDragging(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [currentTime, isDragging]);

  const togglePlayPause = async () => {
    if (!audioRef.current || isLoading) return;
    
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        if (currentTime >= duration) {
          audioRef.current.currentTime = 0;
          setCurrentTime(0);
        }
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  const formatTime = (time) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px] p-2">
      <button
        onClick={togglePlayPause}
        disabled={isLoading}
        className={cn(
          "p-2 rounded-full transition-colors",
          isOwn ? "text-primary-foreground" : "text-foreground",
          "hover:bg-black/10",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </button>

      <div className="flex flex-col flex-1 gap-1">
        {/* Interactive waveform container */}
        <div 
          ref={waveformRef}
          className="relative flex items-center gap-[2px] h-10 cursor-pointer group"
          onClick={handleWaveformInteraction}
          onMouseDown={(e) => {
            if (!isLoading && duration) {
              setIsDragging(true);
              handleWaveformInteraction(e);
            }
          }}
          onMouseMove={(e) => isDragging && handleWaveformInteraction(e)}
        >
          {/* Waveform lines */}
          {waveformData.map((amplitude, index) => {
            const isPlayed = currentTime / duration > index / waveformData.length;
            return (
              <div
                key={index}
                className="w-[2px] rounded-none transition-all duration-200"
                style={{
                  height: `${Math.max(3, amplitude * 32)}px`,
                  backgroundColor: isPlayed ? '#000' : '#D4D4D4',
                  opacity: isPlayed ? 1 : 0.5
                }}
              />
            );
          })}

          {/* Draggable progress handle */}
          <div 
            className={cn(
              "absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full",
              "transform transition-transform duration-75",
              "opacity-0 group-hover:opacity-100",
              isDragging && "opacity-100 scale-110",
              "cursor-grab active:cursor-grabbing",
              "bg-black shadow-sm"
            )}
            style={{
              left: `${(currentTime / duration) * 100}%`,
              transform: `translateX(-50%) translateY(-50%)`,
            }}
          />
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs opacity-70">
          <span>{formatTime(currentTime)}</span>
          <span>{isLoading ? '--:--' : formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
} 