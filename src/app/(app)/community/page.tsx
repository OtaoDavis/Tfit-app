import { PageHeader } from '@/components/common/page-header';
import { ChatInterface } from '@/components/community/chat-interface';
import { CoursesWebView } from '@/components/community/courses-webview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, BookOpen } from 'lucide-react';

// This would typically come from a config or environment variable
const KAJABI_COURSES_URL = "https://app.kajabi.com/admin/sites/2148253219/products"; 

export default function CommunityPage() {
  // Authentication is now handled by the (app) layout.
  // If the user reaches this page, they are authenticated.

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
              Engage in real-time conversations with fellow FitLife Hub members. Share tips, ask questions, and find motivation.
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
            {/* Removed authToken prop. Kajabi login will happen inside the iframe if necessary. */}
            <CoursesWebView src={KAJABI_COURSES_URL} />
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
