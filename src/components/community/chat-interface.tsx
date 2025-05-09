"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, LogIn } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'other';
  avatar?: string;
  name: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  { id: '1', text: 'Hey everyone! Just finished a great workout.', sender: 'other', name: 'Lydia M.', timestamp: new Date(Date.now() - 1000 * 60 * 5) , avatar: 'https://picsum.photos/seed/alex/40/40' },
  { id: '2', text: 'Nice one, Daisy! What did you do?', sender: 'other', name: 'Maria G.', timestamp: new Date(Date.now() - 1000 * 60 * 4), avatar: 'https://picsum.photos/seed/maria/40/40' },
  { id: '3', text: 'I did the new HIIT routine from the courses section. It was tough but rewarding!', sender: 'other', name: 'Rose K.', timestamp: new Date(Date.now() - 1000 * 60 * 3), avatar: 'https://picsum.photos/seed/alex/40/40' },
  { id: 'welcome', text: 'Welcome to the community chat! Feel free to look around. Please log in to send messages.', sender: 'other', name: 'FitLife Bot', timestamp: new Date(Date.now() - 1000 * 60 * 60), avatar: 'https://picsum.photos/seed/fitlifebot/40/40' },
];

export function ChatInterface() {
  const { user } = useAuth(); // Get user from auth context
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '') return; 

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      name: user.displayName || 'You', 
      timestamp: new Date(),
      avatar: user.photoURL || 'https://picsum.photos/seed/user/40/40', 
    };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    
    // Simulate a bot response or another user for demo
    setTimeout(() => {
        const botResponse: Message = {
            id: (Date.now() + 1).toString(),
            text: `Thanks for sharing, ${userMessage.name}! That sounds interesting.`,
            sender: 'other',
            name: 'ChatBot',
            timestamp: new Date(),
            avatar: 'https://picsum.photos/seed/bot/40/40',
        };
        setMessages(prevMessages => [...prevMessages, botResponse]);
    }, 1000);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle>Community Chat</CardTitle>
        {!user && <CardDescription className="text-primary">Log in to send messages and join the conversation!</CardDescription>}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4 border rounded-md p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'other' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.avatar} alt={msg.name} data-ai-hint="person portrait" />
                    <AvatarFallback>{msg.name.substring(0,1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm font-medium mb-0.5">{msg.sender === 'user' ? (user?.displayName || 'You') : msg.name}</p>
                  <p className="text-sm">{msg.text}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
                {msg.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                     <AvatarImage src={msg.avatar} alt={msg.name} data-ai-hint="person abstract" />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        {user ? (
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              aria-label="Chat message input"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        ) : (
          <div className="w-full">
            <LoginPrompt 
              featureName="Chat"
              message="Please log in to send messages and participate in the community chat."
            />
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
