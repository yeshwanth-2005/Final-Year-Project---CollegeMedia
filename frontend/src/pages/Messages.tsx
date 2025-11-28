import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ChatSidebar } from "@/components/messages/ChatSidebar";
import { ChatWindow } from "@/components/messages/ChatWindow";
import { useFriends } from "@/contexts/FriendsContext";
import { messagesService, Conversation, Friend } from "@/services/messagesService";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
  conversationId?: string;
}

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [conversations, setConversations] = useState<ChatUser[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { friends: friendsList } = useFriends();

  // Load conversations and friends
  useEffect(() => {
    loadData();
    // Also load all friends initially for search
    messagesService.getFriendsForMessaging().then(result => {
      if (result.data) {
        setFriends(result.data.friends);
      }
    });
  }, []);

  // Listen for friend request accepted event to refresh conversations
  useEffect(() => {
    const handleFriendAccepted = () => {
      loadData();
    };
    window.addEventListener('friendRequestAccepted', handleFriendAccepted);
    return () => window.removeEventListener('friendRequestAccepted', handleFriendAccepted);
  }, []);

  // Set up Socket.IO listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message: any) => {
      // Update conversations list
      setConversations(prev => {
        const existing = prev.find(c => c.conversationId === message.conversationId);
        if (existing) {
          return prev.map(c => 
            c.conversationId === message.conversationId
              ? {
                  ...c,
                  lastMessage: message.content,
                  lastMessageTime: new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  unreadCount: c.id === selectedChat?.id ? 0 : c.unreadCount + 1
                }
              : c
          );
        }
        return prev;
      });

      // If this conversation is currently open, notify ChatWindow
      if (selectedChat?.conversationId === message.conversationId) {
        // ChatWindow will handle this through its own socket listener
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [selectedChat]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load conversations
      const convResult = await messagesService.getConversations();
      if (convResult.data) {
        const chatUsers: ChatUser[] = convResult.data.conversations.map(conv => ({
          id: conv.user.id,
          name: conv.user.name,
          username: conv.user.username,
          avatar: conv.user.avatar,
          lastMessage: conv.lastMessage?.content || 'No messages yet',
          lastMessageTime: conv.lastMessage 
            ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })
            : '',
          unreadCount: conv.unreadCount,
          isOnline: false, // TODO: Implement online status tracking
          conversationId: conv.id
        }));
        setConversations(chatUsers);
      }

      // Load friends for search
      const friendsResult = await messagesService.getFriendsForMessaging();
      if (friendsResult.data) {
        setFriends(friendsResult.data.friends);
      }
    } catch (error) {
      console.error('Error loading messages data:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChat = async (user: ChatUser) => {
    // If conversation doesn't exist yet, create it
    if (!user.conversationId) {
      try {
        const result = await messagesService.getOrCreateConversation(user.id);
        if (result.data) {
          user.conversationId = result.data.conversationId;
        }
      } catch (error) {
        toast.error('Failed to start conversation');
        return;
      }
    }

    setSelectedChat(user);
    
    // Mark messages as read
    if (user.conversationId) {
      const socket = getSocket();
      if (socket) {
        socket.emit('mark_read', { conversationId: user.conversationId });
      }
      
      // Update unread count
      setConversations(prev => 
        prev.map(c => 
          c.id === user.id ? { ...c, unreadCount: 0 } : c
        )
      );
    }
  };

  const handleSearchFriends = async (query: string) => {
    try {
      const searchTerm = query.trim();
      const result = await messagesService.getFriendsForMessaging(searchTerm || undefined);
      
      if (result.error) {
        console.error('Search error:', result.error);
        // Only show error if it's not a network issue (might be backend down)
        if (!result.error.includes('Failed to fetch') && !result.error.includes('Network')) {
          toast.error(result.error);
        }
        return;
      }
      
      if (result.data) {
        setFriends(result.data.friends);
        console.log('Search results:', result.data.friends); // Debug log
      }
    } catch (error: any) {
      console.error('Error searching friends:', error);
      // Don't show toast for network errors, they're usually temporary
      if (error.message && !error.message.includes('Failed to fetch')) {
        toast.error('Failed to search friends');
      }
    }
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-4rem)] flex bg-background">
        <ChatSidebar 
          conversations={conversations}
          friends={friends}
          selectedChat={selectedChat}
          onSelectChat={handleSelectChat}
          onSearchFriends={handleSearchFriends}
          isLoading={isLoading}
          onRefresh={loadData}
        />
        <ChatWindow 
          selectedChat={selectedChat}
          onMessageSent={loadData}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
