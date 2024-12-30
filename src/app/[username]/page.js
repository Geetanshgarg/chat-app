'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import SignOutButton from '@/components/SignOutButton';
import dynamic from 'next/dynamic';
import FriendRequestSection from '@/components/FriendRequestSection';
// import PageTransition from '@/components/PageTransition';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SidebarTrigger } from '@/components/ui/sidebar';
import Sidebaruse from '@/components/sidebarIntegrate';
import { Separator } from '@/components/ui/separator';
import { FriendRequestsDialog } from '@/components/FriendRequestsDialog';

const DynamicFriendRequestsDialog = dynamic(() => import('@/components/FriendRequestsDialog'), {
  loading: () => <Skeleton className="w-full h-10" />,
  ssr: false,
});

export default function ProfilePage({params}) {
  const {username} = React.use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Preload FriendRequestsDialog when ProfilePage mounts
    DynamicFriendRequestsDialog.preload && DynamicFriendRequestsDialog.preload();
  }, []);

  // Fetch user data based on username
  const fetchUser = async () => {
    try {
      const res = await fetch(`/api/users/${username}`);
      if (!res.ok) {
        router.push('/404');
        return;
      }
      const userData = await res.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/404');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchUser();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center p-6 md:p-10">
        {/* Header with button skeleton */}
        <div className="w-full max-w-3xl flex justify-end mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Main content area */}
        <div className="w-full max-w-3xl">
          {/* Profile header with image and name */}
          <div className="flex items-center mb-6">
            <Skeleton className="w-[120px] h-[120px] rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-8 w-48" /> {/* Name */}
              <Skeleton className="h-4 w-32" /> {/* Username */}
            </div>
          </div>

          {/* Profile content sections */}
          <div className="space-y-6">
            {/* Bio section */}
            <div>
              <Skeleton className="h-6 w-24 mb-2" /> {/* About heading */}
              <Skeleton className="h-20 w-full" /> {/* Bio content */}
            </div>

            {/* Location section */}
            <div>
              <Skeleton className="h-6 w-24 mb-2" /> {/* Location heading */}
              <Skeleton className="h-16 w-full" /> {/* Location content */}
            </div>

            {/* Action button */}
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isOwnProfile = session?.user?.id === user._id;

  return (
  <Sidebaruse>
      <div className="flex min-h-screen min-w-screen flex-col p-6 md:p-10">
        
        <div className="w-full flex flex-row justify-between ">
          <SidebarTrigger />
          <div className="mb flex gap-3">
          <DynamicFriendRequestsDialog/>
          {isOwnProfile && <ThemeToggle />}
          {isOwnProfile && <SignOutButton />}
          </div>
        </div>
        <Separator orientation="horizontal" className="my-6" />
        <div className="w-full max-w-3xl">
          <div className="flex items-center mb-6">
            <Image
              src={user.image || '/default-profile.png'}
              alt={`${user.firstName} ${user.lastName}`}
              width={120}
              height={120}
              className="rounded-full"
            />
            <div className="ml-4">
              <h1 className="text-2xl text-foreground font-bold">
                {`${user.firstName} ${user.lastName}`}
              </h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>

          <div className="space-y-6">
            {user.bio && (
              <div>
                <h3 className="text-lg text-foreground font-medium">About</h3>
                <p className='text-muted-foreground'>{user.bio}</p>
              </div>
            )}
            {user.location && (
              <div>
                <h3 className="text-lg text-foreground font-medium">Location</h3>
                <p className='text-muted-foreground'>{user.location}</p>
              </div>
            )}

            {isOwnProfile ? (
              <Button onClick={()=> router.push("/settings")}>Edit Profile</Button>
            ) : (
              session?.user && (
                <FriendRequestSection
                  user={user}
                  session={session}
                  onUpdateUser={(updatedUser) => setUser(updatedUser)}
                />
              )
            )}
          </div>
        </div>
      </div>
      </Sidebaruse>
  );
}