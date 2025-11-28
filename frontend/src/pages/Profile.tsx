import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Link as LinkIcon, Settings, UserPlus, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PostCard } from "@/components/feed/PostCard";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { userService, UserProfileResponse, UserProfile } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const Profile = () => {
  const { user: currentUser, updateUser } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const result = await userService.getMyProfile();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      if (result.data) {
        setProfileData(result.data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdated = (updatedUser: UserProfile) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        user: updatedUser,
      });
    }
    
    // Also update the user in the AuthContext
    if (updateUser) {
      updateUser(updatedUser);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!profileData) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      </AppLayout>
    );
  }

  const { user, stats, posts } = profileData;
  const initials = user.fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-overlay border-border/50">
            <CardHeader className="pb-6">
              <div className="flex flex-col md:flex-row gap-6">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{user.fullName}</h1>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                    
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                          <Settings className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  
                  {user.bio && (
                    <p className="text-foreground mb-4">
                      {user.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(user.joinedAt), 'MMMM yyyy')}
                    </div>
                    {user.website && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {user.website.replace(/^https?:\/\//, '')}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-6">
                    <div>
                      <span className="font-semibold text-foreground">{stats.friendCount}</span>
                      <span className="text-muted-foreground ml-1">Friends</span>
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{stats.postCount}</span>
                      <span className="text-muted-foreground ml-1">Posts</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Skills/Interests */}
        {user.skills && user.skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader>
                <h3 className="font-semibold text-foreground">Skills & Interests</h3>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <motion.div
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors">
                        {skill}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* User Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-foreground mb-6">Recent Posts</h3>
          {posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard {...post} />
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No posts yet</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Edit Profile Modal */}
      {profileData && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={profileData.user}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </AppLayout>
  );
};

export default Profile;