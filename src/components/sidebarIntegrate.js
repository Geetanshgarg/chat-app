import React from 'react';
import { SidebarProvider } from './ui/sidebar';
import { AppSidebar } from './SideBar';
import { MainNavbar } from './MainNavbar';

const SidebarUse = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <AppSidebar />
        <div className="flex flex-col flex-1">
       
          <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default SidebarUse;