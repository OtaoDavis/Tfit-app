
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Footprints, AlertTriangle, Loader2, CheckCircle2, ShieldAlert, Info, Edit3, History } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { Pedometer, type IPedometerData } from '@ionic-native/pedometer';
import type { Subscription } from 'rxjs';
import { format, parseISO, startOfDay } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const DEFAULT_DAILY_STEP_GOAL = 10000;
const STEP_HISTORY_KEY = 'stepHistory_v1';
const USER_STEP_GOAL_KEY = 'userStepGoal_v1';

interface StepHistoryEntry {
  date: string; // YYYY-MM-DD
  steps: number;
  goal: number;
}

export function StepsTracker() {
  const [currentSessionSteps, setCurrentSessionSteps] = useState<number>(0);
  const [userDailyStepGoal, setUserDailyStepGoal] = useState<number>(DEFAULT_DAILY_STEP_GOAL);
  const [newGoalInput, setNewGoalInput] = useState<string>(DEFAULT_DAILY_STEP_GOAL.toString());
  
  const [stepHistory, setStepHistory] = useState<StepHistoryEntry[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  
  const { toast } = useToast();
  const pedometerSubscriptionRef = useRef<Subscription | null>(null);
  
  const osStepsAtSessionDayStartRef = useRef<number | null>(null);
  const lastTrackedDateRef = useRef<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const stepHistoryRef = useRef(stepHistory);
  const userDailyStepGoalRef = useRef(userDailyStepGoal);
  const currentSessionStepsRef = useRef(currentSessionSteps);
  const isTrackingRef = useRef(isTracking); // Ref for isTracking

  useEffect(() => {
    stepHistoryRef.current = stepHistory;
  }, [stepHistory]);

  useEffect(() => {
    userDailyStepGoalRef.current = userDailyStepGoal;
  }, [userDailyStepGoal]);

  useEffect(() => {
    currentSessionStepsRef.current = currentSessionSteps;
  }, [currentSessionSteps]);

  useEffect(() => { // Keep isTrackingRef in sync with isTracking state
    isTrackingRef.current = isTracking;
  }, [isTracking]);

  const isPluginActuallyAvailable = Capacitor.isNativePlatform() && Capacitor.getPlatform() !== 'web';

  const getTodayDateString = useCallback(() => {
    return format(startOfDay(new Date()), 'yyyy-MM-dd');
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const storedGoal = localStorage.getItem(USER_STEP_GOAL_KEY);
    if (storedGoal) {
      const goal = parseInt(storedGoal, 10);
      if (!isNaN(goal) && goal > 0) {
        setUserDailyStepGoal(goal);
        setNewGoalInput(goal.toString());
      }
    }

    const storedHistoryJson = localStorage.getItem(STEP_HISTORY_KEY);
    let loadedHistory: StepHistoryEntry[] = [];
    if (storedHistoryJson) {
      try {
        loadedHistory = JSON.parse(storedHistoryJson);
      } catch (e) {
        console.error("Failed to parse step history", e);
      }
    }
    
    const todayStr = getTodayDateString();
    const currentGoal = storedGoal ? parseInt(storedGoal, 10) : DEFAULT_DAILY_STEP_GOAL;

    const todayEntryIndex = loadedHistory.findIndex(entry => entry.date === todayStr);
    if (todayEntryIndex === -1) {
        loadedHistory.push({ date: todayStr, steps: 0, goal: currentGoal });
    } else {
      if (loadedHistory[todayEntryIndex].goal !== currentGoal) {
        loadedHistory[todayEntryIndex].goal = currentGoal;
      }
      // Set initial currentSessionSteps from today's persisted data if app is restarted on the same day
      // This is tricky with ionic-native pedometer as it gives session steps.
      // For now, persisted 'steps' is the baseline. Session steps add to it.
    }
    setStepHistory(loadedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    lastTrackedDateRef.current = todayStr;

  }, [getTodayDateString]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(USER_STEP_GOAL_KEY, userDailyStepGoal.toString());
      if (stepHistory.length > 0) {
        localStorage.setItem(STEP_HISTORY_KEY, JSON.stringify(stepHistory));
      }
    }
  }, [userDailyStepGoal, stepHistory, isMounted]);

  const updateStepHistory = useCallback((date: string, steps: number, goal: number) => {
    setStepHistory(prevHistory => {
      const historyCopy = [...prevHistory];
      const entryIndex = historyCopy.findIndex(e => e.date === date);
      if (entryIndex !== -1) {
        historyCopy[entryIndex] = { ...historyCopy[entryIndex], steps, goal };
      } else {
        historyCopy.push({ date, steps, goal });
      }
      return historyCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, []);
  
  const finalizeDaySteps = useCallback((dateToFinalize: string, stepsTakenInLastSession: number) => {
    const history = stepHistoryRef.current;
    const goal = userDailyStepGoalRef.current;

    const entryForDate = history.find(e => e.date === dateToFinalize);
    const previouslyPersistedSteps = entryForDate ? entryForDate.steps : 0;
    const goalForFinalizedDay = entryForDate ? entryForDate.goal : goal;
    
    const totalStepsForDay = previouslyPersistedSteps + (stepsTakenInLastSession > 0 ? stepsTakenInLastSession : 0) ;
    
    updateStepHistory(dateToFinalize, totalStepsForDay, goalForFinalizedDay);
    setCurrentSessionSteps(0); // Reset session steps after finalizing for the day
    osStepsAtSessionDayStartRef.current = null; // Reset OS anchor for next session or day
  }, [updateStepHistory]);


  const startTracking = useCallback(() => {
    if (!isPluginActuallyAvailable || !Pedometer) {
      setError("Step tracking is not available on this platform/device.");
      setIsAvailable(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    Pedometer.isStepCountingAvailable()
      .then((available: boolean) => {
        setIsAvailable(available);
        if (available) {
          const currentProcessingDay = getTodayDateString();
          const historyForToday = stepHistoryRef.current.find(e => e.date === currentProcessingDay);
          const persistedStepsToday = historyForToday?.steps || 0;
          
          // Reset osStepsAtSessionDayStartRef if the day has changed since last tracking
          if (lastTrackedDateRef.current !== currentProcessingDay) {
            if (lastTrackedDateRef.current && currentSessionStepsRef.current > 0) {
               finalizeDaySteps(lastTrackedDateRef.current, currentSessionStepsRef.current);
            }
            lastTrackedDateRef.current = currentProcessingDay;
            osStepsAtSessionDayStartRef.current = null; 
            setCurrentSessionSteps(0); 
          }


          pedometerSubscriptionRef.current = Pedometer.startPedometerUpdates()
            .subscribe(
              (data: IPedometerData) => {
                setIsLoading(false);
                const nowDayStr = getTodayDateString();

                if (lastTrackedDateRef.current !== nowDayStr) {
                  // Day has changed during active tracking
                  if (lastTrackedDateRef.current && currentSessionStepsRef.current > 0) {
                     finalizeDaySteps(lastTrackedDateRef.current, currentSessionStepsRef.current);
                  }
                  lastTrackedDateRef.current = nowDayStr;
                  // For Ionic Pedometer, data.numberOfSteps is cumulative for the *subscription*
                  // So, if it's a new day, we reset our session baseline
                  osStepsAtSessionDayStartRef.current = data.numberOfSteps; 
                  setCurrentSessionSteps(0); 
                } else {
                  // Same day processing
                  if (osStepsAtSessionDayStartRef.current === null) {
                    // First data point for this day's app tracking session
                    // data.numberOfSteps from plugin is steps since subscription started
                    osStepsAtSessionDayStartRef.current = data.numberOfSteps;
                    setCurrentSessionSteps(0); // Effectively, steps in *this specific part of the session*
                  } else {
                    const stepsThisSubscriptionInstance = data.numberOfSteps - osStepsAtSessionDayStartRef.current;
                    setCurrentSessionSteps(stepsThisSubscriptionInstance > 0 ? stepsThisSubscriptionInstance : 0);
                  }
                }
                setIsTracking(true);
                setError(null);
              },
              (err: any) => {
                console.error("Error during pedometer updates:", err);
                let errMsg = "Failed to get step updates. Motion permissions might be needed via OS settings.";
                if (err?.message) errMsg = err.message;
                if (typeof err === 'string' && err.toLowerCase().includes('permission')) {
                  errMsg = "Permission denied for motion activity. Please enable it in settings.";
                } else if (typeof err === 'string' && err.toLowerCase().includes('not authorized')) {
                    errMsg = "Motion activity not authorized. Please enable permissions in settings.";
                }
                setError(errMsg);
                setIsTracking(false);
                setIsLoading(false);
              }
            );
        } else {
          setError("Step counting is not available on this device.");
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        console.error("Error checking step counting availability:", err);
        setError("Could not check step counting availability. Ensure permissions are granted.");
        setIsAvailable(false);
        setIsLoading(false);
      });
  }, [isPluginActuallyAvailable, toast, getTodayDateString, finalizeDaySteps]);

  const stopTracking = useCallback(() => {
    if (pedometerSubscriptionRef.current) {
      pedometerSubscriptionRef.current.unsubscribe();
      pedometerSubscriptionRef.current = null;
    }

    if (isTrackingRef.current && lastTrackedDateRef.current && currentSessionStepsRef.current >= 0) {
      finalizeDaySteps(lastTrackedDateRef.current, currentSessionStepsRef.current);
    }
    setIsTracking(false); 
  }, [finalizeDaySteps]);

  useEffect(() => {
    if (isPluginActuallyAvailable && isMounted) {
      startTracking();
    } else if (isMounted) {
      setIsAvailable(false);
      setError("Step tracking is only available on native mobile devices.");
    }
    
    return () => {
      stopTracking();
    };
  }, [isPluginActuallyAvailable, isMounted, startTracking, stopTracking]);

  const handleSetGoal = () => {
    const goalValue = parseInt(newGoalInput);
    if (!isNaN(goalValue) && goalValue > 0) {
      setUserDailyStepGoal(goalValue);
      const todayStr = getTodayDateString();
      setStepHistory(prev => {
        const newHist = prev.map(e => e.date === todayStr ? {...e, goal: goalValue} : e);
        if (!newHist.some(e => e.date === todayStr)) { 
            newHist.push({date: todayStr, steps: 0, goal: goalValue});
        }
        return newHist.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
      toast({title: "Goal Updated", description: `Daily step goal set to ${goalValue.toLocaleString()}.`});
    } else {
      toast({title: "Invalid Goal", description: "Please enter a valid number for the goal.", variant: "destructive"});
    }
  };
  
  const todayStr = getTodayDateString();
  const todaysHistoricEntry = stepHistory.find(entry => entry.date === todayStr);
  const persistedStepsForToday = todaysHistoricEntry ? todaysHistoricEntry.steps : 0;
  
  const displayableTotalStepsToday = persistedStepsForToday + currentSessionSteps;
  const currentGoalForToday = todaysHistoricEntry ? todaysHistoricEntry.goal : userDailyStepGoal;

  const progressPercentage = currentGoalForToday > 0
    ? Math.min((displayableTotalStepsToday / currentGoalForToday) * 100, 100)
    : 0;

  if (!isMounted) {
     return (
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader><CardTitle>Steps Tracker</CardTitle></CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <Footprints className="h-6 w-6 text-primary" />
            Today&apos;s Steps
          </div>
           <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Edit daily step goal">
                  <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Set Daily Step Goal</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="daily-step-goal">Goal (steps)</Label>
                  <Input
                    id="daily-step-goal" type="number" value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)} min="1"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
                  <DialogClose asChild><Button type="submit" onClick={handleSetGoal}>Set Goal</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </CardTitle>
        <CardDescription>
          {isPluginActuallyAvailable ? 
            `Goal: ${currentGoalForToday.toLocaleString()} steps.` :
            "Step tracking requires a native mobile device."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center justify-center text-center space-y-4">
        {isLoading && isAvailable === null && (
          <div className="space-y-2"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /><p>Initializing...</p></div>
        )}
        {!isPluginActuallyAvailable && isMounted &&(
           <div className="text-muted-foreground space-y-2 p-4 bg-muted/30 rounded-md w-full">
            <Footprints className="h-8 w-8 mx-auto" /><p className="font-semibold">Feature Unavailable</p>
            <p className="text-sm">Available on native mobile devices (iOS/Android) only.</p>
          </div>
        )}
        {isPluginActuallyAvailable && isAvailable === false && !isLoading && (
          <div className="text-destructive space-y-2 p-4 bg-destructive/10 rounded-md w-full">
            <AlertTriangle className="h-8 w-8 mx-auto" /><p className="font-semibold">Not Supported</p>
            <p className="text-sm">{error || "Step counting not supported on this device."}</p>
          </div>
        )}
         {isPluginActuallyAvailable && error && !isLoading && (isAvailable || isAvailable === null) && ( // Show error if plugin available but errors occur
          <div className="text-destructive space-y-2 p-4 bg-destructive/10 rounded-md w-full">
            <AlertTriangle className="h-8 w-8 mx-auto" /><p className="font-semibold">Tracking Error</p>
            <p className="text-sm">{error}</p>
            {(error.toLowerCase().includes('permission') || error.toLowerCase().includes('not authorized')) && (
                 <p className="text-xs mt-2">Check Motion & Fitness or Physical Activity permissions in your device settings.</p>
            )}
            <Button onClick={startTracking} variant="outline" size="sm" className="mt-2">Retry Tracking</Button>
          </div>
        )}
        
        {isPluginActuallyAvailable && isAvailable && !error && !isLoading && (
          <>
            <div className="text-4xl font-bold text-primary">
              {displayableTotalStepsToday.toLocaleString()}
            </div>
            <p className="text-muted-foreground">
              steps today
            </p>
            <Progress value={progressPercentage} className="w-full h-3" />
            <p className="text-sm text-muted-foreground">Goal: {currentGoalForToday.toLocaleString()} steps</p>
            {displayableTotalStepsToday >= currentGoalForToday && (
              <p className="text-sm font-semibold text-green-600 flex items-center justify-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Goal Reached Today!
              </p>
            )}
             {!isTracking && isAvailable && !error && !isLoading && (
                <Button onClick={startTracking} className="mt-2">
                    {persistedStepsForToday > 0 || currentSessionSteps > 0 ? "Resume Step Tracking" : "Start Step Tracking"}
                </Button>
            )}
            {/* <div className="mt-4 p-3 bg-accent/20 rounded-md text-xs text-accent-foreground/80 w-full max-w-md">
                <Info className="inline h-4 w-4 mr-1" />
                Tracks steps while app is active. OS prompts for motion permissions if needed.
                Data is cumulative from OS for the current session; app sums steps during active use.
            </div> */}
          </>
        )}
      </CardContent>
       <CardFooter className="text-xs text-muted-foreground justify-center">
          {isTracking ? "Live tracking active..." : 
           (isPluginActuallyAvailable && isAvailable && !error && !isLoading ? "Tracking paused. Open app to resume." : 
           (!isPluginActuallyAvailable ? "Not a native device." : 
           (isLoading ? "Initializing..." : "Step tracking unavailable or error.")))
          }
        </CardFooter>
    </Card>

    {isPluginActuallyAvailable && stepHistory.filter(entry => entry.date !== getTodayDateString() && entry.steps > 0).length > 0 && (
        <section id="step-history" className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Step Count History
          </h3>
            <Accordion type="multiple" className="w-full space-y-2">
              {stepHistory
                .filter(entry => entry.date !== getTodayDateString() && entry.steps > 0) 
                .map(entry => (
                <AccordionItem value={entry.date} key={entry.date} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-base font-medium">
                    {format(parseISO(entry.date), "MMMM d, yyyy (eeee)")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 border-t bg-background text-sm">
                      <p>Steps: <span className="font-semibold">{entry.steps.toLocaleString()}</span></p>
                      <p>Goal: <span className="font-semibold">{entry.goal.toLocaleString()}</span></p>
                      <Progress 
                        value={entry.goal > 0 ? Math.min((entry.steps / entry.goal) * 100, 100) : 0} 
                        className="w-full h-3 mt-2" 
                      />
                       {entry.steps >= entry.goal && (
                        <p className="text-xs text-green-600 mt-1 font-medium">Goal reached!</p>
                       )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
        </section>
      )}
      {isPluginActuallyAvailable && stepHistory.filter(entry => entry.date !== getTodayDateString() && entry.steps > 0).length === 0 && (
         <section id="step-history-empty" className="mt-8">
            <Card className="shadow-md">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No past step history with recorded steps yet. Keep tracking!
                </CardContent>
             </Card>
         </section>
      )}
    </>
  );
}

