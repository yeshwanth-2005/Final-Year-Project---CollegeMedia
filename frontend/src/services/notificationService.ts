import { apiClient } from '@/lib/api';

export interface NotificationSender {
  id: string;
  fullName: string;
  username: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  type: 'friend_request' | 'friend_accept' | 'job_alert' | 'system_message';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  relatedId?: string;
  sender?: NotificationSender | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class NotificationService {
  // Get all notifications
  async getNotifications(page: number = 1, limit: number = 50): Promise<{ data?: NotificationsResponse; error?: string }> {
    const response = await apiClient.get<NotificationsResponse>(`/api/notifications?page=${page}&limit=${limit}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<{ error?: string }> {
    const response = await apiClient.put(`/api/notifications/${id}/read`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }

  // Mark all as read
  async markAllAsRead(): Promise<{ error?: string }> {
    const response = await apiClient.put('/api/notifications/read-all');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }

  // Delete notification
  async deleteNotification(id: string): Promise<{ error?: string }> {
    const response = await apiClient.delete(`/api/notifications/${id}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }

  // Clear all read notifications
  async clearRead(): Promise<{ error?: string }> {
    const response = await apiClient.delete('/api/notifications/read/clear');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }
}

export const notificationService = new NotificationService();
