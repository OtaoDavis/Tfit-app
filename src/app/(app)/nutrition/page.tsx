import { PageHeader } from '@/components/common/page-header';
import { MealScanner } from '@/components/nutrition/meal-scanner';
import { WaterTracker } from '@/components/nutrition/water-tracker';
import { Separator } from '@/components/ui/separator';

export default function NutritionPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Nutrition Hub"
        description="Track your meals and hydration to stay on top of your health goals."
      />
      <div className="space-y-12">
        <section id="meal-scanner">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Meal Scanner</h2>
          <p className="text-muted-foreground mb-6">
            Upload an image of your meal to get an estimate of its nutritional content.
          </p>
          <MealScanner />
        </section>
        
        <Separator />

        <section id="water-tracker">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Water Tracker</h2>
          <p className="text-muted-foreground mb-6">
            Monitor your daily water intake to stay hydrated.
          </p>
          <WaterTracker />
        </section>
      </div>
    </div>
  );
}
