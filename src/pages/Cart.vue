<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Header -->
      <AppHeader 
        :show-back="true" 
        :back-route="{ name: 'Home' }"
        custom-title="Cart Items"
      >
        <template #right-content>
          <button 
            v-if="cart.items.items && cart.items.items.length > 0"
            @click="confirmClearCart"
            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
          >
            <Trash2 class="w-5 h-5 text-red-500" />
          </button>
          <div v-else class="w-10"></div>
        </template>
      </AppHeader>

      <!-- Cart content -->
      <div v-if="cart.items.items && cart.items.items.length > 0" class="space-y-6">
        <!-- Cart items -->
        <div class="space-y-4">
          <div 
            v-for="product in groupedCartItems" 
            :key="product.product_id"
            class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 overflow-hidden"
          >
              <!-- Product header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-start space-x-4">
                <div class="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    :src="'http://localhost:8000' + product.main_image || 'https://via.placeholder.com/150'"
                    :alt="product.product_name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-semibold text-gray-900 capitalize mb-1">{{ product.product_name }}</h3>
                  <p class="text-sm text-gray-500 mb-2">{{ product.seller_name || '---' }}</p>
                  <div class="flex items-center text-blue-600 text-sm font-medium">
                    <Truck class="w-4 h-4 mr-2" />
                    {{ product.delivery_info?.estimated_delivery_display || 'Standard Delivery' }}
                  </div>
                </div>
                </div>
              </div>

              <!-- Product variants -->
            <div class="p-6 space-y-4">
              <div 
                v-for="variant in product.variants" 
                :key="variant.id"
                class="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100"
              >
                <div class="flex items-center space-x-4">
                                     <div class="text-center">
                     <span class="text-sm font-bold text-blue-600">{{ variant.name }} ML</span>
                     <div class="text-lg font-semibold text-gray-900 mt-1">
                       {{ formatApiPrice({
                         price: variant.price * variant.quantity,
                         currency_info: variant.currency_info 
                       }) }}
                     </div>
                   </div>
                  </div>

                <div class="flex items-center space-x-3">
                  <!-- Quantity controls -->
                  <div class="flex items-center bg-white rounded-2xl shadow-sm border border-gray-200">
                    <button 
                      @click="updateVariantQuantity(variant.cart_item_id, variant.id, variant.quantity - 1, variant.stock)"
                        :disabled="variant.quantity <= 1"
                      class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus class="w-4 h-4" />
                    </button>
                    <div class="w-12 text-center font-bold text-gray-900">{{ variant.quantity }}</div>
                    <button 
                      @click="updateVariantQuantity(variant.cart_item_id, variant.id, variant.quantity + 1, variant.stock)"
                        :disabled="variant.quantity >= (variant.stock || 0)"
                      class="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus class="w-4 h-4" />
                    </button>
                  </div>

                  <!-- Remove button -->
                  <button 
                    @click="removeVariant(variant.cart_item_id)"
                    class="w-10 h-10 bg-red-50 hover:bg-red-100 rounded-2xl flex items-center justify-center transition-colors"
                  >
                    <Trash2 class="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Continue shopping button -->
        <div class="flex justify-center">
          <button 
            @click="$router.push({ name: 'Home' })"
            class="flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl text-blue-600 hover:bg-white hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft class="w-4 h-4 mr-2" />
              Continue Shopping
          </button>
          </div>

        <!-- Order summary -->
        <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">Items</span>
              <span class="font-semibold text-gray-900">
                {{ formatApiPrice({
                  price: cart.items.total_amount || 0, 
                  currency_info: cart.items.currency_info 
                }) }}
              </span>
            </div>

           

            <div class="border-t border-gray-200 pt-4">
              <div class="flex justify-between items-center">
                <span class="text-lg font-bold text-gray-900">Total</span>
                <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  {{ formatApiPrice({
                    price: cart.items.total_amount || 0, 
                    currency_info: cart.items.currency_info 
                  }) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty cart -->
      <div v-else class="text-center py-20">
        <div class="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6" style="background: linear-gradient(to right, #dbeafe, #e9d5ff);">
          <ShoppingCart class="w-16 h-16 text-gray-400" />
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-3">Your Cart is Empty</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added any items to your cart yet. Start shopping to discover amazing products!
        </p>
        <button 
          @click="$router.push({ name: 'Home' })"
          class="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          Start Shopping
        </button>
      </div>

      <!-- Fixed checkout button for mobile -->
      <div v-if="cart.items.items && cart.items.items.length > 0" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
        <div class="p-4">
          <button 
            @click="$router.push({ name: 'Checkout' })"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <span>Proceed to Checkout</span>
            <span class="ml-2">({{ formatApiPrice({ 
              price: cart.items.total_amount || 0, 
              currency_info: cart.items.currency_info 
            }) }})</span>
          </button>
        </div>
                </div>

      <!-- Warning dialog -->
      <div 
        v-if="showWarningDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showWarningDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <AlertTriangle class="w-6 h-6 text-yellow-500 mr-3" />
            <h3 class="text-lg font-bold text-gray-900">Unsaved Changes</h3>
          </div>
          <p class="text-gray-600 mb-6">
            You have unsaved changes in your cart. Are you sure you want to leave this page?
          </p>
          <div class="flex space-x-3">
            <button 
              @click="showWarningDialog = false"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Stay
            </button>
            <button 
              @click="handleLeave"
              class="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-2xl hover:bg-red-600 transition-colors"
            >
              Leave
            </button>
          </div>
        </div>
      </div>

      <!-- Clear cart confirmation dialog -->
      <div 
        v-if="showClearCartDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showClearCartDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <Trash2 class="w-6 h-6 text-red-500 mr-3" />
            <h3 class="text-lg font-bold text-gray-900">Clear Cart</h3>
          </div>
          <p class="text-gray-600 mb-6">
            Are you sure you want to remove all items from your cart?
          </p>
          <div class="flex space-x-3">
            <button 
              @click="showClearCartDialog = false"
              class="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="clearCart"
              class="flex-1 py-3 px-4 bg-red-500 text-white font-medium rounded-2xl hover:bg-red-600 transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'
import { 
  ArrowLeft, Trash2, Truck, Minus, Plus, ShoppingCart, AlertTriangle 
} from 'lucide-vue-next'

const cart = useCartStore()
const router = useRouter()
const { formatApiPrice } = useCurrency()

// Add warning dialog
const showWarningDialog = ref(false)

// Add confirmation dialog for clearing cart
const showClearCartDialog = ref(false)

// Handle page unload
const handleBeforeUnload = (e) => {
  if (cart.cartUpdated) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  // Add event listener for page unload
  window.addEventListener('beforeunload', handleBeforeUnload)
  try {
    // Initialize cart state
    cart.initCartState()

    // If cart is updated, sync with backend
    if (cart.cartUpdated) {
      await cart.syncCartWithBackend()
    } else {
      // Otherwise just fetch the latest cart state
      await cart.fetchCart()
    }
  } catch (error) {
    console.error('Failed to initialize cart:', error)
  }
})

onBeforeUnmount(() => {
  // Remove event listener
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

// Update variant quantity with backend sync
const updateVariantQuantity = async (cartItemId, variantId, newQuantity, stock) => {
  try {
    await cart.updateVariantQuantity(cartItemId, variantId, newQuantity, stock)
    await cart.syncCartWithBackend()
  } catch (error) {
    console.error('Failed to update variant quantity:', error)
  }
}

// Update remove variant with backend sync
const removeVariant = async (cartItemId) => {
  try {
    await cart.removeVariant(cartItemId)
    await cart.syncCartWithBackend()
  } catch (error) {
    console.error('Failed to remove variant:', error)
  }
}

// Add confirmation dialog for clearing cart
const confirmClearCart = () => {
  showClearCartDialog.value = true
}

// Clear cart
const clearCart = async () => {
  try {
    await cart.clearCart()
    await cart.fetchCart()
    showClearCartDialog.value = false
  } catch (error) {
    console.error('Failed to clear cart:', error)
  }
}

// Add a computed property to group cart items by product ID
const groupedCartItems = computed(() => {
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    return [];
  }

  const grouped = {};

  // Group items by product_id
  cart.items.items.forEach(item => {
    if (!grouped[item.product_id]) {
      grouped[item.product_id] = {
        cart_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        seller_name: item.seller_name,
        main_image: item.main_image,
        delivery_info: item.delivery_info,
        variants: []
      };
    }

    // Add all variants from this product
    item.variants.forEach(variant => {
      grouped[item.product_id].variants.push({
        ...variant,
        cart_item_id: item.id,
        product_id: item.product_id
      });
    });
  });

  return Object.values(grouped);
});
</script>

<style scoped>
/* Additional styles if needed */
</style>