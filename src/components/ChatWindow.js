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

// Add this function before the ChatWindow component
const isNearBottom = () => {
  const scrollArea = document.querySelector('.scroll-area');
  if (!scrollArea) return true;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollArea;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom < 100;
};

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
      fetchChatTheme(); // Ensure theme is fetched when chatId changes
    }
  }, [chatId]);

  const fetchChatTheme = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/theme`);
      if (!res.ok) throw new Error("Failed to fetch theme");
      const { theme } = await res.json();
      setCurrentTheme(theme);
      setChatBackground(theme.background); // Ensure background is set
    } catch (error) {
      console.error("Error fetching chat theme:", error);
    }
  };

  useEffect(() => {
    if (socket && chatId) {
      socket.emit('join-chat', chatId);

      socket.on('new-message', (message) => {
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          if (prev.some(m => m._id === message._id)) {
            return prev;
          }
          const newMessages = [...prev, message];
          if (isNearBottom()) {
            setTimeout(() => scrollToBottom(), 100);
          }
          return newMessages;
        });

        // Mark message as read immediately if chat is open
        if (document.hasFocus()) {
          socket.emit('messages-read', {
            chatId,
            userId: session.user.id
          });
        }
      });

      // Update the messages-read handler
      socket.on('messages-read', ({ userId, chatId: updatedChatId }) => {
        if (updatedChatId === chatId) {
          setMessages(prev => prev.map(msg => ({
            ...msg,
            readBy: Array.isArray(msg.readBy) 
              ? [...new Set([...msg.readBy, userId])]
              : [userId]
          })));
        }
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
        socket.off('messages-read');
      };
    }
  }, [socket, chatId, session?.user?.id]);

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
    if (!message || !message.sender) return null; // Add check for undefined message

    const isOwnMessage = message.sender._id === session?.user?.id;
    const isFirstInGroup = index === 0 || 
      messages[index - 1]?.sender?._id !== message.sender._id;
    const isLastInGroup = index === messages.length - 1 || 
      messages[index + 1]?.sender?._id !== message.sender._id;

    return (
      <div
        key={`msg-${message._id}-${index}`}  // Modified key to be more unique
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
              "rounded-2xl px-4 py-2 break-words",
              isOwnMessage ? currentTheme.sentMessage : currentTheme.receivedMessage,
              currentTheme.bubbleShadow,
              "transition-all duration-200",
              isFirstInGroup && isOwnMessage && "rounded-tr-sm",
              isFirstInGroup && !isOwnMessage && "rounded-tl-sm",
              !isLastInGroup && isOwnMessage && "rounded-br-sm",
              !isLastInGroup && !isOwnMessage && "rounded-bl-sm"
            )}
          >
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
          </div>
          {isLastInGroup && (
            <span className="text-[10px] text-muted-foreground mx-1 mt-1">
              {formatMessageTime(message.createdAt)}
              {isOwnMessage && (
                <span className="ml-1">
                  {Array.isArray(message.readBy) && 
                   message.readBy.some(id => id !== session?.user?.id) 
                    ? "✓✓" 
                    : "✓"}
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Add this effect to mark messages as read when chat is open
  useEffect(() => {
    if (chatId && session?.user?.id) {
      const markMessagesAsRead = async () => {
        try {
          const res = await fetch(`/api/chats/${chatId}/read`, {
            method: 'POST',
          });
          
          if (res.ok) {
            socket?.emit('messages-read', {
              chatId,
              userId: session.user.id
            });
          }
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      // Mark as read when chat is focused
      const handleFocus = () => markMessagesAsRead();
      window.addEventListener('focus', handleFocus);
      
      // Initial mark as read
      if (document.hasFocus()) {
        markMessagesAsRead();
      }

      // Periodic check for new messages to mark as read
      const interval = setInterval(() => {
        if (document.hasFocus()) {
          markMessagesAsRead();
        }
      }, 5000);

      return () => {
        window.removeEventListener('focus', handleFocus);
        clearInterval(interval);
      };
    }
  }, [chatId, session?.user?.id, socket]);

  if (loading) {
    return <Skeleton className="w-full h-[90vh]" />;
  }

  return (
    <Card className="h-[90vh] relative border-none rounded-3xl overflow-hidden shadow-2xl">
      {/* Add the ChatSettings component back */}
      <ChatSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        chatBackground={chatBackground}
        onBackgroundChange={handleThemeChange}
        friendDetails={friendDetails}
        chatId={chatId}
        currentTheme={currentTheme}  // Add this prop
      />
      
      {/* Header */}
      <div className="h-14 px-4 flex items-center justify-between bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={friendDetails?.image || "/default-avatar.png"} 
              alt={friendDetails?.name} 
            />
            <AvatarFallback>{friendDetails?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h2 className="text-sm font-medium leading-none">{friendDetails?.name}</h2>
            <span className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <span className={cn(
                "h-1.5 w-1.5 rounded-full",
                isOnline ? "bg-green-500" : "bg-gray-400"
              )}/>
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages Area */}
      <div 
        className="h-[calc(90vh-8rem)] relative overflow-hidden"
        style={{
          backgroundImage: currentTheme.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Theme overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{ backgroundColor: 'var(--theme-overlay)' }}
        />

        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full scroll-area px-4 relative z-10"
          onScroll={handleScroll}
        >
          <div className="flex flex-col gap-2 py-4">
            {[...messages, ...systemMessages]
              .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((message, index, array) => {
                if (message.type === 'system') {
                  return (
                    <div key={`system-${message._id || Date.now()}-${index}`} className="flex justify-center">
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
      </div>

      {/* Input Area with themed border */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-4"
        style={{
          background: 'var(--theme-input-bg)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid var(--theme-border)'
        }}
      >
        <form onSubmit={sendMessage} className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Message..."
            className="flex-1 bg-background/40 border-none h-10 px-4 focus-visible:ring-1 focus-visible:ring-offset-0"
          />
          <Button 
            type="submit"
            size="sm"
            className={cn(
              "rounded-full px-4",
              currentTheme.buttonColor,
              "transition-all duration-200"
            )}
          >
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
}
