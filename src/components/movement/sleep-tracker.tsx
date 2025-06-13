
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Bed, Moon, Sunrise, Edit3, PlusCircle, History, AlertTriangle, CalendarCheck2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { format, parseISO, setHours, setMinutes, subDays, differenceInMinutes, startOfDay, parse } from 'date-fns';

const SLEEP_LOG_KEY = 'sleepLog_v2'; // Store array of sleep log entries
const USER_SLEEP_GOAL_KEY = 'userSleepGoal_v1'; // Store user's preferred goal in hours

interface SleepLogEntry {
  id: string;
  wakeUpDate: string; // YYYY-MM-DD string, the date the user woke up
  bedTime: string; // HH:mm string
  wakeTime: string; // HH:mm string
  durationMinutes: number;
  goalHours: number; // Sleep goal in hours at the time of logging
}

const DEFAULT_SLEEP_GOAL_HOURS = 8;

export function SleepTracker() {
  const [sleepLog, setSleepLog] = useState<SleepLogEntry[]>([]);
  const [sleepGoalHours, setSleepGoalHours] = useState<number>(DEFAULT_SLEEP_GOAL_HOURS);
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  // Dialog states for logging sleep
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [wakeUpDateInput, setWakeUpDateInput] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [bedTimeInput, setBedTimeInput] = useState<string>('23:00');
  const [wakeTimeInput, setWakeTimeInput] = useState<string>('07:00');
  const [logError, setLogError] = useState<string | null>(null);

  // Dialog state for setting goal
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [newGoalInputHours, setNewGoalInputHours] = useState<string>(sleepGoalHours.toString());

  const getTodayDateString = useCallback(() => format(startOfDay(new Date()), 'yyyy-MM-dd'), []);

  useEffect(() => {
    setIsMounted(true);
    const storedLogJson = localStorage.getItem(SLEEP_LOG_KEY);
    if (storedLogJson) {
      try {
        const parsedLog: SleepLogEntry[] = JSON.parse(storedLogJson);
        setSleepLog(parsedLog.sort((a, b) => parseISO(b.wakeUpDate).getTime() - parseISO(a.wakeUpDate).getTime()));
      } catch (e) {
        console.error("Failed to parse sleep log from localStorage", e);
      }
    }

    const storedGoal = localStorage.getItem(USER_SLEEP_GOAL_KEY);
    if (storedGoal) {
      const parsedGoal = parseFloat(storedGoal);
      if (!isNaN(parsedGoal) && parsedGoal > 0) {
        setSleepGoalHours(parsedGoal);
        setNewGoalInputHours(parsedGoal.toString());
      }
    }
  }, []);

  useEffect(() => {
    if (isMounted && sleepLog.length > 0) {
      localStorage.setItem(SLEEP_LOG_KEY, JSON.stringify(sleepLog));
    } else if (isMounted && sleepLog.length === 0) {
      localStorage.removeItem(SLEEP_LOG_KEY);
    }
  }, [sleepLog, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(USER_SLEEP_GOAL_KEY, sleepGoalHours.toString());
      setNewGoalInputHours(sleepGoalHours.toString());
    }
  }, [sleepGoalHours, isMounted]);

  const formatDuration = (totalMinutes: number): string => {
    if (isNaN(totalMinutes) || totalMinutes < 0) return "N/A";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleAddSleepLog = () => {
    setLogError(null);
    if (!wakeUpDateInput || !bedTimeInput || !wakeTimeInput) {
      setLogError("All fields are required.");
      return;
    }

    try {
      const parsedWakeUpDate = parse(wakeUpDateInput, 'yyyy-MM-dd', new Date());
      if (isNaN(parsedWakeUpDate.getTime())) {
        setLogError("Invalid wake-up date.");
        return;
      }

      const [bedH, bedM] = bedTimeInput.split(':').map(Number);
      const [wakeH, wakeM] = wakeTimeInput.split(':').map(Number);

      if (isNaN(bedH) || isNaN(bedM) || isNaN(wakeH) || isNaN(wakeM)) {
        setLogError("Invalid time format. Use HH:mm.");
        return;
      }
      
      let finalWakeUpDateTime = setMinutes(setHours(parsedWakeUpDate, wakeH), wakeM);
      let finalBedDateTime = setMinutes(setHours(parsedWakeUpDate, bedH), bedM);
      if (finalBedDateTime >= finalWakeUpDateTime) {
         finalBedDateTime = subDays(finalBedDateTime, 1);
      }
      
      const durationMinutes = differenceInMinutes(finalWakeUpDateTime, finalBedDateTime);

      if (durationMinutes <= 0) {
        setLogError("Sleep duration must be positive. Check your times (e.g., bedtime should be before wake-up time).");
        return;
      }

      const newEntry: SleepLogEntry = {
        id: new Date().toISOString() + Math.random().toString(36).substring(2,9),
        wakeUpDate: wakeUpDateInput, 
        bedTime: bedTimeInput,
        wakeTime: wakeTimeInput,
        durationMinutes,
        goalHours: sleepGoalHours,
      };

      setSleepLog(prevLog => [newEntry, ...prevLog].sort((a, b) => parseISO(b.wakeUpDate).getTime() - parseISO(a.wakeUpDate).getTime()));
      toast({ title: "Sleep Logged", description: `Logged ${formatDuration(durationMinutes)} of sleep.` });
      setLogDialogOpen(false);
      setWakeUpDateInput(format(new Date(), 'yyyy-MM-dd'));
      setBedTimeInput('23:00');
      setWakeTimeInput('07:00');

    } catch (error) {
      console.error("Error logging sleep:", error);
      setLogError("An unexpected error occurred while logging sleep.");
    }
  };

  const handleSetGoal = () => {
    const goalValue = parseFloat(newGoalInputHours);
    if (!isNaN(goalValue) && goalValue > 0 && goalValue <= 24) {
      setSleepGoalHours(goalValue);
      toast({ title: "Goal Updated", description: `Sleep goal set to ${goalValue} hours.` });
      setGoalDialogOpen(false);
    } else {
      toast({ title: "Invalid Goal", description: "Please enter a valid number of hours (e.g., 1-24).", variant: "destructive" });
    }
  };

  const getTodaysSleepData = (): SleepLogEntry | undefined => {
    const todayStr = getTodayDateString();
    return sleepLog.find(entry => entry.wakeUpDate === todayStr);
  };

  const todaysLog = getTodaysSleepData();
  const progressPercentage = todaysLog ? (todaysLog.durationMinutes / (todaysLog.goalHours * 60)) * 100 : 0;

  if (!isMounted) {
    return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bed className="h-6 w-6 text-primary" />Sleep Tracker</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Loading sleep tracker...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bed className="h-6 w-6 text-primary" />
              Sleep Tracker
            </div>
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Edit daily sleep goal">
                  <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Set Daily Sleep Goal</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="daily-sleep-goal">Goal (hours)</Label>
                  <Input id="daily-sleep-goal" type="number" value={newGoalInputHours} onChange={(e) => setNewGoalInputHours(e.target.value)} min="1" max="24" step="0.5"/>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <Button type="button" onClick={handleSetGoal}>Set Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Monitor your sleep patterns and quality. Goal: {sleepGoalHours} hours.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center space-y-4">
          {todaysLog ? (
            <>
              <p className="text-2xl font-bold text-primary">{formatDuration(todaysLog.durationMinutes)}</p>
              <p className="text-sm text-muted-foreground">
                Slept from {todaysLog.bedTime} to {todaysLog.wakeTime}
              </p>
              <Progress value={progressPercentage} className="w-full h-3" />
              <p className="text-xs text-muted-foreground">
                Today&apos;s goal: {todaysLog.goalHours} hours. {progressPercentage >= 100 ? "Goal met!" : ""}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground">No sleep logged for today yet.</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={logDialogOpen} onOpenChange={(isOpen) => {
            setLogDialogOpen(isOpen);
            if (!isOpen) setLogError(null); // Clear error when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button className="w-full">
                <PlusCircle className="mr-2 h-5 w-5" /> {todaysLog ? "Update Today's Sleep" : "Log Sleep"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{todaysLog ? "Update" : "Log"} Sleep</DialogTitle>
                <CardDescription>Enter your sleep details below.</CardDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="wake-up-date">Wake-up Date</Label>
                  <Input id="wake-up-date" type="date" value={wakeUpDateInput} onChange={(e) => setWakeUpDateInput(e.target.value)} />
                  {wakeUpDateInput && (() => {
                    try {
                      const parsedDate = parse(wakeUpDateInput, 'yyyy-MM-dd', new Date());
                      if (!isNaN(parsedDate.getTime())) {
                        // Format: Month Day, Year (DayName) e.g., June 5, 2024 (Wednesday)
                        const displayDate = format(parsedDate, 'MMMM d, yyyy (EEEE)');
                        return (
                          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <CalendarCheck2 className="h-4 w-4 text-primary"/> Selected: {displayDate}
                          </p>
                        );
                      }
                    } catch (e) { /* Parsing failed, do nothing */ }
                    return null;
                  })()}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="bedtime" className="flex items-center gap-1"><Moon className="h-4 w-4"/>Bedtime</Label>
                    <Input id="bedtime" type="time" value={bedTimeInput} onChange={(e) => setBedTimeInput(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="waketime" className="flex items-center gap-1"><Sunrise className="h-4 w-4"/>Wake-up Time</Label>
                    <Input id="waketime" type="time" value={wakeTimeInput} onChange={(e) => setWakeTimeInput(e.target.value)} />
                  </div>
                </div>
                {logError && (
                  <p className="text-sm text-destructive flex items-center gap-1"><AlertTriangle className="h-4 w-4"/>{logError}</p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button type="button" onClick={handleAddSleepLog}>Save Log</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <section id="sleep-history" className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Sleep History
          </h3>
          {sleepLog.length === 0 ? (
             <Card className="shadow-md">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No sleep history recorded yet.
                </CardContent>
             </Card>
          ) : (
            <Accordion type="multiple" className="w-full space-y-2">
              {sleepLog.map(entry => (
                <AccordionItem value={entry.id} key={entry.id} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-base font-medium">
                    {format(parseISO(entry.wakeUpDate), "MMMM d, yyyy (EEEE)")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 border-t bg-background text-sm space-y-1">
                      <p>Duration: <span className="font-semibold">{formatDuration(entry.durationMinutes)}</span></p>
                      <p>Times: <span className="font-semibold">{entry.bedTime} - {entry.wakeTime}</span></p>
                      <p>Goal at logging: <span className="font-semibold">{entry.goalHours} hours</span></p>
                      <Progress 
                        value={(entry.durationMinutes / (entry.goalHours * 60)) * 100} 
                        className="w-full h-2.5 mt-2" 
                      />
                       {(entry.durationMinutes / (entry.goalHours * 60)) * 100 >= 100 && (
                        <p className="text-xs text-green-600 mt-1 font-medium">Goal reached!</p>
                       )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
    </>
  );
}

