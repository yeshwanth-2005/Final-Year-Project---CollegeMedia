import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useMail } from '@/contexts/MailContext';
import { MailLabel } from '@/types/mail';

interface LabelManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

const predefinedColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export const LabelManager: React.FC<LabelManagerProps> = ({
  isOpen,
  onClose
}) => {
  const { state, loadLabels } = useMail();
  const [editingLabel, setEditingLabel] = useState<MailLabel | null>(null);
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(predefinedColors[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) return;
    
    setIsCreating(true);
    try {
      // In a real implementation, this would call the mail service
      console.log('Creating label:', { name: newLabelName, color: selectedColor });
      setNewLabelName('');
      setSelectedColor(predefinedColors[0]);
      await loadLabels();
    } catch (error) {
      console.error('Failed to create label:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditLabel = (label: MailLabel) => {
    setEditingLabel(label);
    setNewLabelName(label.name);
    setSelectedColor(label.color);
  };

  const handleUpdateLabel = async () => {
    if (!editingLabel || !newLabelName.trim()) return;
    
    try {
      // In a real implementation, this would call the mail service
      console.log('Updating label:', { id: editingLabel.id, name: newLabelName, color: selectedColor });
      setEditingLabel(null);
      setNewLabelName('');
      setSelectedColor(predefinedColors[0]);
      await loadLabels();
    } catch (error) {
      console.error('Failed to update label:', error);
    }
  };

  const handleDeleteLabel = async (labelId: string) => {
    if (confirm('Are you sure you want to delete this label?')) {
      try {
        // In a real implementation, this would call the mail service
        console.log('Deleting label:', labelId);
        await loadLabels();
      } catch (error) {
        console.error('Failed to delete label:', error);
      }
    }
  };

  const handleCancel = () => {
    setEditingLabel(null);
    setNewLabelName('');
    setSelectedColor(predefinedColors[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Labels</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create New Label */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Create New Label</h3>
            <div className="space-y-2">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
              />
              
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Color</span>
                <div className="flex flex-wrap gap-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`
                        w-6 h-6 rounded-full border-2 transition-all
                        ${selectedColor === color ? 'border-foreground scale-110' : 'border-border hover:scale-105'}
                      `}
                      style={{ backgroundColor: color }}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
              </div>

              <Button
                onClick={editingLabel ? handleUpdateLabel : handleCreateLabel}
                disabled={!newLabelName.trim() || isCreating}
                className="w-full"
              >
                {editingLabel ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Label
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Label
                  </>
                )}
              </Button>

              {editingLabel && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>

          {/* Existing Labels */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Existing Labels</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {state.labels.filter(label => label.type === 'custom').map((label) => (
                <div
                  key={label.id}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="text-sm">{label.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({label.count})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditLabel(label)}
                      className="h-6 w-6 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteLabel(label.id)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {state.labels.filter(label => label.type === 'custom').length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Palette className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No custom labels yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


