import React, { useState } from 'react';
import { 
  Reply, 
  ReplyAll, 
  Forward, 
  MoreHorizontal,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Tag
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
import { MailThread, MailMessage } from '@/types/mail';
import { useMail } from '@/contexts/MailContext';
import { cn } from '@/lib/utils';

interface ThreadViewProps {
  thread: MailThread;
}

export const ThreadView: React.FC<ThreadViewProps> = ({ thread }) => {
  const { toggleThreadStar, toggleThreadImportant } = useMail();
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set([thread.messages[0]?.id || '']));

  const toggleMessageExpansion = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold mb-2">{thread.subject}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>From: {thread.participants[0]?.name} &lt;{thread.participants[0]?.email}&gt;</span>
              <span>To: {thread.participants.slice(1).map(p => p.name).join(', ')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleThreadStar(thread.id)}
              className={cn(
                "h-8 w-8 p-0",
                thread.isStarred && "text-yellow-500"
              )}
            >
              <Star className={cn(
                "h-4 w-4",
                thread.isStarred && "fill-current"
              )} />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Tag className="h-4 w-4 mr-2" />
                  Apply label...
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">
            <Reply className="h-4 w-4 mr-2" />
            Reply
          </Button>
          <Button size="sm" variant="outline">
            <ReplyAll className="h-4 w-4 mr-2" />
            Reply All
          </Button>
          <Button size="sm" variant="outline">
            <Forward className="h-4 w-4 mr-2" />
            Forward
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No messages in this thread</p>
          </div>
        ) : (
          thread.messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "border border-border rounded-lg p-4",
                !message.isRead && "bg-blue-50 dark:bg-blue-950/20"
              )}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={message.from.avatar}
                      alt={message.from.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{message.from.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {message.from.email}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  {formatTime(message.timestamp)}
                </div>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <div className="prose prose-sm max-w-none">
                  {message.htmlBody ? (
                    <div dangerouslySetInnerHTML={{ __html: message.htmlBody }} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.body}</p>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {message.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 p-2 border border-border rounded-lg hover:bg-muted/30"
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(attachment.size)} • {attachment.type}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Labels */}
              {message.labels.length > 0 && (
                <div className="flex items-center gap-2">
                  {message.labels.map((label) => (
                    <Badge key={label} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Expand/Collapse for quoted text */}
              {index > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMessageExpansion(message.id)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  {expandedMessages.has(message.id) ? 'Hide quoted text' : 'Show quoted text'}
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
