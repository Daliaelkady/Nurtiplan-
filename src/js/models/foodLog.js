export class FoodLog {
  constructor() {
    this.storageKey = "nutriplan_foodlog";
    this.dailyGoals = {
      calories: 2000,
      protein: 50,
      carbohydrates: 250,
      fat: 65,
    };
  }

  getTodayKey() {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }

  getTodayItems() {
    const todayKey = this.getTodayKey();
    const allData = this.getAllData();
    return allData[todayKey] || [];
  }

  getAllData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return {};
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  addItem(item) {
    const todayKey = this.getTodayKey();
    const allData = this.getAllData();

    if (!allData[todayKey]) {
      allData[todayKey] = [];
    }

    const logItem = {
      id: Date.now().toString(),
      name: item.name,
      type: item.type || "meal", // 'meal' or 'product'
      image: item.image || "",
      nutrition: item.nutrition || {},
      timestamp: new Date().toISOString(),
    };

    allData[todayKey].push(logItem);
    this.saveData(allData);

    return logItem;
  }

  removeItem(itemId) {
    const todayKey = this.getTodayKey();
    const allData = this.getAllData();

    if (allData[todayKey]) {
      allData[todayKey] = allData[todayKey].filter(
        (item) => item.id !== itemId
      );
      this.saveData(allData);
    }
  }

  clearToday() {
    const todayKey = this.getTodayKey();
    const allData = this.getAllData();
    allData[todayKey] = [];
    this.saveData(allData);
  }

  getTodayTotals() {
    const items = this.getTodayItems();
    const totals = {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
    };

    items.forEach((item) => {
      const nutrition = item.nutrition || {};
      totals.calories += nutrition.calories || 0;
      totals.protein += nutrition.protein || 0;
      totals.carbohydrates += nutrition.carbohydrates || 0;
      totals.fat += nutrition.fat || 0;
      totals.fiber += nutrition.fiber || 0;
      totals.sugar += nutrition.sugar || 0;
    });

    return totals;
  }

  getWeeklyData() {
    const allData = this.getAllData();
    const weeklyData = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const items = allData[dateKey] || [];

      const totals = {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
      };

      items.forEach((item) => {
        const nutrition = item.nutrition || {};
        totals.calories += nutrition.calories || 0;
        totals.protein += nutrition.protein || 0;
        totals.carbohydrates += nutrition.carbohydrates || 0;
        totals.fat += nutrition.fat || 0;
      });

      weeklyData.push({
        date: dateKey,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        ...totals,
      });
    }

    return weeklyData;
  }

  getProgress(nutrient) {
    const totals = this.getTodayTotals();
    const goal = this.dailyGoals[nutrient] || 1;
    const percentage = (totals[nutrient] / goal) * 100;
    return Math.min(percentage, 100);
  }
}
