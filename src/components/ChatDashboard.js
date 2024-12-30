"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ChatWindow from "./ChatWindow";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CommandBox from './CommandBox';

export default function ChatDashboard() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (session?.user?.username) {
      fetchChats(session.user.username);
      fetchFriends(session.user.username);
    }
  }, [session]);

  const fetchChats = async (username) => {
    try {
      const res = await fetch(`/api/users/${username}/chats`);
      if (!res.ok) throw new Error("Failed to fetch chats");
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Failed to load chats.");
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchFriends = async (username) => {
    try {
      const res = await fetch(`/api/users/${username}/friends`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
      toast.error("Failed to load friends.");
    }
  };

  const createChat = async (friendUsername) => {
    try {
      const res = await fetch("/api/chats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          username: session.user.username,
          friendUsername,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setChats([...chats, data.chat]);
        toast.success("Chat created successfully.");
      } else {
        throw new Error(data.error || "Failed to create chat.");
      }
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error(error.message || "Failed to create chat.");
    }
  };

  const createGroupChat = async (groupName, selectedFriends) => {
    try {
      const res = await fetch("/api/chats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          userId: session.user.id,
          friendId: selectedFriends,
          isGroup: true,
          groupName,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setChats([...chats, data.chat]);
        toast.success("Group chat created successfully.");
      } else {
        throw new Error(data.message || "Failed to create group chat.");
      }
    } catch (error) {
      console.error("Error creating group chat:", error);
      toast.error(error.message || "Failed to create group chat.");
    }
  };

  const handleFriendClick = async (friend) => {
    try {
      // Find existing chat first
      const existingChat = chats.find(
        (chat) =>
          !chat.isGroup &&
          chat.participants.some(
            (participant) => participant.username === friend.username
          )
      );

      if (existingChat) {
        setSelectedChat(existingChat);
        setOpen(false);
        return;
      }

      // Create new chat only if it doesn't exist
      const createRes = await fetch("/api/chats/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({
          username: session.user.username,
          friendUsername: friend.username,
        }),
      });

      const data = await createRes.json();

      if (createRes.ok) {
        // Only add to chats if it's truly new
        if (!chats.some(chat => chat._id === data.chat._id)) {
          setChats(prev => [...prev, data.chat]);
        }
        setSelectedChat(data.chat);
        setOpen(false);
        toast.success("Chat created successfully.");
      } else {
        throw new Error(data.message || "Failed to create chat.");
      }
    } catch (error) {
      console.error("Error handling friend click:", error);
      toast.error(error.message || "Failed to handle chat action.");
    }
  };

  const handleCommand = async (type, data) => {
    if (type === 'chat') {
      await handleFriendClick(data);
    }
  };

  const getOtherParticipant = (chat) => {
    if (chat.isGroup) return { firstName: chat.name };
    return chat.participants.find(
      (participant) => participant.username !== session.user.username
    );
  };

  const getUnreadCount = (chat) => {
    // Add safety checks
    if (!chat?.messages?.length) return 0;
    if (!session?.user?.id) return 0;

    return chat.messages.filter(msg => {
      return msg?.sender && 
             msg.sender._id !== session.user.id && 
             (!msg.readBy || !msg.readBy.includes(session.user.id));
    }).length;
  };

  const getLastMessagePreview = (chat) => {
    if (!chat?.lastMessage) return 'No messages yet';
    return chat.lastMessage.text || 'No message content';
  };

  const getLastMessageTime = (chat) => {
    if (!chat?.lastMessage?.createdAt) return '';
    return new Date(chat.lastMessage.createdAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const refreshUnreadCounts = async () => {
    if (!session?.user?.id) return;
    
    const counts = {};
    chats.forEach(chat => {
      counts[chat._id] = chat.messages?.filter(msg => 
        msg?.sender?._id !== session.user.id && 
        (!msg.readBy?.includes(session.user.id))
      ).length || 0;
    });
    setUnreadCounts(counts);
  };

  useEffect(() => {
    refreshUnreadCounts();
  }, [chats, session]);

  const handleChatSelect = async (chat) => {
    const friendInfo = chat.isGroup 
      ? { name: chat.name, image: null, isGroup: true, memberCount: chat.participants.length }
      : chat.participants.find(p => p._id !== session.user.id);
      
    setSelectedChat({
      ...chat,
      friendInfo
    });
    
    // Mark as read logic
    if (unreadCounts[chat._id] > 0) {
      try {
        await fetch(`/api/chats/${chat._id}/read`, {
          method: 'POST',
        });
        setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
        fetchChats(session.user.username);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  if (status === "loading") {
    return <Skeleton className="w-full h-48" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">
          You need to be authenticated to view the chat dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex space-x-4 h-[calc(100vh-5rem)] p-4">
      <div className="w-1/3">
        <Card className="h-[90vh] shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-lg font-medium">Messages</CardTitle>
            <Button 
              variant="outline" 
              onClick={() => setOpen(true)}
              className="ml-2 hover:bg-accent hover:text-accent-foreground"
            >
              New Chat
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingChats ? (
              <Skeleton className="w-full h-48" />
            ) : (
              <ScrollArea className="h-[90%]">
                {chats.length > 0 ? (
                  chats.map((chat) => {
                    const otherParticipant = getOtherParticipant(chat);
                    const unreadCount = unreadCounts[chat._id] || 0;
                    const lastMessage = getLastMessagePreview(chat);
                    const lastMessageTime = getLastMessageTime(chat);
                    
                    return (
                      <div
                        key={chat._id}
                        className={`flex items-center justify-between p-4 hover:bg-accent/5 transition-colors cursor-pointer ${
                          selectedChat?._id === chat._id ? 'bg-accent/10' : ''
                        }`}
                        onClick={() => handleChatSelect(chat)}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarImage 
                              src={chat.isGroup ? null : otherParticipant?.image || "/default-avatar.png"}
                              alt={chat.isGroup ? chat.name : otherParticipant?.firstName}
                            />
                            <AvatarFallback className={chat.isGroup ? "bg-primary text-primary-foreground" : ""}>
                              {chat.isGroup ? chat.name?.charAt(0) : otherParticipant?.firstName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {chat.isGroup 
                                ? chat.name 
                                : `${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {lastMessage}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-muted-foreground">
                            {lastMessageTime}
                          </span>
                          {unreadCount > 0 && (
                            <Badge variant="default" className="mt-1">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <Alert>
                    <AlertTitle>No Chats</AlertTitle>
                    <AlertDescription>
                      Start a new chat using the button above.
                    </AlertDescription>
                  </Alert>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="w-2/3">
        {selectedChat ? (
          <div className="rounded-lg overflow-hidden shadow-lg">
            <ChatWindow 
              chatId={selectedChat._id} 
              friendInfo={selectedChat.friendInfo}
            />
          </div>
        ) : (
          <Card className="h-[90vh] flex items-center justify-center bg-card/50 backdrop-blur-sm border-0">
            <p className="text-lg text-muted-foreground">
              Select a chat to start messaging
            </p>
          </Card>
        )}
      </div>
      <CommandBox onCommand={handleCommand} />
    </div>
  );
}
