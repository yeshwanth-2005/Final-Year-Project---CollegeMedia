import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Loader2, UserPlus, UserCheck, Clock, X, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { userService, NetworkUser } from '@/services/userService';
import { friendsService } from '@/services/friendsService';
import { useFriends } from '@/contexts/FriendsContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const Network = () => {
  const navigate = useNavigate();
  const {
    friends,
    pendingRequests,
    friendCounts,
    isLoading: friendsLoading,
    acceptRequest,
    rejectRequest,
    removeFriend,
  } = useFriends();

  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [sendingRequestTo, setSendingRequestTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('friends');

  useEffect(() => {
    loadSuggestions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== '') {
        loadSuggestions(searchQuery);
      } else {
        loadSuggestions();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadSuggestions = async (search?: string) => {
    setIsLoadingSuggestions(true);
    try {
      const result = await userService.searchUsers(search, 1, 20);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.data) {
        // Filter out accepted friends from suggestions
        const filteredUsers = result.data.users.filter(
          user => user.friendshipStatus !== 'accepted'
        );
        setSuggestions(filteredUsers);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast.error('Failed to load suggestions');
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSendFriendRequest = async (username: string, userId: string) => {
    setSendingRequestTo(userId);
    try {
      const result = await friendsService.sendFriendRequest(username);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Friend request sent!');
      
      // Update user's friendship status in the list
      setSuggestions(suggestions.map(u => 
        u.id === userId ? { ...u, friendshipStatus: 'pending' } : u
      ));
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast.error('Failed to send friend request');
    } finally {
      setSendingRequestTo(null);
    }
  };

  const handleAccept = async (requestId: string) => {
    await acceptRequest(requestId);
    await loadSuggestions(); // Refresh to remove accepted user from suggestions
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  const handleRemove = async (friendshipId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendshipId);
    }
  };

  const initials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getActionButton = (user: NetworkUser) => {
    const isProcessing = sendingRequestTo === user.id;

    switch (user.friendshipStatus) {
      case 'pending':
        return (
          <Button variant="outline" size="sm" disabled>
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
        );
      case 'not_friends':
        return (
          <Button
            variant="default"
            size="sm"
            onClick={() => handleSendFriendRequest(user.username, user.id)}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4 mr-2" />
            )}
            Add Friend
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold gradient-text">Network</h1>
              <p className="text-muted-foreground">
                Connect with your college community
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search people by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="friends">
                <UserCheck className="h-4 w-4 mr-2" />
                Friends {friendCounts && `(${friendCounts.friendCount})`}
              </TabsTrigger>
              <TabsTrigger value="suggestions">
                <UserPlus className="h-4 w-4 mr-2" />
                Suggestions
              </TabsTrigger>
            </TabsList>

            {/* Friends Tab */}
            <TabsContent value="friends" className="mt-6">
              {/* Pending Requests - Always at top */}
              {pendingRequests.length > 0 && (
                <Card className="mb-6 bg-gradient-overlay border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Pending Friend Requests
                      <Badge variant="destructive">{pendingRequests.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                            <AvatarImage src={request.user.avatar} />
                            <AvatarFallback>
                              {initials(request.user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              @{request.user.username}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(request.sentAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAccept(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request.id)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Friends List */}
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  {friendsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground">No friends yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Check out suggestions to find people to connect with!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {friends.map((friend, index) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                        >
                          <div
                            className="flex items-center gap-3 mb-3 cursor-pointer"
                            onClick={() => navigate(`/profile/${friend.username}`)}
                          >
                            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{initials(friend.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{friend.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                @{friend.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <p className="text-muted-foreground">
                              Friends since{' '}
                              {formatDistanceToNow(new Date(friend.friendsSince), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate(`/profile/${friend.username}`)}
                            >
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemove(friend.friendshipId)}
                              className="text-destructive hover:text-destructive"
                            >
                              Remove
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Suggestions Tab */}
            <TabsContent value="suggestions" className="mt-6">
              {isLoadingSuggestions ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : suggestions.length === 0 ? (
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardContent className="py-12 text-center">
                    <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No suggestions found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? 'Try adjusting your search query'
                        : 'Check back later for new connections'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suggestions.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="card-hover bg-card/80 backdrop-blur-sm border-border/50 h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start gap-4">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className="cursor-pointer"
                              onClick={() => navigate(`/profile/${user.username}`)}
                            >
                              <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{initials(user.fullName)}</AvatarFallback>
                              </Avatar>
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary"
                                onClick={() => navigate(`/profile/${user.username}`)}
                              >
                                {user.fullName}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                @{user.username}
                              </p>
                              {user.location && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                  {user.location}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {user.bio && (
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                              {user.bio}
                            </p>
                          )}
                          <div className="flex gap-2">
                            {getActionButton(user)}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/profile/${user.username}`)}
                            >
                              View Profile
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
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Network;
