"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatInput({ onSend, disabled }) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSend(message);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 border-t bg-background">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0"
        >
          <Paperclip className="h-5 w-5" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0"
        >
          <ImageIcon className="h-5 w-5" />
        </Button>
        <div className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            disabled={disabled}
            className={cn(
              "min-h-10 py-5 px-4",
              "focus-visible:ring-1 focus-visible:ring-offset-0",
              "transition-all duration-200"
            )}
          />
        </div>
        <Button 
          type="submit"
          size="icon"
          className="shrink-0"
          disabled={!message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
