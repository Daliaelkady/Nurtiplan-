// ============= API SERVICE CLASS =============

export class APIService {
  constructor() {
    this.baseMealURL = 'https://www.themealdb.com/api/json/v1/1';
    this.baseProductURL = 'https://world.openfoodfacts.org/api/v0';
  }

  // ============= MEAL API METHODS =============

  async getRandomMeals(count = 25) {
    try {
      const meals = [];
      const seenIds = new Set();
      
      // Fetch random meals until we have enough unique ones
      while (meals.length < count) {
        try {
          const response = await fetch(`${this.baseMealURL}/random.php`);
          const data = await response.json();
          const meal = data.meals?.[0];
          
          if (meal && !seenIds.has(meal.idMeal)) {
            seenIds.add(meal.idMeal);
            meals.push(meal);
          }
          
          // Safety check to avoid infinite loop
          if (seenIds.size > count * 3) break;
        } catch (error) {
          console.error('Error fetching random meal:', error);
          break;
        }
      }
      
      return meals;
    } catch (error) {
      console.error('Error fetching random meals:', error);
      return [];
    }
  }

  async getMealById(id) {
    try {
      const response = await fetch(`${this.baseMealURL}/lookup.php?i=${id}`);
      const data = await response.json();
      return data.meals?.[0] || null;
    } catch (error) {
      console.error('Error fetching meal by ID:', error);
      return null;
    }
  }

  async getMealsByCategory(category) {
    try {
      const response = await fetch(`${this.baseMealURL}/filter.php?c=${category}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching meals by category:', error);
      return [];
    }
  }

  async getMealsByArea(area) {
    try {
      const response = await fetch(`${this.baseMealURL}/filter.php?a=${area}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching meals by area:', error);
      return [];
    }
  }

  async searchMeals(query) {
    try {
      const response = await fetch(`${this.baseMealURL}/search.php?s=${encodeURIComponent(query)}`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error searching meals:', error);
      return [];
    }
  }

  async getAllCategories() {
    try {
      const response = await fetch(`${this.baseMealURL}/list.php?c=list`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getAllAreas() {
    try {
      const response = await fetch(`${this.baseMealURL}/list.php?a=list`);
      const data = await response.json();
      return data.meals || [];
    } catch (error) {
      console.error('Error fetching areas:', error);
      return [];
    }
  }

  // ============= PRODUCT API METHODS =============

  async searchProducts(query) {
    try {
      const response = await fetch(
        `${this.baseProductURL}/product/${encodeURIComponent(query)}.json`
      );
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return [data.product];
      }
      
      // If single product search fails, try search API
      const searchResponse = await fetch(
        `${this.baseProductURL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&page_size=20&json=true`
      );
      const searchData = await searchResponse.json();
      return searchData.products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  async getProductByBarcode(barcode) {
    try {
      const response = await fetch(`${this.baseProductURL}/product/${barcode}.json`);
      const data = await response.json();
      
      if (data.status === 1 && data.product) {
        return data.product;
      }
      return null;
    } catch (error) {
      console.error('Error fetching product by barcode:', error);
      return null;
    }
  }

  // ============= NUTRITION CALCULATION =============

  calculateMealNutrition(meal) {
    // Extract ingredients and measurements
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({ ingredient, measure: measure || '' });
      }
    }

    // Estimate nutrition values (simplified calculation)
    // In a real app, you'd use a nutrition database
    const estimatedCalories = Math.floor(Math.random() * 300) + 200;
    const estimatedProtein = Math.floor(estimatedCalories * 0.15 / 4);
    const estimatedCarbs = Math.floor(estimatedCalories * 0.50 / 4);
    const estimatedFat = Math.floor(estimatedCalories * 0.35 / 9);

    return {
      calories: estimatedCalories,
      protein: estimatedProtein,
      carbohydrates: estimatedCarbs,
      fat: estimatedFat,
      fiber: Math.floor(estimatedCarbs * 0.1),
      sugar: Math.floor(estimatedCarbs * 0.2)
    };
  }

  extractProductNutrition(product) {
    const nutriments = product.nutriments || {};
    
    return {
      calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0),
      protein: Math.round(nutriments['proteins_100g'] || nutriments['proteins'] || 0),
      carbohydrates: Math.round(nutriments['carbohydrates_100g'] || nutriments['carbohydrates'] || 0),
      fat: Math.round(nutriments['fat_100g'] || nutriments['fat'] || 0),
      fiber: Math.round(nutriments['fiber_100g'] || nutriments['fiber'] || 0),
      sugar: Math.round(nutriments['sugars_100g'] || nutriments['sugars'] || 0)
    };
  }
}

