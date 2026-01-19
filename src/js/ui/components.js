export class MealCard {
  static render(meal) {
    const image =
      meal.strMealThumb || "https://via.placeholder.com/400x300?text=No+Image";
    const name = meal.strMeal || "Unknown Meal";
    const category = meal.strCategory || "Unknown";
    const area = meal.strArea || "Unknown";
    const mealId = meal.idMeal || meal.id || "";

    return `
      <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-meal-id="${mealId}">
        <div class="relative h-48 overflow-hidden">
          <img
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            src="${image}"
            alt="${name}"
            loading="lazy"
          />
          <div class="absolute bottom-3 left-3 flex gap-2">
            <span class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700">
              ${category}
            </span>
            <span class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white">
              ${area}
            </span>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
            ${name}
          </h3>
          <p class="text-xs text-gray-600 mb-3 line-clamp-2">
            Delicious recipe to try!
          </p>
          <div class="flex items-center justify-between text-xs">
            <span class="font-semibold text-gray-900">
              <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
              ${category}
            </span>
            <span class="font-semibold text-gray-500">
              <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
              ${area}
            </span>
          </div>
        </div>
      </div>
    `;
  }
}

export class ProductCard {
  static render(product) {
    const image =
      product.image_url ||
      product.image_front_url ||
      "https://via.placeholder.com/400x300?text=No+Image";
    const name =
      product.product_name || product.product_name_en || "Unknown Product";
    const brand = product.brands || "Unknown Brand";
    const barcode = product.code || "";
    const nutriScore = product.nutriscore_grade?.toUpperCase() || "";
    const novaGroup = product.nova_group || "";

    const nutriments = product.nutriments || {};
    const protein = Math.round(
      nutriments["proteins_100g"] || nutriments["proteins"] || 0
    );
    const carbs = Math.round(
      nutriments["carbohydrates_100g"] || nutriments["carbohydrates"] || 0
    );
    const fat = Math.round(nutriments["fat_100g"] || nutriments["fat"] || 0);
    const sugar = Math.round(
      nutriments["sugars_100g"] || nutriments["sugars"] || 0
    );
    const calories = Math.round(
      nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0
    );
    const weight = product.quantity || "100g";

    const nutriScoreColors = {
      A: "bg-green-500",
      B: "bg-lime-500",
      C: "bg-yellow-500",
      D: "bg-orange-500",
      E: "bg-red-500",
    };

    return `
      <div class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group" data-barcode="${barcode}">
        <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
            src="${image}"
            alt="${name}"
            loading="lazy"
          />
          ${
            nutriScore
              ? `
            <div class="absolute top-2 left-2 ${
              nutriScoreColors[nutriScore] || "bg-gray-500"
            } text-white text-xs font-bold px-2 py-1 rounded uppercase">
              Nutri-Score ${nutriScore}
            </div>
          `
              : ""
          }
          ${
            novaGroup
              ? `
            <div class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" title="NOVA ${novaGroup}">
              ${novaGroup}
            </div>
          `
              : ""
          }
        </div>
        <div class="p-4">
          <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
            ${brand}
          </p>
          <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
            ${name}
          </h3>
          <div class="flex items-center gap-3 text-xs text-gray-500 mb-3">
            <span><i class="fa-solid fa-weight-scale mr-1"></i>${weight}</span>
            <span><i class="fa-solid fa-fire mr-1"></i>${calories} kcal/100g</span>
          </div>
          <div class="grid grid-cols-4 gap-1 text-center">
            <div class="bg-emerald-50 rounded p-1.5">
              <p class="text-xs font-bold text-emerald-700">${protein}g</p>
              <p class="text-[10px] text-gray-500">Protein</p>
            </div>
            <div class="bg-blue-50 rounded p-1.5">
              <p class="text-xs font-bold text-blue-700">${carbs}g</p>
              <p class="text-[10px] text-gray-500">Carbs</p>
            </div>
            <div class="bg-purple-50 rounded p-1.5">
              <p class="text-xs font-bold text-purple-700">${fat}g</p>
              <p class="text-[10px] text-gray-500">Fat</p>
            </div>
            <div class="bg-orange-50 rounded p-1.5">
              <p class="text-xs font-bold text-orange-700">${sugar}g</p>
              <p class="text-[10px] text-gray-500">Sugar</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}
