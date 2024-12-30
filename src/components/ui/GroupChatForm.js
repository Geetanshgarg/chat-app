import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function GroupChatForm({ onSubmit, onCancel, friends }) {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  const handleFriendSelect = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) ? prev.filter(id => id !== friendId) : [...prev, friendId]
    );
  };

  const handleSubmit = () => {
    if (groupName.trim() && selectedFriends.length >= 2) {
      onSubmit(groupName.trim(), selectedFriends);
    } else {
      toast.error('Please enter a group name and select at least two friends.');
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Create Group Chat</h2>
      <Input
        type="text"
        placeholder="Group Name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        className="mb-4"
      />
      <div className="mb-4">
        <p>Select Friends:</p>
        <ScrollArea className="h-48">
          {friends.map(friend => (
            <div key={friend._id} className="flex items-center mb-2">
              <input
                type="checkbox"
                id={friend._id}
                checked={selectedFriends.includes(friend._id)}
                onChange={() => handleFriendSelect(friend._id)}
              />
              <label htmlFor={friend._id} className="ml-2">
                {friend.firstName} {friend.lastName}
              </label>
            </div>
          ))}
        </ScrollArea>
      </div>
      <div className="flex justify-end space-x-2">
        <Button onClick={handleSubmit} variant="primary">Create</Button>
        <Button onClick={onCancel} variant="secondary">Cancel</Button>
      </div>
    </div>
  );
}