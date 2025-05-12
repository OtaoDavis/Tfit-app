
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed } from "lucide-react";

export function SleepTracker() {
  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bed className="h-6 w-6 text-primary" />
          Sleep Tracker
        </CardTitle>
        <CardDescription>Monitor your sleep patterns and quality.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <p className="text-muted-foreground">Sleep tracking features coming soon!</p>
      </CardContent>
    </Card>
  );
}
