import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { ChatUser } from "@/pages/Messages";
import { messagesService, Message } from "@/services/messagesService";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { format } from "date-fns";

interface ChatWindowProps {
  selectedChat: ChatUser | null;
  onMessageSent?: () => void;
}

export const ChatWindow = ({ selectedChat, onMessageSent }: ChatWindowProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat?.conversationId) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat?.conversationId]);

  // Set up Socket.IO listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedChat?.conversationId) return;

    const handleNewMessage = (newMessage: any) => {
      if (newMessage.conversationId === selectedChat.conversationId) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, {
            id: newMessage.id,
            content: newMessage.content,
            sender: newMessage.sender,
            isSent: newMessage.isSent,
            isRead: newMessage.isRead,
            timestamp: newMessage.timestamp
          }];
        });
        scrollToBottom();
      }
    };

    const handleMessageSent = (sentMessage: any) => {
      if (sentMessage.conversationId === selectedChat.conversationId) {
        setMessages(prev => {
          // Check if message already exists
          if (prev.some(m => m.id === sentMessage.id)) {
            return prev.map(m => m.id === sentMessage.id ? {
              ...m,
              id: sentMessage.id,
              content: sentMessage.content,
              sender: sentMessage.sender,
              isSent: true,
              isRead: true,
              timestamp: sentMessage.timestamp
            } : m);
          }
          return [...prev, {
            id: sentMessage.id,
            content: sentMessage.content,
            sender: sentMessage.sender,
            isSent: true,
            isRead: true,
            timestamp: sentMessage.timestamp
          }];
        });
        scrollToBottom();
        setIsSending(false);
        if (onMessageSent) onMessageSent();
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
    };
  }, [selectedChat?.conversationId, onMessageSent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!selectedChat?.conversationId) return;
    
    setIsLoading(true);
    try {
      const result = await messagesService.getMessages(selectedChat.conversationId);
      if (result.data) {
        setMessages(result.data.messages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat?.conversationId || isSending) return;

    const content = message.trim();
    setMessage("");
    setIsSending(true);

    const socket = getSocket();
    if (!socket) {
      toast.error('Not connected to server');
      setIsSending(false);
      return;
    }

    // Emit message via Socket.IO
    socket.emit('send_message', {
      conversationId: selectedChat.conversationId,
      content,
      recipientId: selectedChat.id
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
              </Avatar>
              {selectedChat.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-medium">{selectedChat.name}</h3>
              <p className="text-sm text-muted-foreground">
                {selectedChat.isOnline ? "Online" : "Last seen recently"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading messages...
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className={cn(
                    "flex mb-4",
                    msg.isSent ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                      msg.isSent
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <div className={cn(
                      "text-xs mt-1 flex items-center gap-1",
                      msg.isSent ? "text-primary-foreground/70 justify-end" : "text-muted-foreground"
                    )}>
                      <span>{format(new Date(msg.timestamp), 'h:mm a')}</span>
                      {msg.isSent && (
                        <div className="flex">
                          <div className={cn(
                            "w-1 h-1 rounded-full",
                            msg.isRead ? "bg-primary-foreground/70" : "bg-primary-foreground/40"
                          )} />
                          <div className={cn(
                            "w-1 h-1 rounded-full ml-0.5",
                            msg.isRead ? "bg-primary-foreground/70" : "bg-primary-foreground/40"
                          )} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending}
              className="pr-12 resize-none bg-secondary/50 border-secondary focus:bg-background"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSendMessage}
            disabled={!message.trim() || isSending}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
