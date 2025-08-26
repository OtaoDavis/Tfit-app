import { PageHeader } from '@/components/common/page-header';
import { HabitTracker } from '@/components/mindset/habit-tracker';

export default function MindsetPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Mindset & Habits"
        description="Cultivate positive habits and a resilient mindset for lasting change."
      />
      <div className="space-y-8">
        <HabitTracker />
      </div>
    </div>
  );
}
