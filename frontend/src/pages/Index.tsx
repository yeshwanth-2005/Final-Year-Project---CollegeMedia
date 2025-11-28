import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Sparkles, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PostCard } from "@/components/feed/PostCard";
import { CreatePostModal } from "@/components/feed/CreatePostModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { postsService } from "@/services/postsService";
import { toast } from "sonner";

interface PostsResponse {
  posts: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const Index = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const response = await postsService.getPosts(pageNum, 10);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.data) {
        if (pageNum === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts(prev => [...prev, ...response.data!.posts]);
        }
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadPosts(page + 1);
    }
  };

  const handlePostCreated = () => {
    // Reload posts when a new post is created
    loadPosts(1);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">


        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-overlay border-border/50 mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    Welcome to CollegeMedia
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Connect, share, and discover amazing content with our community
                  </p>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="gradient" 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="btn-glow"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Post
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <Card className="bg-card/80 backdrop-blur-sm border-border/50">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No posts yet</p>
              <Button 
                variant="gradient" 
                onClick={() => setIsCreateModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <PostCard 
                  id={post.id}
                  author={post.author}
                  content={post.content}
                  image={post.image}
                  timestamp={post.createdAt}
                  likes={post.likesCount}
                  comments={post.commentsCount}
                  shares={post.shares}
                  isLiked={post.isLiked}
                  isOwnPost={post.isOwnPost}
                  onPostDeleted={loadPosts}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {!isLoading && posts.length > 0 && hasMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-8"
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="hover:scale-105 transition-transform"
              onClick={handleLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Posts'
              )}
            </Button>
          </motion.div>
        )}
      </div>

      <CreatePostModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </AppLayout>
  );
};

export default Index;
