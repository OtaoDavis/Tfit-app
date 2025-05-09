// 'use client'; // No longer needed at page level if children handle client logic
import { PageHeader } from '@/components/common/page-header';
import { MealScanner } from '@/components/nutrition/meal-scanner';
import { WaterTracker } from '@/components/nutrition/water-tracker';
import { Separator } from '@/components/ui/separator';
// import { useAuth } from '@/contexts/auth-context'; // Components will use useAuth
// import { LoginPrompt } from '@/components/common/login-prompt'; // Components will use LoginPrompt

export default function NutritionPage() {
  // const { user, loading } = useAuth(); // Components will manage their auth state

  // if (loading && !user) { 
  //   // If we want a page-level loader while auth is checked initially (even if features are explorable)
  //   // This might conflict with layout loader. For now, let components handle their loading/prompts.
  //   return null; 
  // }

  return (
    <div className="container mx-auto">
      <PageHeader
        title="Nutrition Hub"
        description="Track your meals and hydration to stay on top of your health goals."
      />
      {/* Features are now accessible for exploration. Login prompts will be within components. */}
      <div className="space-y-12">
        <section id="meal-scanner">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Meal Scanner</h2>
          <p className="text-muted-foreground mb-6">
            Upload an image of your meal to get an estimate of its nutritional content. You can try one scan for free!
          </p>
          <MealScanner />
        </section>
        
        <Separator />

        <section id="water-tracker">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Water Tracker</h2>
          <p className="text-muted-foreground mb-6">
            Monitor your daily water intake to stay hydrated. Your data is saved locally in your browser.
          </p>
          <WaterTracker />
        </section>
      </div>
    </div>
  );
}

