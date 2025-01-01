"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import {
  ChevronLeft,
  Trash2,
  Archive,
  Palette,
  Image as ImageIcon,
  X,
  ChevronRight,
  Check
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatThemes } from "@/config/chatThemes";
import { cn } from "@/lib/utils";  // Add this import

export default function ChatSettings({ 
  isOpen, 
  onClose, 
  chatBackground, 
  onBackgroundChange,
  friendDetails,
  chatId,
  currentTheme  // Add this prop
}) {
  const [currentView, setCurrentView] = useState('main');
  const [selectedTheme, setSelectedTheme] = useState(currentTheme?.id || 'default');
  const [currentThemeIndex, setCurrentThemeIndex] = useState(0);
  
  const themes = Object.values(chatThemes);

  const handleThemeSelect = (themeId) => {
    const theme = chatThemes[themeId];
    if (!theme) return;
    
    onBackgroundChange(theme);
    setSelectedTheme(themeId);
    setCurrentView('main');
  };

  const handleSaveTheme = () => {
    onBackgroundChange(themes[currentThemeIndex]);
    setCurrentView('main');
    toast.success('Chat theme updated successfully');
  };

  const handleDeleteChat = async () => {
    try {
      const res = await fetch(`/api/chats/${chatId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete chat');
      
      // Emit chat deletion event through socket
      socket?.emit('chat-deleted', { chatId });
      
      toast.success('Chat deleted successfully');
      router.push('/chat'); // Redirect to chat list
      onClose();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleArchiveChat = async () => {
    // Implement archive chat functionality
    toast.success('Chat archived successfully');
    onClose();
  };

  const handleNextTheme = () => {
    setCurrentThemeIndex((prev) => (prev + 1) % themes.length);
  };

  const handlePreviousTheme = () => {
    setCurrentThemeIndex((prev) => (prev - 1 + themes.length) % themes.length);
  };

  const renderMainView = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-24 w-24">
          <AvatarImage src={friendDetails?.image || "/default-avatar.png"} />
          <AvatarFallback>{friendDetails?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold">{friendDetails?.name}</h2>
          <p className="text-sm text-muted-foreground">@{friendDetails?.username}</p>
          <div className="flex items-center justify-center gap-2 text-sm">
            <span 
              className={`h-2 w-2 rounded-full ${
                friendDetails?.isOnline ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <span className="text-muted-foreground">
              {friendDetails?.isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Bio</h3>
        <p className="text-sm text-muted-foreground">
          {friendDetails?.bio || "No bio available"}
        </p>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Additional Info</h3>
        <div className="space-y-2 text-sm">
          <p>Email: {friendDetails?.email || 'Not available'}</p>
          <p>Joined: {friendDetails?.joinedAt ? new Date(friendDetails.joinedAt).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="font-semibold">Chat Settings</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setCurrentView('theme')}
          >
            <Palette className="mr-2 h-4 w-4" />
            Change Chat Theme
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start text-yellow-600"
          onClick={handleArchiveChat}
        >
          <Archive className="mr-2 h-4 w-4" />
          Archive Chat
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-destructive"
          onClick={handleDeleteChat}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Chat
        </Button>
      </div>
    </div>
  );

  const renderThemeView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {Object.values(chatThemes).map((theme) => (
          <div
            key={theme.id}
            className={cn(
              "relative cursor-pointer rounded-lg p-2 transition-all",
              "border-2",
              selectedTheme === theme.id 
                ? "border-primary ring-2 ring-primary ring-offset-2" 
                : "border-border hover:border-primary/50"
            )}
            onClick={() => handleThemeSelect(theme.id)}
          >
            <div
              className="h-32 w-full rounded-md overflow-hidden"
              style={{
                background: theme.background,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <div className="h-full w-full p-3 flex flex-col justify-between">
                <div className={cn(
                  "w-16 h-8 rounded-md ml-auto",
                  theme.sentMessage
                )} />
                <div className={cn(
                  "w-16 h-8 rounded-md",
                  theme.receivedMessage
                )} />
              </div>
            </div>
            <p className="mt-2 text-sm font-medium text-center">
              {theme.name}
              {selectedTheme === theme.id && (
                <Check className="h-4 w-4 absolute top-2 right-2 text-primary" />
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[500px] h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <DialogHeader className="sticky top-0 z-50 p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle>
              {currentView === 'main' ? 'Chat Info' : 'Chat Theme'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 h-[calc(90vh-4rem)]">
          <div className="p-6">
            {currentView === 'main' ? renderMainView() : renderThemeView()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
