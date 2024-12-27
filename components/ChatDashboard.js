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
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import ChatWindow from "./ChatWindow";
import { Badge } from "@/components/ui/badge";

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
    if (type === 'friend') {
      await handleFriendClick(data);
    } else if (type === 'group') {
      // Only create group if it doesn't exist
      const existingGroup = chats.find(
        (chat) => chat.isGroup && chat.name === data.name
      );
      
      if (!existingGroup) {
        await createGroupChat(data.name, data.members);
      } else {
        setSelectedChat(existingGroup);
      }
    }
    setOpen(false);
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
    setSelectedChat(chat);
    // Mark messages as read when selecting chat
    if (unreadCounts[chat._id] > 0) {
      try {
        await fetch(`/api/chats/${chat._id}/read`, {
          method: 'POST',
        });
        setUnreadCounts(prev => ({ ...prev, [chat._id]: 0 }));
        // Refresh chats to update last message status
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
    <>
      <div className="flex space-x-4 h-screen">
        <div className="w-1/3">
          <Card className="h-[90%]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Active Chats</CardTitle>
              <Button 
                variant="outline" 
                onClick={() => setOpen(true)}
                className="ml-2"
              >
                New Chat
              </Button>
            </CardHeader>
            <CardContent>
              {loadingChats ? (
                <Skeleton className="w-full h-48" />
              ) : (
                <ScrollArea className="h-96">
                  {chats.length > 0 ? (
                    chats.map((chat) => {
                      const otherParticipant = getOtherParticipant(chat);
                      const unreadCount = unreadCounts[chat._id] || 0;
                      const lastMessage = getLastMessagePreview(chat);
                      const lastMessageTime = getLastMessageTime(chat);
                      
                      return (
                        <div
                          key={chat._id}
                          className={`flex items-center justify-between rounded-sm border-b my-2 p-2 hover:border cursor-pointer ${
                            selectedChat?._id === chat._id ? 'bg-secondary' : ''
                          }`}
                          onClick={() => handleChatSelect(chat)}
                        >
                          <div className="flex items-center gap-2">
                            {chat.isGroup ? (
                              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                                {chat.name?.charAt(0)}
                              </div>
                            ) : (
                              <Image
                                src={otherParticipant?.image || "/default-avatar.png"}
                                alt={otherParticipant?.firstName}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
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
            <ChatWindow chatId={selectedChat._id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">
                Select a chat to start messaging.
              </p>
            </div>
          )}
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search people or create a group..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Friends">
            {friends.map((friend) => (
              <CommandItem
                key={friend._id}
                onSelect={() => handleCommand('friend', friend)}
              >
                <Image
                  src={friend.image || "/default-avatar.png"}
                  alt={friend.firstName}
                  width={24}
                  height={24}
                  className="rounded-full mr-2"
                />
                {friend.firstName} {friend.lastName}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem
              onSelect={() => handleCommand('group', { isNewGroup: true })}
            >
              Create New Group
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
