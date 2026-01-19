import { MealCard } from "../ui/components.js";

export class HomePage {
  constructor(apiService, router, foodLog) {
    this.apiService = apiService;
    this.router = router;
    this.foodLog = foodLog;
    this.meals = [];
    this.filteredMeals = [];
    this.currentFilter = { type: "all", value: null };
  }

  async init() {
    await this.loadMeals();
    this.setupEventListeners();
    this.updateHeader(
      "Meals & Recipes",
      "Discover delicious and nutritious recipes tailored for you"
    );
  }

  async loadMeals() {
    this.showLoading();
    try {
      this.meals = await this.apiService.getRandomMeals(25);
      this.filteredMeals = [...this.meals];
      this.renderMeals();
      this.loadCategories();
      this.loadAreas();
    } catch (error) {
      console.error("Error loading meals:", error);
      this.showError("Failed to load meals. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  async loadCategories() {
    try {
      const categories = await this.apiService.getAllCategories();
      this.renderCategories(categories);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async loadAreas() {
    try {
      const areas = await this.apiService.getAllAreas();
      this.renderAreaFilters(areas);
    } catch (error) {
      console.error("Error loading areas:", error);
    }
  }

  renderMeals() {
    const grid = document.getElementById("recipes-grid");
    if (!grid) return;

    const countElement = document.getElementById("recipes-count");
    if (countElement) {
      countElement.textContent = `Showing ${this.filteredMeals.length} recipes`;
    }

    if (this.filteredMeals.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No recipes found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredMeals
      .map((meal) => MealCard.render(meal))
      .join("");

    grid.querySelectorAll(".recipe-card").forEach((card) => {
      card.addEventListener("click", () => {
        const mealId = card.dataset.mealId;
        this.router.navigate(`#meal/${mealId}`);
      });
    });
  }

  renderCategories(categories) {
    const grid = document.getElementById("categories-grid");
    if (!grid) return;

    const categoryIcons = {
      Beef: "fa-drumstick-bite",
      Chicken: "fa-drumstick-bite",
      Dessert: "fa-ice-cream",
      Lamb: "fa-drumstick-bite",
      Pasta: "fa-bowl-food",
      Pork: "fa-drumstick-bite",
      Seafood: "fa-fish",
      Side: "fa-utensils",
      Starter: "fa-plate-wheat",
      Vegan: "fa-leaf",
      Vegetarian: "fa-carrot",
      Breakfast: "fa-bacon",
      Goat: "fa-drumstick-bite",
      Miscellaneous: "fa-utensils",
    };

    grid.innerHTML = categories
      .slice(0, 12)
      .map((cat) => {
        const icon = categoryIcons[cat.strCategory] || "fa-utensils";
        return `
        <div class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group" data-category="${cat.strCategory}">
          <div class="flex items-center gap-2.5">
            <div class="text-white w-9 h-9 bg-gradient-to-br from-emerald-400 to-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
              <i class="fa-solid ${icon}"></i>
            </div>
            <div>
              <h3 class="text-sm font-bold text-gray-900">${cat.strCategory}</h3>
            </div>
          </div>
        </div>
      `;
      })
      .join("");

    grid.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("click", () => {
        const category = card.dataset.category;
        this.filterByCategory(category);
      });
    });
  }

  renderAreaFilters(areas) {
    const filterContainer = document.querySelector(
      "#search-filters-section .flex.gap-3"
    );
    if (!filterContainer) return;

    const allBtn = filterContainer.querySelector("button:first-child");
    filterContainer.innerHTML = "";
    if (allBtn) {
      filterContainer.appendChild(allBtn);
    }

    areas.slice(0, 10).forEach((area) => {
      const btn = document.createElement("button");
      btn.className =
        "area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
      btn.textContent = area.strArea;
      btn.dataset.area = area.strArea;
      btn.addEventListener("click", () => {
        this.filterByArea(area.strArea);
      });
      filterContainer.appendChild(btn);
    });
  }

  async filterByCategory(category) {
    this.showLoading();
    try {
      const meals = await this.apiService.getMealsByCategory(category);
      this.filteredMeals = meals;
      this.currentFilter = { type: "category", value: category };
      this.renderMeals();
      this.updateFilterButtons("category", category);
    } catch (error) {
      console.error("Error filtering by category:", error);
    } finally {
      this.hideLoading();
    }
  }

  async filterByArea(area) {
    this.showLoading();
    try {
      const meals = await this.apiService.getMealsByArea(area);
      this.filteredMeals = meals;
      this.currentFilter = { type: "area", value: area };
      this.renderMeals();
      this.updateFilterButtons("area", area);
    } catch (error) {
      console.error("Error filtering by area:", error);
    } finally {
      this.hideLoading();
    }
  }

  updateFilterButtons(type, value) {
    const filterContainer = document.querySelector(
      "#search-filters-section .flex.gap-3"
    );
    if (!filterContainer) return;

    filterContainer.querySelectorAll("button").forEach((btn) => {
      if (btn.textContent.includes("All")) {
        btn.className =
          "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
      } else {
        btn.className =
          "px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
      }
    });

    filterContainer.querySelectorAll("button").forEach((btn) => {
      if (type === "area" && btn.dataset.area === value) {
        btn.className =
          "px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";
      }
    });
  }

  setupEventListeners() {
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        searchTimeout = setTimeout(async () => {
          if (query.length > 0) {
            await this.searchMeals(query);
          } else {
            this.filteredMeals = [...this.meals];
            this.renderMeals();
          }
        }, 500);
      });
    }

    const allBtn = document.querySelector(
      "#search-filters-section .flex.gap-3 button:first-child"
    );
    if (allBtn) {
      allBtn.addEventListener("click", () => {
        this.filteredMeals = [...this.meals];
        this.currentFilter = { type: "all", value: null };
        this.renderMeals();
        allBtn.className =
          "px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap hover:bg-emerald-700 transition-all";

        document
          .querySelectorAll("#search-filters-section .area-filter-btn")
          .forEach((btn) => {
            btn.className =
              "area-filter-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all";
          });
      });
    }

    const gridBtn = document.getElementById("grid-view-btn");
    const listBtn = document.getElementById("list-view-btn");
    const recipesGrid = document.getElementById("recipes-grid");

    if (gridBtn && listBtn && recipesGrid) {
      gridBtn.addEventListener("click", () => {
        recipesGrid.className = "grid grid-cols-4 gap-5";
        gridBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
        listBtn.className = "px-3 py-1.5";
      });

      listBtn.addEventListener("click", () => {
        recipesGrid.className = "grid grid-cols-1 gap-5";
        listBtn.className = "px-3 py-1.5 bg-white rounded-md shadow-sm";
        gridBtn.className = "px-3 py-1.5";
      });
    }
  }

  async searchMeals(query) {
    this.showLoading();
    try {
      const meals = await this.apiService.searchMeals(query);
      this.filteredMeals = meals;
      this.renderMeals();
    } catch (error) {
      console.error("Error searching meals:", error);
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    const grid = document.getElementById("recipes-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      `;
    }
  }

  hideLoading() {}

  showError(message) {
    const grid = document.getElementById("recipes-grid");
    if (grid) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">${message}</p>
        </div>
      `;
    }
  }

  updateHeader(title, subtitle) {
    const headerTitle = document.querySelector("#header h1");
    const headerSubtitle = document.querySelector("#header p");

    if (headerTitle) headerTitle.textContent = title;
    if (headerSubtitle) headerSubtitle.textContent = subtitle;
  }
}
