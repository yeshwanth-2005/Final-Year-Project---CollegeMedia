import { apiClient } from '@/lib/api';

export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
  joinedAt: string;
}

export interface UserStats {
  friendCount: number;
  postCount: number;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

export interface UserProfileResponse {
  user: UserProfile;
  stats: UserStats;
  posts: Post[];
  friendshipStatus: 'self' | 'not_friends' | 'pending' | 'accepted' | 'rejected' | 'blocked';
}

export interface UpdateProfileData {
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  skills?: string[];
}

export interface NetworkUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  friendshipStatus: 'not_friends' | 'pending' | 'accepted' | 'rejected' | 'blocked';
}

export interface NetworkUsersResponse {
  users: NetworkUser[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class UserService {
  // Get user profile by username
  async getUserProfile(username: string): Promise<{ data?: UserProfileResponse; error?: string }> {
    const response = await apiClient.get<UserProfileResponse>(`/api/users/${username}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get current user's full profile
  async getMyProfile(): Promise<{ data?: UserProfileResponse; error?: string }> {
    const response = await apiClient.get<UserProfileResponse>('/api/profile/me');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Update current user's profile
  async updateProfile(data: UpdateProfileData): Promise<{ data?: { user: UserProfile }; error?: string }> {
    const response = await apiClient.put<{ user: UserProfile }>('/api/profile/me', data);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Update current user's profile picture
  async updateProfilePicture(file: File): Promise<{ data?: { user: UserProfile }; error?: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await apiClient.request<{ user: UserProfile }>('/api/profile/me/avatar', {
      method: 'PUT',
      body: formData,
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Search/Get all users
  async searchUsers(search?: string, page: number = 1, limit: number = 20): Promise<{ data?: NetworkUsersResponse; error?: string }> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get<NetworkUsersResponse>(`/api/users?${params.toString()}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }
}

export const userService = new UserService();