'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react'; // Import Bell icon from lucide-react
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationButton() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUnreadNotifications() {
      try {
        setLoading(true);
        const res = await fetch('/api/notifications');
        if (!res.ok) throw new Error('Failed to fetch notifications');
        
        const data = await res.json();
        // Ensure data exists and is an array
        const notifications = Array.isArray(data) ? data : [];
        const unread = notifications.filter(notif => notif?.read === false).length;
        
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    }

    fetchUnreadNotifications();
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Skeleton className="h-10 w-10 rounded-full" />
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.push('/notifications')}
      className="relative"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </Button>
  );
}