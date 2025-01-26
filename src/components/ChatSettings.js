"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";

export default function ChatSettings({ isOpen, onClose, onDelete, onArchive }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={onArchive}
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Chat
          </Button>
          <Button 
            variant="destructive" 
            className="w-full justify-start" 
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
