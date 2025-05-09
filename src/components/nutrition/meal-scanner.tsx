"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { scanMeal, type Meal } from '@/services/meal-scanner';
import { AlertCircle, CheckCircle2, Loader2, ScanLine, LogIn } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth-context';
import { LoginPrompt } from '@/components/common/login-prompt';
import { useToast } from '@/hooks/use-toast';

const MEAL_SCANNER_TRIAL_USED_KEY = 'mealScannerTrialUsed_v1';

export function MealScanner() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mealInfo, setMealInfo] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [trialAvailable, setTrialAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const trialUsed = localStorage.getItem(MEAL_SCANNER_TRIAL_USED_KEY);
      setTrialAvailable(!trialUsed);
    }
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setImagePreview(reader.result as string);
        setMealInfo(null); // Reset meal info
        setError(null);
        setShowLoginPrompt(false); // Reset prompt
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScanMeal = async () => {
    if (!imageBase64) {
      setError('Please select an image first.');
      return;
    }

    setError(null);
    setMealInfo(null);
    setShowLoginPrompt(false);

    if (user) {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        const result = await scanMeal(imageBase64);
        setMealInfo(result);
      } catch (err) {
        setError('Failed to scan meal. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Not logged in, check trial status
      const trialUsed = localStorage.getItem(MEAL_SCANNER_TRIAL_USED_KEY);
      if (!trialUsed) {
        setIsLoading(true);
        try {
          // Perform the trial scan
          await new Promise(resolve => setTimeout(resolve, 1500));
          const result = await scanMeal(imageBase64); // Mock scan
          setMealInfo(result);
          localStorage.setItem(MEAL_SCANNER_TRIAL_USED_KEY, 'true');
          setTrialAvailable(false); // Update state
          toast({
            title: "Trial Scan Successful!",
            description: "Log in to scan more and save your meal history.",
            variant: "default",
          });
        } catch (err) {
          setError('Trial scan failed. Please try again.');
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Trial already used
        setShowLoginPrompt(true);
      }
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

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScanLine className="h-6 w-6 text-primary" />
          Scan Your Meal
        </CardTitle>
        <CardDescription>
          {user ? "Upload a picture of your food to get nutritional information." : 
           trialAvailable ? "Upload a picture to see its nutritional info." :
           "Log in to scan meals and track your nutrition."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showLoginPrompt && (
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            className="file:text-primary file:font-semibold hover:file:bg-primary/10"
            aria-label="Upload meal image"
            disabled={showLoginPrompt}
          />
        )}
        
        {imagePreview && !showLoginPrompt && (
          <div className="relative group aspect-video w-full max-w-md mx-auto rounded-md overflow-hidden border border-muted">
            <Image src={imagePreview} alt="Meal preview" layout="fill" objectFit="cover" data-ai-hint="food meal" />
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Remove image"
            >
              Remove
            </Button>
          </div>
        )}
        
        {showLoginPrompt ? (
          <LoginPrompt 
            featureName="Meal Scanner"
            message="Please log in to continue scanning meals and save your data."
          />
        ) : (
          <>
            {error && (
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
                  <CardDescription>Estimated values for: <strong>{mealInfo.name}</strong></CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between"><span>Calories:</span> <span className="font-semibold">{mealInfo.calories} kcal</span></li>
                    <li className="flex justify-between"><span>Protein:</span> <span className="font-semibold">{mealInfo.protein} g</span></li>
                    <li className="flex justify-between"><span>Carbohydrates:</span> <span className="font-semibold">{mealInfo.carbohydrates} g</span></li>
                    <li className="flex justify-between"><span>Fat:</span> <span className="font-semibold">{mealInfo.fat} g</span></li>
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {!showLoginPrompt && (
          <Button 
            onClick={handleScanMeal} 
            disabled={!imageBase64 || isLoading} 
            className="w-full"
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
        )}
         {showLoginPrompt && (
           <Button onClick={() => {/* Logic to navigate to login, handled by LoginPrompt */}} className="w-full" asChild>
             <a href="/login"> {/* Or use router.push('/login') from LoginPrompt itself */}
               <LogIn className="mr-2 h-4 w-4" />
               Login to Scan Meals
             </a>
           </Button>
        )}
      </CardFooter>
    </Card>
  );
}
