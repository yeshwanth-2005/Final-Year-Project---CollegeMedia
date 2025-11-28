import React from 'react';
import { MailSidebar } from './MailSidebar';
import { MailTopbar } from './MailTopbar';
import { ThreadList } from './ThreadList';
import { ThreadView } from './ThreadView';
import { useMail } from '@/contexts/MailContext';

interface MailLayoutProps {
  onCompose?: () => void;
}

export const MailLayout: React.FC<MailLayoutProps> = ({ onCompose }) => {
  const { state } = useMail();

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <MailSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <MailTopbar />
        
        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Thread List */}
          <div className="w-1/2 border-r border-border">
            <ThreadList />
          </div>
          
          {/* Thread View */}
          <div className="flex-1">
            {state.currentThread ? (
              <ThreadView thread={state.currentThread} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a message</h3>
                  <p className="text-sm">Choose a message from the list to read</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
