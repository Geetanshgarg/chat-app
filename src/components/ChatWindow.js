"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Settings, AlertCircle, ChevronDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { format } from "date-fns";
import ChatSettings from "./ChatSettings";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { chatThemes } from "@/config/chatThemes";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ChatWindow({ chatId, friendInfo }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [chatBackground, setChatBackground] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const scrollRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [friendDetails, setFriendDetails] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(chatThemes.default);
  const [systemMessages, setSystemMessages] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesRef = useRef([]); // Add this ref to track messages
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const scrollAreaRef = useRef(null);

  // Add a socket reference to keep connection alive
  const socketRef = useRef(null);

  const handleThemeChange = async (theme) => {
    if (!theme.id) return;
    
    try {
      const res = await fetch(`/api/chats/${chatId}/theme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: theme.id })
      });

      if (!res.ok) throw new Error("Failed to update theme");
      
      setCurrentTheme(theme);
      // ...rest of existing theme change logic...
      setChatBackground(theme.background);
    
      const systemMessage = {
        _id: Date.now(),
        type: 'system',
        text: `Theme changed to ${theme.name}`,
        createdAt: new Date()
      };
      
      setSystemMessages(prev => [...prev.filter(msg => msg.type !== 'system'), systemMessage]);
      
      if (socket) {
        socket.emit('theme-change', { chatId, theme });
      }
    } catch (error) {
      console.error("Error updating theme:", error);
      toast.error("Failed to update theme");
    }
  };

  useEffect(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_APP_URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
    }
  }, [chatId]); // Only fetch messages when chatId changes

  const fetchChatTheme = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/theme`);
      if (!res.ok) throw new Error("Failed to fetch theme");
      const { theme } = await res.json();
      setCurrentTheme(theme);
    } catch (error) {
      console.error("Error fetching chat theme:", error);
    }
  };

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);

      socket.on('new-message', (message) => {
        // Update messages and preserve scroll position
        setMessages(prev => {
          const isAtBottom = isNearBottom();
          const newMessages = [...prev, message];
          
          // Only auto-scroll if we're already at bottom or it's our message
          if (isAtBottom || message.sender._id === session?.user?.id) {
            setTimeout(() => scrollToBottom(), 100);
          }
          
          return newMessages;
        });
      });

      socket.on('theme-changed', (data) => {
        if (!data.theme.name) return;
        
        setCurrentTheme(data.theme);
        setChatBackground(data.theme.background);
        
        const systemMessage = {
          _id: Date.now(),
          type: 'system',
          text: `Theme changed to ${data.theme.name}`,
          createdAt: new Date()
        };
        
        setSystemMessages(prev => [...prev.filter(msg => msg.type !== 'system'), systemMessage]);
      });

      return () => {
        socket.emit('leave-chat', chatId);
        socket.off('new-message');
      };
    }
  }, [socket, chatId]);

  useEffect(() => {
    fetchChatBackground();
  }, []);

  const fetchChatBackground = async () => {
    try {
      const res = await fetch("/api/settings/appearance");
      const data = await res.json();
      setChatBackground(data.chatBackground);
    } catch (error) {
      console.error("Failed to fetch chat background:", error);
    }
  };

  useEffect(() => {
    if (lastMessageRef.current && messages.length > 0) {
      const shouldAutoScroll = 
        !showScrollButton || // If scroll button is hidden (we're at bottom)
        messages[messages.length - 1].sender._id === session?.user?.id; // Or if it's our own message
      
      if (shouldAutoScroll) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, showScrollButton]);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
      setIsAutoScroll(true);
    }
  };

  const handleScroll = (event) => {
    // Get the scroll container - either the event target or its parent
    const scrollContainer = event.target.classList.contains('scroll-area') 
      ? event.target 
      : event.target.parentElement;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 100;
    
    setShowScrollButton(!isNearBottom);
    setIsAutoScroll(isNearBottom);
  };

  useEffect(() => {
    if (friendInfo?.username) {
      fetchFriendDetails();
    }
  }, [friendInfo]);

  const fetchFriendDetails = async () => {
    try {
      const res = await fetch(`/api/users/${friendInfo.username}/details`);
      if (!res.ok) throw new Error("Failed to fetch friend details");
      const data = await res.json();
      setFriendDetails(data);
      setIsOnline(data.isOnline);
    } catch (error) {
      console.error("Error fetching friend details:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messageContent = newMessage;
      setNewMessage(""); // Clear input immediately

      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      const message = await res.json();
      
      // Update local messages immediately
      setMessages(prev => [...prev, message]);
      
      // Emit through socket
      socket?.emit('send-message', message);
      
      // Always scroll to bottom on send
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setNewMessage(messageContent); // Restore message if failed
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), "h:mm a");
  };

  const shouldShowAvatar = (messages, index) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const prevMessage = messages[index - 1];
    return prevMessage.sender._id !== currentMessage.sender._id;
  };

  const renderMessage = (message, index, messages) => {
    const isOwnMessage = message.sender._id === session?.user?.id;
    const isFirstInGroup = index === 0 || 
      messages[index - 1].sender._id !== message.sender._id;
    const isLastInGroup = index === messages.length - 1 || 
      messages[index + 1].sender._id !== message.sender._id;

    return (
      <div
        key={message._id}
        className={cn(
          "flex gap-2 px-2",
          isOwnMessage ? "justify-end" : "justify-start",
          !isLastInGroup && "mb-1"
        )}
        ref={index === messages.length - 1 ? lastMessageRef : null}
      >
        {/* Avatar Column - Fixed Width */}
        <div className={cn(
          "w-6 flex-shrink-0",
          isOwnMessage ? "order-2" : "order-1"
        )}>
          {!isOwnMessage && isFirstInGroup && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={message.sender.image || "/default-avatar.png"}
                      alt={message.sender.firstName}
                    />
                    <AvatarFallback>{message.sender.firstName?.[0]}</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  {message.sender.firstName} {message.sender.lastName}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Message Content */}
        <div className={cn(
          "flex flex-col max-w-[75%]",
          isOwnMessage ? "order-1 items-end" : "order-2 items-start"
        )}>
          {isFirstInGroup && !isOwnMessage && (
            <span className="text-xs text-muted-foreground ml-1 mb-1">
              {message.sender.firstName}
            </span>
          )}
          <div
            className={cn(
              "rounded-2xl px-3 py-2 break-words",
              isOwnMessage 
                ? "bg-primary text-primary-foreground ml-auto" 
                : "bg-muted/50",
              isFirstInGroup && isOwnMessage && "rounded-tr-sm",
              isFirstInGroup && !isOwnMessage && "rounded-tl-sm",
              !isLastInGroup && isOwnMessage && "rounded-br-sm",
              !isLastInGroup && !isOwnMessage && "rounded-bl-sm"
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          </div>
          {isLastInGroup && (
            <span className="text-[10px] text-muted-foreground mx-1 mt-1">
              {formatMessageTime(message.createdAt)}
              {isOwnMessage && (
                <span className="ml-1">
                  {message.readBy?.length > 1 ? "✓✓" : "✓"}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <Skeleton className="w-full h-[90vh]" />;
  }

  return (
    <Card 
      className="h-[90vh] relative border-0 shadow-2xl overflow-hidden"
      style={{
        background: currentTheme.containerBg,
        borderRadius: '1.5rem',
        padding: '1px',
        backgroundImage: currentTheme.borderGradient
      }}
    >
      <div className="absolute inset-0.5 rounded-[1.4rem] overflow-hidden bg-background/95">
        <ChatSettings
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          chatBackground={chatBackground}
          onBackgroundChange={handleThemeChange}
          friendDetails={friendDetails}
        />
        
        {/* Updated Header */}
        <div 
          onClick={() => setIsSettingsOpen(true)}
          className="h-16 px-6 flex items-center bg-background/50 backdrop-blur-sm border-b border-border/50 cursor-pointer hover:bg-accent/5 transition-colors"
        >
          <div className="flex items-center gap-3 w-full">
            <Avatar className="h-10 w-10">
              <AvatarImage 
                src={friendDetails?.image || "/default-avatar.png"} 
                alt={friendDetails?.name} 
              />
              <AvatarFallback>{friendDetails?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold">{friendDetails?.name}</h2>
              <div className="flex items-center gap-2">
                <span 
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-gray-400"
                  )}
                />
                <span className="text-xs text-muted-foreground">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="p-0 h-[calc(90vh-9rem)]"
          style={{
            background: currentTheme.background,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <ScrollArea 
            ref={scrollAreaRef}
            className="h-full scroll-area"
            onWheel={handleScroll}  // Add wheel event
            onScroll={handleScroll} // Keep existing scroll event
          >
            <div 
              className="flex flex-col p-6 gap-y-2 min-h-full"
              onScroll={handleScroll} // Add scroll event to inner container
            >
              {[...messages, ...systemMessages]
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map((message, index, array) => {
                  if (message.type === 'system') {
                    return (
                      <div key={message._id} className="flex justify-center">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/40 backdrop-blur-sm text-xs text-muted-foreground">
                          <AlertCircle className="h-3 w-3" />
                          {message.text}
                        </div>
                      </div>
                    );
                  }
                  return renderMessage(message, index, array);
                })}
            </div>
          </ScrollArea>

          {/* Scroll to bottom button */}
          <Button
            variant="secondary"
            size="icon"
            className={cn(
              "fixed bottom-20 right-8 rounded-full transition-all duration-200 shadow-lg z-10",
              showScrollButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
            onClick={() => {
              scrollToBottom();
              setIsAutoScroll(true);
            }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="absolute bottom-0 w-full p-4 bg-background/50 backdrop-blur-sm border-t border-border/50">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-background/50 border-0 focus-visible:ring-1 focus-visible:ring-accent"
            />
            <Button 
              type="submit"
              className="bg-primary hover:bg-primary/90"
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </Card>
  );
}
