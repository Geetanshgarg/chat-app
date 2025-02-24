"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import debounce from "lodash/debounce";
import { toast } from "sonner";

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ users: [], recommendations: [] });
  const [loading, setLoading] = useState(false);

  const searchUsers = async (searchQuery) => {
    if (!searchQuery.trim()) {
      try {
        const res = await fetch('/api/users/recommendations');
        const data = await res.json();
        
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch recommendations');
        }
        
        setResults({ 
          users: [], 
          recommendations: Array.isArray(data.recommendations) ? data.recommendations : [] 
        });
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
        toast.error(error.message || "Failed to load recommendations");
        setResults({ users: [], recommendations: [] });
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search request failed');
      const data = await res.json();
      if (!data || !Array.isArray(data.users)) throw new Error('Invalid response format');
      setResults({ users: data.users, recommendations: [] });
    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Failed to search users");
      setResults({ users: [], recommendations: [] });
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(searchUsers, 300);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  // Load initial recommendations
  useEffect(() => {
    searchUsers("");
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800/50 p-4 sm:p-6">
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-gray-400 dark:text-zinc-500" />
          <Input
            type="text"
            placeholder="Search by name, username, or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 sm:pl-12 py-4 sm:py-6 text-base sm:text-lg rounded-lg sm:rounded-xl bg-gray-50 dark:bg-zinc-800/50 border-gray-200 dark:border-zinc-700 
            focus:bg-white dark:focus:bg-zinc-800 transition-colors dark:text-zinc-100 dark:placeholder-zinc-400"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800/50 p-4 sm:p-6">
        <ScrollArea className="h-[400px] sm:h-[600px] pr-2 sm:pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary dark:border-primary/70"></div>
            </div>
          ) : (
            <>
              {results.users.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-zinc-100 mb-3 sm:mb-4">Search Results</h3>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                    {results.users.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {!query && results.recommendations.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Suggested Friends</h3>
                  <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
                    {results.recommendations.map((user) => (
                      <UserCard key={user._id} user={user} />
                    ))}
                  </div>
                </div>
              )}

              {query && results.users.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-zinc-400 text-lg">No users found matching "{query}"</div>
                </div>
              )}
            </>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}

function UserCard({ user }) {
  const [isLoading, setIsLoading] = useState(false);

  const sendFriendRequest = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/friends/request/${user._id}`, {
        method: 'POST',
      });
      
      if (!res.ok) throw new Error();
      
      toast.success(`Friend request sent to ${user.firstName}`);
    } catch (error) {
      console.error("Failed to send friend request:", error);
      toast.error("Failed to send friend request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg sm:rounded-xl 
    border border-gray-200 dark:border-zinc-800 transition-colors dark:bg-zinc-900/50">
      <div className="flex items-center gap-3 sm:gap-4">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/10 dark:border-primary/20">
          <AvatarImage src={user.avatarUrl || user.avatar} />
          <AvatarFallback className="bg-primary/10 dark:bg-zinc-800 text-primary dark:text-primary/80 font-medium">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-zinc-100">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">@{user.username}</p>
        </div>
      </div>
      <Button 
        variant="outline"
        size="sm" 
        className="hover:bg-primary/10 hover:text-primary dark:border-zinc-700 dark:hover:bg-primary/10 
        dark:text-zinc-300 dark:hover:text-primary"
        onClick={sendFriendRequest}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}