
/**
 * Represents the structure for a meal diary entry.
 * Includes nutritional info, image data (optional), and timestamp.
 */
export interface MealDiaryEntry {
  /**
   * The name of the meal, generated sequentially (e.g., "Meal 1").
   */
  name: string;
  /**
   * The estimated number of calories in the meal.
   */
  calories: number;
  /**
   * The estimated amount of protein in grams in the meal.
   */
  protein: number;
  /**
   * The estimated amount of carbohydrates in grams in the meal.
   */
  carbohydrates: number;
  /**
   * The estimated amount of fat in grams in the meal.
   */
  fat: number;
  /**
   * The base64 encoded image data URI of the meal. Optional, as it might not be stored in localStorage.
   */
  imageDataUri?: string;
  /**
   * The timestamp when the meal was scanned.
   */
  timestamp: Date;
}

/**
 * Represents the result returned by the (mock) meal scanning function.
 * Includes the generated meal name.
 */
interface MealScanResult {
  name: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}


/**
 * Simulates scanning a meal image and returning nutritional information.
 * Generates a sequential name based on the number of meals already scanned today.
 * @param imageBase64 - The base64 encoded image data URI (not used in mock for analysis, but useful for context).
 * @param existingDiary - An array of existing MealDiaryEntry objects to determine the next meal name.
 * @returns A promise that resolves with estimated nutritional info and a generated name.
 */
export async function scanMeal(imageBase64: string, existingDiary: MealDiaryEntry[]): Promise<MealScanResult> {
  // Simulate network delay or AI processing time
  await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay for quicker testing

  // In a real scenario, you would:
  // 1. Send imageBase64 to your AI backend (e.g., a Genkit flow).
  // 2. The backend analyzes the image and returns nutritional data.
  // 3. Handle potential errors from the AI service.

  // Mock response with random nutritional data:
  if (Math.random() < 0.05) { // Simulate occasional errors (reduced probability)
    throw new Error("Mock scan failed: Unable to analyze image.");
  }

  // Determine the meal number for today
  const today = new Date();
  const todaysMeals = existingDiary.filter(meal => {
    const mealDate = new Date(meal.timestamp);
    return mealDate.toDateString() === today.toDateString();
  });
  const nextMealNumber = todaysMeals.length + 1;
  const mealName = `Meal ${nextMealNumber}`;

  // Return the nutritional data along with the generated name.
  return {
    name: mealName,
    calories: Math.floor(Math.random() * 400) + 100, // Random calories (100-499)
    protein: Math.floor(Math.random() * 30) + 5,   // Random protein (5-34g)
    carbohydrates: Math.floor(Math.random() * 50) + 10, // Random carbs (10-59g)
    fat: Math.floor(Math.random() * 20) + 5,       // Random fat (5-24g)
  };
}

