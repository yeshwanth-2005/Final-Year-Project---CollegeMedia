import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Clock, ExternalLink, Bookmark, Share, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readTime: string;
  category: string;
  imageUrl: string;
  url: string;
  isBookmarked: boolean;
}

const TechNews = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", "AI/ML", "Web Dev", "Mobile", "Cloud", "Security", "Startups"];

  // Mock tech news data
  const newsArticles: NewsArticle[] = [
    {
      id: "1",
      title: "OpenAI Announces GPT-5: Revolutionary Breakthrough in AI Reasoning",
      summary: "The latest iteration promises unprecedented capabilities in logical reasoning and multimodal understanding, setting new benchmarks across various AI tasks.",
      author: "Sarah Chen",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c9a4?w=150&h=150&fit=crop&crop=face",
      publishedAt: "2 hours ago",
      readTime: "5 min read",
      category: "AI/ML",
      imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop",
      url: "https://example.com/gpt5-announcement",
      isBookmarked: false,
    },
    {
      id: "2",
      title: "React 19 Beta Released: Major Performance Improvements and New Features",
      summary: "Facebook releases React 19 beta with automatic batching improvements, concurrent features, and enhanced developer experience tools.",
      author: "Mike Johnson",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      publishedAt: "4 hours ago",
      readTime: "7 min read",
      category: "Web Dev",
      imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
      url: "https://example.com/react-19-beta",
      isBookmarked: true,
    },
    {
      id: "3",
      title: "Google Introduces Quantum Error Correction Milestone",
      summary: "Breakthrough achievement in quantum computing brings us closer to fault-tolerant quantum systems for practical applications.",
      author: "Dr. Emily Rodriguez",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      publishedAt: "6 hours ago",
      readTime: "4 min read",
      category: "AI/ML",
      imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=200&fit=crop",
      url: "https://example.com/quantum-milestone",
      isBookmarked: false,
    },
    {
      id: "4",
      title: "AWS Launches New Serverless Database with Auto-scaling Capabilities",
      summary: "Amazon Web Services introduces a revolutionary serverless database that automatically scales based on demand with zero downtime.",
      author: "Alex Kumar",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      publishedAt: "8 hours ago",
      readTime: "6 min read",
      category: "Cloud",
      imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=200&fit=crop",
      url: "https://example.com/aws-serverless-db",
      isBookmarked: false,
    },
    {
      id: "5",
      title: "New iOS 18 Security Feature Blocks Malicious Apps in Real-time",
      summary: "Apple introduces advanced machine learning-based security system that can detect and prevent malicious app behavior instantly.",
      author: "Jessica Park",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      publishedAt: "12 hours ago",
      readTime: "3 min read",
      category: "Security",
      imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop",
      url: "https://example.com/ios18-security",
      isBookmarked: true,
    },
    {
      id: "6",
      title: "Startup Raises $50M for Revolutionary Green Energy Storage Solution",
      summary: "CleanTech startup develops breakthrough battery technology promising 10x longer storage capacity using sustainable materials.",
      author: "David Wright",
      authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      publishedAt: "1 day ago", 
      readTime: "8 min read",
      category: "Startups",
      imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop",
      url: "https://example.com/cleantech-funding",
      isBookmarked: false,
    },
  ];

  const filteredArticles = newsArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleBookmark = (articleId: string) => {
    // Handle bookmark toggle - integrate with backend later
    console.log("Toggle bookmark for article:", articleId);
  };

  const shareArticle = (article: NewsArticle) => {
    // Handle article sharing - integrate with backend later
    console.log("Share article:", article.title);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Tech News</h1>
            <Button variant="ghost" size="icon" className="ml-auto text-muted-foreground hover:text-foreground">
              <Filter className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search tech news..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary/50 border-secondary focus:bg-background"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className="whitespace-nowrap"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* News Articles */}
      <div className="p-4 space-y-4">
        {filteredArticles.map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden hover:shadow-medium transition-all duration-300 group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Article Image */}
                  <div className="md:w-1/3 relative overflow-hidden">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground">
                      {article.category}
                    </Badge>
                  </div>

                  {/* Article Content */}
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <h2 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                        {article.summary}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Author and metadata */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={article.authorAvatar} alt={article.author} />
                          <AvatarFallback>{article.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{article.author}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{article.publishedAt}</span>
                            <span>•</span>
                            <span>{article.readTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(article.url, '_blank')}
                          className="group-hover:border-primary/50"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Read Full Article
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => toggleBookmark(article.id)}
                            className={article.isBookmarked ? "text-primary" : "text-muted-foreground"}
                          >
                            <Bookmark className={`h-4 w-4 ${article.isBookmarked ? 'fill-current' : ''}`} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => shareArticle(article)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechNews;