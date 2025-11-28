import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, UserMinus, Check, X, Search, Users, UserCheck, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useFriends } from '@/contexts/FriendsContext';
import { formatDistanceToNow } from 'date-fns';

const Friends = () => {
  const {
    friends,
    pendingRequests,
    friendCounts,
    isLoading,
    currentPage,
    totalPages,
    loadFriends,
    sendFriendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    getFriendshipStatus,
  } = useFriends();

  const [searchUsername, setSearchUsername] = useState('');
  const [searchStatus, setSearchStatus] = useState<{
    status: string;
    friendshipId?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('friends');

  const handleSearch = async () => {
    if (!searchUsername.trim()) {
      return;
    }

    setIsSearching(true);
    const status = await getFriendshipStatus(searchUsername.trim());
    setSearchStatus(status);
    setIsSearching(false);
  };

  const handleSendRequest = async () => {
    if (!searchUsername.trim()) return;
    const success = await sendFriendRequest(searchUsername.trim());
    if (success) {
      setSearchUsername('');
      setSearchStatus(null);
      setActiveTab('requests');
    }
  };

  const handleAccept = async (requestId: string) => {
    await acceptRequest(requestId);
  };

  const handleReject = async (requestId: string) => {
    await rejectRequest(requestId);
  };

  const handleRemove = async (friendshipId: string) => {
    if (window.confirm('Are you sure you want to remove this friend?')) {
      await removeFriend(friendshipId);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Friends
            </h1>
            {friendCounts && (
              <div className="flex gap-4">
                <Badge variant="secondary" className="px-3 py-1">
                  <Users className="w-4 h-4 mr-1" />
                  {friendCounts.friendCount} Friends
                </Badge>
                {friendCounts.pendingRequestsCount > 0 && (
                  <Badge variant="outline" className="px-3 py-1">
                    <Clock className="w-4 h-4 mr-1" />
                    {friendCounts.pendingRequestsCount} Pending
                  </Badge>
                )}
              </div>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="friends">
                <Users className="w-4 h-4 mr-2" />
                Friends
              </TabsTrigger>
              <TabsTrigger value="requests">
                <Clock className="w-4 h-4 mr-2" />
                Requests
                {pendingRequests.length > 0 && (
                  <Badge className="ml-2" variant="destructive">
                    {pendingRequests.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="search">
                <Search className="w-4 h-4 mr-2" />
                Find Friends
              </TabsTrigger>
            </TabsList>

            {/* Friends Tab */}
            <TabsContent value="friends" className="mt-6">
              <Card className="bg-gradient-overlay border-border/50">
                <CardHeader>
                  <CardTitle>Your Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading friends...
                    </div>
                  ) : friends.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No friends yet</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Start by searching for friends!
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.map((friend) => (
                          <motion.div
                            key={friend.id}
                            whileHover={{ scale: 1.02 }}
                            className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src={friend.avatar} />
                                <AvatarFallback>
                                  {friend.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{friend.name}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  @{friend.username}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                Friends since{' '}
                                {formatDistanceToNow(new Date(friend.friendsSince), {
                                  addSuffix: true,
                                })}
                              </p>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleRemove(friend.friendshipId)}
                                className="text-destructive hover:text-destructive"
                              >
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadFriends(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <span className="flex items-center px-4 text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadFriends(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Requests Tab */}
            <TabsContent value="requests" className="mt-6">
              <Card className="bg-gradient-overlay border-border/50">
                <CardHeader>
                  <CardTitle>Pending Friend Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">No pending requests</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <motion.div
                          key={request.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-card/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.user.avatar} />
                              <AvatarFallback>
                                {request.user.name.charAt(0)}
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
                              <Check className="w-4 h-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Search Tab */}
            <TabsContent value="search" className="mt-6">
              <Card className="bg-gradient-overlay border-border/50">
                <CardHeader>
                  <CardTitle>Find Friends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by username..."
                        value={searchUsername}
                        onChange={(e) => setSearchUsername(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-1"
                      />
                      <Button onClick={handleSearch} disabled={isSearching}>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </Button>
                    </div>

                    {searchStatus && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-lg border border-border/50 bg-card/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">
                              Status: <span className="capitalize">{searchStatus.status}</span>
                            </p>
                            {searchStatus.status === 'not_friends' && (
                              <p className="text-sm text-muted-foreground mt-1">
                                You can send a friend request to @{searchUsername}
                              </p>
                            )}
                          </div>
                          {searchStatus.status === 'not_friends' && (
                            <Button onClick={handleSendRequest}>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Send Request
                            </Button>
                          )}
                          {searchStatus.status === 'pending' && (
                            <Badge variant="outline">
                              <Clock className="w-4 h-4 mr-1" />
                              Request Pending
                            </Badge>
                          )}
                          {searchStatus.status === 'accepted' && (
                            <Badge variant="secondary">
                              <UserCheck className="w-4 h-4 mr-1" />
                              Already Friends
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Friends;

