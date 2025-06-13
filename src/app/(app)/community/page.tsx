'use client';

import { PageHeader } from '@/components/common/page-header';
import { ChatInterface } from '@/components/community/chat-interface';
import { CoursesWebView } from '@/components/community/courses-webview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// URLs for Kajabi
const KAJABI_LOGIN_URL = "https://www.courses.treasurefitness.com/login";
const KAJABI_DASHBOARD_URL = "YOUR_KAJABI_DASHBOARD_URL";

export default function CommunityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const kajabiSession = localStorage.getItem('yourKajabiSessionKey') || document.cookie.includes('yourKajabiSessionCookie');

    if (kajabiSession) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  const handleCoursesTabClick = () => {
    if (!isLoggedIn) {
      window.location.href = KAJABI_LOGIN_URL;
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Community Hub"
        description="Connect with others, join discussions, and access exclusive courses."
      />

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="courses" className="flex items-center gap-2" onClick={handleCoursesTabClick}>
            <BookOpen className="h-5 w-5" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <section id="chat">
            <h2 className="text-2xl font-semibold mb-4 text-foreground sr-only">Chat</h2>
            <ChatInterface /> 
          </section>
        </TabsContent>

        <TabsContent value="courses">
          <section id="courses">
            <h2 className="text-2xl font-semibold mb-4 text-foreground sr-only">Courses</h2>
            <p className="text-muted-foreground mb-6">
              {isLoggedIn
                ? "Access your library of fitness and wellness courses powered by Kajabi."
                : "Log in to your Kajabi account to access our exclusive courses."}
            </p>
            {isLoggedIn ? (
              <CoursesWebView src={KAJABI_DASHBOARD_URL} />
            ) : (
              <p className="text-muted-foreground">You will be redirected to the Kajabi login page.</p>
            )}
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}