// Gmail OAuth 2.0 Configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '';

// Gmail API scopes
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
].join(' ');

// Gmail API endpoints
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload: {
    headers: Array<{
      name: string;
      value: string;
    }>;
    body?: {
      data?: string;
    };
    parts?: Array<{
      mimeType: string;
      body: {
        data?: string;
      };
    }>;
  };
  internalDate: string;
  sizeEstimate: number;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

export class GmailService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor() {
    // Load tokens from localStorage if available
    this.loadTokens();
  }

  private loadTokens() {
    const tokens = localStorage.getItem('gmail_tokens');
    if (tokens) {
      const { accessToken, refreshToken, tokenExpiry } = JSON.parse(tokens);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = tokenExpiry;
    }
  }

  private saveTokens() {
    if (this.accessToken && this.refreshToken) {
      localStorage.setItem('gmail_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry
      }));
    }
  }

  private clearTokens() {
    localStorage.removeItem('gmail_tokens');
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  // Initialize Google OAuth
  async initializeAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!GOOGLE_CLIENT_ID) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Load Google OAuth library
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            scope: GMAIL_SCOPES,
            callback: this.handleCredentialResponse.bind(this),
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          resolve();
        } else {
          reject(new Error('Failed to load Google OAuth library'));
        }
      };
      
      script.onerror = () => reject(new Error('Failed to load Google OAuth library'));
      document.head.appendChild(script);
    });
  }

  // Handle OAuth response
  private async handleCredentialResponse(response: any) {
    try {
      const { credential } = response;
      
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code: credential,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: window.location.origin,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange authorization code for tokens');
      }

      const tokens = await tokenResponse.json();
      this.accessToken = tokens.access_token;
      this.refreshToken = tokens.refresh_token;
      this.tokenExpiry = Date.now() + (tokens.expires_in * 1000);
      
      this.saveTokens();
      
      // Trigger login success event
      window.dispatchEvent(new CustomEvent('gmail-login-success'));
      
    } catch (error) {
      console.error('OAuth error:', error);
      window.dispatchEvent(new CustomEvent('gmail-login-error', { detail: error }));
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  // Get user profile
  async getProfile(): Promise<GmailProfile> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${GMAIL_API_BASE}/profile`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Gmail profile');
    }

    return response.json();
  }

  // Get emails
  async getEmails(maxResults: number = 20, pageToken?: string): Promise<{
    messages: GmailMessage[];
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    let url = `${GMAIL_API_BASE}/messages?maxResults=${maxResults}`;
    if (pageToken) {
      url += `&pageToken=${pageToken}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    const data = await response.json();
    
    // Fetch full message details for each message
    const messages = await Promise.all(
      data.messages.map((msg: any) => this.getMessage(msg.id))
    );

    return {
      messages,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  // Get specific message
  async getMessage(messageId: string): Promise<GmailMessage> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${GMAIL_API_BASE}/messages/${messageId}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch message');
    }

    return response.json();
  }

  // Search emails
  async searchEmails(query: string, maxResults: number = 20): Promise<{
    messages: GmailMessage[];
    nextPageToken?: string;
    resultSizeEstimate: number;
  }> {
    if (!this.isAuthenticated()) {
      throw new Error('User not authenticated');
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${GMAIL_API_BASE}/messages?q=${encodedQuery}&maxResults=${maxResults}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search emails');
    }

    const data = await response.json();
    
    // Fetch full message details for each message
    const messages = await Promise.all(
      data.messages.map((msg: any) => this.getMessage(msg.id))
    );

    return {
      messages,
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  // Logout
  logout(): void {
    this.clearTokens();
    window.dispatchEvent(new CustomEvent('gmail-logout'));
  }

  // Get access token (for debugging)
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// Create singleton instance
export const gmailService = new GmailService();

// Add types for Google OAuth
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

