import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Settings,
  User,
  LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useMail } from '@/contexts/MailContext';
import { MailSearchFilters } from '@/types/mail';
import { debounce } from 'lodash';

export const MailTopbar: React.FC = () => {
  const { state, searchThreads } = useMail();
  const [searchQuery, setSearchQuery] = useState(state.searchFilters.query);

  const debouncedSearch = debounce((query: string) => {
    const filters: MailSearchFilters = {
      ...state.searchFilters,
      query
    };
    searchThreads(filters);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleAdvancedSearch = () => {
    // In a real implementation, this would open an advanced search modal
    console.log('Opening advanced search...');
  };

  return (
    <div className="h-16 bg-card border-b border-border px-4 flex items-center justify-between">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search mail..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-20 bg-muted/30 border-border/30 focus:bg-background focus:border-primary/50 transition-all duration-300"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-muted/50"
              onClick={handleAdvancedSearch}
            >
              <Filter className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Current Folder Info */}
        <div className="text-sm text-muted-foreground px-3 py-1 bg-muted/30 rounded-lg">
          {state.folders.find(f => f.id === state.currentFolder)?.name || 'Inbox'}
        </div>

        {/* Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-xs font-medium">
                A
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};


