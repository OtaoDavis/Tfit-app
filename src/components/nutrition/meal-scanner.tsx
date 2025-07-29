
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { scanMeal, type MealDiaryEntry, type MealType } from '@/services/meal-scanner';
import { AlertCircle, CheckCircle2, Loader2, ScanLine, Camera, Upload, Trash2, Smartphone, ImageIcon, PlusCircle, NotebookText, X, Calendar as CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, startOfToday, isSameDay } from 'date-fns';
import { Camera as CapacitorCameraPlugin, CameraResultType, CameraSource, Photo as CapacitorPhoto } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from '@/lib/utils';


const MEAL_SCANNER_TRIAL_USED_KEY = 'mealScannerTrialUsed_v1';
const MEAL_DIARY_KEY = 'mealDiary_v3_structured';

const MEAL_TYPES: MealType[] = ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner", "Evening Snack"];

const MEAL_TIMES: Record<MealType, string> = {
  "Breakfast": "7:00",
  "Morning Snack": "9:30",
  "Lunch": "12:00",
  "Afternoon Snack": "14:00",
  "Dinner": "18:00",
  "Evening Snack": "20:00",
};


export function MealScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [mealDiary, setMealDiary] = useState<MealDiaryEntry[]>([]);
  const [trialAvailable, setTrialAvailable] = useState(true);

  // State for the dialogs and scanning process
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  
  const [selectedMealType, setSelectedMealType] = useState<MealType | null>(null);
  const [viewedMeal, setViewedMeal] = useState<MealDiaryEntry | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Data and Permission Management ---
  const saveImageToDevice = async (dataUrl: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform() || !dataUrl.startsWith('data:image')) {
      return dataUrl; // Return dataURL for web
    }

    try {
      const fileName = `meal_${new Date().getTime()}.jpeg`;
      const base64Data = dataUrl.split(',')[1];
      const result = await Filesystem.writeFile({ path: fileName, data: base64Data, directory: Directory.Data });
      return Capacitor.convertFileSrc(result.uri); // Return web-accessible URI for native
    } catch (e: any) {
      console.error('Unable to save image to device', e);
      toast({ title: 'Save Error', description: 'Could not save image to device.', variant: 'destructive' });
      return null;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const trialUsed = localStorage.getItem(MEAL_SCANNER_TRIAL_USED_KEY);
      setTrialAvailable(!trialUsed);
      const storedDiaryJson = localStorage.getItem(MEAL_DIARY_KEY);
      if (storedDiaryJson) {
        try {
          const parsedStoredDiary: any[] = JSON.parse(storedDiaryJson);
          const loadedMealDiary: MealDiaryEntry[] = parsedStoredDiary.map((meal: any) => ({
            ...meal,
            timestamp: new Date(meal.timestamp),
          }));
          setMealDiary(loadedMealDiary);
        } catch (e) {
          console.error("Failed to parse meal diary", e);
          setMealDiary([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        if (mealDiary.length > 0) {
          localStorage.setItem(MEAL_DIARY_KEY, JSON.stringify(mealDiary));
        } else {
          localStorage.removeItem(MEAL_DIARY_KEY);
        }
      } catch (e: any) {
        console.error("Error saving meal diary:", e);
        toast({ title: 'Diary Save Error', description: 'Could not save meal diary updates.', variant: 'destructive' });
      }
    }
  }, [mealDiary, toast]);

  const requestCameraPermissions = async (): Promise<boolean> => {
    if (!Capacitor.isPluginAvailable('Camera')) return true; // Non-native web doesn't need this check
    try {
      let permissions = await CapacitorCameraPlugin.checkPermissions();
      if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
        permissions = await CapacitorCameraPlugin.requestPermissions();
      }
      if (permissions.camera === 'denied' || permissions.photos === 'denied') {
        toast({ variant: 'destructive', title: 'Permission Denied', description: 'Camera access is required. Please enable it in settings.' });
        return false;
      }
      return true;
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Permission Error', description: `Could not request permissions: ${e.message}` });
      return false;
    }
  };
  
  // --- Core Logic ---
  const handleNativeTakePictureAndScan = async () => {
    if (!Capacitor.isPluginAvailable('Camera')) {
        toast({variant: 'destructive', title: 'Not Supported', description: 'Camera is not available on this device.'});
        return;
    };
    if (!selectedMealType) return;
    if (!user && !trialAvailable) {
      toast({ title: "Login Required", description: "Your free trial is used. Please log in to add more meals." });
      return;
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const photo: CapacitorPhoto = await CapacitorCameraPlugin.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (photo.dataUrl) {
        setIsLoading(true);
        setError(null);
        setIsLogDialogOpen(true); // Keep dialog open to show loader

        const savedUri = await saveImageToDevice(photo.dataUrl);

        const result = await scanMeal(photo.dataUrl, selectedMealType);
        const newMealEntry: MealDiaryEntry = {
          ...result,
          imageFileUri: savedUri,
          timestamp: new Date(),
        };
        
        // Save to diary
        setMealDiary(prevDiary => {
            const otherMeals = prevDiary.filter(m => !(isSameDay(m.timestamp, new Date()) && m.mealType === newMealEntry.mealType));
            return [...otherMeals, newMealEntry];
        });

        if (!user) {
            localStorage.setItem(MEAL_SCANNER_TRIAL_USED_KEY, 'true');
            setTrialAvailable(false);
            toast({ title: "Trial Scan Successful!", description: "Logged to your diary. Log in for unlimited scans." });
        } else {
            toast({ title: "Scan Successful!", description: `${newMealEntry.mealType} has been added to your diary.` });
        }

        resetDialogState();

      }
    } catch (e: any) {
      if (e.message?.toLowerCase().includes('cancelled')) {
        // User cancelled the camera, do nothing
        resetDialogState();
      } else {
        setError(`Failed to scan meal: ${e.message || 'An unknown error occurred'}`);
        setIsLoading(false); // Stop loading on error
      }
    }
  };

  const handleGridCardClick = (mealType: MealType, meal: MealDiaryEntry | undefined, isToday: boolean) => {
    if (meal) { // If a meal is already logged
      setViewedMeal(meal);
      setIsDetailsDialogOpen(true);
    } else if (isToday) { // If it's an empty slot for today
      if (!user && !trialAvailable) {
         toast({ title: "Login to Log Meal", description: "You have used your free trial. Please log in to continue."});
         return;
      }
      setSelectedMealType(mealType);
      setIsLogDialogOpen(true);
    }
    // If it's an empty slot for a past day, do nothing.
  };

  const handleDeleteMeal = (mealToDelete: MealDiaryEntry) => {
    setMealDiary(prevDiary => 
      prevDiary.filter(meal => meal.timestamp.getTime() !== mealToDelete.timestamp.getTime() || meal.mealType !== mealToDelete.mealType)
    );
    toast({
      title: 'Meal Deleted',
      description: `${mealToDelete.name} has been removed from your diary.`,
      variant: 'default',
    });
    resetDialogState();
  };
  
  const resetDialogState = () => {
    setIsLogDialogOpen(false);
    setIsDetailsDialogOpen(false);
    setError(null);
    setIsLoading(false);
    setSelectedMealType(null);
    setViewedMeal(null);
  };

  // --- UI Components and Grouping ---
  const MealGrid = ({ forDate }: { forDate: Date }) => {
    const mealsForDate = mealDiary.filter(m => isSameDay(m.timestamp, forDate));
    const isToday = isSameDay(forDate, startOfToday());
    
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {MEAL_TYPES.map(mealType => {
          const meal = mealsForDate.find(m => m.mealType === mealType);
          return (
            <Card 
              key={mealType} 
              className={cn(
                "overflow-hidden shadow-md flex flex-col justify-center items-center text-center transition-transform transform hover:scale-105",
                meal ? "bg-card cursor-pointer" : "bg-muted/50",
                isToday && !meal ? "cursor-pointer" : !isToday && !meal ? "cursor-not-allowed opacity-60" : ""
              )}
              onClick={() => handleGridCardClick(mealType, meal, isToday)}
            >
              <CardHeader className="p-2 w-full">
                <CardTitle className="text-sm font-semibold">{mealType}</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex-grow w-full flex flex-col justify-center items-center">
                {meal ? (
                   <div className="w-full">
                    {meal.imageFileUri ? (
                        <div className="relative aspect-video w-full rounded-md overflow-hidden mb-2">
                        <Image src={meal.imageFileUri} alt={meal.name} layout="fill" objectFit="cover" unoptimized={Capacitor.isNativePlatform()} data-ai-hint="food meal"/>
                        </div>
                    ) : <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />}
                    {/* <p className="text-xs text-primary font-bold">{meal.calories.toFixed(0)} kcal</p> */}
                    <p className="text-xs text-muted-foreground">Logged at {format(new Date(meal.timestamp), "h:mm a")}</p>
                   </div>
                ) : (
                  <>
                    <PlusCircle className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      {isToday ? MEAL_TIMES[mealType] : "Not Logged"}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const MealDetailsView = ({ meal }: { meal: MealDiaryEntry }) => (
    <div className="space-y-4">
        {meal.imageFileUri && (
            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                <Image src={meal.imageFileUri} alt={meal.name} layout="fill" objectFit="cover" data-ai-hint="food meal"/>
            </div>
        )}
        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-primary">{meal.name}</h3>
            <p className="text-sm text-muted-foreground">
                Logged as {meal.mealType} at {format(new Date(meal.timestamp), 'MMM d, yyyy h:mm a')}
            </p>
            <Separator />
            {/* <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div>Calories:</div><div className="font-medium text-right">{meal.calories.toFixed(0)} kcal</div>
                <div>Protein:</div><div className="font-medium text-right">{meal.protein.toFixed(1)} g</div>
                <div>Carbs:</div><div className="font-medium text-right">{meal.carbohydrates.toFixed(1)} g</div>
                <div>Fat:</div><div className="font-medium text-right">{meal.fat.toFixed(1)} g</div>
            </div> */}
        </div>
    </div>
  );

  return (
    <>
      <section id="daily-meal-grid">
         <h2 className="text-2xl font-semibold mb-1 text-foreground">Today's Meals</h2>
         {/* <p className="text-muted-foreground mb-4">Tap a meal to log your food, or tap a logged meal to see details.</p> */}
         <MealGrid forDate={startOfToday()} />
      </section>

      {/* DIALOG FOR LOGGING A NEW MEAL */}
      <Dialog open={isLogDialogOpen} onOpenChange={(open) => !open && resetDialogState()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log {selectedMealType}</DialogTitle>
             <DialogDescription>
                {isLoading ? "Adding your meal..." : `Take a photo of your ${selectedMealType?.toLowerCase()}`}
             </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="font-semibold">Adding Meal...</p>
              {/* <p className="text-sm">This may take a moment.</p> */}
            </div>
          ) : (
            <>
                <div className="pt-4">
                    <Button onClick={handleNativeTakePictureAndScan} variant="default" className="w-full h-24 text-base" disabled={!Capacitor.isNativePlatform()}>
                        <Camera className="mr-2 h-6 w-6"/> Add Meal
                    </Button>
                </div>

                {error && (
                    <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={resetDialogState}>Cancel</Button>
                </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* DIALOG FOR VIEWING LOGGED MEAL DETAILS */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={(open) => !open && resetDialogState()}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Meal Details</DialogTitle>
              </DialogHeader>
              {viewedMeal && <MealDetailsView meal={viewedMeal} />}
              <DialogFooter className="sm:justify-between">
                {viewedMeal && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="mr-2 h-4 w-4"/> Delete Meal
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete this meal from your diary.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteMeal(viewedMeal)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <Button variant="outline" onClick={resetDialogState}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <Separator className="my-8" />

      <section id="meal-history">
        <h3 className="text-2xl font-semibold mb-4 text-foreground">Meal History</h3>
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
                        onSelect={(date) => setSelectedDate(date || startOfToday())}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

            {mealDiary.some(m => isSameDay(m.timestamp, selectedDate)) ? (
                <MealGrid forDate={selectedDate} />
            ) : (
                <Card className="shadow-md">
                    <CardContent className="pt-6">
                        <p className="text-muted-foreground text-center">No meals logged for {format(selectedDate, "MMMM d, yyyy")}.</p>
                    </CardContent>
                </Card>
            )}
        </div>
      </section>
    </>
  );
}
