import { useEffect, useCallback } from 'react';
import { useMail } from '@/contexts/MailContext';

export const useKeyboardShortcuts = () => {
  const { 
    state, 
    toggleThreadSelection, 
    markThreadsRead, 
    archiveThreads, 
    deleteThreads,
    loadThreads
  } = useMail();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Only handle shortcuts when not typing in input fields
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement) {
      return;
    }

    switch (event.key.toLowerCase()) {
      case 'j':
        // Navigate down
        event.preventDefault();
        // In a real implementation, this would navigate to the next thread
        console.log('Navigate down');
        break;
      
      case 'k':
        // Navigate up
        event.preventDefault();
        // In a real implementation, this would navigate to the previous thread
        console.log('Navigate up');
        break;
      
      case 'x':
        // Select current thread
        event.preventDefault();
        if (state.currentThread) {
          toggleThreadSelection(state.currentThread.id);
        }
        break;
      
      case 'e':
        // Archive selected threads
        event.preventDefault();
        if (state.selectedThreads.size > 0) {
          const threadIds = Array.from(state.selectedThreads);
          archiveThreads(threadIds);
        }
        break;
      
      case 'r':
        // Reply to current thread
        event.preventDefault();
        if (state.currentThread) {
          // In a real implementation, this would open the compose modal
          console.log('Reply to thread:', state.currentThread.id);
        }
        break;
      
      case 'c':
        // Compose new message
        event.preventDefault();
        // In a real implementation, this would open the compose modal
        console.log('Compose new message');
        break;
      
      case 'a':
        // Select all threads
        event.preventDefault();
        // In a real implementation, this would select all visible threads
        console.log('Select all threads');
        break;
      
      case 'u':
        // Mark as read/unread
        event.preventDefault();
        if (state.selectedThreads.size > 0) {
          const threadIds = Array.from(state.selectedThreads);
          const hasUnread = threadIds.some(id => {
            const thread = state.threads.find(t => t.id === id);
            return thread && !thread.lastMessage.isRead;
          });
          markThreadsRead(threadIds, hasUnread);
        }
        break;
      
      case 's':
        // Star/unstar threads
        event.preventDefault();
        if (state.selectedThreads.size > 0) {
          const threadIds = Array.from(state.selectedThreads);
          // In a real implementation, this would toggle star for selected threads
          console.log('Toggle star for threads:', threadIds);
        }
        break;
      
      case 'delete':
      case 'backspace':
        // Delete selected threads
        event.preventDefault();
        if (state.selectedThreads.size > 0) {
          const threadIds = Array.from(state.selectedThreads);
          deleteThreads(threadIds);
        }
        break;
      
      case 'escape':
        // Clear selection
        event.preventDefault();
        // In a real implementation, this would clear thread selection
        console.log('Clear selection');
        break;
    }
  }, [state, toggleThreadSelection, markThreadsRead, archiveThreads, deleteThreads]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
};


