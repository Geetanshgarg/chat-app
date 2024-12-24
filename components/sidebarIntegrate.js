import React from 'react';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './SideBar';
import { Toaster } from "@/components/ui/toaster"
const SidebarUse = ({ children }) => {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 ml-0">
            
        {children}
        </main>
        <Toaster />
    </SidebarProvider>
  );
};

export default SidebarUse;