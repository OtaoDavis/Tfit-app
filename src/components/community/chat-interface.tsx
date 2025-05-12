
"use client";

import React, { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';
import { firestore } from '@/lib/firebase/config';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Capacitor } from '@capacitor/core';
import { Keyboard, KeyboardInfo } from '@capacitor/keyboard';


interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: Timestamp;
}

const MESSAGES_COLLECTION = 'chatMessages';
const BASE_SCROLL_AREA_HEIGHT_PX = 400; // Or your desired base height
const MIN_SCROLL_AREA_HEIGHT_PX = 100; // Minimum height for the scroll area


export function ChatInterface() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    if (!firestore) {
      setErrorMessages("Firestore is not initialized. Chat cannot function.");
      setIsLoadingMessages(false);
      return;
    }

    const q = query(collection(firestore, MESSAGES_COLLECTION), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedMessages: ChatMessage[] = [];
      querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        fetchedMessages.push({ 
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          timestamp: data.timestamp,
        });
      });
      setMessages(fetchedMessages);
      setIsLoadingMessages(false);
      setErrorMessages(null);
      setTimeout(scrollToBottom, 0); // Ensure scroll after messages render
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setErrorMessages("Failed to load messages. Please try again later.");
      setIsLoadingMessages(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [scrollToBottom]);

  useEffect(() => {
    if (Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('Keyboard')) {
      const showListener = Keyboard.addListener('keyboardDidShow', (info: KeyboardInfo) => {
        setKeyboardHeight(info.keyboardHeight);
        setTimeout(scrollToBottom, 100); // Scroll after keyboard is fully shown and layout adjusts
      });
      const hideListener = Keyboard.addListener('keyboardDidHide', () => {
        setKeyboardHeight(0);
      });

      // Optional: Hide accessory bar on iOS for a cleaner look
      Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(err => console.warn("Failed to set keyboard accessory bar:", err));


      return () => {
        showListener.remove();
        hideListener.remove();
      };
    }
  }, [scrollToBottom]);


  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || newMessage.trim() === '' || !firestore) return;

    try {
      await addDoc(collection(firestore, MESSAGES_COLLECTION), {
        text: newMessage,
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous User',
        senderAvatar: user.photoURL || null,
        timestamp: Timestamp.now(),
      });
      setNewMessage('');
      // scrollToBottom is handled by messages state change effect
    } catch (error) {
      console.error("Error sending message: ", error);
      // Optionally, show a toast or an error message to the user
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);
  
  const formatTime = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate dynamic height for ScrollArea based on keyboard
  // On native, the OS resizes the webview, so keyboardHeight effectively reduces available space.
  // We subtract it from a base height for the scroll area.
  const scrollAreaDynamicHeight = Math.max(MIN_SCROLL_AREA_HEIGHT_PX, BASE_SCROLL_AREA_HEIGHT_PX - keyboardHeight);

  return (
    <Card className="w-full shadow-lg flex flex-col" style={{ paddingBottom: Capacitor.isNativePlatform() ? 0 : keyboardHeight }}>
      {/* The Card itself will not have paddingBottom for native, as the OS handles view resizing.
          For web, if keyboard plugin isn't native, this provides a fallback, although less ideal.
          Better to rely on Capacitor's native handling. The main effect is adjusting ScrollArea height.
      */}
      <CardHeader>
        <CardTitle>Community Chat</CardTitle>
        {!user && <CardDescription className="text-primary">Log in to send messages and join the conversation!</CardDescription>}
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden"> {/* Make CardContent take available space */}
        <ScrollArea 
          className="w-full pr-4 border rounded-md p-4" 
          ref={scrollAreaRef}
          style={{ height: `${scrollAreaDynamicHeight}px` }}
        >
          {isLoadingMessages && (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading messages...</p>
            </div>
          )}
          {errorMessages && !isLoadingMessages && (
            <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errorMessages}</AlertDescription>
            </Alert>
          )}
          {!isLoadingMessages && !errorMessages && messages.length === 0 && (
             <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No messages yet. Be the first to say hi!</p>
             </div>
          )}
          {!isLoadingMessages && !errorMessages && messages.length > 0 && (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    user && msg.senderId === user.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {(!user || msg.senderId !== user.uid) && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.senderAvatar || undefined} alt={msg.senderName} data-ai-hint="person portrait"/>
                      <AvatarFallback>{msg.senderName?.substring(0,1).toUpperCase() || '?'}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 shadow-md ${
                      user && msg.senderId === user.uid
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm font-medium mb-0.5">
                      {user && msg.senderId === user.uid ? 'You' : msg.senderName}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    <p className="text-xs opacity-70 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                  </div>
                  {user && msg.senderId === user.uid && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} data-ai-hint="person abstract"/>
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      <CardFooter className="mt-auto"> {/* Ensure footer is at the bottom */}
        {user ? (
          <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
              aria-label="Chat message input"
              disabled={!firestore}
              onFocus={scrollToBottom} // Also scroll to bottom on focus
            />
            <Button type="submit" size="icon" aria-label="Send message" disabled={!firestore || newMessage.trim() === ''}>
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

