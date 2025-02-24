"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserNav } from "./UserNav";
import { MoonIcon, SunIcon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { SidebarTrigger } from "./ui/sidebar";
import Image from "next/image";

export default function MainNavbar() {
  const { setTheme, theme } = useTheme();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 md:hidden">
      <div className="flex h-16 items-center px-4">
        <SidebarTrigger className="mr-2" />
        <div className="flex flex-1 items-center justify-between">
          <Link href="/chat" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="font-bold text-lg">Kabootar</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
            </Button>
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
  );
}
