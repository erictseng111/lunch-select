// FIX: Implement the full Gemini service for interacting with the Gemini API.
import { GoogleGenAI, Type } from "@google/genai";

// FIX: Use environment variable for API key as per security best practices and guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// Define the response schema for cuisine suggestions.
const cuisineSuggestionsSchema = {
  type: Type.OBJECT,
  properties: {
    cuisines: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'A list of 6 diverse and popular lunch cuisine types.',
    },
  },
  required: ['cuisines'],
};

/**
 * Generates a list of cuisine suggestions based on the current location.
 * @param location A string describing the current location (e.g., "Taipei, Taiwan").
 * @returns A promise that resolves to an array of cuisine strings.
 */
export const suggestCuisines = async (location: string): Promise<string[]> => {
  try {
    const prompt = `Suggest 6 diverse and popular lunch cuisine types for a user in ${location}. Focus on common and appealing options. Return the list in a JSON object with a "cuisines" key. For example: { "cuisines": ["日式料理", "Italian", "Mexican"] }. Respond in Traditional Chinese.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: cuisineSuggestionsSchema,
      },
    });

    // FIX: Trim whitespace from the response text before parsing to prevent JSON errors.
    const jsonString = response.text.trim();
    const parsed = JSON.parse(jsonString);
    return parsed.cuisines || [];

  } catch (error) {
    console.error("Error suggesting cuisines:", error);
    // Return a default list in case of an error for a better user experience.
    return ["日式料理", "台式料理", "美式料理", "義式料理", "泰式料理", "韓式料理"];
  }
};

/**
 * Generates a descriptive summary for a given restaurant.
 * @param restaurantName The name of the restaurant.
 * @param restaurantAddress The address of the restaurant.
 * @returns A promise that resolves to a string with the restaurant's description.
 */
export const generateRestaurantDetails = async (restaurantName: string, restaurantAddress: string): Promise<string> => {
  try {
    // FIX: Corrected variable name from `address` to `restaurantAddress` in prompt string.
    const prompt = `Generate a compelling and concise description (2-3 sentences) for a restaurant called "${restaurantName}" located at "${restaurantAddress}". Highlight its specialty, atmosphere, or what makes it a great lunch spot. Write in Traditional Chinese.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error(`Error generating details for ${restaurantName}:`, error);
    return "無法產生餐廳描述。請稍後再試。";
  }
};