import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Edit, Trash2, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { postsService } from "@/services/postsService";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  isOwnComment: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommentsProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export const Comments = ({ postId, onCommentCountChange }: CommentsProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async (pageNum = 1) => {
    if (pageNum === 1) {
      setIsLoading(true);
    }
    
    try {
      const response = await postsService.getComments(postId, pageNum, 10);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      if (response.data) {
        if (pageNum === 1) {
          setComments(response.data.comments);
        } else {
          setComments(prev => [...prev, ...response.data!.comments]);
        }
        
        setHasMore(response.data.pagination.page < response.data.pagination.pages);
        setPage(pageNum);
        
        // Notify parent about comment count change
        if (onCommentCountChange) {
          onCommentCountChange(response.data.pagination.total);
        }
      }
    } catch (error) {
      console.error("Error loading comments:", error);
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await postsService.createComment(postId, {
        content: newComment.trim()
      });
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      if (response.data) {
        setComments(prev => [response.data!.comment, ...prev]);
        setNewComment("");
        
        // Notify parent about comment count change
        if (onCommentCountChange) {
          onCommentCountChange(comments.length + 1);
        }
        
        toast.success("Comment added successfully");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const response = await postsService.updateComment(commentId, {
        content: editingContent.trim()
      });
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      if (response.data) {
        setComments(prev =>
          prev.map(comment =>
            comment.id === commentId
              ? { ...comment, ...response.data!.comment }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditingContent("");
        toast.success("Comment updated successfully");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    
    try {
      const response = await postsService.deleteComment(commentId);
      
      if (response.error) {
        toast.error(response.error);
        return;
      }
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Notify parent about comment count change
      if (onCommentCountChange) {
        onCommentCountChange(comments.length - 1);
      }
      
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const handleEditClick = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditingContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingContent("");
  };

  const handleLoadMore = () => {
    loadComments(page + 1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Add Comment Form */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 resize-none"
          rows={2}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || isSubmitting}
          size="icon"
          className="h-10 w-10"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-lg p-3"
          >
            {editingCommentId === comment.id ? (
              // Edit Mode
              <div className="space-y-2">
                <Textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className="w-full resize-none"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={!editingContent.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>
                      {comment.author.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">
                        {comment.author.name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        @{comment.author.username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  {comment.isOwnComment && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditClick(comment)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLoadMore}
            disabled={isLoading}
          >
            Load More Comments
          </Button>
        </div>
      )}
    </div>
  );
};