"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SetUsernamePage() {
    const [username, setUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isAvailable, setIsAvailable] = useState(null);
    const [checking, setChecking] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.username) {
            router.push(`/${session.user.username}`);
        }
    }, [status, router, session]);

    useEffect(() => {
        const checkUsername = async () => {
            if (!username || username.length < 3) {
                setIsAvailable(null);
                return;
            }

            setChecking(true);
            try {
                const response = await fetch('/api/check-username', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username }),
                });

                const data = await response.json();
                setIsAvailable(data.available);
            } catch (error) {
                console.error('Error:', error);
                setIsAvailable(false);
            } finally {
                setChecking(false);
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [username]);

    const handleSetUsername = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!username) {
            setErrorMessage('Username is required');
            return;
        }

        if (!isAvailable) {
            setErrorMessage('Username is not available');
            return;
        }

        try {
            const response = await fetch('/api/set-username', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/${username}`);
            } else {
                setErrorMessage(data.message || 'Failed to set username');
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An unexpected error occurred');
        }
    };

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                {errorMessage && (
                    <p className="text-red-500 mb-4">{errorMessage}</p>
                )}
                <form onSubmit={handleSetUsername} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium">
                            Choose a Username
                        </label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.trim())}
                            className={`mt-1 ${
                                isAvailable === true ? 'border-green-500' : 
                                isAvailable === false ? 'border-red-500' : ''
                            }`}
                        />
                        {checking && <p className="text-gray-500 mt-1">Checking availability...</p>}
                        {!checking && isAvailable === true && username && (
                            <p className="text-green-600 mt-1">Username is available!</p>
                        )}
                        {!checking && isAvailable === false && username && (
                            <p className="text-red-500 mt-1">Username is not available</p>
                        )}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full"
                        disabled={!isAvailable || checking}
                    >
                        Set Username
                    </Button>
                </form>
            </div>
        </div>
    );
}