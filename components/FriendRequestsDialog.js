'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area"; // Import ScrollArea
import dynamic from 'next/dynamic'; // Import dynamic for preloading
import { UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Dynamically import FriendRequestsPage with preloading
const DynamicFriendRequestsPage = dynamic(() => import('./FriendRequestPage'), {
  loading: () => <Skeleton className="w-full h-48" />,
  ssr: false,
});

export default  function FriendRequestsDialog() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchUnreadCount(session.user.id);
      // Preload FriendRequestsPage component
      DynamicFriendRequestsPage.preload && DynamicFriendRequestsPage.preload();
    }
  }, [session]);

  const fetchUnreadCount = async (userId) => {
    try {
      const res = await fetch(`/api/friend-request/notifications/unread-count?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`, // If using JWT or similar
        },
      });
      if (!res.ok) {
        throw new Error('Failed to fetch unread count');
      }
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error fetching unread friend request count:', error);
    }
  };

  if (status === 'loading') {
    return <Skeleton className="h-5 w-5" />;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="relative">
          <UserPlus className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Friend Requests</DialogTitle>
          <DialogDescription>
            Manage your incoming friend requests below.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-80">
          <DynamicFriendRequestsPage />
        </ScrollArea>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}