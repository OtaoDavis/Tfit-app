
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Droplet, Edit3, History, GlassWater, ChevronDown, ChevronUp, Calendar as CalendarIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { format, parseISO, startOfDay, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Progress } from '../ui/progress';

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

interface WaterTrackerProps {
  isHistoryVisible: boolean;
  onToggleHistory: () => void;
}

export function WaterTracker({ isHistoryVisible, onToggleHistory }: WaterTrackerProps) {
  const [waterLog, setWaterLog] = useState<WaterLogEntry[]>([]);
  const [dailyGoalMl, setDailyGoalMl] = useState(DEFAULT_GOAL_ML); // User's current preferred goal
  const [isMounted, setIsMounted] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(GLASS_SIZE_ML.toString());
  const [newGoalInput, setNewGoalInput] = useState<string>(dailyGoalMl.toString());
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));


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

  const getDataForDate = (date: Date): WaterLogEntry => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const data = waterLog.find(entry => entry.date === dateStr);
    return data || { date: dateStr, intakeMl: 0, goalMl: dailyGoalMl };
  };

  const todayData = getDataForDate(new Date());
  const selectedDateData = getDataForDate(selectedDate);
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

  const HistoryView = () => (
    <div className="space-y-4">
      <Popover>
          <PopoverTrigger asChild>
              <Button
                  variant={"outline"}
                  className={cn(
                      "w-full sm:w-[280px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                  )}
              >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
              <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => setSelectedDate(date || startOfDay(new Date()))}
                  initialFocus
              />
          </PopoverContent>
      </Popover>
      <Card className="shadow-md">
        <CardContent className="pt-6 text-center">
            {selectedDateData.intakeMl > 0 || isSameDay(selectedDate, startOfDay(new Date())) ? (
                <>
                    <p className="text-2xl font-bold text-primary">{selectedDateData.intakeMl.toLocaleString()} ml</p>
                    <p className="text-sm text-muted-foreground">
                      Goal: {selectedDateData.goalMl.toLocaleString()} ml
                    </p>
                     <Progress value={(selectedDateData.intakeMl / selectedDateData.goalMl) * 100} className="w-full h-3 mt-2" />
                </>
            ) : (
                <p className="text-muted-foreground">No water logged for {format(selectedDate, "MMMM d, yyyy")}.</p>
            )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Water Tracker</h2>
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

      <section id="water-history" className="mt-8">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold text-foreground">History</h3>
            <Button variant="ghost" onClick={onToggleHistory} className="flex items-center gap-1">
                {isHistoryVisible ? 'Hide History' : 'View History'}
                {isHistoryVisible ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
        </div>
        {isHistoryVisible && <HistoryView />}
      </section>
    </>
  );
}
