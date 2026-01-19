import { APIService } from "./services/apiService.js";
import { Router } from "./services/router.js";
import { HomePage } from "./pages/homePage.js";
import { MealDetailsPage } from "./pages/mealDetailsPage.js";
import { ProductScannerPage } from "./pages/productScannerPage.js";
import { FoodLogPage } from "./pages/foodLogPage.js";
import { FoodLog } from "./models/foodLog.js";

class NutriPlanApp {
  constructor() {
    this.apiService = new APIService();
    this.router = new Router();
    this.foodLog = new FoodLog();

    // Initialize pages
    this.homePage = new HomePage(this.apiService, this.router, this.foodLog);
    this.mealDetailsPage = new MealDetailsPage(
      this.apiService,
      this.router,
      this.foodLog
    );
    this.productScannerPage = new ProductScannerPage(
      this.apiService,
      this.router,
      this.foodLog
    );
    this.foodLogPage = new FoodLogPage(this.foodLog, this.router);

    this.init();
  }

  init() {
    this.hideLoadingOverlay();

    this.setupSidebar();

    this.setupRouter();

    const initialHash = window.location.hash || "#home";
    setTimeout(() => {
      this.router.navigate(initialHash);
    }, 100);
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById("app-loading-overlay");
    if (overlay) {
      setTimeout(() => {
        overlay.style.opacity = "0";
        setTimeout(() => {
          overlay.style.display = "none";
        }, 500);
      }, 500);
    }
  }

  setupSidebar() {
    const menuBtn = document.getElementById("header-menu-btn");
    const closeBtn = document.getElementById("sidebar-close-btn");
    const overlay = document.getElementById("sidebar-overlay");
    const sidebar = document.getElementById("sidebar");
    const navLinks = document.querySelectorAll(".nav-link");

    const toggleSidebar = (open) => {
      if (window.innerWidth <= 1024) {
        if (open) {
          sidebar.classList.add("open");
          overlay.classList.add("active");
          document.body.style.overflow = "hidden";
        } else {
          sidebar.classList.remove("open");
          overlay.classList.remove("active");
          document.body.style.overflow = "";
        }
      }
    };

    menuBtn?.addEventListener("click", () => toggleSidebar(true));
    closeBtn?.addEventListener("click", () => toggleSidebar(false));
    overlay?.addEventListener("click", () => toggleSidebar(false));

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const text = link.textContent.trim();
        toggleSidebar(false);

        if (text.includes("Meals")) {
          this.router.navigate("#home");
        } else if (text.includes("Product")) {
          this.router.navigate("#products");
        } else if (text.includes("Food Log")) {
          this.router.navigate("#foodlog");
        }
      });
    });
  }

  setupRouter() {
    this.router.onRoute("#home", () => {
      this.showSection("all-recipes-section");
      this.hideSection("meal-details");
      this.hideSection("products-section");
      this.hideSection("foodlog-section");
      this.homePage.init();
      this.updateActiveNavLink(0);
    });

    this.router.onRoute("#products", () => {
      this.hideSection("all-recipes-section");
      this.hideSection("meal-details");
      this.showSection("products-section");
      this.hideSection("foodlog-section");
      this.productScannerPage.init();
      this.updateActiveNavLink(1);
    });

    this.router.onRoute("#foodlog", () => {
      this.hideSection("all-recipes-section");
      this.hideSection("meal-details");
      this.hideSection("products-section");
      this.showSection("foodlog-section");
      this.foodLogPage.init();
      this.updateActiveNavLink(2);
    });

    this.router.onRoute("#meal/:id", (params) => {
      this.hideSection("all-recipes-section");
      this.showSection("meal-details");
      this.hideSection("products-section");
      this.hideSection("foodlog-section");
      this.mealDetailsPage.init(params.id);
      this.updateActiveNavLink(0);
    });

    this.router.onRoute("", () => {
      this.router.navigate("#home");
    });
  }

  showSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = "block";
    }
  }

  hideSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = "none";
    }
  }

  updateActiveNavLink(index) {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link, i) => {
      if (i === index) {
        link.classList.add("bg-emerald-50", "text-emerald-700");
        link.classList.remove("text-gray-600", "hover:bg-gray-50");
      } else {
        link.classList.remove("bg-emerald-50", "text-emerald-700");
        link.classList.add("text-gray-600", "hover:bg-gray-50");
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.app = new NutriPlanApp();
  });
} else {
  window.app = new NutriPlanApp();
}
