"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes"; // Add this import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Settings, ChevronDown } from "lucide-react"; // Add ChevronDown import
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { io } from 'socket.io-client';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import ChatSettings from "./ChatSettings";
import ChatInput from "./ChatInput";

export default function ChatWindow({ chatId, friendInfo }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const lastMessageRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { theme } = useTheme();

  // Socket connection
  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  // Join chat room and handle messages
  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);

      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      socket.on('messages-read', ({ userId }) => {
        setMessages(prev => prev.map(msg => ({
          ...msg,
          readBy: Array.isArray(msg.readBy) 
            ? [...new Set([...msg.readBy, userId])]
            : [userId]
        })));
      });

      return () => {
        socket.emit('leave-chat', chatId);
        socket.off('new-message');
        socket.off('messages-read');
      };
    }
  }, [socket, chatId]);

  // Initial messages fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        const data = await res.json();
        setMessages(data);
        scrollToBottom();
      } catch (error) {
        toast.error('Failed to load messages');
      }
    };

    if (chatId) fetchMessages();
  }, [chatId]);

  const scrollToBottom = () => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
    setShowScrollButton(false);
  };

  const handleScroll = (event) => {
    const element = event.currentTarget;
    const isNearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 100;
    setShowScrollButton(!isNearBottom);
  };

  const handleSendMessage = async (content) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (!res.ok) throw new Error('Failed to send message');
      
      // Add this: Get the new message from response and update local state
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
      
      // Scroll to bottom after adding new message
      setTimeout(scrollToBottom, 100);
      
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), "h:mm a");
  };

  // Add this helper function
  const groupMessages = (messages) => {
    return messages.reduce((groups, message, index) => {
      const prevMessage = messages[index - 1];
      const isSameSender = prevMessage && prevMessage.sender._id === message.sender._id;
      const timeDiff = prevMessage && 
        (new Date(message.createdAt) - new Date(prevMessage.createdAt)) < 120000; // 2 minutes
      
      if (isSameSender && timeDiff) {
        groups[groups.length - 1].messages.push(message);
      } else {
        groups.push({
          sender: message.sender,
          messages: [message],
          isOwn: message.sender._id === session?.user?.id
        });
      }
      return groups;
    }, []);
  };

  // Add background handling
  const getBackground = () => {
    return theme === 'dark' 
      ? "url('/backgrounds/dark-pattern.png')"
      : "url('/backgrounds/light-pattern.png')";
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-4rem)] bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b shrink-0">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={friendInfo?.image} />
            <AvatarFallback>{friendInfo?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-medium">{friendInfo?.name}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-4 overflow-y-auto relative"
        style={{ 
          height: 'calc(100vh - 12rem)',
          backgroundImage: getBackground(),
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
        onScroll={handleScroll}
      >
        <div className="space-y-3">
          {groupMessages(messages).map((group, groupIndex) => (
            <div
              key={group.messages[0]._id}
              className={cn(
                "flex items-end gap-2",
                group.isOwn ? "justify-end" : "justify-start"
              )}
            >
              {!group.isOwn && (
                <div className="flex flex-col items-center gap-1 w-8 shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={group.sender.image} />
                    <AvatarFallback>{group.sender.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              )}
              
              <div className="flex flex-col gap-0.5 max-w-[65%]">
                {!group.isOwn && groupIndex === 0 && (
                  <span className="text-xs text-muted-foreground ml-1 mb-1">
                    {group.sender.firstName}
                  </span>
                )}
                {group.messages.map((message, messageIndex) => (
                  <div 
                    key={message._id} 
                    className={cn(
                      "flex flex-col",
                      messageIndex === group.messages.length - 1 ? "mb-1" : "mb-0.5"
                    )}
                  >
                    <div className={cn(
                      "px-4 py-2 rounded-2xl",
                      group.isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                      messageIndex === 0 && "rounded-tl-sm rounded-tr-2xl",
                      messageIndex === group.messages.length - 1 && "rounded-bl-2xl rounded-br-2xl",
                      messageIndex !== 0 && messageIndex !== group.messages.length - 1 && "rounded-2xl"
                    )}>
                      {message.text}
                    </div>
                  </div>
                ))}
                <span className="text-[10px] text-muted-foreground px-2">
                  {formatMessageTime(group.messages[group.messages.length - 1].createdAt)}
                </span>
              </div>

              {group.isOwn && (
                <div className="flex flex-col items-center gap-1 w-8 shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session.user.image} />
                    <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                  </Avatar>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add scroll to bottom button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-20 right-4 rounded-full shadow-lg"
          onClick={scrollToBottom}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      <div className="shrink-0"> {/* Added shrink-0 to prevent compression */}
        <ChatInput 
          onSend={handleSendMessage}
          disabled={!chatId}
        />
      </div>

      <ChatSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDelete={() => {}}
        onArchive={() => {}}
      />
    </Card>
  );
}
