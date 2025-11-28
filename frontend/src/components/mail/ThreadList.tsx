import React, { useState, useCallback, useRef } from 'react';
import { 
  Star, 
  StarOff, 
  Archive, 
  Trash2, 
  MoreHorizontal,
  RefreshCw,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useMail } from '@/contexts/MailContext';
import { MailThread } from '@/types/mail';
import { ThreadRow } from './ThreadRow';
import { cn } from '@/lib/utils';

export const ThreadList: React.FC = () => {
  const { 
    state, 
    toggleThreadSelection, 
    selectAllThreads, 
    clearSelections,
    markThreadsRead,
    deleteThreads,
    archiveThreads,
    loadMoreThreads
  } = useMail();
  
  const [showBulkActions, setShowBulkActions] = useState(false);
  const observerRef = useRef<IntersectionObserver>();
  const loadingRef = useRef<HTMLDivElement>(null);

  const selectedCount = state.selectedThreads.size;
  const hasSelection = selectedCount > 0;

  const handleThreadClick = (thread: MailThread) => {
    // In a real implementation, this would set the current thread
    console.log('Selecting thread:', thread.id);
  };

  const handleSelectAll = () => {
    if (selectedCount === state.threads.length) {
      clearSelections();
    } else {
      selectAllThreads();
    }
  };

  const handleBulkAction = async (action: string) => {
    const threadIds = Array.from(state.selectedThreads);
    
    switch (action) {
      case 'mark-read':
        await markThreadsRead(threadIds, true);
        break;
      case 'mark-unread':
        await markThreadsRead(threadIds, false);
        break;
      case 'archive':
        await archiveThreads(threadIds);
        break;
      case 'delete':
        await deleteThreads(threadIds);
        break;
    }
    
    clearSelections();
  };

  const lastThreadRef = useCallback((node: HTMLDivElement) => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && state.hasMore && !state.isLoading) {
        loadMoreThreads();
      }
    });
    
    if (node) observerRef.current.observe(node);
  }, [state.hasMore, state.isLoading, loadMoreThreads]);

  return (
    <div className="flex flex-col h-full">
      {/* Header with Bulk Actions */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleSelectAll}
            >
              {selectedCount === state.threads.length ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
            </Button>
            
            {hasSelection && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasSelection && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('mark-read')}
                  className="h-8 px-3"
                >
                  Mark Read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('archive')}
                  className="h-8 px-3"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="h-8 px-3 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {state.threads.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">No messages</h3>
              <p className="text-sm">Your inbox is empty</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {state.threads.map((thread, index) => (
              <div
                key={thread.id}
                ref={index === state.threads.length - 1 ? lastThreadRef : null}
              >
                <ThreadRow
                  thread={thread}
                  isSelected={state.selectedThreads.has(thread.id)}
                  onSelect={() => toggleThreadSelection(thread.id)}
                  onClick={() => handleThreadClick(thread)}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Loading indicator */}
        {state.isLoading && (
          <div className="p-4 text-center">
            <RefreshCw className="h-4 w-4 animate-spin mx-auto" />
            <span className="text-sm text-muted-foreground ml-2">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};


