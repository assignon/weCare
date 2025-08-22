<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center">
            <button @click="$router.go(-1)" class="p-2 text-gray-600 hover:text-gray-900 rounded-lg">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="ml-3 text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <span v-if="cartItems.length > 0" class="ml-2 text-sm text-gray-500">
              ({{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }})
            </span>
          </div>
          
          <div class="flex items-center space-x-3">
            <button
              v-if="cartItems.length > 0"
              @click="showSaveForLater = !showSaveForLater"
              class="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
            >
              <Heart class="w-4 h-4 mr-2" />
              Saved Items ({{ savedItems.length }})
            </button>
            <button
              v-if="cartItems.length > 0"
              @click="showClearDialog = true"
              class="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Cart Content -->
      <div v-if="cartItems.length > 0" class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Cart Items -->
        <div class="lg:col-span-8">
          <!-- Bulk Actions -->
          <div v-if="selectedItems.length > 0" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-blue-900">
                {{ selectedItems.length }} item{{ selectedItems.length > 1 ? 's' : '' }} selected
              </span>
              <div class="flex space-x-3">
                <button
                  @click="moveSelectedToSaved"
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Save for Later
                </button>
                <button
                  @click="removeSelectedItems"
                  class="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Remove Selected
                </button>
              </div>
            </div>
          </div>

          <!-- Store Groups -->
          <div class="space-y-6">
            <div 
              v-for="store in groupedCartItems" 
              :key="store.store_id"
              class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              <!-- Store Header -->
              <div class="p-6 bg-gray-50 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      type="checkbox"
                      :checked="isStoreSelected(store.store_id)"
                      @change="toggleStoreSelection(store.store_id)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <Store class="w-5 h-5 text-gray-400 ml-3 mr-2" />
                    <span class="font-semibold text-gray-900">{{ store.store_name }}</span>
                    <span class="ml-2 text-sm text-gray-500">({{ store.items.length }} items)</span>
                  </div>
                  
                  <!-- Store Actions -->
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-green-600 font-medium">
                      Free shipping over {{ formatPrice(store.free_shipping_threshold || 50) }}
                    </span>
                    <button
                      @click="viewStore(store.store_id)"
                      class="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Visit Store
                    </button>
                  </div>
                </div>
              </div>

              <!-- Cart Items for this store -->
              <div class="divide-y divide-gray-200">
                <div 
                  v-for="item in store.items" 
                  :key="item.id"
                  class="p-6"
                >
                  <div class="flex items-start space-x-4">
                    <!-- Selection Checkbox -->
                    <input
                      type="checkbox"
                      :checked="selectedItems.includes(item.id)"
                      @change="toggleItemSelection(item.id)"
                      class="mt-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    <!-- Product Image -->
                    <div class="flex-shrink-0 w-24 h-24">
                      <img
                        :src="item.product.images?.[0]?.image || '/placeholder-product.jpg'"
                        :alt="item.product.name"
                        class="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    <!-- Product Details -->
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between">
                        <div class="flex-1">
                          <h3 class="text-lg font-medium text-gray-900 mb-1">
                            <button 
                              @click="goToProduct(item.product.id)"
                              class="hover:text-blue-600 transition-colors"
                            >
                              {{ item.product.name }}
                            </button>
                          </h3>
                          
                          <!-- Product Attributes -->
                          <div v-if="item.variant" class="text-sm text-gray-600 mb-2">
                            <span v-for="(value, key) in item.variant.attributes" :key="key" class="mr-3">
                              {{ key }}: {{ value }}
                            </span>
                          </div>
                          
                          <!-- Stock Status -->
                          <div class="flex items-center mb-3">
                            <div 
                              :class="item.product.in_stock 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'"
                              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            >
                              <div :class="item.product.in_stock ? 'bg-green-400' : 'bg-red-400'" 
                                   class="w-2 h-2 rounded-full mr-1"></div>
                              {{ item.product.in_stock ? 'In Stock' : 'Out of Stock' }}
                              <span v-if="item.product.in_stock && item.product.stock_quantity < 5" class="ml-1">
                                ({{ item.product.stock_quantity }} left)
                              </span>
                            </div>
                            
                            <!-- Estimated Delivery -->
                            <span class="ml-4 text-sm text-gray-500 flex items-center">
                              <Truck class="w-4 h-4 mr-1" />
                              {{ getEstimatedDelivery(item) }}
                            </span>
                          </div>

                          <!-- Price -->
                          <div class="flex items-center space-x-2">
                            <span class="text-lg font-bold text-gray-900">
                              {{ formatPrice(item.variant?.price || item.product.price) }}
                            </span>
                            <span v-if="item.product.compare_at_price" class="text-sm text-gray-500 line-through">
                              {{ formatPrice(item.product.compare_at_price) }}
                            </span>
                            <span v-if="item.product.discount_percentage" class="text-sm text-green-600 font-medium">
                              ({{ item.product.discount_percentage }}% off)
                            </span>
                          </div>
                        </div>

                        <!-- Item Actions -->
                        <div class="flex flex-col items-end space-y-3 ml-6">
                          <!-- Quantity Controls -->
                          <div class="flex items-center bg-gray-100 rounded-lg">
                            <button
                              @click="updateQuantity(item.id, item.quantity - 1)"
                              :disabled="item.quantity <= 1"
                              class="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Minus class="w-4 h-4" />
                            </button>
                            <div class="px-4 py-2 min-w-[3rem] text-center font-medium">
                              {{ item.quantity }}
                            </div>
                            <button
                              @click="updateQuantity(item.id, item.quantity + 1)"
                              :disabled="item.quantity >= (item.product.stock_quantity || 0)"
                              class="p-2 text-gray-600 hover:text-gray-900 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                              <Plus class="w-4 h-4" />
                            </button>
                          </div>

                          <!-- Secondary Actions -->
                          <div class="flex items-center space-x-2 text-sm">
                            <button
                              @click="saveForLater(item.id)"
                              class="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                              <Heart class="w-4 h-4 mr-1" />
                              Save
                            </button>
                            <span class="text-gray-300">|</span>
                            <button
                              @click="removeItem(item.id)"
                              class="text-red-600 hover:text-red-700 flex items-center"
                            >
                              <Trash2 class="w-4 h-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="mt-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Frequently Bought Together</h3>
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                v-for="product in recommendedProducts" 
                :key="product.id"
                class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                @click="goToProduct(product.id)"
              >
                <img
                  :src="product.images?.[0]?.image || '/placeholder-product.jpg'"
                  :alt="product.name"
                  class="w-full aspect-square object-cover rounded-lg mb-3"
                />
                <h4 class="font-medium text-gray-900 text-sm mb-1 line-clamp-2">{{ product.name }}</h4>
                <p class="text-sm font-bold text-gray-900">{{ formatPrice(product.price) }}</p>
                <button
                  @click.stop="addToCart(product)"
                  class="w-full mt-2 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-4 mt-8 lg:mt-0">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

            <!-- Promo Code -->
            <div class="mb-6">
              <div class="flex">
                <input
                  v-model="promoCode"
                  type="text"
                  placeholder="Enter promo code"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  @click="applyPromoCode"
                  :disabled="!promoCode || applyingPromo"
                  class="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {{ applyingPromo ? 'Applying...' : 'Apply' }}
                </button>
              </div>
              <div v-if="appliedPromo" class="mt-2 flex items-center text-sm text-green-600">
                <CheckCircle class="w-4 h-4 mr-1" />
                {{ appliedPromo.description }} applied
              </div>
            </div>

            <!-- Summary Items -->
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal ({{ totalItems }} items)</span>
                <span class="font-medium">{{ formatPrice(subtotal) }}</span>
              </div>
              
              <div v-if="appliedPromo" class="flex justify-between text-sm text-green-600">
                <span>Promo Discount</span>
                <span>-{{ formatPrice(promoDiscount) }}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="font-medium">
                  {{ shippingCost > 0 ? formatPrice(shippingCost) : 'Free' }}
                </span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Tax</span>
                <span class="font-medium">{{ formatPrice(taxAmount) }}</span>
              </div>
            </div>

            <div class="border-t border-gray-200 pt-4 mb-6">
              <div class="flex justify-between">
                <span class="text-lg font-bold text-gray-900">Total</span>
                <span class="text-xl font-bold text-gray-900">{{ formatPrice(total) }}</span>
              </div>
            </div>

            <!-- Checkout Button -->
            <button
              @click="proceedToCheckout"
              :disabled="!hasAvailableItems"
              class="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Proceed to Checkout
            </button>

            <!-- Security Badge -->
            <div class="mt-4 flex items-center justify-center text-sm text-gray-500">
              <Shield class="w-4 h-4 mr-2" />
              Secure Checkout
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart class="w-12 h-12 text-gray-400" />
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
        </p>
        <button
          @click="$router.push('/explore')"
          class="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </button>
      </div>

      <!-- Saved for Later Section -->
      <div v-if="showSaveForLater && savedItems.length > 0" class="mt-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Saved for Later</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="item in savedItems" 
            :key="item.id"
            class="bg-white rounded-xl border border-gray-200 p-4"
          >
            <img
              :src="item.product.images?.[0]?.image || '/placeholder-product.jpg'"
              :alt="item.product.name"
              class="w-full aspect-square object-cover rounded-lg mb-3"
            />
            <h4 class="font-medium text-gray-900 mb-2">{{ item.product.name }}</h4>
            <p class="text-lg font-bold text-gray-900 mb-3">{{ formatPrice(item.product.price) }}</p>
            <div class="flex space-x-2">
              <button
                @click="moveBackToCart(item.id)"
                class="flex-1 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Move to Cart
              </button>
              <button
                @click="removeSavedItem(item.id)"
                class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Cart Dialog -->
    <div v-if="showClearDialog" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showClearDialog = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="flex items-center">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 class="h-6 w-6 text-red-600" />
              </div>
              <div class="ml-4 text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Clear Shopping Cart</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    Are you sure you want to remove all items from your cart? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse">
            <button
              @click="clearCart"
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Clear Cart
            </button>
            <button
              @click="showClearDialog = false"
              class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrency } from '@/composables/useCurrency'
import { useCartStore } from '@/stores/cart'
import { apiService } from '@/services/api'
import {
  ArrowLeft, Heart, Trash2, Store, Truck, Minus, Plus, ShoppingCart,
  CheckCircle, Shield, X
} from 'lucide-vue-next'

const router = useRouter()
const { formatPrice } = useCurrency()
const cartStore = useCartStore()

// State
const loading = ref(false)
const showSaveForLater = ref(false)
const showClearDialog = ref(false)
const selectedItems = ref([])
const promoCode = ref('')
const appliedPromo = ref(null)
const applyingPromo = ref(false)

// Cart data
const cartItems = ref([])
const savedItems = ref([])
const recommendedProducts = ref([])

// Mock data for demonstration
const mockCartItems = [
  {
    id: 1,
    product: {
      id: 101,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      compare_at_price: 399.99,
      discount_percentage: 25,
      in_stock: true,
      stock_quantity: 8,
      images: [{ image: '/headphones.jpg' }]
    },
    variant: {
      attributes: { Color: 'Black', Size: 'Standard' },
      price: 299.99
    },
    quantity: 2,
    store_id: 1,
    store_name: 'TechZone Electronics'
  },
  {
    id: 2,
    product: {
      id: 102,
      name: 'Smart Fitness Watch',
      price: 199.99,
      in_stock: true,
      stock_quantity: 3,
      images: [{ image: '/watch.jpg' }]
    },
    quantity: 1,
    store_id: 1,
    store_name: 'TechZone Electronics'
  },
  {
    id: 3,
    product: {
      id: 103,
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      in_stock: false,
      stock_quantity: 0,
      images: [{ image: '/tshirt.jpg' }]
    },
    quantity: 3,
    store_id: 2,
    store_name: 'EcoFashion Store'
  }
]

// Initialize with mock data
cartItems.value = mockCartItems

// Computed properties
const groupedCartItems = computed(() => {
  const groups = {}
  cartItems.value.forEach(item => {
    if (!groups[item.store_id]) {
      groups[item.store_id] = {
        store_id: item.store_id,
        store_name: item.store_name,
        free_shipping_threshold: 50,
        items: []
      }
    }
    groups[item.store_id].items.push(item)
  })
  return Object.values(groups)
})

const totalItems = computed(() => {
  return cartItems.value.reduce((total, item) => total + item.quantity, 0)
})

const subtotal = computed(() => {
  return cartItems.value.reduce((total, item) => {
    const price = item.variant?.price || item.product.price
    return total + (price * item.quantity)
  }, 0)
})

const promoDiscount = computed(() => {
  if (!appliedPromo.value) return 0
  if (appliedPromo.value.type === 'percentage') {
    return subtotal.value * (appliedPromo.value.amount / 100)
  }
  return appliedPromo.value.amount
})

const shippingCost = computed(() => {
  // Calculate shipping based on store thresholds
  let totalShipping = 0
  groupedCartItems.value.forEach(store => {
    const storeSubtotal = store.items.reduce((total, item) => {
      const price = item.variant?.price || item.product.price
      return total + (price * item.quantity)
    }, 0)
    
    if (storeSubtotal < store.free_shipping_threshold) {
      totalShipping += 9.99 // Standard shipping per store
    }
  })
  return totalShipping
})

const taxAmount = computed(() => {
  return (subtotal.value - promoDiscount.value) * 0.08 // 8% tax
})

const total = computed(() => {
  return subtotal.value - promoDiscount.value + shippingCost.value + taxAmount.value
})

const hasAvailableItems = computed(() => {
  return cartItems.value.some(item => item.product.in_stock)
})

// Methods
const isStoreSelected = (storeId) => {
  const storeItems = cartItems.value.filter(item => item.store_id === storeId)
  return storeItems.every(item => selectedItems.value.includes(item.id))
}

const toggleStoreSelection = (storeId) => {
  const storeItems = cartItems.value.filter(item => item.store_id === storeId)
  const allSelected = isStoreSelected(storeId)
  
  if (allSelected) {
    storeItems.forEach(item => {
      const index = selectedItems.value.indexOf(item.id)
      if (index > -1) selectedItems.value.splice(index, 1)
    })
  } else {
    storeItems.forEach(item => {
      if (!selectedItems.value.includes(item.id)) {
        selectedItems.value.push(item.id)
      }
    })
  }
}

const toggleItemSelection = (itemId) => {
  const index = selectedItems.value.indexOf(itemId)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(itemId)
  }
}

const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) return
  
  const item = cartItems.value.find(item => item.id === itemId)
  if (item) {
    item.quantity = newQuantity
    // Sync with cart store
    await cartStore.updateCartItem(itemId, { quantity: newQuantity })
  }
}

const removeItem = async (itemId) => {
  const index = cartItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    cartItems.value.splice(index, 1)
    await cartStore.removeCartItem(itemId)
  }
}

const saveForLater = (itemId) => {
  const itemIndex = cartItems.value.findIndex(item => item.id === itemId)
  if (itemIndex > -1) {
    const item = cartItems.value[itemIndex]
    savedItems.value.push(item)
    cartItems.value.splice(itemIndex, 1)
  }
}

const moveBackToCart = (itemId) => {
  const itemIndex = savedItems.value.findIndex(item => item.id === itemId)
  if (itemIndex > -1) {
    const item = savedItems.value[itemIndex]
    cartItems.value.push(item)
    savedItems.value.splice(itemIndex, 1)
  }
}

const removeSavedItem = (itemId) => {
  const index = savedItems.value.findIndex(item => item.id === itemId)
  if (index > -1) {
    savedItems.value.splice(index, 1)
  }
}

const moveSelectedToSaved = () => {
  selectedItems.value.forEach(itemId => {
    saveForLater(itemId)
  })
  selectedItems.value = []
}

const removeSelectedItems = () => {
  selectedItems.value.forEach(itemId => {
    removeItem(itemId)
  })
  selectedItems.value = []
}

const applyPromoCode = async () => {
  if (!promoCode.value) return
  
  applyingPromo.value = true
  try {
    const response = await apiService.applyPromoCode({
      code: promoCode.value,
      cart_total: subtotal.value
    })
    
    appliedPromo.value = response.data
  } catch (error) {
    console.error('Error applying promo code:', error)
    // Show error message
  } finally {
    applyingPromo.value = false
  }
}

const clearCart = async () => {
  cartItems.value = []
  selectedItems.value = []
  showClearDialog.value = false
  await cartStore.clearCart()
}

const proceedToCheckout = () => {
  // Filter out unavailable items
  const availableItems = cartItems.value.filter(item => item.product.in_stock)
  if (availableItems.length === 0) return
  
  router.push('/checkout')
}

const goToProduct = (productId) => {
  router.push(`/product/${productId}`)
}

const viewStore = (storeId) => {
  router.push(`/store/${storeId}`)
}

const addToCart = async (product) => {
  try {
    await cartStore.addToCart({
      product_id: product.id,
      quantity: 1
    })
  } catch (error) {
    console.error('Error adding to cart:', error)
  }
}

const getEstimatedDelivery = (item) => {
  const days = Math.floor(Math.random() * 3) + 2 // 2-4 days
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `Arrives ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

// Lifecycle
onMounted(async () => {
  // Load cart data, recommended products, etc.
  try {
    const response = await apiService.getRecommendedProducts({
      type: 'frequently_bought_together',
      cart_items: cartItems.value.map(item => item.product.id)
    })
    recommendedProducts.value = response.data.results || []
  } catch (error) {
    console.error('Error loading recommendations:', error)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>