export interface MailUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MailAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface MailMessage {
  id: string;
  threadId: string;
  from: MailUser;
  to: MailUser[];
  cc?: MailUser[];
  bcc?: MailUser[];
  subject: string;
  body: string;
  htmlBody?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  attachments: MailAttachment[];
  isDraft: boolean;
  isSent: boolean;
}

export interface MailThread {
  id: string;
  messages: MailMessage[];
  subject: string;
  participants: MailUser[];
  lastMessage: MailMessage;
  unreadCount: number;
  isStarred: boolean;
  isImportant: boolean;
  labels: string[];
  snippet: string;
}

export interface MailLabel {
  id: string;
  name: string;
  color: string;
  count: number;
  type: 'system' | 'custom';
}

export interface MailFolder {
  id: string;
  name: string;
  icon: string;
  count: number;
  type: 'system' | 'custom';
}

export interface MailSearchFilters {
  query: string;
  from?: string;
  to?: string;
  subject?: string;
  hasAttachment?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  labels?: string[];
}

export interface MailComposeData {
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: File[];
}

export interface MailState {
  threads: MailThread[];
  selectedThreads: Set<string>;
  currentThread?: MailThread;
  currentFolder: string;
  searchFilters: MailSearchFilters;
  labels: MailLabel[];
  folders: MailFolder[];
  isLoading: boolean;
  hasMore: boolean;
  page: number;
}


