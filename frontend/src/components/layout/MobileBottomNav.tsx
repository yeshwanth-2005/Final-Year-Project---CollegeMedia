import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";
import { Home, Newspaper, PlusCircle, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Tech News", url: "/news", icon: Newspaper },
  { title: "Create", url: "/create", icon: PlusCircle, isCreate: true },
  { title: "Study", url: "/study", icon: BookOpen },
  { title: "Profile", url: "/profile", icon: User },
];

export const MobileBottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-card/90 backdrop-blur-md border-t border-border"
    >
      <div className="flex items-center justify-around px-4 py-3">
        {navItems.map((item) => (
          <motion.div
            key={item.title}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex justify-center"
          >
            {item.isCreate ? (
              <Button
                variant="gradient"
                size="icon"
                className="h-12 w-12 rounded-full shadow-glow"
                asChild
              >
                <NavLink to={item.url}>
                  <item.icon className="h-5 w-5" />
                </NavLink>
              </Button>
            ) : (
              <NavLink
                to={item.url}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive(item.url)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.title}</span>
              </NavLink>
            )}
          </motion.div>
        ))}
      </div>
    </motion.nav>
  );
};