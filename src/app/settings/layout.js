'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from '@/components/ui/sidebar';
import Sidebaruse from '@/components/sidebarIntegrate';
const settingsSections = [
  { 
    name: 'Profile',
    href: '/settings/profile',
    description: 'Manage your personal information'
  },
  { 
    name: 'Appearance', 
    href: '/settings/appearance',
    description: 'Customize your interface'
  },
  { 
    name: 'Account',
    href: '/settings/account',
    description: 'Manage your account settings'
  },
  { 
    name: 'Chat',
    href: '/settings/chat',
    description: 'Configure chat preferences'
  },
  { 
    name: 'Other',
    href: '/settings/other',
    description: 'Additional settings'
  }
];

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  return (
    <Sidebaruse>
    <div className="hidden space-y-6 p-10 pb-16 md:block">
      <div className="flex flex-row gap-3 items-center">

      <SidebarTrigger />
      <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and set e-mail preferences.
          </p>
        </div>
      </div>
        <Separator className="my-6" />
      <div className="flex flex-col  space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="col-span-1">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  pathname === section.href 
                  ? "bg-muted hover:bg-muted"
                  : "hover:bg-transparent hover:underline",
                "justify-start","flex flex-col h-auto items-start"
                )}
              >
               <span>{section.name}</span>
                
                  {section.description}
                
              </Link>
            ))}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          {children}
        </div>
      </div>
    </div>
    </Sidebaruse>
  );
}