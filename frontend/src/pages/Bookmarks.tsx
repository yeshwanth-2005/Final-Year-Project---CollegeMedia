import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Bookmark, 
  Briefcase, 
  MessageSquare, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Building2,
  ExternalLink,
  Trash2,
  Calendar,
  GraduationCap
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for bookmarks
const mockJobBookmarks = [
  {
    id: "jb1",
    title: "Senior Frontend Developer",
    company: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $150,000",
    experience: "5+ years",
    posted: "2 days ago",
    isRemote: true,
    category: "Frontend Development"
  },
  {
    id: "jb2",
    title: "Data Scientist",
    company: "DataFlow Analytics",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=DF",
    location: "Seattle, WA",
    type: "Full-time",
    salary: "$130,000 - $160,000",
    experience: "6+ years",
    posted: "1 day ago",
    isRemote: true,
    category: "Data Science"
  },
  {
    id: "jb3",
    title: "Software Engineering Intern",
    company: "TechCorp Solutions",
    logo: "https://api.dicebear.com/7.x/initials/svg?seed=TC",
    location: "San Francisco, CA",
    type: "Internship",
    duration: "3 months",
    stipend: "$5,000/month",
    posted: "1 week ago",
    isRemote: false,
    category: "Software Engineering"
  }
];

const mockPostBookmarks = [
  {
    id: "pb1",
    author: {
      name: "Alex Chen",
      username: "alexchen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex"
    },
    content: "Just launched my new React project with some amazing animations! The developer experience has been incredible. What's everyone working on this week? 🚀",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&h=400",
    timestamp: "2h",
    likes: 24,
    comments: 8,
    shares: 3
  },
  {
    id: "pb2",
    author: {
      name: "Sarah Wilson",
      username: "sarahwilson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah"
    },
    content: "The future of web development is looking incredibly bright! With new frameworks and tools emerging, we're able to create more performant and beautiful applications than ever before. What trends are you most excited about? 💡",
    timestamp: "4h",
    likes: 42,
    comments: 15,
    shares: 7
  },
  {
    id: "pb3",
    author: {
      name: "David Kim",
      username: "davidkim",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david"
    },
    content: "Working on a new social media platform that focuses on meaningful connections and authentic content sharing. The tech stack includes React, TypeScript, and some amazing animation libraries!",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=800&h=400",
    timestamp: "6h",
    likes: 18,
    comments: 6,
    shares: 2
  }
];

const Bookmarks = () => {
  const [jobBookmarks, setJobBookmarks] = useState(mockJobBookmarks);
  const [postBookmarks, setPostBookmarks] = useState(mockPostBookmarks);

  const removeJobBookmark = (id: string) => {
    setJobBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const removePostBookmark = (id: string) => {
    setPostBookmarks(prev => prev.filter(bookmark => bookmark.id !== id));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Frontend Development":
        return <Briefcase className="h-4 w-4" />;
      case "Data Science":
        return <Users className="h-4 w-4" />;
      case "Software Engineering":
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Briefcase className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold gradient-text mb-2">Bookmarks</h1>
          <p className="text-muted-foreground">
            Your saved jobs, internships, and posts in one place
          </p>
        </motion.div>

        {/* Content Tabs */}
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs & Internships ({jobBookmarks.length})
            </TabsTrigger>
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Posts ({postBookmarks.length})
            </TabsTrigger>
          </TabsList>

          {/* Jobs & Internships Tab */}
          <TabsContent value="jobs" className="space-y-6">
            {jobBookmarks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No job bookmarks yet</h3>
                <p className="text-muted-foreground">Start bookmarking jobs and internships you're interested in</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {jobBookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/30">
                              <img
                                src={bookmark.logo}
                                alt={bookmark.company}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-1">{bookmark.title}</h3>
                              <p className="text-sm text-muted-foreground">{bookmark.company}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeJobBookmark(bookmark.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{bookmark.location}</span>
                            {bookmark.isRemote && (
                              <Badge variant="outline" className="ml-2 text-xs">Remote</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{bookmark.type}</span>
                          </div>
                          {bookmark.salary ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span>{bookmark.salary}</span>
                            </div>
                          ) : bookmark.stipend ? (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <DollarSign className="h-4 w-4" />
                              <span>{bookmark.stipend}</span>
                            </div>
                          ) : null}
                          {bookmark.duration && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{bookmark.duration}</span>
                            </div>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(bookmark.category)}
                            <span className="ml-1">{bookmark.category}</span>
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="gradient" className="flex-1">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Job
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {postBookmarks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No post bookmarks yet</h3>
                <p className="text-muted-foreground">Start bookmarking posts you want to read later</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {postBookmarks.map((bookmark, index) => (
                  <motion.div
                    key={bookmark.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-border/30">
                              <img
                                src={bookmark.author.avatar}
                                alt={bookmark.author.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{bookmark.author.name}</h3>
                              <p className="text-sm text-muted-foreground">@{bookmark.author.username}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePostBookmark(bookmark.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {bookmark.image && (
                          <div className="mb-3">
                            <img
                              src={bookmark.image}
                              alt="Post content"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {bookmark.content}
                        </p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{bookmark.timestamp}</span>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {bookmark.likes}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {bookmark.comments}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Post
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Organize Your Bookmarks</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" size="lg">
              <Bookmark className="h-4 w-4 mr-2" />
              Export Bookmarks
            </Button>
            <Button variant="gradient" size="lg">
              <Briefcase className="h-4 w-4 mr-2" />
              Browse Jobs
            </Button>
            <Button variant="outline" size="lg">
              <MessageSquare className="h-4 w-4 mr-2" />
              Explore Posts
            </Button>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Bookmarks;


