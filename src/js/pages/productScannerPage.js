import { ProductCard } from "../ui/components.js";

export class ProductScannerPage {
  constructor(apiService, router, foodLog) {
    this.apiService = apiService;
    this.router = router;
    this.foodLog = foodLog;
    this.products = [];
    this.filteredProducts = [];
  }

  async init() {
    this.setupEventListeners();
    this.updateHeader(
      "Product Scanner",
      "Search for packaged food products to view nutrition information"
    );
  }

  setupEventListeners() {
    const searchInput = document.getElementById("product-search-input");
    const searchBtn = document.getElementById("search-product-btn");

    if (searchInput && searchBtn) {
      const performSearch = async () => {
        const query = searchInput.value.trim();
        if (query) {
          await this.searchProducts(query);
        }
      };

      searchBtn.addEventListener("click", performSearch);
      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performSearch();
        }
      });
    }

    const barcodeInput = document.getElementById("barcode-input");
    const barcodeBtn = document.getElementById("lookup-barcode-btn");

    if (barcodeInput && barcodeBtn) {
      const performBarcodeLookup = async () => {
        const barcode = barcodeInput.value.trim();
        if (barcode) {
          await this.lookupBarcode(barcode);
        }
      };

      barcodeBtn.addEventListener("click", performBarcodeLookup);
      barcodeInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          performBarcodeLookup();
        }
      });
    }

    const nutriScoreFilters = document.querySelectorAll(".nutri-score-filter");
    nutriScoreFilters.forEach((btn) => {
      btn.addEventListener("click", () => {
        const grade = btn.dataset.grade;
        this.filterByNutriScore(grade);
      });
    });

    const categoryBtns = document.querySelectorAll(".product-category-btn");
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const category = btn.textContent.trim();
        categoryBtns.forEach((b) => {
          b.classList.remove("bg-emerald-100", "text-emerald-700");
          b.classList.add("bg-gray-100", "text-gray-700");
        });
        btn.classList.add("bg-emerald-100", "text-emerald-700");
        btn.classList.remove("bg-gray-100", "text-gray-700");
      });
    });

    document.addEventListener("click", (e) => {
      const productCard = e.target.closest(".product-card");
      if (productCard) {
        const barcode = productCard.dataset.barcode;
        this.addProductToLog(barcode);
      }
    });
  }

  async searchProducts(query) {
    this.showLoading();
    try {
      const products = await this.apiService.searchProducts(query);
      this.products = products;
      this.filteredProducts = [...products];
      this.renderProducts();
    } catch (error) {
      console.error("Error searching products:", error);
      this.showError("Failed to search products. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  async lookupBarcode(barcode) {
    this.showLoading();
    try {
      const product = await this.apiService.getProductByBarcode(barcode);
      if (product) {
        this.products = [product];
        this.filteredProducts = [product];
        this.renderProducts();
      } else {
        this.showError(
          "Product not found. Please check the barcode and try again."
        );
      }
    } catch (error) {
      console.error("Error looking up barcode:", error);
      this.showError("Failed to lookup barcode. Please try again.");
    } finally {
      this.hideLoading();
    }
  }

  filterByNutriScore(grade) {
    if (!grade) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter((product) => {
        const productGrade = (product.nutriscore_grade || "").toLowerCase();
        return productGrade === grade.toLowerCase();
      });
    }

    document.querySelectorAll(".nutri-score-filter").forEach((btn) => {
      if (btn.dataset.grade === grade) {
        btn.classList.add("bg-emerald-600", "text-white");
        btn.classList.remove("bg-gray-100", "text-gray-700");
      } else {
        btn.classList.remove("bg-emerald-600", "text-white");
        if (btn.dataset.grade) {
          const gradeColors = {
            a: "bg-green-100 text-green-700",
            b: "bg-lime-100 text-lime-700",
            c: "bg-yellow-100 text-yellow-700",
            d: "bg-orange-100 text-orange-700",
            e: "bg-red-100 text-red-700",
          };
          const colors =
            gradeColors[btn.dataset.grade] || "bg-gray-100 text-gray-700";
          btn.className = `nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all ${colors} hover:opacity-80`;
        } else {
          btn.className =
            "nutri-score-filter px-4 py-2 rounded-lg text-sm font-bold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200";
        }
      }
    });

    this.renderProducts();
  }

  renderProducts() {
    const grid = document.getElementById("products-grid");
    if (!grid) return;

    const countElement = document.getElementById("products-count");
    if (countElement) {
      countElement.textContent =
        this.filteredProducts.length > 0
          ? `Found ${this.filteredProducts.length} product(s)`
          : "Search for products to see results";
    }

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
          </div>
          <p class="text-gray-500 text-lg">No products found</p>
          <p class="text-gray-400 text-sm mt-2">Try searching for a product name or barcode</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = this.filteredProducts
      .map((product) => ProductCard.render(product))
      .join("");
  }

  async addProductToLog(barcode) {
    const product = this.products.find((p) => (p.code || "") === barcode);
    if (!product) return;

    const nutrition = this.apiService.extractProductNutrition(product);

    const item = {
      name:
        product.product_name || product.product_name_en || "Unknown Product",
      type: "product",
      image: product.image_url || product.image_front_url || "",
      nutrition: nutrition,
    };

    this.foodLog.addItem(item);

    Swal.fire({
      icon: "success",
      title: "Product Logged!",
      text: `${item.name} has been added to your food log.`,
      timer: 2000,
      showConfirmButton: false,
    });
  }

  showLoading() {
    const grid = document.getElementById("products-grid");
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
    const grid = document.getElementById("products-grid");
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
