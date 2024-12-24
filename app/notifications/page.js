'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import NotificationItem from '@/components/NotificationItem';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/api/auth/signin');
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="w-full max-w-3xl space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <Button onClick={() => router.refresh()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      {(!notifications || notifications.length === 0) ? (
        <p>No notifications.</p>
      ) : (
        <ul className="space-y-4 w-full max-w-3xl">
          {notifications.map((notification) => (
            <NotificationItem 
              key={notification._id} 
              notification={notification} 
            />
          ))}
        </ul>
      )}
      <Button 
        onClick={() => router.back()} 
        className="mt-6"
        variant="outline"
      >
        Back
      </Button>
    </div>
  );
}