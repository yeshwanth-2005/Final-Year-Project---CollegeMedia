import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { MailState, MailThread, MailLabel, MailFolder, MailSearchFilters } from '@/types/mail';
import { mailService } from '@/services/mailService';

type MailAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_THREADS'; payload: MailThread[] }
  | { type: 'ADD_THREADS'; payload: MailThread[] }
  | { type: 'SET_CURRENT_THREAD'; payload: MailThread | undefined }
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_SEARCH_FILTERS'; payload: MailSearchFilters }
  | { type: 'SET_LABELS'; payload: MailLabel[] }
  | { type: 'SET_FOLDERS'; payload: MailFolder[] }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'TOGGLE_THREAD_SELECTION'; payload: string }
  | { type: 'CLEAR_SELECTIONS' }
  | { type: 'SELECT_ALL_THREADS' }
  | { type: 'UPDATE_THREAD'; payload: { id: string; updates: Partial<MailThread> } }
  | { type: 'REMOVE_THREADS'; payload: string[] };

const initialState: MailState = {
  threads: [],
  selectedThreads: new Set(),
  currentThread: undefined,
  currentFolder: 'inbox',
  searchFilters: { query: '' },
  labels: [],
  folders: [],
  isLoading: false,
  hasMore: false,
  page: 1,
};

function mailReducer(state: MailState, action: MailAction): MailState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_THREADS':
      return { ...state, threads: action.payload, page: 1 };
    
    case 'ADD_THREADS':
      return { ...state, threads: [...state.threads, ...action.payload] };
    
    case 'SET_CURRENT_THREAD':
      return { ...state, currentThread: action.payload };
    
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload, page: 1 };
    
    case 'SET_SEARCH_FILTERS':
      return { ...state, searchFilters: action.payload, page: 1 };
    
    case 'SET_LABELS':
      return { ...state, labels: action.payload };
    
    case 'SET_FOLDERS':
      return { ...state, folders: action.payload };
    
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    
    case 'TOGGLE_THREAD_SELECTION':
      const newSelected = new Set(state.selectedThreads);
      if (newSelected.has(action.payload)) {
        newSelected.delete(action.payload);
      } else {
        newSelected.add(action.payload);
      }
      return { ...state, selectedThreads: newSelected };
    
    case 'CLEAR_SELECTIONS':
      return { ...state, selectedThreads: new Set() };
    
    case 'SELECT_ALL_THREADS':
      const allThreadIds = new Set(state.threads.map(t => t.id));
      return { ...state, selectedThreads: allThreadIds };
    
    case 'UPDATE_THREAD':
      return {
        ...state,
        threads: state.threads.map(thread =>
          thread.id === action.payload.id
            ? { ...thread, ...action.payload.updates }
            : thread
        ),
        currentThread: state.currentThread?.id === action.payload.id
          ? { ...state.currentThread, ...action.payload.updates }
          : state.currentThread,
      };
    
    case 'REMOVE_THREADS':
      const threadsToRemove = new Set(action.payload);
      return {
        ...state,
        threads: state.threads.filter(t => !threadsToRemove.has(t.id)),
        selectedThreads: new Set(),
        currentThread: state.currentThread && threadsToRemove.has(state.currentThread.id)
          ? undefined
          : state.currentThread,
      };
    
    default:
      return state;
  }
}

interface MailContextType {
  state: MailState;
  dispatch: React.Dispatch<MailAction>;
  loadThreads: (folder?: string, page?: number) => Promise<void>;
  loadMoreThreads: () => Promise<void>;
  searchThreads: (filters: MailSearchFilters) => Promise<void>;
  toggleThreadSelection: (threadId: string) => void;
  selectAllThreads: () => void;
  clearSelections: () => void;
  markThreadsRead: (threadIds: string[], isRead: boolean) => Promise<void>;
  toggleThreadStar: (threadId: string) => Promise<void>;
  toggleThreadImportant: (threadId: string) => Promise<void>;
  deleteThreads: (threadIds: string[]) => Promise<void>;
  archiveThreads: (threadIds: string[]) => Promise<void>;
  applyLabels: (threadIds: string[], labelIds: string[]) => Promise<void>;
  loadLabels: () => Promise<void>;
  loadFolders: () => Promise<void>;
}

const MailContext = createContext<MailContextType | undefined>(undefined);

export function MailProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(mailReducer, initialState);

  const loadThreads = async (folder: string = state.currentFolder, page: number = 1) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const result = await mailService.listThreads(folder, page, state.searchFilters);
      if (page === 1) {
        dispatch({ type: 'SET_THREADS', payload: result.threads });
      } else {
        dispatch({ type: 'ADD_THREADS', payload: result.threads });
      }
      dispatch({ type: 'SET_HAS_MORE', payload: result.hasMore });
      dispatch({ type: 'SET_PAGE', payload: page });
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadMoreThreads = async () => {
    if (state.hasMore && !state.isLoading) {
      await loadThreads(state.currentFolder, state.page + 1);
    }
  };

  const searchThreads = async (filters: MailSearchFilters) => {
    dispatch({ type: 'SET_SEARCH_FILTERS', payload: filters });
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const results = await mailService.searchThreads(filters);
      dispatch({ type: 'SET_THREADS', payload: results });
      dispatch({ type: 'SET_HAS_MORE', payload: false });
    } catch (error) {
      console.error('Failed to search threads:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleThreadSelection = (threadId: string) => {
    dispatch({ type: 'TOGGLE_THREAD_SELECTION', payload: threadId });
  };

  const selectAllThreads = () => {
    dispatch({ type: 'SELECT_ALL_THREADS' });
  };

  const clearSelections = () => {
    dispatch({ type: 'CLEAR_SELECTIONS' });
  };

  const markThreadsRead = async (threadIds: string[], isRead: boolean) => {
    try {
      await Promise.all(threadIds.map(id => mailService.markThreadRead(id, isRead)));
      threadIds.forEach(threadId => {
        dispatch({
          type: 'UPDATE_THREAD',
          payload: { id: threadId, updates: { lastMessage: { isRead } } }
        });
      });
    } catch (error) {
      console.error('Failed to mark threads read:', error);
    }
  };

  const toggleThreadStar = async (threadId: string) => {
    try {
      await mailService.toggleThreadStar(threadId);
      const thread = state.threads.find(t => t.id === threadId);
      if (thread) {
        dispatch({
          type: 'UPDATE_THREAD',
          payload: { id: threadId, updates: { isStarred: !thread.isStarred } }
        });
      }
    } catch (error) {
      console.error('Failed to toggle thread star:', error);
    }
  };

  const toggleThreadImportant = async (threadId: string) => {
    try {
      await mailService.toggleThreadImportant(threadId);
      const thread = state.threads.find(t => t.id === threadId);
      if (thread) {
        dispatch({
          type: 'UPDATE_THREAD',
          payload: { id: threadId, updates: { isImportant: !thread.isImportant } }
        });
      }
    } catch (error) {
      console.error('Failed to toggle thread important:', error);
    }
  };

  const deleteThreads = async (threadIds: string[]) => {
    try {
      await mailService.deleteThreads(threadIds);
      dispatch({ type: 'REMOVE_THREADS', payload: threadIds });
    } catch (error) {
      console.error('Failed to delete threads:', error);
    }
  };

  const archiveThreads = async (threadIds: string[]) => {
    try {
      await mailService.archiveThreads(threadIds);
      dispatch({ type: 'REMOVE_THREADS', payload: threadIds });
    } catch (error) {
      console.error('Failed to archive threads:', error);
    }
  };

  const applyLabels = async (threadIds: string[], labelIds: string[]) => {
    try {
      await mailService.applyLabels(threadIds, labelIds);
      // Refresh threads to show updated labels
      await loadThreads();
    } catch (error) {
      console.error('Failed to apply labels:', error);
    }
  };

  const loadLabels = async () => {
    try {
      const labels = await mailService.getLabels();
      dispatch({ type: 'SET_LABELS', payload: labels });
    } catch (error) {
      console.error('Failed to load labels:', error);
    }
  };

  const loadFolders = async () => {
    try {
      const folders = await mailService.getFolders();
      dispatch({ type: 'SET_FOLDERS', payload: folders });
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  useEffect(() => {
    loadThreads();
    loadLabels();
    loadFolders();
  }, []);

  const value: MailContextType = {
    state,
    dispatch,
    loadThreads,
    loadMoreThreads,
    searchThreads,
    toggleThreadSelection,
    selectAllThreads,
    clearSelections,
    markThreadsRead,
    toggleThreadStar,
    toggleThreadImportant,
    deleteThreads,
    archiveThreads,
    applyLabels,
    loadLabels,
    loadFolders,
  };

  return (
    <MailContext.Provider value={value}>
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const context = useContext(MailContext);
  if (context === undefined) {
    throw new Error('useMail must be used within a MailProvider');
  }
  return context;
}


