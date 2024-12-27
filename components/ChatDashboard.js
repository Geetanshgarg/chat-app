'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import ChatWindow from './ChatWindow'; // Import ChatWindow component
import Modal from '@/components/ui/Modal'; // Ensure Modal is correctly imported
import GroupChatForm from '@/components/ui/GroupChatForm'; 
// Import GroupChatForm
export default function ChatDashboard() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null); // Add selectedChat state
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false); // Add isGroupModalOpen state

  const openGroupModal = () => setIsGroupModalOpen(true);
  const closeGroupModal = () => setIsGroupModalOpen(false);

  useEffect(() => {
    if (session?.user?.username) {
      fetchChats(session.user.username);
      fetchFriends(session.user.username);
    }
  }, [session]);

  const fetchChats = async (username) => {
    try {
      const res = await fetch(`/api/users/${username}/chats`);
      if (!res.ok) throw new Error('Failed to fetch chats');
      const data = await res.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to load chats.');
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchFriends = async (username) => {
    try {
      const res = await fetch(`/api/users/${username}/friends`);
      if (!res.ok) throw new Error('Failed to fetch friends');
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends.');
    } finally {
      setLoadingFriends(false);
    }
  };

  const createChat = async (friendUsername) => {
    try {
      const res = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ 
          username: session.user.username, 
          friendUsername 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setChats([...chats, data.chat]);
        toast.success('Chat created successfully.');
      } else {
        throw new Error(data.error || 'Failed to create chat.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error(error.message || 'Failed to create chat.');
    }
  };

  const createGroupChat = async (groupName, selectedFriends) => {
    try {
      const res = await fetch('/api/chats/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.accessToken}`,
        },
        body: JSON.stringify({ 
          userId: session.user.id, 
          friendId: selectedFriends, 
          isGroup: true, 
          groupName 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setChats([...chats, data.chat]);
        toast.success('Group chat created successfully.');
        closeGroupModal();
      } else {
        throw new Error(data.message || 'Failed to create group chat.');
      }
    } catch (error) {
      console.error('Error creating group chat:', error);
      toast.error(error.message || 'Failed to create group chat.');
    }
  };

  const handleFriendClick = async (friendId) => {
    // Find existing chat with the friend
    const existingChat = chats.find(chat => 
      !chat.isGroup && chat.participants.some(participant => participant._id === friendId)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
    } else {
      // Create a new chat if it doesn't exist
      try {
        const res = await fetch('/api/chats/create', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify({ userId: session.user.id, friendId }),
        });

        const data = await res.json();

        if (res.ok) {
          setChats([...chats, data.chat]);
          setSelectedChat(data.chat);
          toast.success('Chat created successfully.');
        } else {
          throw new Error(data.message || 'Failed to create chat.');
        }
      } catch (error) {
        console.error('Error creating chat:', error);
        toast.error(error.message || 'Failed to create chat.');
      }
    }
  };

  if (status === 'loading') {
    return <Skeleton className="w-full h-48" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">You need to be authenticated to view the chat dashboard.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 h-screen">
        <div className="w-1/3">
          {/* Friends Section */}
          <Card className="h-[90%]">
            <CardHeader>
              <CardTitle>Your Friends</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingFriends ? (
                <Skeleton className="w-full h-48" />
              ) : (
                <ScrollArea className="h-96">
                  {friends.length > 0 ? (
                    friends.map((friend) => (
                      <div
                        key={friend._id}
                        className="flex items-center flex-row rounded-sm border-b my-2 gap-2 p-2 hover:border cursor-pointer"
                        onClick={() => handleFriendClick(friend._id)} // Set selectedChat on click
                      >
                          <Image
                            src={friend.image || "/default-avatar.png"}
                            alt={`${friend.firstName} ${friend.lastName}`}
                            width={40}
                            height={40}
                            className="rounded-full"
                            />
                          <span>{`${friend.firstName} ${friend.lastName}`}</span>
                      </div>
                    ))
                  ) : (
                    <Alert variant="destructive">
                      <AlertTitle>No Friends</AlertTitle>
                      <AlertDescription>You have no friends to chat with.</AlertDescription>
                    </Alert>
                  )}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

      {/* Group Chat Modal */}
        {/* Chat Window Section */}
        <div className="w-2/3">
          {selectedChat ? (
            <ChatWindow chatId={selectedChat._id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-lg text-gray-500">Select a chat to start messaging.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Group Chat Button */}
      <button
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg"
        onClick={openGroupModal}
      >
        +
      </button>

      {/* Group Chat Modal */}
      {isGroupModalOpen && (
        <Modal onClose={closeGroupModal}>
          <GroupChatForm onSubmit={createGroupChat} onCancel={closeGroupModal} friends={friends} />
        </Modal>
      )}
    </>
  );
}