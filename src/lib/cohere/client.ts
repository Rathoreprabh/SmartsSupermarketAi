import { CohereClient } from 'cohere-ai';

// Initialize Cohere client (ONLY ONCE)
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY!,
});

// ============================================
// CHAT WITH ASSISTANT
// ============================================
export async function chatWithAssistant(message: string, chatHistory: any[] = []) {
  try {
    console.log('💬 Calling Cohere Chat API...');
    
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: message,
      chatHistory: chatHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.content,
      })),
      temperature: 0.7,
      preamble: `You are a helpful AI shopping assistant for a Smart Supermarket. Your name is ShopBot.

Your capabilities:
- Help users find products
- Suggest recipes and meal ideas
- Create shopping lists
- Answer questions about products, prices, and availability
- Provide nutritional advice
- Help with budget planning

Be friendly, conversational, and helpful. Keep responses concise but informative.
When suggesting products, mention the emoji icon and price.
Always be enthusiastic about helping with grocery shopping!`,
    });

    console.log('✅ Cohere response received');
    return {
      success: true,
      message: response.text,
    };
  } catch (error: any) {
    console.error('❌ Cohere chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response',
      message: "I'm having trouble connecting right now. Please try again!",
    };
  }
}

// ============================================
// SMART CHAT WITH ACTIONS
// ============================================
export async function chatWithActions(
  message: string, 
  chatHistory: any[] = [],
  availableProducts: any[] = []
) {
  try {
    console.log('💬 Calling Cohere Chat API with actions...');
    
    // Build product context for AI
    const productContext = availableProducts.length > 0 
      ? `\nAvailable products in our store:\n${availableProducts.map(p => 
          `- ${p.name} (${p.image}) - $${p.price} - ID: ${p.id}`
        ).join('\n')}`
      : '';

    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: message,
      chatHistory: chatHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'USER' : 'CHATBOT',
        message: msg.content,
      })),
      temperature: 0.7,
      preamble: `You are ShopBot, an AI shopping assistant for Smart Supermarket with special action capabilities.

${productContext}

CRITICAL INSTRUCTIONS - ACTIONS:
When users want to perform actions, you MUST include a special JSON block in your response:

1. NAVIGATION: "take me to cart", "show products", "go to orders"," "open meal planner", "dashboard","empty my cart"
   Response format: "Sure! <ACTION>{"type":"navigate","page":"cart"}</ACTION>"
   Valid pages: cart, products, orders, meal-planner, dashboard

2. PRODUCT SEARCH: "I need apples", "show me milk"
   Response format: "Let me find that! <ACTION>{"type":"search","query":"apples"}</ACTION>"

3. ADD TO CART: "add 2 apples", "put 3 milk in cart"
   Response format: "Adding to cart! <ACTION>{"type":"addToCart","productId":"xxx","quantity":2,"productName":"Organic Apples"}</ACTION>"

4. VIEW PRODUCT: "show me details of apples"
   Response format: "Here's the product! <ACTION>{"type":"viewProduct","productId":"xxx"}</ACTION>"

EXAMPLES:
User: "take me to my cart"
You: "Sure! Let me open your cart for you. <ACTION>{"type":"navigate","page":"cart"}</ACTION>"

User: "I need organic apples"
You: "Let me find organic apples for you! <ACTION>{"type":"search","query":"organic apples"}</ACTION>"

User: "add 2 apples to cart"
You: "Great choice! Adding 2 Organic Apples to your cart. <ACTION>{"type":"addToCart","productId":"product-id-here","quantity":2,"productName":"Organic Apples"}</ACTION>"

IMPORTANT:
- Always include the <ACTION> tags when performing actions
- Be conversational and friendly before the action
- Only include ONE action per response
- Match product names to the available products list
- If product not found, tell user and don't include action tags

Your normal capabilities:
- Help users find products
- Suggest recipes and meal ideas
- Answer questions about products, prices, availability
- Provide nutritional advice
- Help with budget planning

Be enthusiastic and helpful!`,
    });

    console.log('✅ Cohere response received');
    console.log('📤 Response:', response.text);

    return {
      success: true,
      message: response.text,
    };
  } catch (error: any) {
    console.error('❌ Cohere chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to get response',
      message: "I'm having trouble connecting right now. Please try again!",
    };
  }
}

// ============================================
// TYPES FOR MEAL SUGGESTIONS
// ============================================
export interface MealSuggestionInput {
  dietaryRestrictions?: string[];
  favoriteCuisines?: string[];
  allergies?: string[];
  dislikedIngredients?: string[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  caloriePreference?: 'low' | 'medium' | 'high';
  numberOfMeals?: number;
  prepTimeMax?: number;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface GeneratedMeal {
  mealName: string;
  description: string;
  cuisineType: string;
  mealType: string;
  preparationTime: number;
  servings: number;
  calories: number;
  difficultyLevel: string;
  ingredients: Array<{
    name: string;
    quantity: string;
  }>;
  recipeSteps: string[];
  dietaryTags: string[];
}

// ============================================
// GENERATE MEAL SUGGESTIONS
// ============================================
export async function generateMealSuggestions(
  input: MealSuggestionInput
): Promise<GeneratedMeal[]> {
  const {
    dietaryRestrictions = [],
    favoriteCuisines = [],
    allergies = [],
    dislikedIngredients = [],
    mealType = 'dinner',
    caloriePreference = 'medium',
    numberOfMeals = 3,
    prepTimeMax = 60,
    skillLevel = 'intermediate',
  } = input;

  const message = `You are a professional chef and meal planner. Generate ${numberOfMeals} unique ${mealType} meal suggestions based on these preferences:

Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
Favorite Cuisines: ${favoriteCuisines.join(', ') || 'Any'}
Allergies: ${allergies.join(', ') || 'None'}
Avoid Ingredients: ${dislikedIngredients.join(', ') || 'None'}
Calorie Level: ${caloriePreference}
Max Prep Time: ${prepTimeMax} minutes
Skill Level: ${skillLevel}

IMPORTANT: You must respond with ONLY valid JSON in this EXACT format, with no additional text before or after:

{
  "meals": [
    {
      "mealName": "Creamy Tuscan Chicken",
      "description": "Tender chicken in a rich cream sauce with sun-dried tomatoes and spinach",
      "cuisineType": "Italian",
      "mealType": "${mealType}",
      "preparationTime": 30,
      "servings": 4,
      "calories": 450,
      "difficultyLevel": "medium",
      "ingredients": [
        {"name": "chicken breast", "quantity": "1 pound"},
        {"name": "heavy cream", "quantity": "1 cup"},
        {"name": "spinach", "quantity": "2 cups"}
      ],
      "recipeSteps": [
        "Season and sear chicken until golden",
        "Add garlic and sun-dried tomatoes",
        "Pour in cream and simmer",
        "Add spinach and cook until wilted"
      ],
      "dietaryTags": ["gluten-free"]
    }
  ]
}

Generate ${numberOfMeals} diverse meals matching the preferences. Return ONLY the JSON, no markdown, no explanations.`;

  try {
    console.log('🤖 Calling Cohere Chat API with command-a-03-2025 model...');
    
    const response = await cohere.chat({
      model: 'command-a-03-2025',
      message: message,
      temperature: 0.7,
      preamble: 'You are a helpful meal planning assistant that always responds with valid JSON.',
    });

    const generatedText = response.text.trim();
    
    console.log('📥 Cohere Response (first 300 chars):', generatedText.substring(0, 300));

    let cleanedText = generatedText;
    if (cleanedText.includes('```')) {
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from response');
      console.error('Full response:', generatedText);
      throw new Error('Failed to parse meal suggestions from AI response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.meals || !Array.isArray(parsed.meals)) {
      console.error('❌ Invalid meal format in response');
      throw new Error('Invalid meal format from AI');
    }
    
    console.log(`✅ Successfully generated ${parsed.meals.length} meals`);
    
    return parsed.meals;
  } catch (error: any) {
    console.error('❌ Error generating meal suggestions:', error);
    
    if (error.message?.includes('api_key') || error.statusCode === 401) {
      throw new Error('Invalid Cohere API key. Please check your .env.local file');
    }
    
    if (error.statusCode === 404) {
      throw new Error('Cohere model not found. Please check if you have access to command-r model.');
    }
    
    if (error instanceof SyntaxError) {
      throw new Error('AI returned invalid JSON. Please try again.');
    }
    
    throw new Error(error.message || 'Failed to generate meal suggestions');
  }
}

// ============================================
// MATCH INGREDIENTS TO PRODUCTS
// ============================================
export async function matchIngredientsToProducts(
  ingredients: Array<{ name: string; quantity: string }>
): Promise<Array<{ ingredientName: string; quantity: string; productId: string | null }>> {
  return ingredients.map(ing => ({
    ingredientName: ing.name,
    quantity: ing.quantity,
    productId: null,
  }));
}