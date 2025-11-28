import { 
  MailThread, 
  MailMessage, 
  MailLabel, 
  MailFolder, 
  MailSearchFilters,
  MailComposeData,
  MailUser 
} from '@/types/mail';

// Mock data
const mockUsers: MailUser[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@college.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex' },
  { id: '2', name: 'Sarah Wilson', email: 'sarah@college.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah' },
  { id: '3', name: 'David Kim', email: 'david@college.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' },
  { id: '4', name: 'Emma Davis', email: 'emma@college.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' },
  { id: '5', name: 'Mike Johnson', email: 'mike@college.edu', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike' },
];

const mockLabels: MailLabel[] = [
  { id: '1', name: 'Important', color: '#FF6B6B', count: 12, type: 'system' },
  { id: '2', name: 'Work', color: '#4ECDC4', count: 8, type: 'custom' },
  { id: '3', name: 'Personal', color: '#45B7D1', count: 15, type: 'custom' },
  { id: '4', name: 'Study', color: '#96CEB4', count: 6, type: 'custom' },
];

const mockFolders: MailFolder[] = [
  { id: 'inbox', name: 'Inbox', icon: 'inbox', count: 25, type: 'system' },
  { id: 'starred', name: 'Starred', icon: 'star', count: 8, type: 'system' },
  { id: 'sent', name: 'Sent', icon: 'send', count: 18, type: 'system' },
  { id: 'drafts', name: 'Drafts', icon: 'edit', count: 3, type: 'system' },
  { id: 'trash', name: 'Trash', icon: 'trash', count: 0, type: 'system' },
];

const mockThreads: MailThread[] = [
  {
    id: '1',
    subject: 'Project Update Meeting',
    participants: [mockUsers[0], mockUsers[1]],
    lastMessage: {
      id: '1',
      threadId: '1',
      from: mockUsers[0],
      to: [mockUsers[1]],
      subject: 'Project Update Meeting',
      body: 'Hi Sarah, I wanted to discuss the latest updates on our project. Can we schedule a meeting for tomorrow?',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false,
      isStarred: true,
      isImportant: true,
      labels: ['Work', 'Important'],
      attachments: [],
      isDraft: false,
      isSent: false,
    },
    messages: [],
    unreadCount: 1,
    isStarred: true,
    isImportant: true,
    labels: ['Work', 'Important'],
    snippet: 'Hi Sarah, I wanted to discuss the latest updates on our project...',
  },
  {
    id: '2',
    subject: 'Study Group Session',
    participants: [mockUsers[2], mockUsers[3], mockUsers[4]],
    lastMessage: {
      id: '2',
      threadId: '2',
      from: mockUsers[2],
      to: [mockUsers[3], mockUsers[4]],
      subject: 'Study Group Session',
      body: 'Hey everyone! Are we still meeting for the study session this weekend? I have some questions about the algorithms.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: true,
      isStarred: false,
      isImportant: false,
      labels: ['Study'],
      attachments: [],
      isDraft: false,
      isSent: false,
    },
    messages: [],
    unreadCount: 0,
    isStarred: false,
    isImportant: false,
    labels: ['Study'],
    snippet: 'Hey everyone! Are we still meeting for the study session...',
  },
  {
    id: '3',
    subject: 'Weekend Plans',
    participants: [mockUsers[4], mockUsers[0]],
    lastMessage: {
      id: '3',
      threadId: '3',
      from: mockUsers[4],
      to: [mockUsers[0]],
      subject: 'Weekend Plans',
      body: 'Hey Alex! What are your plans for the weekend? Want to grab coffee and catch up?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true,
      isStarred: false,
      isImportant: false,
      labels: ['Personal'],
      attachments: [],
      isDraft: false,
      isSent: false,
    },
    messages: [],
    unreadCount: 0,
    isStarred: false,
    isImportant: false,
    labels: ['Personal'],
    snippet: 'Hey Alex! What are your plans for the weekend...',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MailService {
  // Thread operations
  async listThreads(folder: string, page: number = 1, filters?: MailSearchFilters): Promise<{ threads: MailThread[], hasMore: boolean }> {
    await delay(300);
    
    let filteredThreads = [...mockThreads];
    
    if (filters?.query) {
      const query = filters.query.toLowerCase();
      filteredThreads = filteredThreads.filter(thread => 
        thread.subject.toLowerCase().includes(query) ||
        thread.snippet.toLowerCase().includes(query) ||
        thread.participants.some(p => p.name.toLowerCase().includes(query))
      );
    }
    
    if (filters?.labels?.length) {
      filteredThreads = filteredThreads.filter(thread => 
        filters.labels!.some(label => thread.labels.includes(label))
      );
    }
    
    const pageSize = 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      threads: filteredThreads.slice(start, end),
      hasMore: end < filteredThreads.length
    };
  }

  async getThread(threadId: string): Promise<MailThread | null> {
    await delay(200);
    return mockThreads.find(t => t.id === threadId) || null;
  }

  async markThreadRead(threadId: string, isRead: boolean): Promise<void> {
    await delay(100);
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.lastMessage.isRead = isRead;
      thread.unreadCount = isRead ? 0 : 1;
    }
  }

  async toggleThreadStar(threadId: string): Promise<void> {
    await delay(100);
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.isStarred = !thread.isStarred;
    }
  }

  async toggleThreadImportant(threadId: string): Promise<void> {
    await delay(100);
    const thread = mockThreads.find(t => t.id === threadId);
    if (thread) {
      thread.isImportant = !thread.isImportant;
    }
  }

  async deleteThreads(threadIds: string[]): Promise<void> {
    await delay(300);
    // In real implementation, this would move to trash or delete permanently
    console.log('Deleting threads:', threadIds);
  }

  async archiveThreads(threadIds: string[]): Promise<void> {
    await delay(300);
    console.log('Archiving threads:', threadIds);
  }

  // Label operations
  async getLabels(): Promise<MailLabel[]> {
    await delay(200);
    return mockLabels;
  }

  async createLabel(name: string, color: string): Promise<MailLabel> {
    await delay(300);
    const newLabel: MailLabel = {
      id: Date.now().toString(),
      name,
      color,
      count: 0,
      type: 'custom'
    };
    mockLabels.push(newLabel);
    return newLabel;
  }

  async updateLabel(labelId: string, updates: Partial<MailLabel>): Promise<MailLabel> {
    await delay(300);
    const label = mockLabels.find(l => l.id === labelId);
    if (label) {
      Object.assign(label, updates);
    }
    return label!;
  }

  async deleteLabel(labelId: string): Promise<void> {
    await delay(300);
    const index = mockLabels.findIndex(l => l.id === labelId);
    if (index > -1) {
      mockLabels.splice(index, 1);
    }
  }

  async applyLabels(threadIds: string[], labelIds: string[]): Promise<void> {
    await delay(300);
    threadIds.forEach(threadId => {
      const thread = mockThreads.find(t => t.id === threadId);
      if (thread) {
        labelIds.forEach(labelId => {
          const label = mockLabels.find(l => l.id === labelId);
          if (label && !thread.labels.includes(label.name)) {
            thread.labels.push(label.name);
          }
        });
      }
    });
  }

  // Compose operations
  async sendMessage(composeData: MailComposeData): Promise<void> {
    await delay(1000);
    console.log('Sending message:', composeData);
  }

  async saveDraft(composeData: MailComposeData): Promise<void> {
    await delay(300);
    console.log('Saving draft:', composeData);
  }

  // Folder operations
  async getFolders(): Promise<MailFolder[]> {
    await delay(200);
    return mockFolders;
  }

  // Search operations
  async searchThreads(filters: MailSearchFilters): Promise<MailThread[]> {
    await delay(500);
    let results = [...mockThreads];
    
    if (filters.query) {
      const query = filters.query.toLowerCase();
      results = results.filter(thread => 
        thread.subject.toLowerCase().includes(query) ||
        thread.snippet.toLowerCase().includes(query) ||
        thread.participants.some(p => p.name.toLowerCase().includes(query))
      );
    }
    
    if (filters.from) {
      results = results.filter(thread => 
        thread.participants.some(p => p.email.toLowerCase().includes(filters.from!.toLowerCase()))
      );
    }
    
    if (filters.hasAttachment) {
      results = results.filter(thread => 
        thread.lastMessage.attachments.length > 0
      );
    }
    
    return results;
  }
}

export const mailService = new MailService();


