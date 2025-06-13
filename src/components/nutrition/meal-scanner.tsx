
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { scanMeal, type MealDiaryEntry } from '@/services/meal-scanner'; // Ensure type is imported
import { AlertCircle, CheckCircle2, Loader2, ScanLine, LogIn, Camera, Upload, Trash2, Smartphone, ImageIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { format } from 'date-fns';
import { Camera as CapacitorCameraPlugin, CameraResultType, CameraSource, Photo as CapacitorPhoto, CameraPermissionState } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

const MEAL_SCANNER_TRIAL_USED_KEY = 'mealScannerTrialUsed_v1';
const MEAL_DIARY_KEY = 'mealDiary_v2_files';

export function MealScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImageFileUri, setCurrentImageFileUri] = useState<string | null>(null);

  const [mealInfo, setMealInfo] = useState<Omit<MealDiaryEntry, 'imageFileUri' | 'timestamp'> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(true);

  const [scanMode, setScanMode] = useState<'upload' | 'camera'>('upload');
  const [mealDiary, setMealDiary] = useState<MealDiaryEntry[]>([]);

  const saveImageToDevice = async (dataUrl: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform() || !dataUrl.startsWith('data:image')) {
      if (Capacitor.isNativePlatform() && !dataUrl.startsWith('data:image')) {
         toast({ title: "Save Error", description: "Invalid image data for saving.", variant: "destructive" });
         return null;
      }
      return dataUrl;
    }

    try {
      const fileName = `meal_${new Date().getTime()}.jpeg`;
      const base64Data = dataUrl.split(',')[1];

      const result = await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Data,
      });

      const webUri = Capacitor.convertFileSrc(result.uri);
      setCurrentImageFileUri(webUri);
      return webUri;

    } catch (e: any) {
      console.error('Unable to save image to device', e);
      toast({
        title: 'Save Error',
        description: `Could not save image: ${e.message || 'Unknown error'}`,
        variant: 'destructive',
      });
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
            calories: Number(meal.calories) || 0,
            protein: Number(meal.protein) || 0,
            carbohydrates: Number(meal.carbohydrates) || 0,
            fat: Number(meal.fat) || 0,
            timestamp: new Date(meal.timestamp),
            imageFileUri: meal.imageFileUri,
          }));
          setMealDiary(loadedMealDiary.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
        } catch (e) {
          console.error("Failed to parse meal diary from localStorage", e);
          setMealDiary([]);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storableMealDiary = mealDiary.map(meal => {
        return {
          ...meal,
          calories: Number(meal.calories) || 0,
          protein: Number(meal.protein) || 0,
          carbohydrates: Number(meal.carbohydrates) || 0,
          fat: Number(meal.fat) || 0,
          timestamp: meal.timestamp.toISOString(),
          imageFileUri: meal.imageFileUri,
        };
      });
      try {
        if (storableMealDiary.length > 0) {
          localStorage.setItem(MEAL_DIARY_KEY, JSON.stringify(storableMealDiary));
        } else {
          localStorage.removeItem(MEAL_DIARY_KEY);
        }
      } catch (e: any) {
        console.error("Error saving meal diary to localStorage:", e);
        toast({
            title: 'Diary Save Error',
            description: 'Could not save meal diary updates. Storage might be full.',
            variant: 'destructive',
        });
      }
    }
  }, [mealDiary, toast]);


  useEffect(() => {
    setShowLoginPrompt(false);
  }, [user]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const result = reader.result as string;
        setImageBase64(result);
        setImagePreview(result);
        setCurrentImageFileUri(null);

        if (Capacitor.isNativePlatform()) {
          await saveImageToDevice(result);
        } else {
          setCurrentImageFileUri(result);
        }

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
         if (typeof CapacitorCameraPlugin.requestPermissions === 'function') {
            permissions = await CapacitorCameraPlugin.requestPermissions();
         } else {
           return true;
         }
      } else {
        permissions = await CapacitorCameraPlugin.checkPermissions();
        if (permissions.camera !== 'granted' || permissions.photos !== 'granted') {
          permissions = await CapacitorCameraPlugin.requestPermissions();
        }
      }

      const cameraGranted = permissions.camera === 'granted' || permissions.camera === 'limited';
      const photosGrantedOnNative = Capacitor.getPlatform() !== 'web' ? (permissions.photos === 'granted' || permissions.photos === 'limited') : true;

      if (cameraGranted && photosGrantedOnNative) {
        return true;
      }

      let message = 'Camera and/or photos permission denied. Please enable access in your device settings.';
       if (!cameraGranted){
          message = 'Camera permission was not granted.'
      } else if (!photosGrantedOnNative){
          message = 'Photos permission was not granted. This might affect saving images.'
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
       toast({ variant: 'destructive', title: 'Camera Not Available', description: 'Camera not supported.' });
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
        setImageBase64(photo.dataUrl);
        setImagePreview(photo.dataUrl);
        setCurrentImageFileUri(null);
        await saveImageToDevice(photo.dataUrl);
        setMealInfo(null);
        setError(null);
        setShowLoginPrompt(false);
      } else {
        setError("Failed to capture image. No data received.");
         toast({ variant: 'destructive', title: 'Capture Error', description: 'No image data received.' });
      }
    } catch (e: any) {
        if (e.message && (e.message.toLowerCase().includes('cancelled') || e.message.toLowerCase().includes('user cancelled'))) {
          toast({ title: 'Camera Cancelled', description: 'Image capture was cancelled.' });
        } else {
          setError(`Error taking picture: ${e.message || 'Unknown error'}`);
          toast({ variant: 'destructive', title: 'Camera Error', description: `Could not take picture: ${e.message || 'Unknown error'}`});
        }
      console.error('Error taking picture with Capacitor Camera:', e);
    }
  };

  const handleRemoveImage = () => {
    setImageBase64(null);
    setImagePreview(null);
    setCurrentImageFileUri(null);
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
        toast({ title: "Login Required", description: "Trial used. Please log in.", variant: "default" })
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
        imageFileUri: currentImageFileUri,
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
          toast({ title: "Trial Scan Successful!", description: "Used one free scan. Log in for more." });
      } else {
         toast({ title: "Scan Successful!", description: "Nutritional info added to your diary." });
      }

    } catch (err: any) {
      setError(`Failed to scan meal: ${err.message || 'An unknown error occurred'}`);
      toast({ title: "Scan Error", description: `Could not analyze meal. ${err.message || ''}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };


  const toggleScanMode = () => {
    handleRemoveImage();
    setScanMode(prevMode => prevMode === 'upload' ? 'camera' : 'upload');
  };

  const canScan = imagePreview && (user || trialAvailable);

  const groupMealsByDate = (meals: MealDiaryEntry[]): Record<string, MealDiaryEntry[]> => {
    return meals.reduce((acc, meal) => {
      const mealTimestamp = meal.timestamp instanceof Date ? meal.timestamp : new Date(meal.timestamp);
      // 'en-CA' gives YYYY-MM-DD format which is good for sorting and consistency
      const dateKey = mealTimestamp.toLocaleDateString('en-CA'); 
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(meal);
      return acc;
    }, {} as Record<string, MealDiaryEntry[]>);
  };

  const groupedMeals = groupMealsByDate(mealDiary);
  const sortedDates = Object.keys(groupedMeals).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());


  return (
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ScanLine className="h-6 w-6 text-primary" />
              Add To Meal Diary
            </div>
            {Capacitor.isPluginAvailable('Camera') && Capacitor.isNativePlatform() && (
              <Button variant="outline" size="sm" onClick={toggleScanMode} disabled={isLoading}>
                {scanMode === 'camera' ? <Upload className="mr-2 h-4 w-4" /> : <Camera className="mr-2 h-4 w-4" />}
                {scanMode === 'camera' ? 'Switch to Upload' : 'Use Phone Camera'}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
             {user ? `Use the ${scanMode === 'camera' && Capacitor.isNativePlatform() ? 'phone camera' : 'uploader'} to get nutritional information.` :
             trialAvailable ? `Try one scan for free! ${scanMode === 'camera' && Capacitor.isNativePlatform() ? 'Take a picture with your phone' : 'Upload an image'} to see its nutritional info.` :
             "Log in to scan meals and track your nutrition."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showLoginPrompt && (
            <>
              {(scanMode === 'upload' || !Capacitor.isNativePlatform()) && !imagePreview && (
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
              {scanMode === 'camera' && Capacitor.isNativePlatform() && !imagePreview && (
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
                     <p className="text-muted-foreground text-center">Nutrition Analysis Coming Soon</p>
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
              title={!imagePreview ? "Select an image first" : (!user && !trialAvailable) ? "Log in or use free trial" : "Scan Meal"}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                   Scan Meal {(trialAvailable && !user) ? "" : ""}
                </>
              )}
            </Button>
           ) : (
             <Button onClick={() => {
                if (typeof window !== 'undefined') window.location.href = '/login';
              }} className="w-full">
                 <LogIn className="mr-2 h-4 w-4" />
                 Login to Scan Meals
             </Button>
           )}
        </CardFooter>
      </Card>

      <Separator className="my-8" />

      <section id="meal-history" className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 text-foreground">Meal History</h3>
        {mealDiary.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">No meals scanned yet. Use the scanner above to add your meals!</p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="multiple" className="w-full space-y-2">
            {sortedDates.map(dateKey => (
              <AccordionItem value={dateKey} key={dateKey} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 text-base font-medium">
                  {format(new Date(dateKey + 'T00:00:00'), "MMMM d, yyyy (eeee)")}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-4 border-t bg-background">
                    {groupedMeals[dateKey]
                      .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) 
                      .map((meal, index) => (
                      <Card key={`${meal.timestamp.toISOString()}-${index}`} className="shadow-sm overflow-hidden">
                        <div className="md:flex">
                          {meal.imageFileUri ? (
                            <div className="md:w-1/3 relative aspect-video md:aspect-square">
                              <Image
                                src={meal.imageFileUri}
                                alt={meal.name || 'Scanned meal'}
                                layout="fill"
                                objectFit="cover"
                                data-ai-hint="food delicious"
                                unoptimized={Capacitor.isNativePlatform()}
                              />
                            </div>
                          ) : (
                             <div className="md:w-1/3 flex items-center justify-center bg-muted p-4 aspect-video md:aspect-square">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                          )}
                          <div className="p-4 md:w-2/3">
                            <CardHeader className="p-0 pb-2">
                              <CardTitle className="text-lg">{meal.name || 'Scanned Meal'}</CardTitle>
                              <CardDescription className="text-xs">
                                {format(new Date(meal.timestamp), "p")} {/* Time e.g., 2:30 PM */}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                              {/* <ul className="space-y-0.5 text-sm">
                                <li className="flex justify-between"><span>Calories:</span> <span className="font-medium">{Number(meal.calories).toFixed(0)} kcal</span></li>
                                <li className="flex justify-between"><span>Protein:</span> <span className="font-medium">{Number(meal.protein).toFixed(1)} g</span></li>
                                <li className="flex justify-between"><span>Carbs:</span> <span className="font-medium">{Number(meal.carbohydrates).toFixed(1)} g</span></li>
                                <li className="flex justify-between"><span>Fat:</span> <span className="font-medium">{Number(meal.fat).toFixed(1)} g</span></li>
                              </ul> */}
                              <p className="text-muted-foreground text-center">Nutrition Analysis Coming Soon</p>
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    ))}
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

