
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Droplet, Edit3, History, GlassWater } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format, parseISO, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';

const DEFAULT_GOAL_ML = 2000;
const GLASS_SIZE_ML = 250;
const NUMBER_OF_GLASSES = 8;

const WATER_LOG_KEY = 'waterIntakeLog_v2'; // Store array of daily logs
const USER_PREF_GOAL_KEY = 'waterUserPrefGoal_v1'; // Store user's preferred goal for new days

interface WaterLogEntry {
  date: string; // YYYY-MM-DD
  intakeMl: number;
  goalMl: number;
}

export function WaterTracker() {
  const [waterLog, setWaterLog] = useState<WaterLogEntry[]>([]);
  const [dailyGoalMl, setDailyGoalMl] = useState(DEFAULT_GOAL_ML); // User's current preferred goal
  const [isMounted, setIsMounted] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(GLASS_SIZE_ML.toString());
  const [newGoalInput, setNewGoalInput] = useState<string>(dailyGoalMl.toString());

  const getTodayDateString = useCallback(() => {
    return format(startOfDay(new Date()), 'yyyy-MM-dd');
  }, []);

  // Load log and preferred goal from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedLogJson = localStorage.getItem(WATER_LOG_KEY);
    let loadedLog: WaterLogEntry[] = [];
    if (storedLogJson) {
      try {
        loadedLog = JSON.parse(storedLogJson);
      } catch (e) {
        console.error("Failed to parse water log from localStorage", e);
      }
    }

    const storedPrefGoal = localStorage.getItem(USER_PREF_GOAL_KEY);
    let currentPrefGoal = DEFAULT_GOAL_ML;
    if (storedPrefGoal) {
      currentPrefGoal = JSON.parse(storedPrefGoal);
      setDailyGoalMl(currentPrefGoal);
      setNewGoalInput(currentPrefGoal.toString());
    }
    
    // Ensure today's entry exists
    const todayStr = getTodayDateString();
    const todayEntryExists = loadedLog.some(entry => entry.date === todayStr);
    if (!todayEntryExists) {
      loadedLog.push({ date: todayStr, intakeMl: 0, goalMl: currentPrefGoal });
    }
    
    setWaterLog(loadedLog.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

  }, [getTodayDateString]);

  // Save log to localStorage whenever it changes
  useEffect(() => {
    if (isMounted && waterLog.length > 0) {
      localStorage.setItem(WATER_LOG_KEY, JSON.stringify(waterLog));
    }
  }, [waterLog, isMounted]);

  // Save preferred goal to localStorage when it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(USER_PREF_GOAL_KEY, JSON.stringify(dailyGoalMl));
      setNewGoalInput(dailyGoalMl.toString()); // Keep dialog input in sync
    }
  }, [dailyGoalMl, isMounted]);

  const updateTodaysLog = useCallback((updateFn: (currentIntake: number) => number) => {
    const todayStr = getTodayDateString();
    setWaterLog(prevLog => {
      const logCopy = [...prevLog];
      const todayIndex = logCopy.findIndex(entry => entry.date === todayStr);
      
      if (todayIndex !== -1) {
        const newIntake = updateFn(logCopy[todayIndex].intakeMl);
        // Cap intake at 2x goal to prevent extreme values
        logCopy[todayIndex].intakeMl = Math.min(Math.max(0, newIntake), logCopy[todayIndex].goalMl * 2);
      } else {
        // Should not happen if initialized correctly, but handle defensively
        const newIntake = updateFn(0);
        logCopy.push({ date: todayStr, intakeMl: Math.min(Math.max(0, newIntake), dailyGoalMl * 2), goalMl: dailyGoalMl });
      }
      return logCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });
  }, [getTodayDateString, dailyGoalMl]);

  const addWater = (amountMl: number) => {
    updateTodaysLog(currentIntake => currentIntake + amountMl);
  };

  const removeWater = (amountMl: number) => {
    updateTodaysLog(currentIntake => currentIntake - amountMl);
  };

  const handleSetGoal = () => {
    const goalValue = parseInt(newGoalInput);
    if (!isNaN(goalValue) && goalValue > 0) {
      setDailyGoalMl(goalValue); // Update preferred goal

      // Update today's log entry with the new goal
      const todayStr = getTodayDateString();
      setWaterLog(prevLog => {
        const logCopy = [...prevLog];
        const todayIndex = logCopy.findIndex(entry => entry.date === todayStr);
        if (todayIndex !== -1) {
          logCopy[todayIndex].goalMl = goalValue;
        } else {
          // If today's entry somehow doesn't exist, create it
          logCopy.push({ date: todayStr, intakeMl: 0, goalMl: goalValue });
        }
        return logCopy.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      });
    }
  };

  const getTodaysData = (): WaterLogEntry => {
    const todayStr = getTodayDateString();
    const todayData = waterLog.find(entry => entry.date === todayStr);
    return todayData || { date: todayStr, intakeMl: 0, goalMl: dailyGoalMl };
  };

  const todayData = getTodaysData();
  const progressPercentage = todayData.goalMl > 0 ? (todayData.intakeMl / todayData.goalMl) * 100 : 0;
  
  const amountPerGlass = todayData.goalMl / NUMBER_OF_GLASSES;
  const glassesFilled = amountPerGlass > 0 ? Math.floor(todayData.intakeMl / amountPerGlass) : 0;


  if (!isMounted) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-primary" />
            Hydration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <p className="text-muted-foreground">Loading water tracker...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="h-6 w-6 text-primary" />
              Today's Hydration
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Edit daily goal">
                  <Edit3 className="h-5 w-5 text-muted-foreground hover:text-primary" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Set Daily Water Goal</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="daily-goal" className="text-right col-span-1">
                      Goal (ml)
                    </Label>
                    <Input
                      id="daily-goal"
                      type="number"
                      value={newGoalInput}
                      onChange={(e) => setNewGoalInput(e.target.value)}
                      className="col-span-3"
                      min="1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit" onClick={handleSetGoal}>Set Goal</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>
            {todayData.intakeMl.toLocaleString()} ml / {todayData.goalMl.toLocaleString()} ml ({Math.round(progressPercentage)}%)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
           <div className="flex justify-center items-center gap-2 flex-wrap" aria-label={`${glassesFilled} out of ${NUMBER_OF_GLASSES} glasses filled`}>
            {Array.from({ length: NUMBER_OF_GLASSES }).map((_, index) => (
              <GlassWater
                key={index}
                className={cn(
                  "h-8 w-8 transition-colors duration-300",
                  index < glassesFilled ? "text-primary" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <div className="flex items-center justify-center gap-2 w-full">
            <Button
              onClick={() => removeWater(GLASS_SIZE_ML)}
              variant="outline"
              size="default"
              className="flex items-center gap-2"
              aria-label={`Remove ${GLASS_SIZE_ML}ml`}
              disabled={todayData.intakeMl === 0}
            >
              <Minus className="h-4 w-4" />
              <span>Glass</span>
            </Button>
            <Button
              onClick={() => addWater(GLASS_SIZE_ML)}
              variant="default"
              size="default"
              className="flex items-center gap-2"
              aria-label={`Add ${GLASS_SIZE_ML}ml`}
            >
              <Plus className="h-4 w-4" />
              <span>Glass</span>
            </Button>
          </div>
          <div className="flex items-end gap-2 w-full max-w-sm mx-auto">
            <div className="flex-grow">
              <Label htmlFor="custom-amount" className="text-sm text-muted-foreground">Custom (ml)</Label>
              <Input
                id="custom-amount"
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min="1"
                className="mt-1 h-9"
              />
            </div>
            <Button
              onClick={() => {
                const amount = parseInt(customAmount);
                if (!isNaN(amount) && amount > 0) addWater(amount);
              }}
              variant="secondary"
              className="h-9"
              aria-label="Add custom amount"
            >
              Add
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground justify-center pt-4">
          <p>Goal: {todayData.goalMl / 1000} liters</p>
        </CardFooter>
      </Card>

      {waterLog.length > 1 && ( // Only show history if there's more than just today
        <section id="water-history" className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Water Intake History
          </h3>
          {waterLog.filter(entry => entry.date !== getTodayDateString()).length === 0 ? (
             <Card className="shadow-md">
                <CardContent className="pt-6 text-center text-muted-foreground">
                    No past history yet. Keep tracking!
                </CardContent>
             </Card>
          ) : (
            <Accordion type="multiple" className="w-full space-y-2">
              {waterLog
                .filter(entry => entry.date !== getTodayDateString()) // Exclude today from history list
                .map(entry => (
                <AccordionItem value={entry.date} key={entry.date} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
                  <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-base font-medium">
                    {format(parseISO(entry.date), "MMMM d, yyyy (eeee)")}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 border-t bg-background text-sm">
                      <p>Intake: <span className="font-semibold">{entry.intakeMl} ml</span></p>
                      <p>Goal: <span className="font-semibold">{entry.goalMl} ml</span></p>
                      <div className="w-full bg-secondary rounded-full h-2.5 mt-2">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(entry.intakeMl / entry.goalMl) * 100}%` }}></div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
      )}
    </>
  );
}
