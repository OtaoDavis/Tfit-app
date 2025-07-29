
/**
 * Defines the specific types of meals that can be logged.
 */
export type MealType = "Breakfast" | "Morning Snack" | "Lunch" | "Afternoon Snack" | "Dinner" | "Evening Snack";

/**
 * Represents the structure for a meal diary entry.
 * Includes nutritional info, meal type, image file URI (optional), and timestamp.
 */
export interface MealDiaryEntry {
  /**
   * The name of the meal, identified by the user or AI.
   */
  name: string;
  /**
   * The type of the meal, e.g., "Breakfast", "Lunch".
   */
  mealType: MealType;
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
   * The URI (path) to the image file stored on the device or a data URI for web. Optional.
   */
  imageFileUri?: string | null;
  /**
   * The timestamp when the meal was scanned.
   */
  timestamp: Date;
}

/**
 * Represents the result returned by the (mock) meal scanning function.
 * Includes the generated meal name and type.
 */
interface MealScanResult {
  name: string;
  mealType: MealType;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
}


/**
 * Simulates scanning a meal image and returning nutritional information.
 * @param imageBase64 - The base64 encoded image data URI (not used in mock for analysis, but required for the flow).
 * @param mealType - The type of meal being scanned (e.g., "Breakfast").
 * @returns A promise that resolves with estimated nutritional info.
 */
export async function scanMeal(imageBase64: string, mealType: MealType): Promise<MealScanResult> {
  // Simulate network delay or AI processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  // In a real scenario, you would send the image and context (mealType) to an AI model.
  // The model would return a plausible name and nutritional data.
  // For now, we mock a response.
  if (Math.random() < 0.05) { 
    throw new Error("Mock scan failed: Unable to analyze image.");
  }

  // Return the nutritional data along with a mock name and the provided mealType.
  return {
    name: `${mealType}`, // A more descriptive mock name
    mealType: mealType,
    calories: Math.floor(Math.random() * 400) + 100, // Random calories (100-499)
    protein: Math.floor(Math.random() * 30) + 5,   // Random protein (5-34g)
    carbohydrates: Math.floor(Math.random() * 50) + 10, // Random carbs (10-59g)
    fat: Math.floor(Math.random() * 20) + 5,       // Random fat (5-24g)
  };
}
