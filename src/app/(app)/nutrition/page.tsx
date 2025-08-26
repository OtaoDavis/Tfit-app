
'use client';
import { useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { MealScanner } from '@/components/nutrition/meal-scanner';
import { WaterTracker } from '@/components/nutrition/water-tracker';
import { Separator } from '@/components/ui/separator';

export default function NutritionPage() {
  const [isMealHistoryVisible, setIsMealHistoryVisible] = useState(false);
  const [isWaterHistoryVisible, setIsWaterHistoryVisible] = useState(false);

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Nutrition Hub"
        description="Track your meals and hydration to stay on top of your health goals."
      />
      <div className="space-y-12">
        <MealScanner
          isHistoryVisible={isMealHistoryVisible}
          onToggleHistory={() => setIsMealHistoryVisible(!isMealHistoryVisible)}
        />
        
        <Separator />

        <WaterTracker
          isHistoryVisible={isWaterHistoryVisible}
          onToggleHistory={() => setIsWaterHistoryVisible(!isWaterHistoryVisible)}
        />
      </div>
    </div>
  );
}
