import React from 'react';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './SideBar';

const SidebarUse = ({ children }) => {
  return (
    <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 ml-0">
            
        {children}
        </main>
        
    </SidebarProvider>
  );
};

export default SidebarUse;