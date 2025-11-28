import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { postsService } from "@/services/postsService";
import { toast } from "sonner";
import { Comments } from "@/components/feed/Comments";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PostCardProps {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  image?: string;
  timestamp: string | Date;
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isOwnPost?: boolean;
  onPostDeleted?: () => void;
  onPostUpdated?: (updatedPost: any) => void;
}

export const PostCard = ({ 
  id,
  author, 
  content, 
  image, 
  timestamp, 
  likes, 
  comments, 
  shares, 
  isLiked = false, 
  isOwnPost = false,
  onPostDeleted,
  onPostUpdated
}: PostCardProps) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);
  const [commentCount, setCommentCount] = useState(comments);
  const [showComments, setShowComments] = useState(false);
  const [currentImage, setCurrentImage] = useState(image);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const formatTimestamp = (ts: string | Date): string => {
    if (typeof ts === 'string') {
      // If it's already a formatted string like "1h", "2d", return as is
      if (ts.match(/^\d+[smhd]$/)) return ts;
      // Otherwise parse it as a date
      return formatDistanceToNow(new Date(ts), { addSuffix: true });
    }
    return formatDistanceToNow(ts, { addSuffix: true });
  };

  const handleLike = async () => {
    try {
      const response = await postsService.toggleLike(id);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      if (response.data) {
        setLiked(response.data.isLiked);
        setLikeCount(response.data.likesCount);
      }
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Failed to like post');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const response = await postsService.deletePost(id);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      toast.success('Post deleted successfully');
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete the image from this post?')) {
      return;
    }
    
    try {
      const response = await postsService.deleteImage(id);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      toast.success('Image deleted successfully');
      // Update local state to remove the image
      setCurrentImage(undefined);
      // Refresh the post or update the UI
      if (onPostUpdated && response.data) {
        onPostUpdated(response.data.post);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleCommentCountChange = (count: number) => {
    setCommentCount(count);
  };

  const handleUserClick = () => {
    // If clicking on own profile, go to own profile page
    if (currentUser && author.username === currentUser.username) {
      navigate('/profile');
    } else {
      // Otherwise, go to the user's profile page
      navigate(`/profile/${author.username}`);
    }
  };

  // Update the post when the image is deleted
  useEffect(() => {
    if (onPostUpdated) {
      // Update local state when post is updated
      setCommentCount(comments);
    }
  }, [comments, onPostUpdated]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-hover bg-card/80 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer" onClick={handleUserClick}>
                <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                  <AvatarImage src={author.avatar} alt={author.name} />
                  <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div>
                <h4 
                  className="font-semibold text-foreground cursor-pointer hover:text-primary"
                  onClick={handleUserClick}
                >
                  {author.name}
                </h4>
                <p className="text-sm text-muted-foreground">@{author.username} • {formatTimestamp(timestamp)}</p>
              </div>
            </div>
            
            {isOwnPost && (
              <div className="relative group">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
                <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                  {currentImage && (
                    <button 
                      className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      onClick={handleDeleteImage}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Image
                    </button>
                  )}
                  <button 
                    className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted text-red-500 hover:text-red-600"
                    onClick={handleDeletePost}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
                  </button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-4">
          <p className="text-foreground mb-4 leading-relaxed">{content}</p>
          
          {currentImage && (
            <motion.div
              className="rounded-lg overflow-hidden mb-4"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <img 
                src={currentImage} 
                alt="Post content" 
                className="w-full h-auto object-cover max-h-96"
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={`flex items-center gap-2 ${
                    liked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <motion.div
                    animate={liked ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  </motion.div>
                  <span className="text-sm">{likeCount}</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">{commentCount}</span>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Share className="h-4 w-4 mr-2" />
                  <span className="text-sm">{shares}</span>
                </Button>
              </motion.div>
            </div>
          </div>
        </CardContent>
        
        {/* Comments Section */}
        {showComments && (
          <div className="px-6 pb-4">
            <Comments postId={id} onCommentCountChange={handleCommentCountChange} />
          </div>
        )}
      </Card>
    </motion.div>
  );
};