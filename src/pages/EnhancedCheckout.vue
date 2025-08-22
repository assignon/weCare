<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between py-4">
          <div class="flex items-center">
            <button @click="$router.go(-1)" class="p-2 text-gray-600 hover:text-gray-900 rounded-lg">
              <ArrowLeft class="w-5 h-5" />
            </button>
            <h1 class="ml-3 text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
          
          <!-- Checkout Steps -->
          <div class="hidden md:flex items-center space-x-4">
            <div 
              v-for="(step, index) in checkoutSteps" 
              :key="step.id"
              class="flex items-center"
            >
              <div 
                :class="currentStep >= index + 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'"
                class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              >
                {{ index + 1 }}
              </div>
              <span 
                :class="currentStep >= index + 1 ? 'text-blue-600' : 'text-gray-500'"
                class="ml-2 text-sm font-medium"
              >
                {{ step.name }}
              </span>
              <ChevronRight 
                v-if="index < checkoutSteps.length - 1" 
                class="w-4 h-4 text-gray-400 ml-4" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="lg:grid lg:grid-cols-12 lg:gap-8">
        <!-- Main Content -->
        <div class="lg:col-span-8">
          <!-- Step 1: Shipping Information -->
          <div v-if="currentStep === 1" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Shipping Information</h2>
            
            <!-- Saved Addresses -->
            <div v-if="savedAddresses.length > 0" class="mb-6">
              <h3 class="text-lg font-medium text-gray-900 mb-4">Choose from saved addresses</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                  v-for="address in savedAddresses" 
                  :key="address.id"
                  @click="selectAddress(address)"
                  :class="selectedAddress?.id === address.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'"
                  class="p-4 border-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center mb-2">
                        <span class="font-medium text-gray-900">{{ address.full_name }}</span>
                        <span v-if="address.is_default" class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Default
                        </span>
                      </div>
                      <p class="text-sm text-gray-600">{{ address.address_line_1 }}</p>
                      <p v-if="address.address_line_2" class="text-sm text-gray-600">{{ address.address_line_2 }}</p>
                      <p class="text-sm text-gray-600">
                        {{ address.city }}, {{ address.state }} {{ address.postal_code }}
                      </p>
                      <p class="text-sm text-gray-600">{{ address.country }}</p>
                      <p class="text-sm text-gray-600 mt-1">{{ address.phone_number }}</p>
                    </div>
                    <input
                      type="radio"
                      :checked="selectedAddress?.id === address.id"
                      class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      readonly
                    />
                  </div>
                </div>
              </div>
              
              <button 
                @click="showNewAddressForm = true"
                class="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                + Add new address
              </button>
            </div>

            <!-- New Address Form -->
            <div v-if="showNewAddressForm || savedAddresses.length === 0">
              <h3 v-if="savedAddresses.length > 0" class="text-lg font-medium text-gray-900 mb-4">Add new address</h3>
              
              <form @submit.prevent="saveAddress" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    v-model="newAddress.first_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    v-model="newAddress.last_name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 1 *</label>
                  <input
                    v-model="newAddress.address_line_1"
                    type="text"
                    required
                    placeholder="Street address, P.O. box, company name"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
                  <input
                    v-model="newAddress.address_line_2"
                    type="text"
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">City *</label>
                  <input
                    v-model="newAddress.city"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">State/Province *</label>
                  <input
                    v-model="newAddress.state"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Postal Code *</label>
                  <input
                    v-model="newAddress.postal_code"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                  <select
                    v-model="newAddress.country"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Country</option>
                    <option v-for="country in countries" :key="country.code" :value="country.name">
                      {{ country.name }}
                    </option>
                  </select>
                </div>
                
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    v-model="newAddress.phone_number"
                    type="tel"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div class="md:col-span-2">
                  <label class="flex items-center">
                    <input
                      v-model="newAddress.is_default"
                      type="checkbox"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span class="ml-2 text-sm text-gray-700">Set as default address</span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          <!-- Step 2: Delivery Options -->
          <div v-if="currentStep === 2" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Delivery Options</h2>
            
            <div class="space-y-4">
              <div 
                v-for="option in deliveryOptions" 
                :key="option.id"
                @click="selectDeliveryOption(option)"
                :class="selectedDeliveryOption?.id === option.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'"
                class="p-4 border-2 rounded-xl cursor-pointer transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <input
                      type="radio"
                      :checked="selectedDeliveryOption?.id === option.id"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      readonly
                    />
                    <div class="ml-3">
                      <div class="flex items-center">
                        <component :is="option.icon" class="w-5 h-5 text-gray-600 mr-2" />
                        <span class="font-medium text-gray-900">{{ option.name }}</span>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ option.description }}</p>
                      <p class="text-sm text-green-600 mt-1">{{ option.estimate }}</p>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-gray-900">
                      {{ option.price > 0 ? formatPrice(option.price) : 'Free' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Special Instructions -->
            <div class="mt-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Special delivery instructions (optional)</label>
              <textarea
                v-model="deliveryInstructions"
                rows="3"
                placeholder="e.g., Leave at door, Ring doorbell, etc."
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
          </div>

          <!-- Step 3: Payment -->
          <div v-if="currentStep === 3" class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Payment Information</h2>
            
            <!-- Payment Methods -->
            <div class="space-y-4 mb-6">
              <div 
                v-for="method in paymentMethods" 
                :key="method.id"
                @click="selectPaymentMethod(method)"
                :class="selectedPaymentMethod?.id === method.id 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'"
                class="p-4 border-2 rounded-xl cursor-pointer transition-colors"
              >
                <div class="flex items-center">
                  <input
                    type="radio"
                    :checked="selectedPaymentMethod?.id === method.id"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    readonly
                  />
                  <component :is="method.icon" class="w-6 h-6 text-gray-600 ml-3 mr-3" />
                  <span class="font-medium text-gray-900">{{ method.name }}</span>
                </div>
              </div>
            </div>

            <!-- Credit Card Form -->
            <div v-if="selectedPaymentMethod?.id === 'card'" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                <input
                  v-model="cardInfo.number"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                  <input
                    v-model="cardInfo.expiry"
                    type="text"
                    placeholder="MM/YY"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                  <input
                    v-model="cardInfo.cvv"
                    type="text"
                    placeholder="123"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Cardholder Name *</label>
                <input
                  v-model="cardInfo.name"
                  type="text"
                  placeholder="John Doe"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div class="flex items-center">
                <input
                  v-model="saveCard"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span class="ml-2 text-sm text-gray-700">Save card for future purchases</span>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between">
            <button
              v-if="currentStep > 1"
              @click="previousStep"
              class="flex items-center px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft class="w-4 h-4 mr-2" />
              Previous
            </button>
            <div v-else></div>
            
            <button
              v-if="currentStep < 3"
              @click="nextStep"
              :disabled="!canProceed"
              class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Continue
              <ArrowRight class="w-4 h-4 ml-2" />
            </button>
            <button
              v-else
              @click="placeOrder"
              :disabled="!canPlaceOrder || placingOrder"
              class="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <component :is="placingOrder ? Loader2 : CheckCircle" 
                         :class="{ 'animate-spin': placingOrder }" 
                         class="w-4 h-4 mr-2" />
              {{ placingOrder ? 'Placing Order...' : 'Place Order' }}
            </button>
          </div>
        </div>

        <!-- Order Summary Sidebar -->
        <div class="lg:col-span-4 mt-8 lg:mt-0">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>

            <!-- Order Items -->
            <div class="space-y-4 mb-6 max-h-64 overflow-y-auto">
              <div 
                v-for="item in orderItems" 
                :key="item.id"
                class="flex items-center space-x-3"
              >
                <img
                  :src="item.product.images?.[0]?.image || '/placeholder-product.jpg'"
                  :alt="item.product.name"
                  class="w-12 h-12 object-cover rounded-lg"
                />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ item.product.name }}</p>
                  <p class="text-xs text-gray-500">Qty: {{ item.quantity }}</p>
                </div>
                <p class="text-sm font-medium text-gray-900">
                  {{ formatPrice(item.product.price * item.quantity) }}
                </p>
              </div>
            </div>

            <!-- Summary -->
            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-medium">{{ formatPrice(subtotal) }}</span>
              </div>
              
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Shipping</span>
                <span class="font-medium">
                  {{ selectedDeliveryOption?.price > 0 ? formatPrice(selectedDeliveryOption.price) : 'Free' }}
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

            <!-- Security Info -->
            <div class="flex items-center justify-center text-sm text-gray-500">
              <Shield class="w-4 h-4 mr-2" />
              Secure 256-bit SSL encryption
            </div>
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
  ArrowLeft, ArrowRight, ChevronRight, CheckCircle, Shield, 
  Truck, Clock, Zap, CreditCard, Smartphone, Wallet,
  Loader2
} from 'lucide-vue-next'

const router = useRouter()
const { formatPrice } = useCurrency()
const cartStore = useCartStore()

// State
const currentStep = ref(1)
const placingOrder = ref(false)
const showNewAddressForm = ref(false)
const saveCard = ref(false)

// Data
const savedAddresses = ref([])
const countries = ref([])
const orderItems = ref([])

// Selected options
const selectedAddress = ref(null)
const selectedDeliveryOption = ref(null)
const selectedPaymentMethod = ref(null)

// Form data
const newAddress = reactive({
  first_name: '',
  last_name: '',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  phone_number: '',
  is_default: false
})

const cardInfo = reactive({
  number: '',
  expiry: '',
  cvv: '',
  name: ''
})

const deliveryInstructions = ref('')

// Configuration
const checkoutSteps = [
  { id: 1, name: 'Shipping' },
  { id: 2, name: 'Delivery' },
  { id: 3, name: 'Payment' }
]

const deliveryOptions = [
  {
    id: 'standard',
    name: 'Standard Delivery',
    description: 'Delivered to your doorstep',
    estimate: 'Arrives in 3-5 business days',
    price: 0,
    icon: Truck
  },
  {
    id: 'express',
    name: 'Express Delivery',
    description: 'Faster delivery option',
    estimate: 'Arrives in 1-2 business days',
    price: 15.99,
    icon: Clock
  },
  {
    id: 'same_day',
    name: 'Same Day Delivery',
    description: 'Order by 2 PM for same day delivery',
    estimate: 'Arrives today',
    price: 25.99,
    icon: Zap
  }
]

const paymentMethods = [
  {
    id: 'card',
    name: 'Credit/Debit Card',
    icon: CreditCard
  },
  {
    id: 'mobile',
    name: 'Mobile Money',
    icon: Smartphone
  },
  {
    id: 'wallet',
    name: 'Digital Wallet',
    icon: Wallet
  }
]

// Mock order items
orderItems.value = [
  {
    id: 1,
    product: {
      id: 101,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      images: [{ image: '/headphones.jpg' }]
    },
    quantity: 2
  },
  {
    id: 2,
    product: {
      id: 102,
      name: 'Smart Fitness Watch',
      price: 199.99,
      images: [{ image: '/watch.jpg' }]
    },
    quantity: 1
  }
]

// Computed properties
const subtotal = computed(() => {
  return orderItems.value.reduce((total, item) => {
    return total + (item.product.price * item.quantity)
  }, 0)
})

const shippingCost = computed(() => {
  return selectedDeliveryOption.value?.price || 0
})

const taxAmount = computed(() => {
  return (subtotal.value + shippingCost.value) * 0.08 // 8% tax
})

const total = computed(() => {
  return subtotal.value + shippingCost.value + taxAmount.value
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return selectedAddress.value !== null
    case 2:
      return selectedDeliveryOption.value !== null
    case 3:
      return selectedPaymentMethod.value !== null
    default:
      return false
  }
})

const canPlaceOrder = computed(() => {
  return selectedAddress.value && 
         selectedDeliveryOption.value && 
         selectedPaymentMethod.value &&
         (selectedPaymentMethod.value.id !== 'card' || isCardInfoValid.value)
})

const isCardInfoValid = computed(() => {
  if (selectedPaymentMethod.value?.id !== 'card') return true
  return cardInfo.number && cardInfo.expiry && cardInfo.cvv && cardInfo.name
})

// Methods
const selectAddress = (address) => {
  selectedAddress.value = address
  showNewAddressForm.value = false
}

const selectDeliveryOption = (option) => {
  selectedDeliveryOption.value = option
}

const selectPaymentMethod = (method) => {
  selectedPaymentMethod.value = method
}

const saveAddress = async () => {
  try {
    const response = await apiService.createAddress(newAddress)
    savedAddresses.value.push(response.data)
    selectedAddress.value = response.data
    showNewAddressForm.value = false
    
    // Reset form
    Object.keys(newAddress).forEach(key => {
      if (typeof newAddress[key] === 'boolean') {
        newAddress[key] = false
      } else {
        newAddress[key] = ''
      }
    })
  } catch (error) {
    console.error('Error saving address:', error)
  }
}

const nextStep = () => {
  if (canProceed.value && currentStep.value < 3) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const placeOrder = async () => {
  if (!canPlaceOrder.value) return
  
  placingOrder.value = true
  
  try {
    const orderData = {
      shipping_address: selectedAddress.value.id,
      delivery_option: selectedDeliveryOption.value.id,
      delivery_instructions: deliveryInstructions.value,
      payment_method: selectedPaymentMethod.value.id,
      items: orderItems.value.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        variant_id: item.variant?.id
      }))
    }
    
    if (selectedPaymentMethod.value.id === 'card') {
      orderData.card_info = cardInfo
      orderData.save_card = saveCard.value
    }
    
    const response = await apiService.createOrderFromCart(orderData)
    const orderId = response.data.id || response.data.order_id
    
    // Clear cart
    await cartStore.clearCart()
    
    // Redirect to success page
    router.push(`/payment-success?order_id=${orderId}`)
  } catch (error) {
    console.error('Error placing order:', error)
    // Handle error - show error message
  } finally {
    placingOrder.value = false
  }
}

// Lifecycle
onMounted(async () => {
  try {
    // Load saved addresses
    const addressResponse = await apiService.getAddresses()
    savedAddresses.value = addressResponse.data.results || addressResponse.data || []
    
    // Set default address if available
    const defaultAddress = savedAddresses.value.find(addr => addr.is_default)
    if (defaultAddress) {
      selectedAddress.value = defaultAddress
    }
    
    // Load countries
    const countriesResponse = await apiService.getCountries()
    countries.value = countriesResponse.data.results || countriesResponse.data || []
    
    // Set default delivery option
    selectedDeliveryOption.value = deliveryOptions[0]
    
    // Set default payment method
    selectedPaymentMethod.value = paymentMethods[0]
  } catch (error) {
    console.error('Error loading checkout data:', error)
  }
})
</script>

<style scoped>
/* Add any custom styles here */
</style>