import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function FriendRequestSection({ user, session }) {
  const [friendRequestStatus, setFriendRequestStatus] = useState('none');
  const [friendRequestMessage, setFriendRequestMessage] = useState('');
  const [alertType, setAlertType] = useState(null); // 'success', 'error', 'warning'
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [friendRequestId, setFriendRequestId] = useState(null); // New state for requestId

  const showAlert = (message, type) => {
    setFriendRequestMessage(message);
    setAlertType(type);
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setFriendRequestMessage('');
      setAlertType(null);
    }, 5000);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchFriendRequestStatus = async () => {
      try {
        setLoading(true);
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
          setFriendRequestMessage('Failed to load friend status');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
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
    setFriendRequestMessage('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/friend-request/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();

      if (res.ok) {
        setFriendRequestStatus('request_sent');
        showAlert('Friend request sent successfully!', 'success');
      } else {
        throw new Error(data.message || 'Failed to send friend request');
      }
    } catch (error) {
      console.error('Error sending friend request:', error);
      showAlert(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (!friendRequestId) {
      setFriendRequestMessage('Invalid friend request ID');
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
        setFriendRequestStatus('friends');
        setFriendRequestMessage('Friend request accepted!');
      } else {
        throw new Error(data.message || 'Failed to accept friend request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setFriendRequestMessage(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (!friendRequestId) {
      setFriendRequestMessage('Invalid friend request ID');
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
        setFriendRequestMessage('Friend request declined.');
      } else {
        throw new Error(data.message || 'Failed to decline friend request');
      }
    } catch (error) {
      console.error('Error declining friend request:', error);
      setFriendRequestMessage(error.message);
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
        setFriendRequestMessage('Successfully unfriended.');
      } else {
        throw new Error(data.message || 'Failed to unfriend user');
      }
    } catch (error) {
      console.error('Error unfriending user:', error);
      setFriendRequestMessage(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
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
      
        {friendRequestMessage && alertType && (
          <div
          >
            <Alert 
              variant={alertType} 
              className="shadow-lg"
            >
              {alertType === 'success' && <CheckCircle2 className="h-4 w-4" />}
              {alertType === 'error' && <XCircle className="h-4 w-4" />}
              {alertType === 'warning' && <AlertCircle className="h-4 w-4" />}
              <AlertTitle>
                {alertType === 'success' && 'Success'}
                {alertType === 'error' && 'Error'}
                {alertType === 'warning' && 'Warning'}
              </AlertTitle>
              <AlertDescription>{friendRequestMessage}</AlertDescription>
            </Alert>
          </div>
        )}
     

      {friendRequestStatus === 'none' && (
        <form onSubmit={handleSendFriendRequest}>
          <input type="hidden" name="userId" value={user._id} />
          <Button type="submit" disabled={actionLoading}>
            {actionLoading ? 'Sending...' : 'Send Friend Request'}
          </Button>
        </form>
      )}

      {friendRequestStatus === 'request_sent' && (
        <div>
          <Button variant="secondary" disabled>
            Request Sent
          </Button>
        </div>
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