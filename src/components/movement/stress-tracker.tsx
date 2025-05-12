
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Waves } from "lucide-react"; // Using Waves for calmness/stress management

export function StressTracker() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-primary" />
          Stress Management
        </CardTitle>
        <CardDescription>Tools and techniques to manage stress levels.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-muted-foreground">Stress management resources coming soon!</p>
      </CardContent>
    </Card>
  );
}
