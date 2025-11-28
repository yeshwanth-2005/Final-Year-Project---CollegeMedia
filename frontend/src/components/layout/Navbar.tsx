import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Bell, PlusCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/components/ui/sidebar";
import { notificationService } from "@/services/notificationService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Navbar = () => {
  const { open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    loadUnreadCount();
  }, []);
  
  const loadUnreadCount = async () => {
    try {
      const result = await notificationService.getNotifications(1, 1); // Just get count
      if (result.data) {
        setUnreadCount(result.data.unreadCount);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };
  
  const handleProfileClick = () => {
    if (user) {
      navigate(`/profile/${user.username}`);
    }
  };
  
  const handleCreatePostClick = () => {
    // This would typically open a modal or navigate to a create post page
    // For now, we'll just navigate to the home page
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full hidden lg:block"
    >
      <div className="mx-4 mt-4">
        <div className="bg-card/70 backdrop-blur-md border border-border/50 rounded-2xl shadow-soft">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Left - Logo and Toggle */}
            <div className="flex items-center gap-4">
              {/* Sidebar Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                className="h-10 w-10 bg-muted/30 hover:bg-muted/50 border border-border/30 rounded-xl transition-all duration-300"
              >
                <Menu className="h-5 w-5" />
              </Button>
              
              {/* CollegeMedia Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <h1 className="text-xl font-bold gradient-text">CollegeMedia</h1>
              </div>
            </div>
            
            {/* Center - Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, people, topics..."
                  className="pl-10 bg-muted/30 border-border/30 focus:bg-card focus:border-primary/50 transition-all duration-300 rounded-xl"
                />
              </div>
            </div>

            {/* Right - Profile Picture, Notifications and Create */}
            <div className="flex items-center gap-3">
              {/* Profile Picture */}
              {user && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar 
                    className="h-8 w-8 cursor-pointer ring-2 ring-primary/20"
                    onClick={handleProfileClick}
                  >
                    <AvatarImage src={user.avatar} alt={user.fullName} />
                    <AvatarFallback>{user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationsClick}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-gradient-accent">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Badge>
                  )}
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="gradient" size="sm" onClick={handleCreatePostClick}>
                  <PlusCircle className="h-4 w-4" />
                  Create
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};