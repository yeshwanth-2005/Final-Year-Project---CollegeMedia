import { apiClient } from '@/lib/api';

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  friendshipId: string;
  friendsSince: string;
}

export interface FriendRequest {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  sentAt: string;
}

export interface FriendshipStatus {
  status: 'not_friends' | 'pending' | 'accepted' | 'rejected' | 'blocked';
  friendshipId?: string;
}

export interface FriendCounts {
  friendCount: number;
  pendingRequestsCount: number;
}

export interface FriendsResponse {
  friends: Friend[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class FriendsService {
  // Get user's friends with pagination
  async getFriends(page: number = 1, limit: number = 10): Promise<{ data?: FriendsResponse; error?: string }> {
    const response = await apiClient.get<FriendsResponse>(`/api/friends?page=${page}&limit=${limit}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get pending friend requests
  async getPendingRequests(): Promise<{ data?: { requests: FriendRequest[] }; error?: string }> {
    const response = await apiClient.get<{ requests: FriendRequest[] }>('/api/friends/requests');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Send friend request
  async sendFriendRequest(recipientUsername: string): Promise<{ data?: { message: string; request: FriendRequest }; error?: string }> {
    const response = await apiClient.post<{ message: string; request: FriendRequest }>('/api/friends/request', {
      recipientUsername
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Respond to friend request (accept or reject)
  async respondToRequest(requestId: string, action: 'accept' | 'reject'): Promise<{ data?: { message: string; friendship?: any }; error?: string }> {
    const response = await apiClient.post<{ message: string; friendship?: any }>('/api/friends/respond', {
      requestId,
      action
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Remove friend
  async removeFriend(friendshipId: string): Promise<{ data?: { message: string }; error?: string }> {
    const response = await apiClient.delete<{ message: string }>(`/api/friends/${friendshipId}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Check friendship status with another user
  async getFriendshipStatus(username: string): Promise<{ data?: FriendshipStatus; error?: string }> {
    const response = await apiClient.get<FriendshipStatus>(`/api/friends/status/${username}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get friend counts
  async getFriendCounts(): Promise<{ data?: FriendCounts; error?: string }> {
    const response = await apiClient.get<FriendCounts>('/api/friends/count');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }
}

export const friendsService = new FriendsService();

