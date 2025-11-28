import React from 'react';
import { 
  Star, 
  StarOff, 
  Paperclip,
  MoreHorizontal
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
import { MailThread } from '@/types/mail';
import { useMail } from '@/contexts/MailContext';
import { cn } from '@/lib/utils';

interface ThreadRowProps {
  thread: MailThread;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}

export const ThreadRow: React.FC<ThreadRowProps> = ({
  thread,
  isSelected,
  onSelect,
  onClick
}) => {
  const { toggleThreadStar, toggleThreadImportant } = useMail();
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleThreadStar(thread.id);
  };

  const handleImportantClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleThreadImportant(thread.id);
  };

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 hover:bg-muted/30 cursor-pointer transition-colors",
        !thread.lastMessage.isRead && "bg-blue-50 dark:bg-blue-950/20",
        isSelected && "bg-primary/10"
      )}
      onClick={onClick}
    >
      {/* Selection Checkbox */}
      <div onClick={handleSelectClick}>
        <div className={cn(
          "w-4 h-4 rounded border-2 cursor-pointer transition-colors",
          isSelected 
            ? "bg-primary border-primary" 
            : "border-muted-foreground/30 hover:border-muted-foreground/50"
        )}>
          {isSelected && (
            <svg className="w-full h-full text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* Star */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-muted/50"
        onClick={handleStarClick}
      >
        {thread.isStarred ? (
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ) : (
          <Star className="h-4 w-4 text-muted-foreground hover:text-yellow-400" />
        )}
      </Button>

      {/* Important */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-muted/50"
        onClick={handleImportantClick}
      >
        {thread.isImportant ? (
          <div className="w-4 h-4 bg-red-500 rounded-full" />
        ) : (
          <div className="w-4 h-4 border-2 border-muted-foreground/30 rounded-full hover:border-red-500" />
        )}
      </Button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        <img
          src={thread.participants[0]?.avatar || '/placeholder.svg'}
          alt={thread.participants[0]?.name || 'Unknown'}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn(
              "text-sm font-medium truncate",
              !thread.lastMessage.isRead && "font-semibold"
            )}>
              {thread.participants.map(p => p.name).join(', ')}
            </span>
            
            {/* Labels */}
            {thread.labels.map((label) => (
              <Badge
                key={label}
                variant="outline"
                className="text-xs px-2 py-0.5 h-5"
              >
                {label}
              </Badge>
            ))}
          </div>
          
          <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
            {formatTime(thread.lastMessage.timestamp)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm truncate",
            !thread.lastMessage.isRead && "font-medium"
          )}>
            {thread.subject}
          </span>
          
          {thread.lastMessage.attachments.length > 0 && (
            <Paperclip className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <p className="text-sm text-muted-foreground truncate">
          {thread.snippet}
        </p>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Mark as read</DropdownMenuItem>
          <DropdownMenuItem>Add star</DropdownMenuItem>
          <DropdownMenuItem>Mark as important</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Move to...</DropdownMenuItem>
          <DropdownMenuItem>Apply label...</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};


