'use client';

import ChatDashboard from '@/components/ChatDashboard';
import MainNavbar from '@/components/MainNavbar';
import SidebarUse from '@/components/sidebarIntegrate';

export default function ChatPage() {
  return (
    <SidebarUse>

      <div className="flex flex-col  h-screen overflow-hidden">
         <MainNavbar />
        <ChatDashboard />
      </div>
       
    </SidebarUse>
  );
}