"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

export default function ChatWindow({ chatId }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      
      const message = await res.json();
      setMessages((prev) => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (loading) {
    return <Skeleton className="w-full h-[600px]" />;
  }

  return (
    <Card className="h-[90vh]">
      <CardHeader className="border-b pb-4">
        <h2 className="text-xl font-semibold">Chat</h2>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(90vh-180px)]" ref={scrollRef}>
          <div className="flex flex-col gap-4 p-4">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex gap-2 ${
                  message.sender._id === session?.user?.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.sender._id !== session?.user?.id && (
                  <Image
                    src={message.sender.image || "/default-avatar.png"}
                    alt={message.sender.firstName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div
                  className={`p-3 rounded-lg max-w-[70%] ${
                    message.sender._id === session?.user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={sendMessage} className="flex w-full gap-2">
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