
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Brain, Droplet, Footprints, ForkKnife, Bed, BookOpen, CheckSquare, Calendar as CalendarIcon, History } from "lucide-react";
import { format, isSameDay, startOfDay, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const HABIT_TRACKER_KEY = 'habitTracker_v2_daily';

const habits = [
  { id: 'water', label: 'Drank 6+ glasses of water', icon: Droplet },
  { id: 'move', label: 'I Was active for the day', icon: Footprints },
  { id: 'eat_mindfully', label: 'Ate to 80% fullness', icon: ForkKnife },
  { id: 'sleep', label: 'Slept 7-8 hours', icon: Bed },
  { id: 'shmec', label: 'Checked SHMEC', icon: CheckSquare },
  { id: 'journal', label: 'Journaled / Reflected', icon: BookOpen },
];

type HabitId = typeof habits[number]['id'];
type HabitState = Record<string, Record<HabitId, boolean>>; // Date string as key

export function HabitTracker() {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const [habitState, setHabitState] = useState<HabitState>({});
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedState = localStorage.getItem(HABIT_TRACKER_KEY);
    if (storedState) {
        try {
            setHabitState(JSON.parse(storedState));
        } catch (e) {
            console.error("Failed to parse habit state:", e);
        }
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(HABIT_TRACKER_KEY, JSON.stringify(habitState));
    }
  }, [habitState, isMounted]);

  const handleHabitToggle = (date: Date, habitId: HabitId) => {
    const dateString = format(date, 'yyyy-MM-dd');
    
    setHabitState(prevState => {
      const newDateState = { ...(prevState[dateString] || {}) };
      newDateState[habitId] = !newDateState[habitId];
      
      const newState = { ...prevState, [dateString]: newDateState };

      // Clean up empty entries
      if (Object.keys(newDateState).every(key => !newDateState[key as HabitId])) {
        delete newState[dateString];
      }
      
      return newState;
    });

    toast({
        title: "Habit Updated",
        description: `Your progress for ${format(date, 'MMMM d')} has been saved.`,
    });
  };

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const todaysHabits = habitState[selectedDateString] || {};
  const isFutureDate = selectedDate > startOfDay(new Date());

  const historyEntries = Object.keys(habitState)
    .filter(dateStr => dateStr !== format(startOfDay(new Date()), 'yyyy-MM-dd'))
    .sort((a,b) => parseISO(b).getTime() - parseISO(a).getTime());


  if (!isMounted) {
    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-primary" />
                    Habit Tracker
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading tracker...</p>
            </CardContent>
        </Card>
    )
  }

  return (
    <>
        <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Habit Tracker
            </CardTitle>
            <CardDescription>Select a day to view or log your habits. Consistency is key!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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
                        disabled={(date) => date > new Date()}
                    />
                </PopoverContent>
            </Popover>

            <div className="space-y-4">
                {isFutureDate ? (
                     <p className="text-muted-foreground text-center">Cannot log habits for a future date.</p>
                ) : (
                    habits.map(habit => (
                        <div key={habit.id} className="flex items-center space-x-4 p-3 rounded-lg border bg-background hover:bg-muted/50 transition-colors">
                            <Checkbox
                                id={`${habit.id}-${selectedDateString}`}
                                checked={todaysHabits[habit.id] || false}
                                onCheckedChange={() => handleHabitToggle(selectedDate, habit.id)}
                                aria-label={`Mark ${habit.label} as complete for ${format(selectedDate, 'EEEE')}`}
                            />
                            <label
                                htmlFor={`${habit.id}-${selectedDateString}`}
                                className="flex-1 flex items-center gap-3 text-sm font-medium leading-none cursor-pointer"
                            >
                                <habit.icon className="h-6 w-6 text-muted-foreground" />
                                {habit.label}
                            </label>
                        </div>
                    ))
                )}
            </div>
        </CardContent>
        </Card>

        <section id="habit-history" className="mt-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Habit History
            </h3>
            {historyEntries.length === 0 ? (
                <Card className="shadow-md">
                    <CardContent className="pt-6 text-center text-muted-foreground">
                        No past habit history recorded yet. Keep tracking!
                    </CardContent>
                </Card>
            ) : (
                <Accordion type="multiple" className="w-full space-y-2">
                {historyEntries.map(dateStr => (
                    <AccordionItem value={dateStr} key={dateStr} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
                    <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-base font-medium">
                        {format(parseISO(dateStr), "MMMM d, yyyy (EEEE)")}
                    </AccordionTrigger>
                    <AccordionContent>
                        <ul className="p-4 border-t bg-background text-sm space-y-2">
                        {habits.map(habit => {
                            const isCompleted = habitState[dateStr]?.[habit.id];
                            if (!isCompleted) return null;
                            return (
                                <li key={habit.id} className="flex items-center gap-2 text-muted-foreground">
                                    <CheckSquare className="h-4 w-4 text-green-500" />
                                    <span>{habit.label}</span>
                                </li>
                            );
                        }).filter(Boolean).length > 0 ? (
                            habits.map(habit => {
                                const isCompleted = habitState[dateStr]?.[habit.id];
                                if (!isCompleted) return null;
                                return (
                                    <li key={habit.id} className="flex items-center gap-2 text-muted-foreground">
                                        <CheckSquare className="h-4 w-4 text-green-500" />
                                        <span>{habit.label}</span>
                                    </li>
                                );
                            })
                        ) : (
                            <li className="text-muted-foreground">No habits completed on this day.</li>
                        )}
                        </ul>
                    </AccordionContent>
                    </AccordionItem>
                ))}
                </Accordion>
            )}
        </section>
    </>
  );
}
