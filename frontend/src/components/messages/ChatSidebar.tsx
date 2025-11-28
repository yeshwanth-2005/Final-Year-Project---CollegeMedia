import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Plus, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChatUser } from "@/pages/Messages";
import { Friend } from "@/services/messagesService";
import { formatDistanceToNow } from "date-fns";

interface ChatSidebarProps {
  conversations: ChatUser[];
  friends: Friend[];
  selectedChat: ChatUser | null;
  onSelectChat: (user: ChatUser) => void;
  onSearchFriends: (query: string) => void;
  isLoading: boolean;
  onRefresh: () => void;
}

export const ChatSidebar = ({ 
  conversations, 
  friends,
  selectedChat, 
  onSelectChat,
  onSearchFriends,
  isLoading,
  onRefresh
}: ChatSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFriends, setShowFriends] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setShowFriends(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowFriends(true);
      onSearchFriends(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Show friends when searching, conversations otherwise
  const displayList = searchQuery.trim() && showFriends
    ? friends.length > 0 
      ? friends.map(friend => {
          const existingConv = conversations.find(c => c.id === friend.id);
          return existingConv || {
            id: friend.id,
            name: friend.name,
            username: friend.username,
            avatar: friend.avatar,
            lastMessage: 'No messages yet',
            lastMessageTime: '',
            unreadCount: 0,
            isOnline: false
          };
        })
      : []
    : conversations;

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Messages</h1>
          <div className="ml-auto flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onRefresh}
              disabled={isLoading}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-secondary/50 border-secondary focus:bg-background"
          />
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && displayList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>Loading conversations...</p>
          </div>
        ) : displayList.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <p>{searchQuery.trim() && showFriends ? `No friends found matching "${searchQuery}"` : 'No conversations yet'}</p>
            <p className="text-sm mt-2">
              {searchQuery.trim() && showFriends ? 'Try a different search term' : 'Start a conversation with a friend!'}
            </p>
          </div>
        ) : (
          displayList.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ backgroundColor: "hsl(var(--muted)/0.5)" }}
              className={cn(
                "p-4 cursor-pointer border-b border-border/50 transition-colors",
                selectedChat?.id === user.id && "bg-muted"
              )}
              onClick={() => onSelectChat(user)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-sm truncate">{user.name}</h3>
                    {user.lastMessageTime && (
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {user.lastMessageTime}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {user.lastMessage}
                    </p>
                    {user.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 px-1.5 py-0 text-xs h-5 min-w-5 rounded-full">
                        {user.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
