"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"; // Adjust the import paths as necessary
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import shadcn's AlertDialog components
import {
  Inbox,
  Search,
  Settings,
  ChevronRight,
  MessageCircleMore,
} from "lucide-react"; // Ensure correct icon imports
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "./ui/collapsible";
import CommandBox from "./CommandBox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    // Wait until loading is complete
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleSignOut = () => {
    signOut();
  };

  const handleCommand = (type, data) => {
    if (type === 'profile') {
      router.push(`/${data.username}`);
    } else if (type === 'chat') {
      // Implement chat opening logic here
    }
  };

  const renderAlertDialog = () => (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Sign Out</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to sign out? You will need to log in again to
            access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSignOut}>
            Sign Out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <Sidebar className="min-h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarHeader className="border-b px-6 py-4 flex flex-row justify-between items-center">
        <h3 className="text-xl font-semibold text-primary">Chat App</h3>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-accent relative group"
                  onClick={() => setIsCommandOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search (⌘/Ctrl+Q)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <CommandBox 
            open={isCommandOpen} 
            onOpenChange={setIsCommandOpen}
            onCommand={handleCommand} 
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => router.push("/chat")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <MessageCircleMore className="h-5 w-5 text-primary" />
                  <span className="font-medium">Chat</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => router.push("/Inbox")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Inbox className="h-5 w-5 text-primary" />
                  <span className="font-medium">Inbox</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => router.push("/Search")}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <Search className="h-5 w-5 text-primary" />
                  <span className="font-medium">Search</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Collapsible defaultOpen className="group/collapsible w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent transition-colors">
                      <Settings className="h-5 w-5 text-primary" />
                      <span className="font-medium">Settings</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pl-2 space-y-1">
                    <SidebarMenuSub>
                      {['Profile', 'Appearance', 'Account', 'Chat', 'Other'].map((item) => (
                        <SidebarMenuSubItem key={item}>
                          <SidebarMenuSubButton
                            onClick={() => router.push(`/settings/${item.toLowerCase()}`)}
                            className="w-full text-sm py-2 px-4 rounded-md hover:bg-accent/50 transition-colors"
                          >
                            {item}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenuButton asChild>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="w-full h-14 justify-start gap-3 p-4 rounded-lg hover:bg-accent transition-colors"
                variant="ghost"
              >
                <Image
                  src={session?.user?.image || "/default-profile.png"}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="rounded-full ring-2 ring-primary/10"
                />
                <div className="flex flex-col text-left">
                  <span className="font-medium text-foreground">
                    {session?.user?.name || "Unnamed"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{session?.user?.username || "username"}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => router.push(`/${session?.user?.username}`)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-2" onClick={() => router.push("/settings")}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2 text-destructive" onClick={() => setIsAlertOpen(true)}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuButton>
        {renderAlertDialog()}
      </SidebarFooter>
    </Sidebar>
  );
}
