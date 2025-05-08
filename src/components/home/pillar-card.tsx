import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface PillarCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  imageSrc: string;
  imageAlt: string;
  imageHint: string;
}

export function PillarCard({ title, description, icon: Icon, href, imageSrc, imageAlt, imageHint }: PillarCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <div className="relative h-48 w-full">
        <Image 
          src={imageSrc} 
          alt={imageAlt} 
          layout="fill" 
          objectFit="cover" 
          data-ai-hint={imageHint}
        />
      </div>
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-8 w-8 text-primary" />
          <CardTitle className="text-2xl">{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        <Button asChild variant="ghost" className="w-full justify-start p-0 text-primary hover:text-primary/80">
          <Link href={href}>
            Explore {title}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
