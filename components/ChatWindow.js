'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';
import { toast } from 'sonner';

export default function ChatWindow({ chatId }) { // Accept chatId as a prop
  console.log(`ChatWindow component rendered with chatId: ${chatId}`); // Added log
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(true);
  const messagesEndRef = useRef(null);

  
  const fetchMessages = async (chatId) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      scrollToBottom();
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (chatId && session?.user?.id) {
      fetchMessages(chatId);
      // Optionally set up real-time updates with WebSockets or SSE
    }
  }, [chatId, session]);

  const sendMessage = async () => {
    if (!currentMessage.trim()) return;

    try {
      const res = await fetch(`/api/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: currentMessage }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessages([...messages, data.message]);
        setCurrentMessage('');
        scrollToBottom();
        // Optionally notify other participants via WebSockets
      } else {
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message.');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">You need to be authenticated to view this chat.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
            <Button onClick={() => router.back()}>Back</Button>
            <h2 className="text-lg font-semibold">Chat</h2> 
        </div>
      {/* Messages Section */}
      <div className="flex-1 overflow-auto p-4">
        {loadingMessages ? (
          <p>Loading messages...</p>
        ) : (
          <ScrollArea>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div key={msg._id} className={`flex ${msg.sender._id === session.user.id ? 'justify-end' : 'justify-start'} mb-4`}>
                  {msg.sender._id !== session.user.id && (
                    <Image
                      src={msg.sender.image || '/default-avatar.png'}
                      alt={`${msg.sender.firstName} ${msg.sender.lastName}`}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  )}
                  <div className={`ml-2 ${msg.sender._id === session.user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'} p-2 rounded-lg max-w-xs`}>
                    <p>{msg.content}</p>
                    <span className="text-xs text-gray-600">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No messages yet.</p>
            )}
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            className="flex-1"
          />
          <Button onClick={sendMessage} variant="primary">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}