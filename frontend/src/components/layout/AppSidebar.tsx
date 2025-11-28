import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  Home, 
  MessageSquare, 
  Users, 
  Briefcase, 
  BookOpen, 
  Bookmark, 
  User, 
  Settings,
  Newspaper,
  Mail,
  Network as NetworkIcon,
  Bell
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { notificationService } from "@/services/notificationService";
import { messagesService } from "@/services/messagesService";

const mainItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Notifications", url: "/notifications", icon: Bell, badgeKey: 'notifications' },
  { title: "Message", url: "/messages", icon: MessageSquare, badgeKey: 'messages' },
  { title: "Network", url: "/network", icon: NetworkIcon },
  { title: "Jobs/Internship", url: "/jobs", icon: Briefcase },
  { title: "Study Materials", url: "/study", icon: BookOpen },
  { title: "Bookmarks", url: "/bookmarks", icon: Bookmark },
];

const contentItems = [
  { title: "Communities", url: "/communities", icon: Users },
  { title: "Tech News", url: "/news", icon: Newspaper },
  { title: "Mails", url: "/mails", icon: Mail },
];

const accountItems = [
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: Settings },
];

export const AppSidebar = () => {
  const { open } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  const currentPath = location.pathname;
  const [badges, setBadges] = useState<{ notifications: number; messages: number }>({
    notifications: 0,
    messages: 0
  });

  useEffect(() => {
    loadBadgeCounts();
    // Refresh counts every 30 seconds
    const interval = setInterval(loadBadgeCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  // Refresh counts when route changes
  useEffect(() => {
    loadBadgeCounts();
  }, [currentPath]);

  const loadBadgeCounts = async () => {
    try {
      // Load notification count
      const notifResult = await notificationService.getNotifications(1, 1);
      if (notifResult.data) {
        setBadges(prev => ({ ...prev, notifications: notifResult.data!.unreadCount }));
      }

      // Load unread conversation count
      const convResult = await messagesService.getConversations();
      if (convResult.data) {
        const unreadCount = convResult.data.conversations.filter(c => c.unreadCount > 0).length;
        setBadges(prev => ({ ...prev, messages: unreadCount }));
      }
    } catch (error) {
      console.error('Error loading badge counts:', error);
    }
  };

  const getBadgeCount = (badgeKey?: string): number => {
    if (!badgeKey) return 0;
    return badges[badgeKey as keyof typeof badges] || 0;
  };

  const formatBadge = (count: number): string => {
    return count > 9 ? '9+' : count.toString();
  };

  const isActive = (path: string) => currentPath === path;
  
  const getNavClassName = (path: string) => {
    const baseClasses = "transition-all duration-300 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground";
    return isActive(path) 
      ? `${baseClasses} bg-sidebar-primary text-sidebar-primary-foreground shadow-medium` 
      : baseClasses;
  };

  const sidebarVariants = {
    expanded: { width: 280, opacity: 1 },
    collapsed: { width: 80, opacity: 1 }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      animate={collapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen"
    >
      <Sidebar className="border-r border-sidebar-border bg-sidebar h-full">
        <SidebarContent className="px-2 py-4 h-full">


          {/* Main Navigation */}
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Main
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                        <NavLink to={item.url} className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          {!collapsed && (
                            <>
                              <span className="ml-3">{item.title}</span>
                              {item.badgeKey && getBadgeCount(item.badgeKey) > 0 && (
                                <Badge className="ml-auto bg-gradient-accent text-xs">
                                  {formatBadge(getBadgeCount(item.badgeKey))}
                                </Badge>
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Content Section */}
          <SidebarGroup>
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Content
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {contentItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + mainItems.length) * 0.1 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                        <NavLink to={item.url} className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className="ml-3">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Account Section */}
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className={collapsed ? "sr-only" : ""}>
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountItems.map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + mainItems.length + contentItems.length) * 0.1 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild className={getNavClassName(item.url)}>
                        <NavLink to={item.url} className="flex items-center">
                          <item.icon className="h-5 w-5" />
                          {!collapsed && <span className="ml-3">{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </motion.div>
  );
};