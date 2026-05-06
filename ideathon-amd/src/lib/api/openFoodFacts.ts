export interface OpenFoodFactsProduct {
  code: string;
  product: {
    product_name?: string;
    image_url?: string;
    ingredients_text?: string;
    nutrition_grades?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      proteins_100g?: number;
      carbohydrates_100g?: number;
      fat_100g?: number;
      fiber_100g?: number;
      sugars_100g?: number;
    };
  };
  status: 0 | 1;
  status_verbose: string;
}

export interface ProductNutrition {
  name: string;
  image: string;
  ingredients: string;
  grade: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  sugar: number;
  healthScore: number;
}

export async function fetchProductByBarcode(barcode: string): Promise<ProductNutrition | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
    if (!res.ok) {
      throw new Error('Failed to fetch from OpenFoodFacts');
    }

    const data: OpenFoodFactsProduct = await res.json();
    
    if (data.status !== 1 || !data.product) {
      return null; // Product not found
    }

    const p = data.product;
    const n = p.nutriments || {};

    // Map nutrition grade (a, b, c, d, e) to a score (0-100)
    let score = 50;
    const grade = (p.nutrition_grades || "unknown").toLowerCase();
    switch (grade) {
      case 'a': score = 95; break;
      case 'b': score = 80; break;
      case 'c': score = 65; break;
      case 'd': score = 40; break;
      case 'e': score = 20; break;
      default: score = 50;
    }

    return {
      name: p.product_name || 'Unknown Product',
      image: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800',
      ingredients: p.ingredients_text || 'No ingredients listed.',
      grade: grade.toUpperCase(),
      calories: n['energy-kcal_100g'] || 0,
      protein: n.proteins_100g || 0,
      carbs: n.carbohydrates_100g || 0,
      fats: n.fat_100g || 0,
      fiber: n.fiber_100g || 0,
      sugar: n.sugars_100g || 0,
      healthScore: score,
    };
  } catch (error) {
    console.error("OpenFoodFacts API error:", error);
    return null;
  }
}
