import { PageHeader } from '@/components/common/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HeartPulse, Info, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="About FitLife Hub"
        description="Learn more about our mission and what drives us."
      />
      <div className="space-y-8">
        <Card className="overflow-hidden">
          <div className="relative h-56 sm:h-72 w-full">
            <Image 
              src="https://picsum.photos/seed/fitnessgroup/1200/400" 
              alt="FitLife Hub Team or Concept Image"
              layout="fill"
              objectFit="cover"
              data-ai-hint="fitness team"
            />
          </div>
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>
              At FitLife Hub, we believe that a healthy lifestyle is built upon four fundamental pillars: Mindset, Nutrition, Movement, and Community. Our mission is to provide you with the tools, resources, and support you need to thrive in each of these areas.
            </p>
            <p>
              We aim to create a positive and empowering environment where you can cultivate a resilient mindset, make informed nutritional choices, discover enjoyable ways to move your body, and connect with a supportive community that shares your wellness goals.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-accent" />
                What We Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Personalized insights for Mindset development.</li>
                <li>Advanced Meal Scanner and Water Tracker for Nutrition management.</li>
                <li>Engaging Movement challenges and workout inspirations (coming soon!).</li>
                <li>A vibrant Community forum and access to expert-led Courses.</li>
                <li>Easy-to-use Profile and Settings management.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-accent" />
                Join Our Community
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground space-y-3">
              <p>
                FitLife Hub is more than just an app; it&apos;s a community of individuals committed to living healthier, happier lives. We encourage you to engage, share your progress, ask questions, and motivate others.
              </p>
              <p>
                Your journey to wellness is unique, and we&apos;re here to support you every step of the way.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Version & Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>App Version: 1.0.0 (Beta)</p>
            <p>For support or inquiries, please contact us at: <a href="mailto:support@fitlifehub.com" className="text-primary hover:underline">support@fitlifehub.com</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
