'use client';
import { PageHeader } from '@/components/common/page-header';
import { MealScanner } from '@/components/nutrition/meal-scanner';
import { WaterTracker } from '@/components/nutrition/water-tracker';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';

export default function NutritionPage() {
  const { user, loading } = useAuth();

  if (loading) {
    // Optional: can show a page-specific loader or rely on the layout loader
    return null; 
  }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Nutrition Hub"
        description="Track your meals and hydration to stay on top of your health goals."
      />
      {!user ? (
        <LoginPrompt featureName="Nutrition Hub" message="Log in to access meal scanning and water tracking features." />
      ) : (
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
      )}
    </div>
  );
}
