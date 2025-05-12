
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { scanMeal, MealDiaryEntry } from '@/services/meal-scanner';
import { AlertCircle, CheckCircle2, Loader2, ScanLine, LogIn, Camera, Upload, Trash2, Smartphone, ImageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Camera as CapacitorCamera, CameraResultType, CameraSource, Photo as CapacitorPhoto, CameraPermissionState } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

const MEAL_SCANNER_TRIAL_USED_KEY = 'mealScannerTrialUsed_v1';
const MEAL_DIARY_KEY = 'mealDiary_v1';

export function MealScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealInfo, setMealInfo] = useState<Omit<MealDiaryEntry, 'imageDataUri' | 'timestamp'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(false);

  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [mealDiary, setMealDiary] = useState<MealDiaryEntry[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const trialUsed = localStorage.getItem(MEAL_SCANNER_TRIAL_USED_KEY);
      setTrialAvailable(!trialUsed);

      const storedDiaryJson = localStorage.getItem(MEAL_DIARY_KEY);
      if (storedDiaryJson) {
        try {
          // Entries from localStorage will not have imageDataUri
          const parsedStoredDiary: Omit<MealDiaryEntry, 'imageDataUri'>[] = JSON.parse(storedDiaryJson);
          const loadedMealDiary: MealDiaryEntry[] = parsedStoredDiary.map((meal: any) => ({
            ...meal,
            timestamp: new Date(meal.timestamp),
            // imageDataUri will be undefined here, which is fine
          }));
          setMealDiary(loadedMealDiary);
        } catch (e) {
          console.error("Failed to parse meal diary from localStorage", e);
          setMealDiary([]); 
        }
      }
    }
  }, []);

  // Save meal diary to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Strip imageDataUri before saving to localStorage to prevent quota errors
      const storableMealDiary = mealDiary.map(meal => {
        const { imageDataUri, ...rest } = meal;
        return { ...rest, timestamp: meal.timestamp.toISOString() }; // Store timestamp as ISO string
      });
      try {
        localStorage.setItem(MEAL_DIARY_KEY, JSON.stringify(storableMealDiary));
      } catch (e: any) {
        if (e.name === 'QuotaExceededError') {
          toast({
            title: 'Storage Full',
            description: 'Could not save new meal to diary due to storage limits. Older entries might not have images stored.',
            variant: 'destructive',
          });
          console.error("LocalStorage quota exceeded:", e);
          // Optionally, implement a strategy to remove older entries if quota is an issue
          // For now, it just fails to save the latest state if too large.
        } else {
          console.error("Error saving meal diary to localStorage:", e);
        }
      }
    }
  }, [mealDiary, toast]);

  useEffect(() => {
    setShowLoginPrompt(false);
  }, [user]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImagePreview(result);
        setMealInfo(null); 
        setError(null); 
        setShowLoginPrompt(false); 
      };
      reader.readAsDataURL(file);
    }
  };

   const requestCameraPermissions = async (): Promise<boolean> => {
     if (!Capacitor.isPluginAvailable('Camera')) {
      setError("Camera plugin is not available on this platform.");
      toast({
        variant: 'destructive',
        title: 'Camera Not Available',
        description: 'The camera feature is not supported on this device/platform.',
      });
      return false;
    }
    try {
      let permissions: { camera: CameraPermissionState; photos: CameraPermissionState };
      if (Capacitor.getPlatform() === 'web') {
        permissions = await CapacitorCamera.requestPermissions();
      } else {
        permissions = await CapacitorCamera.checkPermissions();
        if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
          permissions = await CapacitorCamera.requestPermissions();
        }
      }

      if (permissions.camera === 'granted' && (Capacitor.getPlatform() === 'web' || permissions.photos === 'granted')) {
        return true;
      }
      
      let message = 'Camera and/or photos permission denied. Please enable access in your device settings.';
       if (permissions.camera === 'prompt' || permissions.camera === 'prompt-with-rationale'){
          message = 'Camera permission was not granted.'
      } else if (Capacitor.getPlatform() !== 'web' && (permissions.photos === 'prompt' || permissions.photos === 'prompt-with-rationale')){
          message = 'Photos permission was not granted.'
      }


      setError(message);
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: message,
      });
      return false;
    } catch (e: any) {
      setError(`Error requesting camera permissions: ${e.message}`);
      toast({
        variant: 'destructive',
        title: 'Permission Error',
        description: `Could not request camera permissions. ${e.message}`,
      });
      return false;
    }
  };

  const handleNativeTakePicture = async () => {
    if (!Capacitor.isPluginAvailable('Camera')) {
       setError("Camera plugin is not available on this platform.");
       toast({
         variant: 'destructive',
         title: 'Camera Not Available',
         description: 'The camera feature is not supported on this device/platform.',
       });
       return;
    }

    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const photo: CapacitorPhoto = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, 
        source: CameraSource.Camera,
        saveToGallery: false, 
      });

      if (photo.dataUrl) {
        setImageBase64(photo.dataUrl);
        setImagePreview(photo.dataUrl);
        setMealInfo(null);
        setError(null);
        setShowLoginPrompt(false);
      } else {
        setError("Failed to capture image. No data received.");
      }
    } catch (e: any) {
        if (e.message && (e.message.toLowerCase().includes('cancelled') || e.message.toLowerCase().includes('canceled'))) {
          toast({
              title: 'Camera Cancelled',
              description: 'Image capture was cancelled.',
              variant: 'default' 
          });
        } else {
          setError(`Error taking picture: ${e.message}`);
          toast({
            variant: 'destructive',
            title: 'Camera Error',
            description: `Could not take picture: ${e.message || 'Unknown error'}`,
          });
        }
      console.error('Error taking picture with Capacitor Camera:', e);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setMealInfo(null);
    setError(null);
    setShowLoginPrompt(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScanMeal = async () => {
    if (!imageBase64) {
      setError('Please select or take an image first.');
      return;
    }

    setError(null);
    setMealInfo(null);
    setShowLoginPrompt(false); 

    if (!user) {
      const trialUsed = typeof window !== 'undefined' ? localStorage.getItem(MEAL_SCANNER_TRIAL_USED_KEY) : true;
      if (trialUsed) {
        setShowLoginPrompt(true);
        toast({
          title: "Login Required",
          description: "You've used your free trial scan. Please log in to scan more meals.",
          variant: "default"
        })
        return; 
      }
    }
    
    setIsLoading(true);

    try {
      const result = await scanMeal(imageBase64, mealDiary); 

      const newMealEntry: MealDiaryEntry = {
        name: result.name, 
        calories: result.calories,
        protein: result.protein,
        carbohydrates: result.carbohydrates,
        fat: result.fat,
        imageDataUri: imageBase64, // Keep for current session display
        timestamp: new Date(), 
      };

      setMealInfo({
        name: newMealEntry.name,
        calories: newMealEntry.calories,
        protein: newMealEntry.protein,
        carbohydrates: newMealEntry.carbohydrates,
        fat: newMealEntry.fat,
      });

      setMealDiary(prevDiary => [newMealEntry, ...prevDiary].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));

      if (!user) {
          localStorage.setItem(MEAL_SCANNER_TRIAL_USED_KEY, 'true');
          setTrialAvailable(false); 
          toast({
            title: "Trial Scan Successful!",
            description: "You've used your one free meal scan. Log in to save future scans.",
          });
      } else {
         toast({
            title: "Scan Successful!",
            description: "Nutritional information added to your diary.",
          });
      }

    } catch (err: any) {
      setError(`Failed to scan meal: ${err.message || 'An unknown error occurred'}`);
      toast({
        title: "Scan Error",
        description: `Could not analyze the meal image. ${err.message || ''}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScanMode = () => {
    handleRemoveImage(); 
    setScanMode(prevMode => prevMode === 'upload' ? 'camera' : 'upload');
  };

  const todaysMeals = mealDiary.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    const today = new Date();
    return mealDate.toDateString() === today.toDateString();
  });

  const canScan = imageBase64 && (user || trialAvailable);

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanLine className="h-6 w-6 text-primary" />
              Scan Your Meal
            </div>
            {Capacitor.isPluginAvailable('Camera') && (
              <Button variant="outline" size="sm" onClick={toggleScanMode} disabled={isLoading}>
                {scanMode === 'camera' ? <Camera className="mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                {scanMode === 'camera' ? 'Use Phone Camera' : 'Upload Image'}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
             {user ? `Use the ${scanMode === 'camera' ? 'phone camera' : 'uploader'} to get nutritional information.` :
             trialAvailable ? `Try one scan for free! ${scanMode === 'camera' ? 'Take a picture with your phone' : 'Upload an image'} to see its nutritional info.` :
             "Log in to scan meals and track your nutrition."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showLoginPrompt && (
            <>
              {scanMode === 'upload' && !imagePreview && (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="file:text-primary file:font-semibold hover:file:bg-primary/10"
                  aria-label="Upload meal image"
                  disabled={isLoading}
                />
              )}

              {scanMode === 'camera' && !imagePreview && (
                 <div className="space-y-4">
                    <Button onClick={handleNativeTakePicture} className="w-full" disabled={isLoading}>
                        <Smartphone className="mr-2 h-4 w-4" /> Open Phone Camera
                    </Button>
                 </div>
              )}

              {imagePreview && (
                <div className="relative group aspect-video w-full max-w-md mx-auto rounded-md overflow-hidden border border-muted">
                  <Image src={imagePreview} alt="Meal preview" layout="fill" objectFit="cover" data-ai-hint="food meal"/>
                  {!isLoading && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {showLoginPrompt && (
            <LoginPrompt
              featureName="Meal Scanner"
              message="You've used your free trial scan. Please log in to continue scanning meals and save your data."
            />
          )}

          {!showLoginPrompt && (
            <>
              {error && !isLoading && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {isLoading && (
                <div className="flex items-center justify-center text-muted-foreground p-4">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                  <p>Scanning your meal...</p>
                </div>
              )}

              {mealInfo && !isLoading && (
                <Card className="bg-secondary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-primary">
                      <CheckCircle2 className="h-5 w-5" />
                      Nutritional Information
                    </CardTitle>
                    {/* <CardDescription>Estimated values for: <strong>{mealInfo.name}</strong></CardDescription> */}
                  </CardHeader>
                  <CardContent>
                    {/* <ul className="space-y-2 text-sm">
                      <li className="flex justify-between"><span>Calories:</span> <span className="font-semibold">{mealInfo.calories} kcal</span></li>
                      <li className="flex justify-between"><span>Protein:</span> <span className="font-semibold">{mealInfo.protein} g</span></li>
                      <li className="flex justify-between"><span>Carbohydrates:</span> <span className="font-semibold">{mealInfo.carbohydrates} g</span></li>
                      <li className="flex justify-between"><span>Fat:</span> <span className="font-semibold">{mealInfo.fat} g</span></li>
                    </ul> */}
                     <p className="text-xs text-muted-foreground mt-4">Nutrition Analyis Coming Soon</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
        <CardFooter>
           {!showLoginPrompt ? (
             <Button
              onClick={handleScanMeal}
              disabled={!canScan || isLoading}
              className="w-full"
              title={!imageBase64 ? "Select an image first" : (!user && !trialAvailable) ? "Log in or use free trial" : "Scan Meal"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                   Scan Meal {(trialAvailable && !user) ? "(1 Free Trial)" : ""}
                </>
              )}
            </Button>
           ) : (
             <Button onClick={() => {}} className="w-full" asChild>
               <a href="/login">
                 <LogIn className="mr-2 h-4 w-4" />
                 Login to Scan Meals
               </a>
             </Button>
           )}
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      <section id="meal-diary" className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 text-foreground">Today&apos;s Meal Diary</h3>
        {todaysMeals.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No meals scanned today. Use the scanner above to add your meals!</p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[600px] pr-4"> 
            <div className="space-y-4">
              {todaysMeals.map((meal, index) => (
                <Card key={`${meal.timestamp.toISOString()}-${index}`} className="shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {meal.imageDataUri ? (
                      <div className="md:col-span-1 relative aspect-video md:aspect-auto min-h-[150px]">
                        <Image
                          src={meal.imageDataUri}
                          alt={meal.name || 'Scanned meal'}
                          layout="fill"
                          objectFit="cover"
                          data-ai-hint="food delicious"
                        />
                      </div>
                    ) : (
                      <div className="md:col-span-1 flex items-center justify-center bg-muted min-h-[150px] p-4">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className={meal.imageDataUri ? "md:col-span-2" : "col-span-full md:col-span-3"}>
                      <CardHeader>
                        <CardTitle className="text-xl">{meal.name || 'Scanned Meal'}</CardTitle>
                        <CardDescription>
                          Added on: {new Date(meal.timestamp).toLocaleDateString()} at {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {/* <ul className="space-y-1 text-sm">
                          <li className="flex justify-between"><span>Calories:</span> <span className="font-medium">{meal.calories} kcal</span></li>
                          <li className="flex justify-between"><span>Protein:</span> <span className="font-medium">{meal.protein} g</span></li>
                          <li className="flex justify-between"><span>Carbs:</span> <span className="font-medium">{meal.carbohydrates} g</span></li>
                          <li className="flex justify-between"><span>Fat:</span> <span className="font-medium">{meal.fat} g</span></li>
                        </ul> */}
                        <p className="text-muted-foreground text-center">Nutrition Analysis Coming Soon</p>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}
      </section>
    </>
  );
}

