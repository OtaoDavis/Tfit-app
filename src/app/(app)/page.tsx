import { PillarCard } from '@/components/home/pillar-card';
import { PageHeader } from '@/components/common/page-header';
import { Brain, Apple, Dumbbell, Users } from 'lucide-react';

export default function HomePage() {
  const pillars = [
    {
      title: 'Mindset',
      description: 'Cultivate a positive and resilient mindset for overall well-being.',
      icon: Brain,
      href: '#', // Placeholder, can link to specific content later
      imageHint: 'mindfulness meditation'
    },
    {
      title: 'Nutrition',
      description: 'Fuel your body with wholesome foods. Explore meal plans and track your intake.',
      icon: Apple,
      href: '/nutrition',
      imageHint: 'healthy food'
    },
    {
      title: 'Movement',
      description: 'Stay active with diverse workouts. Find routines that fit your lifestyle.',
      icon: Dumbbell,
      href: '#', // Placeholder
      imageHint: 'fitness exercise'
    },
    {
      title: 'Community',
      description: 'Connect with like-minded individuals. Share your journey and find support.',
      icon: Users,
      href: '/community',
      imageHint: 'people community'
    },
  ];

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Welcome to FitLife Hub"
        description="Your comprehensive platform for a healthier, happier you. Explore our core pillars."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => (
          <PillarCard
            key={pillar.title}
            title={pillar.title}
            description={pillar.description}
            icon={pillar.icon}
            href={pillar.href}
            imageSrc={`https://picsum.photos/seed/${pillar.title.toLowerCase()}/400/300`}
            imageAlt={`${pillar.title} pillar image`}
            imageHint={pillar.imageHint}
          />
        ))}
      </div>
    </div>
  );
}
