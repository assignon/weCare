<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Checkout Step 2 - Delivery Cost Test</h1>
      
      <!-- Mock cart setup -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Mock Cart Setup</h2>
        
        <div class="space-y-4">
          <button
            @click="setupSingleSellerStandard"
            class="w-full p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-left transition-colors"
          >
            <h3 class="font-medium text-blue-900">Single Seller - All Standard</h3>
            <p class="text-sm text-blue-700">2 items from Seller 1, both standard delivery</p>
            <p class="text-xs text-blue-600">Expected: 10 FCFA</p>
          </button>
          
          <button
            @click="setupSingleSellerMixed"
            class="w-full p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-left transition-colors"
          >
            <h3 class="font-medium text-green-900">Single Seller - Mixed Delivery</h3>
            <p class="text-sm text-green-700">2 items from Seller 1, 1 standard + 1 express</p>
            <p class="text-xs text-green-600">Expected: 25 FCFA (10 + 15)</p>
          </button>
          
          <button
            @click="setupMultiSeller"
            class="w-full p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-left transition-colors"
          >
            <h3 class="font-medium text-purple-900">Multi Seller Example</h3>
            <p class="text-sm text-purple-700">Seller 1: 2 standard, Seller 2: 1 standard + 1 express</p>
            <p class="text-xs text-purple-600">Expected: 35 FCFA (10 + 25)</p>
          </button>
        </div>
      </div>

      <!-- Delivery Cost Breakdown Component Test -->
      <div v-if="mockCartItems.length > 0">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Delivery Cost Breakdown</h2>
        
        <DeliveryCostBreakdown
          :loading="deliveryCost.loading"
          :error="deliveryCost.error"
          :total-delivery-cost="deliveryCost.totalDeliveryCost"
          :seller-groups="deliveryCost.deliveryCosts.seller_groups"
          :breakdown="deliveryCost.deliveryCosts.breakdown"
        />

        <!-- Test Results -->
        <div class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Test Results</h3>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Expected Cost:</span>
              <span class="text-sm text-gray-900">{{ expectedCost }} FCFA</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Actual Cost:</span>
              <span class="text-sm text-gray-900">{{ deliveryCost.totalDeliveryCost }} FCFA</span>
            </div>
            
            <div 
              class="flex justify-between items-center p-3 rounded-lg"
              :class="testPassed ? 'bg-green-50' : 'bg-red-50'"
            >
              <span class="text-sm font-medium">Test Result:</span>
              <span 
                class="text-sm font-semibold"
                :class="testPassed ? 'text-green-800' : 'text-red-800'"
              >
                {{ testPassed ? 'PASS ✅' : 'FAIL ❌' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Debug Info -->
        <div v-if="showDebug" class="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Debug Information</h3>
          <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
            <pre>{{ JSON.stringify(deliveryCost.getDeliveryDebugInfo(), null, 2) }}</pre>
          </div>
        </div>

        <div class="mt-4 flex space-x-4">
          <button
            @click="showDebug = !showDebug"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            {{ showDebug ? 'Hide Debug' : 'Show Debug' }}
          </button>
          
          <button
            @click="recalculate"
            :disabled="deliveryCost.loading"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
          >
            {{ deliveryCost.loading ? 'Calculating...' : 'Recalculate' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDeliveryCostStore } from '@/stores/deliveryCost'
import DeliveryCostBreakdown from '@/components/DeliveryCostBreakdown.vue'

const deliveryCost = useDeliveryCostStore()

// State
const mockCartItems = ref([])
const expectedCost = ref(0)
const showDebug = ref(false)

// Computed
const testPassed = computed(() => {
  return deliveryCost.totalDeliveryCost === expectedCost.value
})

// Test scenarios
const setupSingleSellerStandard = async () => {
  mockCartItems.value = [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    }
  ]
  expectedCost.value = 10
  await calculateCost()
}

const setupSingleSellerMixed = async () => {
  mockCartItems.value = [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: true,
      quantity: 1
    }
  ]
  expectedCost.value = 25
  await calculateCost()
}

const setupMultiSeller = async () => {
  mockCartItems.value = [
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 1, name: 'Seller 1' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 2, name: 'Seller 2' } },
      express_delivery: false,
      quantity: 1
    },
    {
      product: { seller: { id: 2, name: 'Seller 2' } },
      express_delivery: true,
      quantity: 1
    }
  ]
  expectedCost.value = 35
  await calculateCost()
}

const calculateCost = async () => {
  if (mockCartItems.value.length === 0) return
  
  try {
    // Try API first, then fallback to local calculation
    await deliveryCost.calculateDeliveryCostFromAPI(mockCartItems.value)
  } catch (error) {
    console.error('API calculation failed, using local calculation:', error)
    deliveryCost.calculateDeliveryCostLocally(mockCartItems.value)
  }
}

const recalculate = async () => {
  await calculateCost()
}
</script>