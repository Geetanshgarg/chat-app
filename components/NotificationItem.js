// filepath: /components/NotificationItem.js

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default function NotificationItem({ notification }) {
  const router = useRouter();

  const handleClick = () => {
    if (notification.type === 'friend_request' && notification.sender) {
      router.push(`/${notification.sender.username}`);
    }
  };

  return (
    <Card
      className={`mb-2 p-4 ${
        notification.type === 'friend_request' ? 'cursor-pointer hover:bg-gray-50' : ''
      } ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`}
      onClick={handleClick}
    >
      <p className="text-sm text-gray-900">{notification.message}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {new Date(notification.createdAt).toLocaleString()}
        </span>
        {!notification.read && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
            New
          </span>
        )}
      </div>
    </Card>
  );
}