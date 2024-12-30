"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function ChatSettings({ 
  isOpen, 
  onClose, 
  chatBackground, 
  onBackgroundChange 
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chat Background</label>
            <Input
              type="url"
              placeholder="Enter background image URL"
              value={chatBackground}
              onChange={(e) => onBackgroundChange(e.target.value)}
            />
          </div>
          {/* Add more chat settings here */}
        </div>
      </DialogContent>
    </Dialog>
  );
}
