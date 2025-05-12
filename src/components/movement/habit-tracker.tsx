
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export function HabitTracker() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          Habit Tracker
        </CardTitle>
        <CardDescription>Build and maintain positive habits.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-muted-foreground">Habit tracking tools coming soon!</p>
      </CardContent>
    </Card>
  );
}
