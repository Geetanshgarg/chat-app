"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { format } from "date-fns";

export default function ChatWindow({ chatId }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const message = await res.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const formatMessageTime = (date) => {
    return format(new Date(date), 'h:mm a');
  };

  const shouldShowAvatar = (messages, index) => {
    if (index === 0) return true;
    const currentMessage = messages[index];
    const prevMessage = messages[index - 1];
    return prevMessage.sender._id !== currentMessage.sender._id;
  };

  if (loading) {
    return <Skeleton className="w-full h-[90vh]" />;
  }

  return (
    <Card className="h-[90vh] relative">
      <CardHeader className="border-b h-[60px] flex flex-row items-center">
        <h2 className="text-xl font-semibold">Messages</h2>
      </CardHeader>
      
      <CardContent className="p-0 h-[calc(90vh-120px)]">
        <ScrollArea className="h-full">
          <div className="flex flex-col p-4 gap-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = message.sender._id === session?.user?.id;
              const showAvatar = !isOwnMessage && shouldShowAvatar(messages, index);
              
              return (
                <div
                  key={message._id}
                  className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                >
                  <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
                    {!isOwnMessage && showAvatar && (
                      <Image
                        src={message.sender.image || "/default-avatar.png"}
                        alt={message.sender.firstName}
                        width={32}
                        height={32}
                        className="rounded-full self-end"
                      />
                    )}
                    <div className={`flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                      {showAvatar && !isOwnMessage && (
                        <span className="text-sm text-muted-foreground ml-2 mb-1">
                          {message.sender.firstName}
                        </span>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-full break-words ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwnMessage && (
                          <span>
                            {message.readBy?.length > 1 ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t absolute bottom-0 w-full bg-background">
        <form onSubmit={sendMessage} className="flex w-full gap-2 py-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}