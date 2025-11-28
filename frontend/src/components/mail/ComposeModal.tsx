import React, { useState, useRef } from 'react';
import { 
  X, 
  Send, 
  Paperclip, 
  Save,
  Trash2,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useMail } from '@/contexts/MailContext';
import { MailComposeData } from '@/types/mail';

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  replyTo?: {
    to: string[];
    subject: string;
    body: string;
  };
}

export const ComposeModal: React.FC<ComposeModalProps> = ({
  isOpen,
  onClose,
  replyTo
}) => {
  const { sendMessage, saveDraft } = useMail();
  const [composeData, setComposeData] = useState<MailComposeData>({
    to: replyTo?.to || [],
    cc: [],
    bcc: [],
    subject: replyTo?.subject ? `Re: ${replyTo.subject}` : '',
    body: replyTo?.body ? `\n\n${replyTo.body}` : '',
    attachments: []
  });
  
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof MailComposeData, value: string | string[]) => {
    setComposeData(prev => ({ ...prev, [field]: value }));
  };

  const handleToChange = (value: string) => {
    const emails = value.split(',').map(email => email.trim()).filter(Boolean);
    handleInputChange('to', emails);
  };

  const handleCcChange = (value: string) => {
    const emails = value.split(',').map(email => email.trim()).filter(Boolean);
    handleInputChange('cc', emails);
  };

  const handleBccChange = (value: string) => {
    const emails = value.split(',').map(email => email.trim()).filter(Boolean);
    handleInputChange('bcc', emails);
  };

  const handleAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setComposeData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index: number) => {
    setComposeData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSend = async () => {
    if (!composeData.to.length || !composeData.subject.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(composeData);
      onClose();
      // Reset form
      setComposeData({
        to: [],
        cc: [],
        bcc: [],
        subject: '',
        body: '',
        attachments: []
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraft(composeData);
      onClose();
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>New Message</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Recipients */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium w-16">To:</span>
              <Input
                placeholder="recipient@example.com"
                value={composeData.to.join(', ')}
                onChange={(e) => handleToChange(e.target.value)}
                className="flex-1"
              />
            </div>

            {showCc && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-16">Cc:</span>
                <Input
                  placeholder="cc@example.com"
                  value={composeData.cc.join(', ')}
                  onChange={(e) => handleCcChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}

            {showBcc && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium w-16">Bcc:</span>
                <Input
                  placeholder="bcc@example.com"
                  value={composeData.bcc.join(', ')}
                  onChange={(e) => handleBccChange(e.target.value)}
                  className="flex-1"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(!showCc)}
                className="h-6 px-2 text-xs"
              >
                {showCc ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Cc
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowBcc(!showBcc)}
                className="h-6 px-2 text-xs"
              >
                {showBcc ? <Minus className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                Bcc
              </Button>
            </div>
          </div>

          {/* Subject */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm font-medium w-16">Subject:</span>
            <Input
              placeholder="Subject"
              value={composeData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Attachments */}
          {composeData.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Attachments</h4>
              <div className="space-y-2">
                {composeData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 border border-border rounded-lg"
                  >
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Body */}
          <div className="flex-1 mt-4 min-h-[300px]">
            <Textarea
              placeholder="Write your message here..."
              value={composeData.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              className="h-full resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-2" />
                Attach
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleAttachment}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Discard
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending || !composeData.to.length || !composeData.subject.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


