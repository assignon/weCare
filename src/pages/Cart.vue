<template>
  <div class="page-container pb-24">
    <BackButtonHeader :title="$t('cart.title')" />
    <div class="p-4 pt-4">

      <!-- Cart content -->
      <div v-if="cart.items.items && cart.items.items.length > 0" class="space-y-3">
        <!-- Cart items -->
        <div class="space-y-3">
          <div 
            v-for="product in groupedCartItems" 
            :key="product.product_id"
            class="card overflow-hidden"
          >
            <!-- Product header -->
            <div class="p-3 border-b border-grey-100">
              <div class="flex items-start space-x-3">
                <div class="w-14 h-14 rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    :src="'http://localhost:8000' + product.main_image || 'https://via.placeholder.com/150'"
                    :alt="product.product_name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-sm font-semibold text-navy capitalize mb-0.5 leading-tight">{{ product.product_name }}</h3>
                  <p class="text-xs text-grey-500 mb-1">{{ product.seller_name || '---' }}</p>
                  
                  <!-- Shopper Choices Display -->
                  <div v-if="product.shopper_choices && Object.keys(product.shopper_choices).length > 0" class="mt-1.5 mb-1">
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="(value, attrId) in product.shopper_choices" 
                        :key="attrId" 
                        class="chip chip-navy"
                      >
                        {{ formatShopperChoice(attrId, value) }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="flex items-center text-navy text-xs font-medium">
                    <Truck class="w-3 h-3 mr-1" />
                    {{ product.delivery_info?.estimated_delivery_display || $t('cart.standard_delivery') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Product variants -->
            <div class="p-3 space-y-2">
              <div 
                v-for="variant in product.variants" 
                :key="variant.id"
                class="flex items-center justify-between p-2.5 bg-grey-50 rounded-2xl"
              >
                <div class="flex items-center space-x-3">
                  <div>
                    <span class="text-xs font-semibold text-navy">{{ variant.name }} ML</span>
                    <div class="text-sm font-semibold text-navy mt-0.5">
                      {{ formatPrice(variant.price * variant.quantity) }}
                    </div>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <!-- Quantity controls -->
                  <div class="flex items-center bg-white rounded-full shadow-card">
                    <button 
                      @click="updateVariantQuantity(variant.cart_item_id, variant.id, variant.quantity - 1, variant.stock)"
                      :disabled="variant.quantity <= 1"
                      class="w-8 h-8 flex items-center justify-center text-grey-500 hover:text-navy disabled:text-grey-200 disabled:cursor-not-allowed transition-colors rounded-full"
                    >
                      <Minus class="w-3.5 h-3.5" />
                    </button>
                    <div class="w-10 text-center text-xs font-bold text-navy">{{ variant.quantity }}</div>
                    <button 
                      @click="updateVariantQuantity(variant.cart_item_id, variant.id, variant.quantity + 1, variant.stock)"
                      :disabled="variant.quantity >= (variant.stock || 0)"
                      class="w-8 h-8 flex items-center justify-center text-grey-500 hover:text-navy disabled:text-grey-200 disabled:cursor-not-allowed transition-colors rounded-full"
                    >
                      <Plus class="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <!-- Remove button -->
                  <button 
                    @click="removeVariant(variant.cart_item_id)"
                    class="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Trash2 class="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Continue shopping button -->
        <div class="flex justify-center pt-2">
          <button 
            @click="$router.push({ name: 'Home' })"
            class="btn btn-outlined text-sm flex items-center px-4 py-2"
          >
            <ArrowLeft class="w-3.5 h-3.5 mr-1.5" />
            {{ $t('cart.continue_shopping') }}
          </button>
        </div>

        <!-- Order summary -->
        <div class="card p-4">
          <h2 class="text-base font-bold text-navy mb-4">{{ $t('cart.order_summary') }}</h2>

          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-grey-500">{{ $t('cart.items') }}</span>
              <span class="text-sm font-semibold text-navy">
                {{ formatPrice(cart.items.total_amount || 0) }}
              </span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-grey-500">{{ $t('cart.delivery_fee') }}</span>
              <span class="text-sm font-semibold text-navy">
                {{ formatPrice(estimatedDeliveryFee) }}
              </span>
            </div>

            <div class="border-t border-grey-100 pt-3">
              <div class="flex justify-between items-center">
                <span class="text-base font-bold text-navy">{{ $t('cart.total') }}</span>
                <span class="text-lg font-bold text-navy">
                  {{ formatPrice(totalWithDelivery) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty cart -->
      <div v-else class="text-center py-16">
        <div class="w-24 h-24 bg-grey-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart class="w-12 h-12 text-grey-400" />
        </div>
        <h3 class="text-lg font-bold text-navy mb-2">{{ $t('cart.empty') }}</h3>
        <p class="text-sm text-grey-500 mb-6 max-w-md mx-auto">
          {{ $t('cart.empty_subtitle') }}
        </p>
        <button 
          @click="$router.push({ name: 'Home' })"
          class="btn btn-primary px-6 py-2.5 text-sm"
        >
          {{ $t('cart.start_shopping') }}
        </button>
      </div>

      <!-- Fixed checkout button for mobile -->
      <div v-if="cart.items.items && cart.items.items.length > 0" class="action-bar">
        <div class="p-3">
          <button 
            @click="$router.push({ name: 'Checkout' })"
            class="btn-cta flex items-center justify-center"
          >
            <span>{{ $t('cart.checkout') }}</span>
            <span class="ml-2 text-xs opacity-90">({{ formatPrice(totalWithDelivery) }})</span>
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
          class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-float"
          @click.stop
        >
          <div class="flex items-center mb-3">
            <AlertTriangle class="w-5 h-5 text-yellow-500 mr-2" />
            <h3 class="text-base font-bold text-navy">Unsaved Changes</h3>
          </div>
          <p class="text-sm text-grey-500 mb-5">
            You have unsaved changes in your cart. Are you sure you want to leave this page?
          </p>
          <div class="flex space-x-2">
            <button 
              @click="showWarningDialog = false"
              class="flex-1 py-2.5 px-4 bg-grey-50 text-navy text-sm font-semibold rounded-2xl hover:bg-grey-100 transition-colors"
            >
              Stay
            </button>
            <button 
              @click="handleLeave"
              class="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-semibold rounded-2xl hover:bg-red-600 transition-colors"
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
          class="bg-white rounded-2xl p-5 max-w-sm w-full shadow-float"
          @click.stop
        >
          <div class="flex items-center mb-3">
            <Trash2 class="w-5 h-5 text-red-500 mr-2" />
            <h3 class="text-base font-bold text-navy">Clear Cart</h3>
          </div>
          <p class="text-sm text-grey-500 mb-5">
            Are you sure you want to remove all items from your cart?
          </p>
          <div class="flex space-x-2">
            <button 
              @click="showClearCartDialog = false"
              class="flex-1 py-2.5 px-4 bg-grey-50 text-navy text-sm font-semibold rounded-2xl hover:bg-grey-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="clearCart"
              class="flex-1 py-2.5 px-4 bg-red-500 text-white text-sm font-semibold rounded-2xl hover:bg-red-600 transition-colors"
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
import { useCRMStore } from '@/stores/crm'
import { useRouter } from 'vue-router'
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useCurrency } from '@/composables/useCurrency'
import { apiService } from '@/services/api'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { 
  ArrowLeft, Trash2, Truck, Minus, Plus, ShoppingCart, AlertTriangle 
} from 'lucide-vue-next'

const cart = useCartStore()
const crmStore = useCRMStore()
const router = useRouter()
const { formatPrice } = useCurrency()

// Attribute templates mapping (attribute_template_id -> label)
const attributeTemplatesMap = ref({})

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
  // Check if cart access should be restricted for CRM categories
  if (crmStore.shouldRestrictCart) {
    console.log('Cart access restricted for CRM category, redirecting to Rendezvous')
    router.replace({ name: 'Rendezvous' })
    return
  }

  // Add event listener for page unload
  window.addEventListener('beforeunload', handleBeforeUnload)
  try {
    // Initialize cart state
    cart.initCartState()

    // Force refresh cart data to ensure we have the latest
    console.log('🔄 Force refreshing cart data...')
    await cart.fetchCart()
    
    // Fetch attribute templates for displaying shopper choices
    await fetchAttributeTemplates()
    
    console.log('📊 Cart data after refresh:', {
      total_amount: cart.items?.total_amount,
      items: cart.items?.items?.length,
      cart: cart.items
    })
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
        shopper_choices: item.shopper_choices || {}, // Include shopper_choices from the first item
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
    
    // If this item has shopper_choices and the grouped item doesn't, use this one
    // (or merge if needed - for now, use the first non-empty one)
    if (item.shopper_choices && Object.keys(item.shopper_choices).length > 0 && 
        (!grouped[item.product_id].shopper_choices || Object.keys(grouped[item.product_id].shopper_choices).length === 0)) {
      grouped[item.product_id].shopper_choices = item.shopper_choices;
    }
  });

  return Object.values(grouped);
});

// Calculate estimated delivery fee
const estimatedDeliveryFee = computed(() => {
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    return 0;
  }

  // Get delivery cost from cart data or use default
  let rawDeliveryCost = 7.5; // Default fallback
  
  // Try to get delivery cost from cart data
  if (cart.items.delivery_cost) {
    rawDeliveryCost = parseFloat(cart.items.delivery_cost);
  } else if (cart.items.total_delivery_cost) {
    rawDeliveryCost = parseFloat(cart.items.total_delivery_cost);
  } else if (cart.items.delivery_fee) {
    rawDeliveryCost = parseFloat(cart.items.delivery_fee);
  }
  
  // Round up to the nearest whole number for display and calculation
  const roundedDeliveryCost = Math.ceil(rawDeliveryCost);
  
  console.log('🚚 Delivery fee calculation:', {
    rawDeliveryCost: rawDeliveryCost,
    roundedDeliveryCost: roundedDeliveryCost,
    cartDeliveryCost: cart.items.delivery_cost,
    cartTotalDeliveryCost: cart.items.total_delivery_cost,
    cartDeliveryFee: cart.items.delivery_fee,
    cartData: cart.items
  });
  
  return roundedDeliveryCost;
});

// Calculate total with delivery fee
const totalWithDelivery = computed(() => {
  const rawSubtotal = cart.items?.total_amount || 0;
  const subtotal = parseFloat(rawSubtotal);
  const deliveryFee = estimatedDeliveryFee.value;
  const total = subtotal + deliveryFee;
  
  console.log('🔍 Cart total calculation:', {
    rawSubtotal: rawSubtotal,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    calculation: `${subtotal} + ${deliveryFee} = ${total}`,
    cartTotalAmount: cart.items?.total_amount,
    cartItems: cart.items
  });
  
  // Ensure we return a proper number
  return Math.round(total * 100) / 100;
});

// Fetch attribute templates for products in cart
const fetchAttributeTemplates = async () => {
  try {
    // Get store category from sessionStorage (default store)
    const storeCategoryId = sessionStorage.getItem('defaultStore')
    
    if (!storeCategoryId) {
      console.warn('No default store category found, cannot fetch attribute templates')
      return
    }
    
    // Fetch attribute templates for the store category
    const response = await apiService.getStoreAttributesByStoreCategory({ 
      store_category_id: storeCategoryId 
    })
    
    const templates = response.data?.templates || []
    const templatesMap = {}
    templates.forEach(template => {
      templatesMap[template.id] = template.label || template.name
    })
    
    attributeTemplatesMap.value = templatesMap
    console.log('📋 Loaded attribute templates:', templatesMap)
  } catch (error) {
    console.warn('Failed to fetch attribute templates:', error)
  }
}

// Format shopper choice for display with label
const formatShopperChoice = (attrId, value) => {
  // Get the attribute label from the mapping
  const label = attributeTemplatesMap.value[attrId] || `Attribute ${attrId}`
  
  // Format the value
  let formattedValue = ''
  if (Array.isArray(value)) {
    formattedValue = value.join(', ')
  } else if (typeof value === 'boolean') {
    formattedValue = value ? 'Yes' : 'No'
  } else {
    formattedValue = String(value)
  }
  
  // Return "label: value" format
  return `${label}: ${formattedValue}`
}
</script>

<style scoped>
/* Additional styles if needed */
</style>