import { MessageCircleMore, Inbox, Search, Settings } from "lucide-react";

export const sidebarLinks = [
  {
    label: "Chat",
    path: "/chat",
    icon: MessageCircleMore
  },
  {
    label: "Inbox",
    path: "/inbox",
    icon: Inbox
  },
  {
    label: "Search",
    path: "/search",
    icon: Search
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
    subItems: ['Profile', 'Appearance', 'Account', 'Chat', 'Other']
  }
];

export const settingsSubItems = ['Profile', 'Appearance', 'Account', 'Chat', 'Other'];