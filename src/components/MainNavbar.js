"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./UserNav";
import { MoonIcon, SunIcon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import SidebarUse from "./sidebarIntegrate";
import { SidebarTrigger } from "./ui/sidebar";

export default function MainNavbar() {
  const { setTheme, theme } = useTheme();

  return (
    
    <nav className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger/>
        
            <Link href="/chat" className="flex items-center gap-2">
              <span className="text-2xl font-bold text-accent">Kabootar</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </Button>
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
    
  );
}
