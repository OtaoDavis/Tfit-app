// 'use client'; // No longer needed at page level as children handle client logic
import { PageHeader } from '@/components/common/page-header';
import { ChatInterface } from '@/components/community/chat-interface';
import { CoursesWebView } from '@/components/community/courses-webview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen } from 'lucide-react';
// import { useAuth } from '@/contexts/auth-context'; // ChatInterface will use this
// import { LoginPrompt } from '@/components/common/login-prompt'; // ChatInterface will use this

// This would typically come from a config or environment variable
const KAJABI_COURSES_URL = "https://app.kajabi.com/admin/sites/2148253219/products"; 
// const KAJABI_API_KEY = process.env.NEXT_PUBLIC_KAJABI_API_KEY;
// const KAJABI_COURSES_URL = `https://app.kajabi.com/admin/sites/2148253219/products?api_key=${KAJABI_API_KEY}`;

export default function CommunityPage() {
  // const { user, loading } = useAuth(); // ChatInterface will handle its own auth state

  // if (loading) { // Page-level loading can be removed if ChatInterface handles its specific loading
  //   return null; 
  // }

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
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
           <section id="chat">
              <h2 className="text-2xl font-semibold mb-4 text-foreground sr-only">Chat</h2>
              <p className="text-muted-foreground mb-6">
                Engage in real-time conversations with fellow FitLife Hub members. Share tips, ask questions, and find motivation. Log in to participate!
              </p>
              <ChatInterface />
            </section>
        </TabsContent>

        <TabsContent value="courses">
          <section id="courses">
            <h2 className="text-2xl font-semibold mb-4 text-foreground sr-only">Courses</h2>
            <p className="text-muted-foreground mb-6">
              Access a library of fitness and wellness courses powered by Kajabi. You may need to log in to your Kajabi account within the view below.
            </p>
            <CoursesWebView src={KAJABI_COURSES_URL} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
