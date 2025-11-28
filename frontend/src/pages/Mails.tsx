import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Mail, 
  Inbox, 
  Star, 
  Send, 
  Trash2, 
  Archive, 
  Filter,
  RefreshCw,
  LogOut,
  User,
  Calendar,
  Paperclip,
  Reply,
  Forward,
  MoreVertical
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gmailService, GmailMessage, GmailProfile } from "@/lib/gmail";
import { useNavigate } from "react-router-dom";

const Mails = () => {
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [activeTab, setActiveTab] = useState("inbox");
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMoreEmails, setHasMoreEmails] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!gmailService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    loadEmails();
    loadProfile();
  }, [navigate]);

  const loadEmails = async (pageToken?: string) => {
    try {
      setIsLoading(true);
      const result = await gmailService.getEmails(20, pageToken);
      
      if (pageToken) {
        setEmails(prev => [...prev, ...result.messages]);
      } else {
        setEmails(result.messages);
      }
      
      setNextPageToken(result.nextPageToken);
      setHasMoreEmails(!!result.nextPageToken);
    } catch (error) {
      console.error('Failed to load emails:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const profileData = await gmailService.getProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadEmails();
      return;
    }

    try {
      setIsLoading(true);
      const result = await gmailService.searchEmails(searchQuery, 20);
      setEmails(result.messages);
      setNextPageToken(result.nextPageToken);
      setHasMoreEmails(!!result.nextPageToken);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    gmailService.logout();
    navigate('/login');
  };

  const formatDate = (internalDate: string) => {
    const date = new Date(parseInt(internalDate));
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getEmailHeader = (message: GmailMessage, name: string) => {
    const header = message.payload.headers.find(h => h.name === name);
    return header?.value || '';
  };

  const getEmailBody = (message: GmailMessage) => {
    if (message.payload.body?.data) {
      return atob(message.payload.body.data);
    }
    
    if (message.payload.parts) {
      const textPart = message.payload.parts.find(part => 
        part.mimeType === 'text/plain' || part.mimeType === 'text/html'
      );
      if (textPart?.body?.data) {
        return atob(textPart.body.data);
      }
    }
    
    return message.snippet;
  };

  const hasAttachments = (message: GmailMessage) => {
    return message.payload.parts?.some(part => 
      part.mimeType !== 'text/plain' && part.mimeType !== 'text/html'
    ) || false;
  };

  const isStarred = (message: GmailMessage) => {
    return message.labelIds.includes('STARRED');
  };

  const isImportant = (message: GmailMessage) => {
    return message.labelIds.includes('IMPORTANT');
  };

  const isUnread = (message: GmailMessage) => {
    return !message.labelIds.includes('READ');
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Gmail Inbox</h1>
              {profile && (
                <p className="text-muted-foreground">
                  {profile.emailAddress} • {profile.messagesTotal} messages
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={loadProfile}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-lg bg-card/50 border-border/30 focus:bg-card focus:border-primary/50 transition-all duration-300 rounded-xl"
              />
            </div>
            <Button onClick={handleSearch} variant="gradient" size="lg">
              Search
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Folders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="inbox" className="justify-start">
                      <Inbox className="h-4 w-4 mr-2" />
                      Inbox
                    </TabsTrigger>
                    <TabsTrigger value="starred" className="justify-start">
                      <Star className="h-4 w-4 mr-2" />
                      Starred
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="justify-start">
                      <Send className="h-4 w-4 mr-2" />
                      Sent
                    </TabsTrigger>
                    <TabsTrigger value="archive" className="justify-start">
                      <Archive className="h-4 w-4 mr-2" />
                      Archive
                    </TabsTrigger>
                    <TabsTrigger value="trash" className="justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Trash
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {activeTab === 'inbox' ? 'Inbox' : 
                   activeTab === 'starred' ? 'Starred' :
                   activeTab === 'sent' ? 'Sent' :
                   activeTab === 'archive' ? 'Archive' : 'Trash'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading emails...</p>
                  </div>
                ) : emails.length === 0 ? (
                  <div className="text-center py-8">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No emails found</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {emails.map((email) => (
                      <motion.div
                        key={email.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedEmail?.id === email.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border/50 hover:border-border hover:bg-muted/30'
                        } ${isUnread(email) ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''}`}
                        onClick={() => setSelectedEmail(email)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-medium text-sm">
                                {getEmailHeader(email, 'From')?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className={`font-medium truncate ${
                                  isUnread(email) ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                  {getEmailHeader(email, 'From') || 'Unknown Sender'}
                                </span>
                                {isStarred(email) && (
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                )}
                                {isImportant(email) && (
                                  <Badge variant="secondary" className="text-xs">Important</Badge>
                                )}
                              </div>
                              <span className="text-sm text-muted-foreground flex-shrink-0">
                                {formatDate(email.internalDate)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium truncate ${
                                isUnread(email) ? 'text-foreground' : 'text-muted-foreground'
                              }`}>
                                {getEmailHeader(email, 'Subject') || 'No Subject'}
                              </span>
                              {hasAttachments(email) && (
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {email.snippet || 'No preview available'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {hasMoreEmails && (
                      <div className="text-center pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => loadEmails(nextPageToken)}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            'Load More'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Email Detail Modal */}
        <AnimatePresence>
          {selectedEmail && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedEmail(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {getEmailHeader(selectedEmail, 'Subject') || 'No Subject'}
                    </h2>
                    <p className="text-muted-foreground">
                      From: {getEmailHeader(selectedEmail, 'From')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      <Forward className="h-4 w-4 mr-2" />
                      Forward
                    </Button>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="mb-4 text-sm text-muted-foreground">
                    <span>Date: {new Date(parseInt(selectedEmail.internalDate)).toLocaleString()}</span>
                    {hasAttachments(selectedEmail) && (
                      <span className="ml-4 flex items-center gap-1">
                        <Paperclip className="h-4 w-4" />
                        Has attachments
                      </span>
                    )}
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: getEmailBody(selectedEmail).replace(/\n/g, '<br>') 
                    }} />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Mails;

