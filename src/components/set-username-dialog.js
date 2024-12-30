import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function SetUsernameDialog({ isOpen, onClose, onSubmit }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const validateUsername = (value) => {
    if (!value) return 'Username is required';
    if (value.length < 3) return 'Username must be at least 3 characters';
    if (value.length > 30) return 'Username must be less than 30 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers and underscores';
    }
    return null;
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    const validationError = validateUsername(value);
    setError(validationError || '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsChecking(true);
    try {
      const res = await fetch('/api/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to check username');
      }

      if (!data.available) {
        setError('Username already taken');
        return;
      }

      // Username is valid and available
      await onSubmit(username);
      toast.success('Username set successfully!');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose a Username</DialogTitle>
          <DialogDescription>
            Pick a unique username for your account. This will be your identifier in chats.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter username"
              disabled={isChecking}
              className={error ? 'border-red-500' : ''}
            />
            {error && (
              <p className="text-destructive">{error}</p>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isChecking}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isChecking || Boolean(error) || !username}
            >
              {isChecking ? 'Checking...' : 'Set Username'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}