"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes"; // Add this import
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Settings, ChevronDown, ChevronLeft } from "lucide-react"; // Add ChevronDown and ChevronLeft import
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { io } from 'socket.io-client';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import ChatSettings from "./ChatSettings";
import ChatInput from "./ChatInput";
import VoiceMessage from './VoiceMessage';
import { Spinner } from "@/components/ui/spinner";

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
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

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

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        console.log('Fetching messages for chatId:', chatId); // Debug log

        const res = await fetch(`/api/chats/${chatId}/messages`);
        if (!res.ok) throw new Error('Failed to fetch messages');
        
        const data = await res.json();
        console.log('Fetched messages:', data); // Debug log
        
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (chatId) {
      fetchMessages();
    }
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

  const handleSendMessage = async (content, type = 'text', duration = null) => {
    try {
      console.log('Sending message:', { content, type, duration }); // Debug log

      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          type,
          duration
        }),
      });

      if (!res.ok) throw new Error('Failed to send message');

      const newMessage = await res.json();
      console.log('New message:', newMessage); // Debug log
      
      setMessages(prev => [...prev, newMessage]);
      scrollToBottom();

    } catch (error) {
      console.error('Error sending message:', error);
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

  // Group messages
  const groupedMessages = useMemo(() => {
    return groupMessages(messages);
  }, [messages]);

  return (
    <Card className="flex flex-col h-[calc(100vh-4rem)] bg-background relative">
      {/* Header */}
      <div className="flex items-center p-4 border-b shrink-0">
        <div className="flex-1 flex items-center gap-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage src={friendInfo?.image} />
              <AvatarFallback>{friendInfo?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <h2 className="text-sm font-medium truncate">{friendInfo?.name}</h2>
              
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsSettingsOpen(true)}
          className="shrink-0"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages Area */}
      <ScrollArea 
        ref={scrollAreaRef}
        className="flex-1 p-2 sm:p-4 overflow-y-auto relative"
        style={{ 
          height: 'calc(100vh - 12rem)',
          backgroundImage: getBackground(),
          backgroundRepeat: 'repeat',
          backgroundPosition: 'center',
        }}
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4" ref={scrollRef}>
            {groupedMessages.map((group, groupIndex) => (
              <div
                key={group.messages[0]._id}
                className={cn(
                  "flex gap-3",
                  group.isOwn ? "justify-end" : "justify-start"
                )}
              >
                {/* Avatar for received messages */}
                {!group.isOwn && (
                  <div className="relative">
                    <Avatar className="h-8 w-8 ring-2 ring-background">
                      <AvatarImage src={group.sender.image} />
                      <AvatarFallback>{group.sender.firstName?.[0]}</AvatarFallback>
                    </Avatar>
                    {group.sender.isOnline && (
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                    )}
                  </div>
                )}
                
                <div className={cn(
                  "flex flex-col space-y-2 w-fit",
                  "max-w-[85%] sm:max-w-[75%]",
                  group.isOwn && "items-end"
                )}>
                  {!group.isOwn && groupIndex === 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-foreground/70">
                        {group.sender.firstName}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-1">
                    {group.messages.map((message, messageIndex) => (
                      <div 
                        key={message._id} 
                        className={cn(
                          "flex items-start gap-2.5",
                          group.isOwn && "justify-end"
                        )}
                      >
                        <div className={cn(
                          "flex flex-col w-full",
                          "max-w-[280px] sm:max-w-[320px]",
                          "leading-1.5 p-2 sm:p-4",
                          group.isOwn ? [
                            "bg-primary text-primary-foreground rounded-s-xl rounded-ee-xl",
                          ] : [
                            "bg-muted rounded-e-xl rounded-es-xl",
                          ]
                        )}>
                          {!group.isOwn && (
                            <span className="text-sm font-semibold">
                              {group.sender.firstName}
                            </span>
                          )}

                          {/* Check if the message content is a voice message URL */}
                          {message.content?.startsWith('https://') && message.content?.includes('voice-messages') ? (
                            <VoiceMessage 
                              url={message.content}
                              duration={message.duration || 0}
                              isOwn={group.isOwn}
                            />
                          ) : (
                            <p className="text-sm font-normal py-2.5">
                              {message.content}
                            </p>
                          )}

                          <div className="flex items-center space-x-2 rtl:space-x-reverse">
                            <span className="text-sm font-normal text-muted-foreground">
                              {formatMessageTime(message.createdAt)}
                            </span>
                            <span className="text-sm font-normal text-muted-foreground">
                              {message.readBy?.length > 0 ? "Read" : "Delivered"}
                            </span>
                          </div>
                        </div>

                        {/* Avatar for sent messages */}
                        {group.isOwn && (
                          <div className="relative">
                            <Avatar className="h-8 w-8 ring-2 ring-background">
                              <AvatarImage src={session.user.image} />
                              <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-2 ring-background" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
