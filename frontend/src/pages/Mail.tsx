import React, { useState } from 'react';
import { MailLayout } from '@/components/mail/MailLayout';
import { ComposeModal } from '@/components/mail/ComposeModal';
import { MailProvider } from '@/contexts/MailContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const MailContent: React.FC = () => {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen">
      <MailLayout onCompose={() => setIsComposeOpen(true)} />
      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => setIsComposeOpen(false)} 
      />
    </div>
  );
};

const Mail: React.FC = () => {
  return (
    <MailProvider>
      <MailContent />
    </MailProvider>
  );
};

export default Mail;
