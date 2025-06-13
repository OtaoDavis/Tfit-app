
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Waves, Smile, Meh, Frown, Edit2, Lightbulb } from "lucide-react"; // Using Waves for calmness/stress management
import { useToast } from '@/hooks/use-toast';
import { Label } from "@/components/ui/label"; // Added this import

interface StressLogEntry {
  level: 'calm' | 'okay' | 'stressed';
  notes?: string;
  timestamp: Date;
}

const STRESS_LOG_KEY = 'stressLog_v1';
const DAILY_TIPS = [
  "Take 5 deep breaths, focusing on the air entering and leaving your body.",
  "Step away from your screen for 5 minutes and stretch.",
  "Write down three things you are grateful for today.",
  "Listen to a calming song or nature sounds.",
  "Go for a short walk, even if it's just around the room.",
  "Practice a mindful minute: focus all your senses on the present moment.",
  "Identify one small, manageable task you can complete right now.",
  "Reach out to a friend or loved one for a quick chat."
];

export function StressTracker() {
  const [stressLog, setStressLog] = useState<StressLogEntry[]>([]);
  const [currentNotes, setCurrentNotes] = useState('');
  const [showNotesInput, setShowNotesInput] = useState<StressLogEntry['level'] | null>(null);
  const [dailyTip, setDailyTip] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Load stress log from localStorage
    const storedLog = localStorage.getItem(STRESS_LOG_KEY);
    if (storedLog) {
      try {
        const parsedLog: any[] = JSON.parse(storedLog);
        // Ensure timestamps are Date objects
        setStressLog(parsedLog.map(entry => ({ ...entry, timestamp: new Date(entry.timestamp) })));
      } catch (error) {
        console.error("Failed to parse stress log from localStorage", error);
        setStressLog([]);
      }
    }

    // Set a daily tip
    const today = new Date().toDateString();
    const lastTipDate = localStorage.getItem('lastTipDate');
    let currentTip = localStorage.getItem('currentDailyTip');

    if (lastTipDate !== today || !currentTip) {
      currentTip = DAILY_TIPS[Math.floor(Math.random() * DAILY_TIPS.length)];
      localStorage.setItem('currentDailyTip', currentTip);
      localStorage.setItem('lastTipDate', today);
    }
    setDailyTip(currentTip);

  }, []);

  const saveLog = (updatedLog: StressLogEntry[]) => {
    setStressLog(updatedLog);
    localStorage.setItem(STRESS_LOG_KEY, JSON.stringify(updatedLog));
  };

  const handleLogStress = (level: StressLogEntry['level']) => {
    if (showNotesInput === level && currentNotes.trim() !== '') {
      const newEntry: StressLogEntry = {
        level,
        notes: currentNotes,
        timestamp: new Date(),
      };
      saveLog([newEntry, ...stressLog]);
      toast({ title: "Stress Level Logged", description: `You logged feeling ${level} with notes.` });
      setCurrentNotes('');
      setShowNotesInput(null);
    } else if (showNotesInput === level && currentNotes.trim() === '') {
      // If notes were shown but empty, log without notes
      const newEntry: StressLogEntry = {
        level,
        timestamp: new Date(),
      };
      saveLog([newEntry, ...stressLog]);
      toast({ title: "Stress Level Logged", description: `You logged feeling ${level}.` });
      setShowNotesInput(null);
    }
     else {
      // First click on a level, or switching level
      setShowNotesInput(level);
      setCurrentNotes(''); // Reset notes when switching level or first click
    }
  };
  
  const handleSaveNotes = () => {
    if (showNotesInput && currentNotes.trim() !== '') {
      const newEntry: StressLogEntry = {
        level: showNotesInput,
        notes: currentNotes,
        timestamp: new Date(),
      };
      saveLog([newEntry, ...stressLog]);
      toast({ title: "Stress Level Logged", description: `You logged feeling ${showNotesInput} with notes.` });
      setCurrentNotes('');
      setShowNotesInput(null);
    } else if (showNotesInput) {
        // Log without notes if notes are empty
        const newEntry: StressLogEntry = {
            level: showNotesInput,
            timestamp: new Date(),
        };
        saveLog([newEntry, ...stressLog]);
        toast({ title: "Stress Level Logged", description: `You logged feeling ${showNotesInput}.` });
        setCurrentNotes('');
        setShowNotesInput(null);
    }
  };


  const getMostRecentLog = () => {
    if (stressLog.length === 0) return null;
    // Sort by timestamp descending to get the most recent
    const sortedLog = [...stressLog].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return sortedLog[0];
  };

  const recentLog = getMostRecentLog();

  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-6 w-6 text-primary" />
          Stress Management
        </CardTitle>
        <CardDescription>Log your stress levels and find helpful tips.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">Log Your Current Stress Level</h3>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant={showNotesInput === 'calm' ? "default" : "outline"}
              onClick={() => handleLogStress('calm')}
              className="flex-1 flex items-center gap-2"
            >
              <Smile className="h-5 w-5" /> Calm
            </Button>
            <Button
              variant={showNotesInput === 'okay' ? "default" : "outline"}
              onClick={() => handleLogStress('okay')}
              className="flex-1 flex items-center gap-2"
            >
              <Meh className="h-5 w-5" /> Okay
            </Button>
            <Button
              variant={showNotesInput === 'stressed' ? "default" : "outline"}
              onClick={() => handleLogStress('stressed')}
              className="flex-1 flex items-center gap-2"
            >
              <Frown className="h-5 w-5" /> Stressed
            </Button>
          </div>

          {showNotesInput && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="stress-notes" className="text-sm font-medium">
                Add notes about how you&apos;re feeling (optional):
              </Label>
              <Textarea
                id="stress-notes"
                placeholder={`Notes for when feeling ${showNotesInput}...`}
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                rows={3}
              />
              <Button onClick={handleSaveNotes} size="sm" className="mt-2">
                <Edit2 className="mr-2 h-4 w-4" /> Save Log
              </Button>
            </div>
          )}
        </div>

        {recentLog && (
          <div className="p-3 bg-muted/50 rounded-md">
            <p className="text-sm text-muted-foreground">
              Last log: <span className="font-semibold capitalize">{recentLog.level}</span>
              {recentLog.notes && ` - "${recentLog.notes}"`}
              <span className="block text-xs"> ({recentLog.timestamp.toLocaleTimeString()})</span>
            </p>
          </div>
        )}
        
        <div className="space-y-2 pt-4 border-t">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-accent" />
            Daily Stress Relief Tip
          </h3>
          <p className="text-sm text-muted-foreground italic">
            {dailyTip || "Take a moment for yourself today."}
          </p>
        </div>

      </CardContent>
    </Card>
  );
}
