'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link'; // Import Link for navigation
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function FriendRequestPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const [alert, setAlert] = useState(null); // New state for alerts
  const [friendRequestId, setFriendRequestId] = useState(null);
  useEffect(() => {
    if (session?.user?.id) {
      fetchFriendRequests(session.user.id);
    }
  }, [session]);


  const fetchFriendRequests = async (userId) => {
    try {
      const res = await fetch(`/api/friend-request/notifications`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`, // If using JWT or similar
        },
      });
      if (!res.ok) throw new Error('Failed to fetch friend requests');
      const data = await res.json();
      setRequests(data);
      
      // Optionally, mark all as read
      await fetch('/api/friend-request/notifications/mark-as-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          },
        body: JSON.stringify({ userId }),
      });
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      setAlert({ type: 'error', message: 'Failed to load friend requests.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      const res = await fetch('/api/friend-request/respond', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        setRequests((prev) => prev.filter((req) => req._id !== requestId));
        setAlert({ type: 'success', message: `Friend request ${action === 'accepted' ? 'accepted' : 'declined'} successfully.` });
      } else {
        throw new Error(data.message || `Failed to ${action} friend request.`);
      }
    } catch (error) {
      console.error(`Error ${action} friend request:`, error);
      setAlert({ type: 'error', message: error.message });
    }
  };

  if (status === 'loading') {
    return <Skeleton className="w-full h-48" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg">You need to be authenticated to view friend requests.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alert Section */}
      {alert && (
        <Alert variant={alert.type} className="shadow-lg">
          {alert.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
          {alert.type === 'error' && <XCircle className="h-4 w-4" />}
          {alert.type === 'warning' && <AlertCircle className="h-4 w-4" />}
          <div className="ml-2">
            <AlertTitle>
              {alert.type === 'success' && 'Success'}
              {alert.type === 'error' && 'Error'}
              {alert.type === 'warning' && 'Warning'}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </div>
        </Alert>
      )}

      {/* Friend Requests List */}
      {loading ? (
        <Skeleton className="w-full h-48" />
      ) : (
        <ScrollArea className="h-80"> {/* Adjust height as needed */}
          {requests.length > 0 ? (
            requests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-4 border rounded-lg">
                <Link href={`/users/${request.requester._id}`} className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded">
                  <Image
                    src={request.requester.image || '/default-avatar.png'}
                    alt={`${request.requester.firstName} ${request.requester.lastName}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{`${request.requester.firstName} ${request.requester.lastName}`}</p>
                    <p className="text-sm text-gray-500">@{request.requester.username}</p>
                  </div>
                </Link>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => handleRespond(request._id, 'accepted')}
                    variant="default"
                    disabled={false} // Optionally disable while processing
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => handleRespond(request._id, 'declined')}
                    variant="destructive"
                    disabled={false} // Optionally disable while processing
                  >
                    Decline
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No incoming friend requests.</p>
          )}
        </ScrollArea>
      )}
    </div>
  );
}