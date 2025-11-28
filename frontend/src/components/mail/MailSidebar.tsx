import React, { useState } from 'react';
import { 
  Inbox, 
  Star, 
  Send, 
  Edit, 
  Trash2, 
  Plus, 
  MoreHorizontal,
  Tag,
  FolderPlus,
  PanelLeft,
  PanelLeftClose
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMail } from '@/contexts/MailContext';
import { MailFolder, MailLabel } from '@/types/mail';
import { cn } from '@/lib/utils';
import { LabelManager } from './LabelManager';
import { motion, AnimatePresence } from 'framer-motion';

const getFolderIcon = (iconName: string) => {
  switch (iconName) {
    case 'inbox': return <Inbox className="h-4 w-4" />;
    case 'star': return <Star className="h-4 w-4" />;
    case 'send': return <Send className="h-4 w-4" />;
    case 'edit': return <Edit className="h-4 w-4" />;
    case 'trash': return <Trash2 className="h-4 w-4" />;
    default: return <Inbox className="h-4 w-4" />;
  }
};

interface MailSidebarProps {
  onCompose?: () => void;
}

export const MailSidebar: React.FC<MailSidebarProps> = ({ onCompose }) => {
  const { state, loadThreads } = useMail();
  const [showLabels, setShowLabels] = useState(true);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [showSideComponents, setShowSideComponents] = useState(true);

  const handleFolderClick = (folderId: string) => {
    loadThreads(folderId);
  };

  const handleLabelClick = (labelName: string) => {
    // In a real implementation, this would filter threads by label
    console.log('Filtering by label:', labelName);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-border flex flex-col">
      {/* Compose and Toggle Buttons */}
      <div className="p-4 border-b border-border space-y-2">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={onCompose}
        >
          <Edit className="h-4 w-4 mr-2" />
          Compose
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowSideComponents(!showSideComponents)}
        >
          {showSideComponents ? (
            <>
              <PanelLeftClose className="h-4 w-4 mr-2" />
              Hide Sidebar
            </>
          ) : (
            <>
              <PanelLeft className="h-4 w-4 mr-2" />
              Show Sidebar
            </>
          )}
        </Button>
      </div>

      {/* Side Components Container */}
      <AnimatePresence>
        {showSideComponents && (
          <motion.div 
            className="flex-1 overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Folders */}
            <div className="p-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Folders
              </h3>
              <div className="space-y-1">
                {state.folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => handleFolderClick(folder.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                      state.currentFolder === folder.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getFolderIcon(folder.icon)}
                      <span>{folder.name}</span>
                    </div>
                    {folder.count > 0 && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        {folder.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Labels
                </h3>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-sidebar-accent/50"
                    onClick={() => setShowLabels(!showLabels)}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-sidebar-accent/50"
                    onClick={() => setIsLabelManagerOpen(true)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {showLabels && (
                <div className="space-y-1">
                  {state.labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelClick(label.name)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: label.color }}
                        />
                        <span>{label.name}</span>
                      </div>
                      {label.count > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          {label.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border mt-auto">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Storage: 2.1 GB of 15 GB</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <FolderPlus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label Manager Modal */}
      <LabelManager 
        isOpen={isLabelManagerOpen} 
        onClose={() => setIsLabelManagerOpen(false)} 
      />
    </div>
  );
};
