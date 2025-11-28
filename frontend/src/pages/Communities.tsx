import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Plus, Hash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Community {
  id: string;
  name: string;
  avatar: string;
  description: string;
  lastPost: string;
  lastPostTime: string;
  memberCount: number;
  unreadCount: number;
  isVerified: boolean;
}


const Communities = () => {
  const navigate = useNavigate();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with actual data later
  const communities: Community[] = [
    {
      id: "1",
      name: "React Developers",
      avatar: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=150&h=150&fit=crop",
      description: "Latest updates in React ecosystem",
      lastPost: "New React 18 features announced! 🚀",
      lastPostTime: "5 min",
      memberCount: 1250,
      unreadCount: 3,
      isVerified: true,
    },
    {
      id: "2", 
      name: "UI/UX Design",
      avatar: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=150&h=150&fit=crop",
      description: "Design trends and inspiration",
      lastPost: "Beautiful gradient inspirations for 2024",
      lastPostTime: "1h",
      memberCount: 890,
      unreadCount: 0,
      isVerified: true,
    },
    {
      id: "3",
      name: "Tech News",
      avatar: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&h=150&fit=crop",
      description: "Latest technology updates",
      lastPost: "AI breakthrough in machine learning",
      lastPostTime: "2h",
      memberCount: 2100,
      unreadCount: 1,
      isVerified: false,
    },
  ];

  const filteredCommunities = communities.filter(community => 
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const CommunityBroadcast = ({ community }: { community: Community }) => (
    <div className="flex-1 flex flex-col bg-card">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={community.avatar} alt={community.name} />
            <AvatarFallback><Hash className="h-5 w-5" /></AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{community.name}</h2>
              {community.isVerified && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">✓</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{community.memberCount.toLocaleString()} members</p>
          </div>
        </div>
      </div>

      {/* Broadcast Content */}
      <div className="flex-1 p-4 bg-muted/30">
        <div className="bg-card rounded-lg p-4 shadow-soft">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={community.avatar} alt={community.name} />
              <AvatarFallback><Hash className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{community.name}</span>
                <span className="text-xs text-muted-foreground">{community.lastPostTime}</span>
              </div>
              <p className="text-sm">{community.lastPost}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center text-muted-foreground">
          <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">This is a broadcast channel</p>
          <p className="text-xs">Only admins can send messages here</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        {/* Header with back button */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Communities</h1>
            <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-foreground">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-secondary focus:bg-background"
            />
          </div>
        </div>

        {/* Communities list */}
        <div className="flex-1 overflow-y-auto">
          {filteredCommunities.map((community) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ backgroundColor: "hsl(var(--muted)/0.5)" }}
              className={cn(
                "p-4 cursor-pointer border-b border-border/50 transition-colors",
                selectedCommunity?.id === community.id && "bg-muted"
              )}
              onClick={() => setSelectedCommunity(community)}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={community.avatar} alt={community.name} />
                    <AvatarFallback><Hash className="h-5 w-5" /></AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm truncate">{community.name}</h3>
                      {community.isVerified && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">✓</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{community.lastPostTime}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{community.memberCount.toLocaleString()} members</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate flex-1">
                      {community.lastPost}
                    </p>
                    {community.unreadCount > 0 && (
                      <Badge variant="default" className="ml-2 px-1.5 py-0 text-xs h-5 min-w-5 rounded-full">
                        {community.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredCommunities.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No communities found</p>
            </div>
          )}
        </div>
      </div>

      {/* Community Broadcast Area */}
      {selectedCommunity ? (
        <CommunityBroadcast community={selectedCommunity} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-muted/30">
          <div className="text-center text-muted-foreground">
            <Hash className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select a Community</h3>
            <p className="text-sm">Choose a community to view broadcasts</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Communities;