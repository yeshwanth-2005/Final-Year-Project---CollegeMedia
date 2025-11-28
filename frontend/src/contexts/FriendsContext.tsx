import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  friendsService, 
  Friend, 
  FriendRequest, 
  FriendshipStatus, 
  FriendCounts 
} from '@/services/friendsService';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

interface FriendsContextType {
  friends: Friend[];
  pendingRequests: FriendRequest[];
  friendCounts: FriendCounts | null;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  loadFriends: (page?: number) => Promise<void>;
  loadPendingRequests: () => Promise<void>;
  loadFriendCounts: () => Promise<void>;
  sendFriendRequest: (username: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  rejectRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  getFriendshipStatus: (username: string) => Promise<FriendshipStatus | null>;
  refreshAll: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export const useFriends = () => {
  const context = useContext(FriendsContext);
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
};

interface FriendsProviderProps {
  children: ReactNode;
}

export const FriendsProvider: React.FC<FriendsProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [friendCounts, setFriendCounts] = useState<FriendCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshAll();
    }
  }, [isAuthenticated]);

  const loadFriends = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const result = await friendsService.getFriends(page, 10);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data) {
        setFriends(result.data.friends);
        setCurrentPage(result.data.pagination.page);
        setTotalPages(result.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const result = await friendsService.getPendingRequests();
      
      if (result.error) {
        console.error('Error loading pending requests:', result.error);
        return;
      }
      
      if (result.data) {
        setPendingRequests(result.data.requests);
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
    }
  };

  const loadFriendCounts = async () => {
    try {
      const result = await friendsService.getFriendCounts();
      
      if (result.error) {
        console.error('Error loading friend counts:', result.error);
        return;
      }
      
      if (result.data) {
        setFriendCounts(result.data);
      }
    } catch (error) {
      console.error('Error loading friend counts:', error);
    }
  };

  const sendFriendRequest = async (username: string): Promise<boolean> => {
    try {
      const result = await friendsService.sendFriendRequest(username);
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      
      toast.success('Friend request sent!');
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
      return false;
    }
  };

  const acceptRequest = async (requestId: string): Promise<boolean> => {
    try {
      const result = await friendsService.respondToRequest(requestId, 'accept');
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      
      toast.success('Friend request accepted! A conversation has been started.');
      await refreshAll();
      
      // Trigger a custom event to refresh messages page if it's open
      window.dispatchEvent(new CustomEvent('friendRequestAccepted'));
      
      return true;
    } catch (error) {
      console.error('Error accepting request:', error);
      toast.error('Failed to accept friend request');
      return false;
    }
  };

  const rejectRequest = async (requestId: string): Promise<boolean> => {
    try {
      const result = await friendsService.respondToRequest(requestId, 'reject');
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      
      toast.success('Friend request rejected');
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject friend request');
      return false;
    }
  };

  const removeFriend = async (friendshipId: string): Promise<boolean> => {
    try {
      const result = await friendsService.removeFriend(friendshipId);
      
      if (result.error) {
        toast.error(result.error);
        return false;
      }
      
      toast.success('Friend removed');
      await refreshAll();
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
      return false;
    }
  };

  const getFriendshipStatus = async (username: string): Promise<FriendshipStatus | null> => {
    try {
      const result = await friendsService.getFriendshipStatus(username);
      
      if (result.error) {
        console.error('Error getting friendship status:', result.error);
        return null;
      }
      
      return result.data || null;
    } catch (error) {
      console.error('Error getting friendship status:', error);
      return null;
    }
  };

  const refreshAll = async () => {
    const pageToLoad = currentPage || 1;
    await Promise.all([
      loadFriends(pageToLoad),
      loadPendingRequests(),
      loadFriendCounts()
    ]);
  };

  const value: FriendsContextType = {
    friends,
    pendingRequests,
    friendCounts,
    isLoading,
    currentPage,
    totalPages,
    loadFriends,
    loadPendingRequests,
    loadFriendCounts,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    getFriendshipStatus,
    refreshAll,
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};

