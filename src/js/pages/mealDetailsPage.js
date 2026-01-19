export class MealDetailsPage {
  constructor(apiService, router, foodLog) {
    this.apiService = apiService;
    this.router = router;
    this.foodLog = foodLog;
    this.currentMeal = null;
  }

  async init(mealId) {
    await this.loadMealDetails(mealId);
    this.setupEventListeners();
    this.updateHeader(
      "Meal Details",
      "View recipe details and nutrition information"
    );
  }

  async loadMealDetails(mealId) {
    this.showLoading();
    try {
      const meal = await this.apiService.getMealById(mealId);
      if (!meal) {
        this.showError("Meal not found");
        return;
      }

      this.currentMeal = meal;
      this.renderMealDetails(meal);
    } catch (error) {
      console.error("Error loading meal details:", error);
      this.showError("Failed to load meal details");
    } finally {
      this.hideLoading();
    }
  }

  renderMealDetails(meal) {
    const heroImg = document.querySelector("#meal-details .relative.h-80 img");
    if (heroImg) {
      heroImg.src = meal.strMealThumb || "";
      heroImg.alt = meal.strMeal || "";
    }

    const heroTitle = document.querySelector("#meal-details h1");
    if (heroTitle) {
      heroTitle.textContent = meal.strMeal || "";
    }

    const tagsContainer = document.querySelector(
      "#meal-details .absolute.bottom-0 .flex.gap-3"
    );
    if (tagsContainer) {
      const tags = [];
      if (meal.strCategory)
        tags.push({ text: meal.strCategory, color: "emerald" });
      if (meal.strArea) tags.push({ text: meal.strArea, color: "blue" });
      if (meal.strTags) {
        const tagList = meal.strTags.split(",").slice(0, 1);
        tagList.forEach((tag) => {
          const trimmed = tag.trim();
          if (trimmed) tags.push({ text: trimmed, color: "purple" });
        });
      }

      if (tags.length > 0) {
        tagsContainer.innerHTML = tags
          .map((tag) => {
            const colorClasses = {
              emerald: "bg-emerald-500",
              blue: "bg-blue-500",
              purple: "bg-purple-500",
            };
            return `<span class="px-3 py-1 ${
              colorClasses[tag.color] || "bg-gray-500"
            } text-white text-sm font-semibold rounded-full">${
              tag.text
            }</span>`;
          })
          .join("");
      }
    }

    const nutrition = this.apiService.calculateMealNutrition(meal);
    this.renderNutrition(nutrition);

    this.renderIngredients(meal);

    this.renderInstructions(meal);

    this.renderVideo(meal);

    const logBtn = document.getElementById("log-meal-btn");
    if (logBtn) {
      logBtn.dataset.mealId = meal.idMeal;
    }
  }

  renderIngredients(meal) {
    const container = document.querySelector(
      "#meal-details .bg-white.rounded-2xl.p-6 .grid"
    );
    if (!container) return;

    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        ingredients.push({
          ingredient: ingredient.trim(),
          measure: (measure || "").trim(),
        });
      }
    }

    const countSpan = container.parentElement.querySelector("span.text-sm");
    if (countSpan) {
      countSpan.textContent = `${ingredients.length} items`;
    }

    container.innerHTML = ingredients
      .map(
        (item) => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
        <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
        <span class="text-gray-700">
          <span class="font-medium text-gray-900">${
            item.measure || ""
          }</span> ${item.ingredient}
        </span>
      </div>
    `
      )
      .join("");
  }

  renderInstructions(meal) {
    const container = document.querySelector("#meal-details .space-y-4");
    if (!container) return;

    const instructions = (meal.strInstructions || "")
      .split("\n")
      .filter((step) => step.trim());

    container.innerHTML = instructions
      .map(
        (step, index) => `
      <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
        <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
          ${index + 1}
        </div>
        <p class="text-gray-700 leading-relaxed pt-2">${step.trim()}</p>
      </div>
    `
      )
      .join("");
  }

  renderVideo(meal) {
    const iframe = document.querySelector("#meal-details iframe");
    if (iframe && meal.strYoutube) {
      const videoId = this.extractYouTubeId(meal.strYoutube);
      if (videoId) {
        iframe.src = `https://www.youtube.com/embed/${videoId}`;
      }
    }
  }

  extractYouTubeId(url) {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }

  renderNutrition(nutrition) {
    const container = document.getElementById("nutrition-facts-container");
    if (!container) return;

    const calories = nutrition.calories || 0;
    const protein = nutrition.protein || 0;
    const carbs = nutrition.carbohydrates || 0;
    const fat = nutrition.fat || 0;
    const fiber = nutrition.fiber || 0;
    const sugar = nutrition.sugar || 0;

    container.innerHTML = `
      <p class="text-sm text-gray-500 mb-4">Per serving</p>

      <div class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl">
        <p class="text-sm text-gray-600">Calories per serving</p>
        <p class="text-4xl font-bold text-emerald-600">${calories}</p>
        <p class="text-xs text-gray-500 mt-1">Total: ${calories * 4} cal</p>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span class="text-gray-700">Protein</span>
          </div>
          <span class="font-bold text-gray-900">${protein}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-emerald-500 h-2 rounded-full" style="width: ${Math.min(
            (protein / 50) * 100,
            100
          )}%"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-blue-500"></div>
            <span class="text-gray-700">Carbs</span>
          </div>
          <span class="font-bold text-gray-900">${carbs}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full" style="width: ${Math.min(
            (carbs / 250) * 100,
            100
          )}%"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-purple-500"></div>
            <span class="text-gray-700">Fat</span>
          </div>
          <span class="font-bold text-gray-900">${fat}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-purple-500 h-2 rounded-full" style="width: ${Math.min(
            (fat / 65) * 100,
            100
          )}%"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-orange-500"></div>
            <span class="text-gray-700">Fiber</span>
          </div>
          <span class="font-bold text-gray-900">${fiber}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-orange-500 h-2 rounded-full" style="width: ${Math.min(
            (fiber / 25) * 100,
            100
          )}%"></div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-pink-500"></div>
            <span class="text-gray-700">Sugar</span>
          </div>
          <span class="font-bold text-gray-900">${sugar}g</span>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-pink-500 h-2 rounded-full" style="width: ${Math.min(
            (sugar / 50) * 100,
            100
          )}%"></div>
        </div>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-100">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Vitamins & Minerals (% Daily Value)</h3>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin A</span>
            <span class="font-medium">15%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Vitamin C</span>
            <span class="font-medium">25%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Calcium</span>
            <span class="font-medium">4%</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Iron</span>
            <span class="font-medium">12%</span>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    const backBtn = document.getElementById("back-to-meals-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.router.navigate("#home");
      });
    }

    const logBtn = document.getElementById("log-meal-btn");
    if (logBtn) {
      logBtn.addEventListener("click", () => {
        this.logMeal();
      });
    }
  }

  logMeal() {
    if (!this.currentMeal) return;

    const nutrition = this.apiService.calculateMealNutrition(this.currentMeal);

    const item = {
      name: this.currentMeal.strMeal,
      type: "meal",
      image: this.currentMeal.strMealThumb,
      nutrition: nutrition,
    };

    this.foodLog.addItem(item);

    Swal.fire({
      icon: "success",
      title: "Meal Logged!",
      text: `${this.currentMeal.strMeal} has been added to your food log.`,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  showLoading() {
    const section = document.getElementById("meal-details");
    if (section) {
      const content = section.querySelector(".max-w-7xl");
      if (content) {
        content.innerHTML = `
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        `;
      }
    }
  }

  hideLoading() {}

  showError(message) {
    const section = document.getElementById("meal-details");
    if (section) {
      const content = section.querySelector(".max-w-7xl");
      if (content) {
        content.innerHTML = `
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <p class="text-gray-500 text-lg">${message}</p>
            <button onclick="window.app.router.navigate('#home')" class="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
              Back to Recipes
            </button>
          </div>
        `;
      }
    }
  }

  updateHeader(title, subtitle) {
    const headerTitle = document.querySelector("#header h1");
    const headerSubtitle = document.querySelector("#header p");

    if (headerTitle) headerTitle.textContent = title;
    if (headerSubtitle) headerSubtitle.textContent = subtitle;
  }
}
