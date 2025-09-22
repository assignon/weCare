<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-24">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button 
          @click="$router.back()"
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>

        <h1 class="text-xl font-bold text-gray-900">Delivery Cost Demo</h1>

        <div class="w-10"></div>
      </div>

      <!-- Scenario Selection -->
      <div class="mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Test Scenarios</h2>
          <div class="grid grid-cols-1 gap-3">
            <button
              v-for="(scenario, key) in scenarios"
              :key="key"
              @click="testScenario(key)"
              :class="[
                'p-4 rounded-lg border-2 text-left transition-all duration-200',
                selectedScenario === key
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ scenario.name }}</h3>
                  <p class="text-sm text-gray-600 mt-1">{{ scenario.description }}</p>
                </div>
                <div class="text-sm text-gray-500">
                  Expected: {{ formatPrice(scenario.expectedCost) }}
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Current Test Details -->
      <div v-if="selectedScenario" class="mb-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Test Details</h2>
          <div class="space-y-3">
            <div>
              <h3 class="font-medium text-gray-700">Cart Items:</h3>
              <div class="mt-2 space-y-2">
                <div
                  v-for="(item, index) in currentTestItems"
                  :key="index"
                  class="p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="text-sm font-medium">Item {{ index + 1 }}</span>
                      <span class="text-sm text-gray-600 ml-2">
                        Seller: {{ item.product.seller.name }}
                      </span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-xs font-medium',
                          item.express_delivery
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        ]"
                      >
                        {{ item.express_delivery ? 'Express' : 'Standard' }}
                      </span>
                      <span class="text-sm text-gray-600">Qty: {{ item.quantity }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Cost Calculation Results -->
      <div v-if="selectedScenario">
        <DeliveryCostBreakdown
          :loading="deliveryCostStore.loading"
          :error="deliveryCostStore.error"
          :total-delivery-cost="deliveryCostStore.totalDeliveryCost"
          :seller-groups="deliveryCostStore.deliveryCosts.seller_groups"
          :breakdown="deliveryCostStore.deliveryCosts.breakdown"
        />
      </div>

      <!-- Test Results -->
      <div v-if="selectedScenario && !deliveryCostStore.loading" class="mt-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
          
          <div class="space-y-3">
            <!-- Expected vs Actual -->
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Expected Cost:</span>
              <span class="text-sm text-gray-900">{{ formatPrice(scenarios[selectedScenario].expectedCost) }}</span>
            </div>
            
            <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span class="text-sm font-medium text-gray-700">Actual Cost:</span>
              <span class="text-sm text-gray-900">{{ formatPrice(deliveryCostStore.totalDeliveryCost) }}</span>
            </div>
            
            <!-- Test Status -->
            <div class="flex justify-between items-center p-3 rounded-lg" :class="testStatusClass">
              <span class="text-sm font-medium">Test Result:</span>
              <span class="text-sm font-semibold">{{ testStatusText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Debug Information -->
      <div v-if="selectedScenario && showDebugInfo" class="mt-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Debug Information</h2>
            <button
              @click="showDebugInfo = false"
              class="text-gray-500 hover:text-gray-700"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          
          <div class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
            <pre>{{ JSON.stringify(deliveryCostStore.getDeliveryDebugInfo(), null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-6 flex space-x-4">
        <button
          @click="showDebugInfo = !showDebugInfo"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
        >
          {{ showDebugInfo ? 'Hide Debug' : 'Show Debug' }}
        </button>
        
        <button
          @click="runAllTests"
          :disabled="isRunningAllTests"
          class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 px-4 rounded-xl font-medium transition-colors duration-200"
        >
          {{ isRunningAllTests ? 'Running Tests...' : 'Run All Tests' }}
        </button>
      </div>

      <!-- All Tests Results -->
      <div v-if="allTestsResults.length > 0" class="mt-6">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">All Tests Summary</h2>
          
          <div class="space-y-2">
            <div
              v-for="result in allTestsResults"
              :key="result.scenario"
              class="flex justify-between items-center p-3 rounded-lg"
              :class="result.passed ? 'bg-green-50' : 'bg-red-50'"
            >
              <span class="text-sm font-medium">{{ result.name }}</span>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-600">
                  {{ formatPrice(result.expected) }} → {{ formatPrice(result.actual) }}
                </span>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]"
                >
                  {{ result.passed ? 'PASS' : 'FAIL' }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex justify-between items-center">
              <span class="font-medium text-gray-700">Overall Result:</span>
              <span
                :class="[
                  'px-3 py-1 rounded-full text-sm font-medium',
                  allTestsPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ passedTests }}/{{ allTestsResults.length }} Tests Passed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { ArrowLeft, X } from 'lucide-vue-next'
import { useDeliveryCostStore } from '@/stores/deliveryCost'
import { useCurrency } from '@/composables/useCurrency'
import { exampleScenarios } from '@/utils/deliveryCost'
import DeliveryCostBreakdown from '@/components/DeliveryCostBreakdown.vue'

const deliveryCostStore = useDeliveryCostStore()
const { formatApiPrice } = useCurrency()

// State
const selectedScenario = ref(null)
const currentTestItems = ref([])
const showDebugInfo = ref(false)
const isRunningAllTests = ref(false)
const allTestsResults = ref([])

// Test scenarios based on user requirements
const scenarios = {
  singleSellerStandard: {
    name: 'Scenario 1: Single Seller - All Standard',
    description: 'Items 1 & 2 from Seller 1, both standard delivery',
    items: exampleScenarios.singleSellerStandard,
    expectedCost: 10 // Standard delivery cost only
  },
  singleSellerMixed: {
    name: 'Scenario 2: Single Seller - Mixed Delivery', 
    description: 'Items from Seller 1, one standard + one express',
    items: exampleScenarios.singleSellerMixed,
    expectedCost: 25 // Standard (10) + Express (15)
  },
  singleSellerExpress: {
    name: 'Scenario 3: Single Seller - All Express',
    description: 'Items 1 & 2 from Seller 1, both express delivery', 
    items: exampleScenarios.singleSellerExpress,
    expectedCost: 15 // Express delivery cost only
  },
  multiSeller: {
    name: 'Multi-Seller Example',
    description: 'Seller 1 (standard) + Seller 2 (standard + express)',
    items: exampleScenarios.multiSeller,
    expectedCost: 35 // Seller 1: 10 + Seller 2: 25
  }
}

// Computed properties
const testStatusClass = computed(() => {
  if (!selectedScenario.value || deliveryCostStore.loading) return 'bg-gray-50'
  
  const expected = scenarios[selectedScenario.value].expectedCost
  const actual = deliveryCostStore.totalDeliveryCost
  
  return expected === actual ? 'bg-green-50' : 'bg-red-50'
})

const testStatusText = computed(() => {
  if (!selectedScenario.value || deliveryCostStore.loading) return 'Pending'
  
  const expected = scenarios[selectedScenario.value].expectedCost
  const actual = deliveryCostStore.totalDeliveryCost
  
  return expected === actual ? 'PASS ✅' : 'FAIL ❌'
})

const allTestsPassed = computed(() => {
  return allTestsResults.value.length > 0 && allTestsResults.value.every(result => result.passed)
})

const passedTests = computed(() => {
  return allTestsResults.value.filter(result => result.passed).length
})

// Helper functions
const formatPrice = (price) => {
  return formatApiPrice(price)
}

// Test functions
const testScenario = async (scenarioKey) => {
  selectedScenario.value = scenarioKey
  currentTestItems.value = scenarios[scenarioKey].items
  
  try {
    await deliveryCostStore.calculateDeliveryCostLocally(currentTestItems.value)
  } catch (error) {
    console.error('Error testing scenario:', error)
  }
}

const runAllTests = async () => {
  isRunningAllTests.value = true
  allTestsResults.value = []
  
  try {
    for (const [key, scenario] of Object.entries(scenarios)) {
      // Run test for this scenario
      await deliveryCostStore.calculateDeliveryCostLocally(scenario.items)
      
      // Wait for state to update
      await nextTick()
      
      const result = {
        scenario: key,
        name: scenario.name,
        expected: scenario.expectedCost,
        actual: deliveryCostStore.totalDeliveryCost,
        passed: scenario.expectedCost === deliveryCostStore.totalDeliveryCost
      }
      
      allTestsResults.value.push(result)
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  } catch (error) {
    console.error('Error running all tests:', error)
  } finally {
    isRunningAllTests.value = false
  }
}

// Initialize with first scenario
testScenario('singleSellerStandard')
</script>