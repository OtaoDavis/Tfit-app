"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MinusCircle, PlusCircle, Droplet, Edit3 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';

const DEFAULT_GOAL_ML = 2000; // Default daily goal in ml
const GLASS_SIZE_ML = 250; // Standard glass size in ml

export function WaterTracker() {
  const [currentIntakeMl, setCurrentIntakeMl] = useState(0);
  const [dailyGoalMl, setDailyGoalMl] = useState(DEFAULT_GOAL_ML);
  const [isMounted, setIsMounted] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>(GLASS_SIZE_ML.toString());
  const [newGoal, setNewGoal] = useState<string>(dailyGoalMl.toString());


  useEffect(() => {
    setIsMounted(true);
    // Load from local storage if available
    const savedIntake = localStorage.getItem('waterIntake');
    const savedGoal = localStorage.getItem('waterGoal');
    if (savedIntake) {
      setCurrentIntakeMl(JSON.parse(savedIntake));
    }
    if (savedGoal) {
      setDailyGoalMl(JSON.parse(savedGoal));
      setNewGoal(JSON.parse(savedGoal).toString());
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('waterIntake', JSON.stringify(currentIntakeMl));
    }
  }, [currentIntakeMl, isMounted]);
  
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('waterGoal', JSON.stringify(dailyGoalMl));
    }
  }, [dailyGoalMl, isMounted]);


  const addWater = (amountMl: number) => {
    setCurrentIntakeMl(prev => Math.min(prev + amountMl, dailyGoalMl * 2)); // Cap at 2x goal to prevent extreme values
  };

  const removeWater = (amountMl: number) => {
    setCurrentIntakeMl(prev => Math.max(0, prev - amountMl));
  };

  const progressPercentage = dailyGoalMl > 0 ? (currentIntakeMl / dailyGoalMl) * 100 : 0;

  const handleSetGoal = () => {
    const goalValue = parseInt(newGoal);
    if (!isNaN(goalValue) && goalValue > 0) {
      setDailyGoalMl(goalValue);
    }
  };

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
          <Progress value={0} className="w-full h-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplet className="h-6 w-6 text-primary" />
            Hydration Status
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
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
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
          {currentIntakeMl} ml / {dailyGoalMl} ml ({Math.round(progressPercentage)}%)
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        <Progress value={progressPercentage} className="w-full h-4 rounded-full" />
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
          <Button
            onClick={() => removeWater(GLASS_SIZE_ML)}
            variant="outline"
            size="lg"
            className="flex items-center gap-2 w-full sm:w-auto"
            aria-label={`Remove ${GLASS_SIZE_ML}ml`}
            disabled={currentIntakeMl === 0}
          >
            <MinusCircle className="h-5 w-5" />
            Remove Glass ({GLASS_SIZE_ML}ml)
          </Button>
          <Button
            onClick={() => addWater(GLASS_SIZE_ML)}
            variant="default"
            size="lg"
            className="flex items-center gap-2 w-full sm:w-auto"
            aria-label={`Add ${GLASS_SIZE_ML}ml`}
          >
            <PlusCircle className="h-5 w-5" />
            Add Glass ({GLASS_SIZE_ML}ml)
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-2 w-full max-w-xs">
          <div className="flex-grow">
            <Label htmlFor="custom-amount" className="text-sm text-muted-foreground">Custom Amount (ml)</Label>
            <Input
              id="custom-amount"
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              min="1"
              className="mt-1"
            />
          </div>
          <Button
            onClick={() => {
              const amount = parseInt(customAmount);
              if (!isNaN(amount) && amount > 0) addWater(amount);
            }}
            variant="secondary"
            className="w-full sm:w-auto"
            aria-label="Add custom amount"
          >
            Add Custom
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-center">
        <p>Tip: Aim for {dailyGoalMl / 1000} liters per day!</p>
      </CardFooter>
    </Card>
  );
}
