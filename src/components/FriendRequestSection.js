import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';


export default function FriendRequestSection({ user, session }) {
  const [friendRequestStatus, setFriendRequestStatus] = useState('none');
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState(null); // New state for requestId

  useEffect(() => {
    let isMounted = true;

    const fetchFriendRequestStatus = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/friend-request/status/${user._id}`);
        if (!res.ok) throw new Error('Failed to fetch status');
        const data = await res.json();
        if (isMounted) {
          setFriendRequestStatus(data.status);
          // Store requestId in local state instead of updating parent
          if (data.status === 'request_received') {
            setFriendRequestId(data.requestId);
          }
        }
      } catch (error) {
        console.error('Error fetching friend request status:', error);
        if (isMounted) {
          toast.error('Failed to load friend status');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user._id && session?.user?.id) {
      fetchFriendRequestStatus();
    }

    return () => {
      isMounted = false;
    };
  }, [user._id, session?.user?.id]); // Removed onUpdateUser from dependencies

  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user._id
        })
      });

      const data = await res.json();

      if (res.ok) {
        setFriendRequestStatus('pending');
        toast.success('Friend request sent successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send friend request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendRequestId) {
      toast.error('Invalid friend request ID');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/friend-request/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: friendRequestId, action: 'accepted' }),
      });

      const data = await res.json();

      if (res.ok) {
        setFriendRequestStatus('accepted');
        toast.success('Friend request accepted!');
      } else {
        throw new Error(data.message || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!friendRequestId) {
      toast.error('Invalid friend request ID');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/friend-request/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: friendRequestId, action: 'declined' }),
      });

      const data = await res.json();

      if (res.ok) {
        setFriendRequestStatus('none');
        toast.success('Friend request declined.');
      } else {
        throw new Error(data.message || 'Failed to decline friend request');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnfriend = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/friend-request/unfriend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: user._id  , userId: session.user.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setFriendRequestStatus('none');
        toast.success('Successfully unfriended.');
      } else {
        throw new Error(data.message || 'Failed to unfriend user');
      }
    } catch (error) {
      console.error('Error unfriending user:', error);
      toast.error(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mt-4">
        <div className="flex space-x-2">
          <Skeleton className="h-10 w-32" /> {/* Primary action button */}
          <Skeleton className="h-10 w-32" /> {/* Secondary action button (for accept/decline) */}
        </div>
        <Skeleton className="h-5 w-48 mt-2" /> {/* Message placeholder */}
      </div>
    );
  }

  return (
    <div className="mt-4">
      {friendRequestStatus === 'none' && (
        <form onSubmit={handleSendFriendRequest}>
          <input type="hidden" name="userId" value={user._id} />
          <Button 
            type="submit" 
            disabled={isLoading}
            
          >
            {isLoading ? 'Sending...' : 'Send Friend Request'}
          </Button>
        </form>
      )}

      {friendRequestStatus === 'pending' && (
        <Button disabled variant="outline">
          Friend Request Pending
        </Button>
      )}

      {friendRequestStatus === 'request_received' && (
        <div className="flex space-x-2">
          <Button 
            onClick={handleAcceptFriendRequest} 
            variant="success"
            disabled={actionLoading}
          >
            {actionLoading ? 'Accepting...' : 'Accept'}
          </Button>
          <Button 
            onClick={handleDeclineFriendRequest} 
            variant="destructive"
            disabled={actionLoading}
          >
            {actionLoading ? 'Declining...' : 'Decline'}
          </Button>
        </div>
      )}

      {friendRequestStatus === 'accepted' && (
        <Button disabled className="w-full bg-green-500">
          Friends
        </Button>
      )}

      {friendRequestStatus === 'friends' && (
        <Button 
          variant="destructive" 
          onClick={handleUnfriend}
          disabled={actionLoading}
        >
          {actionLoading ? 'Unfriending...' : 'Unfriend'}
        </Button>
      )}
    </div>
  );
}