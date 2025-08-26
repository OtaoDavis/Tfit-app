import { PageHeader } from '@/components/common/page-header';
import { HabitTracker } from '@/components/movement/habit-tracker';
import { SleepTracker } from '@/components/movement/sleep-tracker';
import { StepsTracker } from '@/components/movement/steps-tracker';
import { StressTracker } from '@/components/movement/stress-tracker';

export default function MovementPage() {
  return (
    <div className="container mx-auto">
      <PageHeader
        title="Wellness Hub"
        description="Track your steps, sleep, habits, and manage stress for holistic wellbeing."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        <StepsTracker />
        <SleepTracker />
        <StressTracker />
      </div>
    </div>
  );
}
