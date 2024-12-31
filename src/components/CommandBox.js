"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  UserRound,
  Users,
  Mail,
  Settings,
  Plus,
} from "lucide-react";
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { DialogTitle } from "@/components/ui/dialog";

export default function CommandBox({ open, onOpenChange, onCommand }) {
  const [friends, setFriends] = useState([]);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    const down = (e) => {
      if (e.key === "q" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange?.(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open && session?.user?.username) {
      fetchFriends(session.user.username);
    }
  }, [open, session?.user?.username]);

  const fetchFriends = async (username) => {
    if (!username) return;
    
    try {
      const res = await fetch(`/api/users/${username}/friends`);
      if (!res.ok) throw new Error("Failed to fetch friends");
      const data = await res.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleSelect = async (type, data) => {
    if (type === 'profile') {
      router.push(`/${data.username}`);
    } else if (type === 'chat') {
      const friendInfo = {
        name: `${data.friend.firstName} ${data.friend.lastName}`,
        username: data.friend.username,
        image: data.friend.image,
        isOnline: data.friend.isOnline
      };
      
      window.localStorage.setItem('activeChat', JSON.stringify({
        chatId: data.chat._id,
        friendInfo
      }));
      
      router.push('/chat');
    }
    onOpenChange?.(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle className="sr-only">Search commands and friends</DialogTitle>
      <CommandInput placeholder="Type a command or search... (⌘/Ctrl+Q to toggle)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <TooltipProvider>
            {quickActions.map(({ icon: Icon, label, path, tooltip }) => (
              <Tooltip key={path}>
                <TooltipTrigger asChild>
                  <CommandItem onSelect={() => handleSelect('navigation', path)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{label}</span>
                  </CommandItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Friends">
          {friends.map((friend) => (
            <CommandItem
              key={friend._id}
              onSelect={() => handleSelect('profile', friend)}
              className="flex items-center gap-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={friend.image} alt={friend.firstName} />
                <AvatarFallback>{friend.firstName?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span>{friend.firstName} {friend.lastName}</span>
                <span className="text-sm text-muted-foreground">
                  @{friend.username}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem onSelect={() => handleSelect('navigation', '/settings/profile')}>
            <UserRound className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('navigation', '/settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>App Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => handleSelect('navigation', '/inbox')}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Inbox</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

const quickActions = [
  {
    icon: MessageCircle,
    label: "Open Chat",
    path: "/chat",
    tooltip: "Go to your chat messages"
  },
  {
    icon: Users,
    label: "Find Friends",
    path: "/friends",
    tooltip: "Discover and add new friends"
  },
  // Add more quick actions as needed
];
