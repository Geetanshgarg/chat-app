"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  ChevronLeft,
  Menu,
  LogOut,
  MessageSquare,
  Settings,
  Search,
  Moon,
  Sun
} from "lucide-react";

export function AppSidebar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCompact, setIsCompact] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-4 border-b flex items-center gap-2">
        <Image 
          src="/logo.png" 
          alt="Logo" 
          width={32} 
          height={32} 
          className="min-w-8"
        />
        {(!isCompact || isMobile) && (
          <span className="font-bold text-lg">Kabootar</span>
        )}
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b">
        <Button
          variant="ghost"
          className="w-full p-0 h-auto hover:bg-transparent"
          onClick={() => router.push('/profile')}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 ring-2 ring-primary/10">
              <AvatarImage src={session?.user?.image} />
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {(!isCompact || isMobile) && (
              <div className="flex-1 overflow-hidden text-left">
                <p className="font-medium truncate">{session?.user?.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  @{session?.user?.username}
                </p>
              </div>
            )}
          </div>
        </Button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 p-2">
        <nav className="space-y-1">
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              isCompact && !isMobile ? "justify-center" : "justify-start"
            )}
            onClick={() => router.push('/chat')}
          >
            <MessageSquare className="h-5 w-5" />
            {(!isCompact || isMobile) && <span className="ml-3">Messages</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              isCompact && !isMobile ? "justify-center" : "justify-start"
            )}
            onClick={() => router.push('/search')}
          >
            <Search className="h-5 w-5" />
            {(!isCompact || isMobile) && <span className="ml-3">Search</span>}
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              isCompact && !isMobile ? "justify-center" : "justify-start"
            )}
            onClick={() => router.push('/settings')}
          >
            <Settings className="h-5 w-5" />
            {(!isCompact || isMobile) && <span className="ml-3">Settings</span>}
          </Button>
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t space-y-1">
        {!isMobile && (
          <Button
            variant="ghost"
            className={cn(
              "w-full",
              isCompact ? "justify-center" : "justify-start"
            )}
            onClick={() => setIsCompact(!isCompact)}
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              isCompact && "rotate-180"
            )} />
            {!isCompact && <span className="ml-3">Collapse</span>}
          </Button>
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full",
            isCompact && !isMobile ? "justify-center" : "justify-start"
          )}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              {(!isCompact || isMobile) && <span className="ml-3">Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              {(!isCompact || isMobile) && <span className="ml-3">Dark Mode</span>}
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className={cn(
            "w-full hover:bg-red-100 dark:hover:bg-red-900/10",
            isCompact && !isMobile ? "justify-center" : "justify-start"
          )}
          onClick={() => signOut()}
        >
          <LogOut className="h-5 w-5 text-red-500" />
          {(!isCompact || isMobile) && <span className="ml-3 text-red-500">Sign Out</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div 
        className={cn(
          "fixed left-0 top-0 h-screen z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r transition-all duration-300",
          isCompact ? "w-[70px]" : "w-[240px]"
        )}
      >
        <SidebarContent />
      </div>

      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 md:hidden z-50"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Dialog */}
      <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent className="sm:max-w-[300px] p-0 h-[100dvh] max-h-screen">
          <SidebarContent isMobile={true} />
        </DialogContent>
      </Dialog>

      {/* Main content wrapper */}
      <div className={cn(
        "min-h-screen",
        "md:pl-[70px]",
        !isCompact && "md:pl-[240px]"
      )}>
        <main className="p-4">
          {/* Your main content goes here */}
        </main>
      </div>
    </>
  );
}