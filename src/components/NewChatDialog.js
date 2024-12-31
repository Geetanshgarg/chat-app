"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, MessageCircle, UsersRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewChatDialog({ open, onClose, friends = [], onSelectFriend }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredFriends, setFilteredFriends] = useState(friends);
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    setFilteredFriends(
      friends.filter((friend) =>
        `${friend.firstName} ${friend.lastName} ${friend.username}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, friends]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">New Chat</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Tabs defaultValue="friends" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Direct Message
              </TabsTrigger>
              <TabsTrigger value="groups" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Group Chat
              </TabsTrigger>
            </TabsList>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${activeTab === 'friends' ? 'friends' : 'groups'}...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <TabsContent value="friends" className="mt-0">
              <ScrollArea className="h-[400px] rounded-md border">
                <div className="p-4 space-y-2">
                  {filteredFriends.length > 0 ? (
                    filteredFriends.map((friend) => (
                      <div
                        key={friend._id}
                        onClick={() => {
                          onSelectFriend(friend);
                          onClose();
                        }}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg",
                          "hover:bg-accent/50 transition-colors cursor-pointer",
                          "group relative"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={friend.image} />
                            <AvatarFallback>
                              {friend.firstName[0]}
                              {friend.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              @{friend.username}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {friend.isOnline && (
                            <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                              Online
                            </Badge>
                          )}
                          <MessageCircle 
                            className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[360px] text-center p-4">
                      <UsersRound className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {searchQuery 
                          ? "No friends found matching your search" 
                          : "No friends available to chat with"}
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="mt-0">
              <div className="flex flex-col items-center justify-center h-[400px] border rounded-md">
                <Users className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Group chat feature coming soon
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
