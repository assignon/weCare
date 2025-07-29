<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div class="px-4 pt-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">weCare</h1>
        <div class="flex items-center space-x-2">
          <button class="btn-icon relative" @click="navigateToNotification">
            <Bell class="w-6 h-6" />
            <span
              v-if="notification.hasUnreadNotifications"
              class="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center min-w-0"
            >
              {{ notification.unreadCount }}
            </span>
          </button>
          <button class="btn-icon" @click="navigateToProfile">
            <img
              v-if="auth.user?.profile_picture"
              :src="auth.user.profile_picture"
              alt="Profile"
              class="w-8 h-8 rounded-full object-cover"
            />
            <User v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Popular Products Section -->
      <div v-if="productStore.popularProducts.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Popular Product</h2>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center mb-4"
        >
          <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
          <span class="text-red-800 text-sm">{{ error }}</span>
        </div>

        <!-- Popular products with horizontal scroll -->
        <div v-else class="overflow-x-auto">
          <div class="flex space-x-4 pb-2">
            <div
              v-for="product in productStore.popularProducts.slice(0, 10)"
              :key="product.id"
              class="card flex-shrink-0 w-40 cursor-pointer hover:shadow-md transition-shadow"
              @click="navigateToDetails(product.id)"
            >
              <img
                :src="product.main_image || packagingImage"
                :alt="product.name"
                class="w-full h-36 object-cover rounded-t-lg mb-2"
              />
              <div class="px-2 pb-2">
                <h3 class="text-sm font-medium mb-1 truncate capitalize">
                  {{ product.name }}
                </h3>
                <p class="text-xs text-gray-600 mb-1 truncate">
                  {{ product.seller_name || "weCare" }}
                </p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-bold text-primary">{{
                    formatApiPrice(product)
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Arrivals Section -->
      <div v-if="productStore.newArrivals.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">New Arrivals</h2>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center mb-4"
        >
          <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
          <span class="text-red-800 text-sm">{{ error }}</span>
        </div>

        <!-- New arrivals with horizontal scroll -->
        <div v-else class="space-y-3">
          <div
            v-for="product in productStore.newArrivals.slice(0, 10)"
            :key="product.id"
            class="card p-3 cursor-pointer hover:shadow-md transition-shadow"
            @click="navigateToDetails(product.id)"
          >
            <div class="flex">
              <img
                :src="product.main_image || packagingImage"
                :alt="product.name"
                class="w-24 h-36 object-cover rounded-lg flex-shrink-0"
              />
              <div class="px-3 py-1 flex flex-col justify-between flex-grow">
                <div>
                  <h3
                    class="text-base font-medium mb-1 line-clamp-2 capitalize"
                  >
                    {{ product.name }}
                  </h3>
                  <p class="text-xs text-gray-500 mb-2 truncate">
                    {{ product.seller_name || "weCare" }}
                  </p>
                </div>
                <div class="flex items-center justify-between">
                  <div>
                    <span
                      v-if="
                        product.original_price &&
                        product.original_price > product.price
                      "
                      class="text-xs line-through text-gray-400 mr-1"
                    >
                      {{ formatApiPrice({ price: product.original_price }) }}
                    </span>
                    <span class="text-sm font-bold text-primary">{{
                      formatApiPrice(product)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Products Section -->
      <div v-if="productStore.recommendedProducts.length > 0" class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-900">Recommended For You</h2>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div
            class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
          ></div>
        </div>

        <!-- Error state -->
        <div
          v-else-if="error"
          class="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center mb-4"
        >
          <AlertCircle class="w-5 h-5 text-red-500 mr-2" />
          <span class="text-red-800 text-sm">{{ error }}</span>
        </div>

        <!-- Recommended products in 2x2 grid -->
        <div v-else class="grid grid-cols-2 gap-3">
          <div
            v-for="product in productStore.recommendedProducts.slice(0, 4)"
            :key="product.id"
            class="card cursor-pointer hover:shadow-md transition-shadow h-full"
            @click="navigateToDetails(product.id)"
          >
            <img
              :src="product.main_image || packagingImage"
              :alt="product.name"
              class="w-full h-30 object-cover rounded-t-lg mb-2"
            />
            <div class="px-2 pb-2">
              <h3 class="text-xs font-medium mb-1 truncate capitalize">
                {{ product.name }}
              </h3>
              <p class="text-xs text-gray-500 mb-1 truncate">
                {{ product.seller_name || "weCare" }}
              </p>
              <div class="flex justify-between items-center">
                <span class="text-sm font-bold text-primary">{{
                  formatApiPrice(product)
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from "vue";
import { useCartStore } from "@/stores/cart";
import { useProductStore } from "@/stores/product";
import { useRouter } from "vue-router";
import packagingImage from "@/assets/packaging_10471395.png";
import BottomNavigation from "@/components/BottomNavigation.vue";
import { useNotificationStore } from "@/stores/notification";
import { useAuthStore } from "@/stores/auth";
import { useCurrency } from "@/composables/useCurrency";
import { Bell, User, AlertCircle } from "lucide-vue-next";

const productStore = useProductStore();
const cart = useCartStore();
const router = useRouter();
const notification = useNotificationStore();
const auth = useAuthStore();
const { formatApiPrice } = useCurrency();

const loading = computed(() => productStore.loading);
const error = computed(() => productStore.error);

const navigateToProfile = () => {
  router.push({ name: "Profile" });
};

const navigateToNotification = () => {
  router.push({ name: "Notification" });
};

const navigateToDetails = (productId) => {
  router.push({ name: "ProductDetails", params: { id: productId } });
};

onMounted(async () => {
  console.log("Home page mounted - starting initialization");

  try {
    // Initialize cart state
    cart.initCartState();
    console.log("Cart state initialized");

    await Promise.all([
      cart
        .fetchCart()
        .then(() => console.log("Cart fetched"))
        .catch((err) => {
          console.error("Cart fetch failed, continuing anyway:", err);
        }),
    ]);

    // init notification store
    await notification.init();

    console.log("Starting to fetch products...");

    // Fetch popular products, new arrivals, and recommended products for home page
    await Promise.all([
      productStore.fetchPopularProducts().then(() => {
        console.log(
          "Popular products fetched:",
          productStore.popularProducts.length
        );
      }),
      productStore.fetchNewArrivals().then(() => {
        console.log("New arrivals fetched:", productStore.newArrivals.length);
      }),
      productStore
        .fetchRecommendedProducts()
        .then(() => {
          console.log(
            "Recommended products fetched:",
            productStore.recommendedProducts.length
          );
        })
        .catch((err) => {
          console.error(
            "Recommended products fetch failed, continuing anyway:",
            err
          );
        }),
    ]);
  } catch (error) {
    console.error("Error during Home page initialization:", error);
  }
});
</script>

<style scoped>
.home-page {
  background-color: #f8f9fa;
  font-family: "Poppins", sans-serif;
}

.section-title {
  font-size: 16px;
}

.primary-color {
  color: #6b3aa5;
}

.product-card-horizontal {
  flex: 0 0 160px;
  /* Fixed width */
  width: 160px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card-bundle-horizontal {
  flex: 0 0 280px;
  /* Fixed width for bundle cards */
  width: 280px;
  height: 150px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.product-card-bundle-horizontal:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Horizontal scroll containers */
.horizontal-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;
  /* Internet Explorer 10+ */
}

.horizontal-scroll-container::-webkit-scrollbar {
  display: none;
  /* WebKit */
}

.horizontal-scroll-content {
  display: flex;
  gap: 12px;
  padding-bottom: 4px;
}

/* Grid product cards for recommended products */
.product-card-grid {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 180px;
}

.product-card-grid:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Make sure vertical scrolling is smooth */
::-webkit-scrollbar {
  height: 0;
  width: 0;
  display: none;
}
</style>
