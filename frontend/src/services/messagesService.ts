import { apiClient } from '@/lib/api';

export interface ConversationUser {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Conversation {
  id: string;
  user: ConversationUser;
  lastMessage: {
    content: string;
    timestamp: string;
  } | null;
  lastMessageAt: string;
  unreadCount: number;
}

export interface Message {
  id: string;
  content: string;
  sender: ConversationUser;
  isSent: boolean;
  isRead: boolean;
  timestamp: string;
}

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

class MessagesService {
  // Get all conversations
  async getConversations(): Promise<{ data?: { conversations: Conversation[] }; error?: string }> {
    const response = await apiClient.get<{ conversations: Conversation[] }>('/api/conversations');
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get messages for a conversation
  async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{ data?: { messages: Message[] }; error?: string }> {
    const response = await apiClient.get<{ messages: Message[] }>(
      `/api/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get or create conversation with a friend
  async getOrCreateConversation(friendId: string): Promise<{ data?: { conversationId: string }; error?: string }> {
    const response = await apiClient.get<{ conversationId: string }>(`/api/conversations/with/${friendId}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get friends list for messaging (searchable)
  async getFriendsForMessaging(search?: string): Promise<{ data?: { friends: Friend[] }; error?: string }> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const response = await apiClient.get<{ friends: Friend[] }>(`/api/messages/friends${query}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }
}

export const messagesService = new MessagesService();

