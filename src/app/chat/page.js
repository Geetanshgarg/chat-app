'use client';

import ChatDashboard from '@/components/ChatDashboard';
import MainNavbar from '@/components/MainNavbar';
import SidebarUse from '@/components/sidebarIntegrate';

export default function ChatPage() {
  return (
    <SidebarUse>

      
        <ChatDashboard />
      
       
    </SidebarUse>
  );
}