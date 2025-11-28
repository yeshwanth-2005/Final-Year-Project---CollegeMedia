const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4004';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

class ApiClient {
  private accessToken: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.accessToken = localStorage.getItem('accessToken');
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type to application/json if not uploading files
    // When using FormData, let the browser set the correct Content-Type with boundary
    const isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      console.log(`🔵 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Important for cookies
      });

      console.log(`🟢 API Response: ${response.status} ${response.statusText}`);

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('❌ JSON Parse Error:', jsonError);
          return { error: 'Invalid response from server' };
        }
      } else {
        // If not JSON, try to get text response
        try {
          const text = await response.text();
          console.error('❌ Non-JSON Response:', text.substring(0, 200));
          return { error: `Server returned non-JSON response: ${response.status}` };
        } catch (textError) {
          console.error('❌ Failed to read response:', textError);
          return { error: `Invalid response from server (Status: ${response.status})` };
        }
      }

      if (!response.ok) {
        const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
        console.error('❌ API Error:', errorMsg, data);
        return { error: errorMsg };
      }

      console.log('✅ API Success:', data);
      return { data };
    } catch (error: any) {
      console.error('❌ Network Error Details:', {
        message: error.message,
        url,
        error
      });
      
      // Provide more specific error messages
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        return { 
          error: `Cannot connect to backend at ${API_BASE_URL}. Is the backend server running?` 
        };
      }
      
      // Handle JSON parse errors
      if (error.message && error.message.includes('JSON')) {
        return {
          error: 'Invalid response from server'
        };
      }
      
      // Handle network errors
      if (error.message && error.message.includes('NetworkError')) {
        return {
          error: 'Network error. Please check your internet connection.'
        };
      }
      
      return { 
        error: `Network error: ${error.message || 'Unknown error occurred'}` 
      };
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();