export class FoodLogPage {
  constructor(foodLog, router) {
    this.foodLog = foodLog;
    this.router = router;
  }

  init() {
    this.render();
    this.setupEventListeners();
    this.updateHeader(
      "Food Log",
      "Track and monitor your daily nutrition intake"
    );
    this.updateDate();
  }

  render() {
    this.renderProgress();
    this.renderLoggedItems();
    this.renderWeeklyChart();
  }

  renderProgress() {
    const totals = this.foodLog.getTodayTotals();
    const goals = this.foodLog.dailyGoals;

    const caloriesProgress = this.foodLog.getProgress("calories");
    const caloriesBar = document.querySelector(
      "#foodlog-today-section .grid > div:first-child .bg-emerald-500"
    );
    const caloriesText = document.querySelector(
      "#foodlog-today-section .grid > div:first-child .text-sm.text-gray-500"
    );
    if (caloriesBar) {
      caloriesBar.style.width = `${caloriesProgress}%`;
    }
    if (caloriesText) {
      caloriesText.textContent = `${Math.round(totals.calories)} / ${
        goals.calories
      } kcal`;
    }

    const proteinProgress = this.foodLog.getProgress("protein");
    const proteinBar = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(2) .bg-blue-500"
    );
    const proteinText = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(2) .text-sm.text-gray-500"
    );
    if (proteinBar) {
      proteinBar.style.width = `${proteinProgress}%`;
    }
    if (proteinText) {
      proteinText.textContent = `${Math.round(totals.protein)} / ${
        goals.protein
      } g`;
    }

    const carbsProgress = this.foodLog.getProgress("carbohydrates");
    const carbsBar = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(3) .bg-amber-500"
    );
    const carbsText = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(3) .text-sm.text-gray-500"
    );
    if (carbsBar) {
      carbsBar.style.width = `${carbsProgress}%`;
    }
    if (carbsText) {
      carbsText.textContent = `${Math.round(totals.carbohydrates)} / ${
        goals.carbohydrates
      } g`;
    }

    const fatProgress = this.foodLog.getProgress("fat");
    const fatBar = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(4) .bg-purple-500"
    );
    const fatText = document.querySelector(
      "#foodlog-today-section .grid > div:nth-child(4) .text-sm.text-gray-500"
    );
    if (fatBar) {
      fatBar.style.width = `${fatProgress}%`;
    }
    if (fatText) {
      fatText.textContent = `${Math.round(totals.fat)} / ${goals.fat} g`;
    }
  }

  renderLoggedItems() {
    const container = document.getElementById("logged-items-list");
    const clearBtn = document.getElementById("clear-foodlog");
    if (!container) return;

    const items = this.foodLog.getTodayItems();

    if (items.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No meals logged today</p>
          <p class="text-sm">Add meals from the Meals page or scan products</p>
        </div>
      `;
      if (clearBtn) clearBtn.style.display = "none";
      return;
    }

    if (clearBtn) clearBtn.style.display = "block";

    container.innerHTML = items
      .map((item) => {
        const nutrition = item.nutrition || {};
        const time = new Date(item.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div class="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all flex items-center gap-4" data-item-id="${
          item.id
        }">
          <img src="${
            item.image || "https://via.placeholder.com/80?text=No+Image"
          }" 
               alt="${item.name}" 
               class="w-16 h-16 rounded-lg object-cover" />
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-1">${item.name}</h4>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span><i class="fa-solid fa-fire mr-1"></i>${Math.round(
                nutrition.calories || 0
              )} kcal</span>
              <span><i class="fa-solid fa-drumstick-bite mr-1"></i>${Math.round(
                nutrition.protein || 0
              )}g protein</span>
              <span><i class="fa-solid fa-clock mr-1"></i>${time}</span>
            </div>
          </div>
          <button class="remove-item-btn text-red-500 hover:text-red-600 p-2" data-item-id="${
            item.id
          }">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      })
      .join("");

    container.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const itemId = btn.dataset.itemId;
        this.removeItem(itemId);
      });
    });
  }

  renderWeeklyChart() {
    const container = document.getElementById("weekly-chart");
    if (!container) return;

    const weeklyData = this.foodLog.getWeeklyData();

    if (weeklyData.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-400">
          <i class="fa-solid fa-chart-line text-4xl mb-2"></i>
          <p>Weekly nutrition chart will appear here</p>
        </div>
      `;
      return;
    }

    const trace1 = {
      x: weeklyData.map((d) => d.day),
      y: weeklyData.map((d) => d.calories),
      name: "Calories",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#10b981" },
    };

    const trace2 = {
      x: weeklyData.map((d) => d.day),
      y: weeklyData.map((d) => d.protein),
      name: "Protein (g)",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#3b82f6" },
    };

    const trace3 = {
      x: weeklyData.map((d) => d.day),
      y: weeklyData.map((d) => d.carbohydrates),
      name: "Carbs (g)",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#f59e0b" },
    };

    const trace4 = {
      x: weeklyData.map((d) => d.day),
      y: weeklyData.map((d) => d.fat),
      name: "Fat (g)",
      type: "scatter",
      mode: "lines+markers",
      line: { color: "#a855f7" },
    };

    const layout = {
      title: "Weekly Nutrition Overview",
      xaxis: { title: "Day" },
      yaxis: { title: "Amount" },
      height: 300,
      margin: { l: 50, r: 50, t: 50, b: 50 },
    };

    try {
      Plotly.newPlot(container, [trace1, trace2, trace3, trace4], layout, {
        responsive: true,
      });
    } catch (error) {
      console.error("Error rendering chart:", error);
      container.innerHTML = `
        <div class="text-center text-gray-400">
          <i class="fa-solid fa-chart-line text-4xl mb-2"></i>
          <p>Chart rendering error</p>
        </div>
      `;
    }
  }

  removeItem(itemId) {
    this.foodLog.removeItem(itemId);
    this.render();

    Swal.fire({
      icon: "success",
      title: "Item Removed",
      timer: 1500,
      showConfirmButton: false,
    });
  }

  setupEventListeners() {
    const clearBtn = document.getElementById("clear-foodlog");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Clear All Items?",
          text: "This will remove all items from today's log.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#ef4444",
          cancelButtonColor: "#6b7280",
          confirmButtonText: "Yes, clear all",
        }).then((result) => {
          if (result.isConfirmed) {
            this.foodLog.clearToday();
            this.render();
            Swal.fire({
              icon: "success",
              title: "Cleared!",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        });
      });
    }

    const quickLogBtns = document.querySelectorAll(".quick-log-btn");
    quickLogBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.textContent.trim();
        if (text.includes("Meal")) {
          this.router.navigate("#home");
        } else if (text.includes("Product") || text.includes("Scan")) {
          this.router.navigate("#products");
        }
      });
    });
  }

  updateDate() {
    const dateElement = document.getElementById("foodlog-date");
    if (dateElement) {
      const today = new Date();
      const options = { weekday: "long", month: "short", day: "numeric" };
      dateElement.textContent = today.toLocaleDateString("en-US", options);
    }
  }

  updateHeader(title, subtitle) {
    const headerTitle = document.querySelector("#header h1");
    const headerSubtitle = document.querySelector("#header p");

    if (headerTitle) headerTitle.textContent = title;
    if (headerSubtitle) headerSubtitle.textContent = subtitle;
  }
}
