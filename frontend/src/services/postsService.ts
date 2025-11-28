import { apiClient } from '@/lib/api';

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  content: string;
  image?: string;
  likesCount: number;
  commentsCount: number;
  shares: number;
  isLiked: boolean;
  isOwnPost: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  author: PostAuthor;
  isOwnComment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PostsResponse {
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreatePostData {
  content: string;
  image?: File;
}

export interface CreateCommentData {
  content: string;
}

class PostsService {
  // Get all posts (feed)
  async getPosts(page: number = 1, limit: number = 10): Promise<{ data?: PostsResponse; error?: string }> {
    const response = await apiClient.get<PostsResponse>(`/api/posts?page=${page}&limit=${limit}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get single post
  async getPost(postId: string): Promise<{ data?: { post: Post }; error?: string }> {
    const response = await apiClient.get<{ post: Post }>(`/api/posts/${postId}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Create post
  async createPost(data: CreatePostData): Promise<{ data?: { post: Post }; error?: string }> {
    const formData = new FormData();
    formData.append('content', data.content);
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.request<{ post: Post }>('/api/posts', {
      method: 'POST',
      body: formData,
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Update post
  async updatePost(postId: string, data: Partial<CreatePostData>): Promise<{ data?: { post: Post }; error?: string }> {
    const formData = new FormData();
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.image) {
      formData.append('image', data.image);
    }

    const response = await apiClient.request<{ post: Post }>(`/api/posts/${postId}`, {
      method: 'PUT',
      body: formData,
    });
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Delete post
  async deletePost(postId: string): Promise<{ error?: string }> {
    const response = await apiClient.delete(`/api/posts/${postId}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }

  // Like/unlike post
  async toggleLike(postId: string): Promise<{ data?: { likesCount: number; isLiked: boolean }; error?: string }> {
    const response = await apiClient.post<{ likesCount: number; isLiked: boolean }>(`/api/posts/${postId}/like`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Get comments for a post
  async getComments(postId: string, page: number = 1, limit: number = 10): Promise<{ data?: CommentsResponse; error?: string }> {
    const response = await apiClient.get<CommentsResponse>(`/api/posts/${postId}/comments?page=${page}&limit=${limit}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Create comment
  async createComment(postId: string, data: CreateCommentData): Promise<{ data?: { comment: Comment }; error?: string }> {
    const response = await apiClient.post<{ comment: Comment }>(`/api/posts/${postId}/comments`, data);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Update comment
  async updateComment(commentId: string, data: CreateCommentData): Promise<{ data?: { comment: Comment }; error?: string }> {
    const response = await apiClient.put<{ comment: Comment }>(`/api/comments/${commentId}`, data);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }

  // Delete comment
  async deleteComment(commentId: string): Promise<{ error?: string }> {
    const response = await apiClient.delete(`/api/comments/${commentId}`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return {};
  }

  // Delete image from post
  async deleteImage(postId: string): Promise<{ data?: { post: Post }; error?: string }> {
    const response = await apiClient.delete<{ post: Post }>(`/api/posts/${postId}/image`);
    
    if (response.error) {
      return { error: response.error };
    }
    
    return { data: response.data };
  }
}

export const postsService = new PostsService();
