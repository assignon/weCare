<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">Debug Delivery Cost Display</h1>
      
      <!-- Debug Information -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Debug Info</h2>
        
        <div class="space-y-4 text-sm">
          <div>
            <strong>Loading State:</strong>
            <span :class="loading ? 'text-red-600' : 'text-green-600'">
              {{ loading ? 'Loading...' : 'Not Loading' }}
            </span>
          </div>
          
          <div>
            <strong>Error State:</strong>
            <span :class="error ? 'text-red-600' : 'text-green-600'">
              {{ error || 'No Error' }}
            </span>
          </div>
          
          <div>
            <strong>Total Delivery Cost:</strong>
            <span class="font-mono">{{ totalDeliveryCost }} FCFA</span>
          </div>
          
          <div>
            <strong>Seller Groups Count:</strong>
            <span class="font-mono">{{ sellerGroups.length }}</span>
          </div>
          
          <div>
            <strong>Raw Seller Groups:</strong>
            <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(sellerGroups, null, 2) }}</pre>
          </div>
          
          <div>
            <strong>Raw Breakdown:</strong>
            <pre class="bg-gray-100 p-2 rounded text-xs overflow-auto">{{ JSON.stringify(breakdown, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <!-- Force Show Component with Test Data -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Force Test with Mock Data</h2>
        
        <button 
          @click="loadTestData"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mb-4"
        >
          Load Test Data
        </button>
        
        <DeliveryCostBreakdown
          :loading="loading"
          :error="error"
          :total-delivery-cost="totalDeliveryCost"
          :seller-groups="sellerGroups"
          :breakdown="breakdown"
        />
      </div>

      <!-- Minimal Working Example -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Minimal Working Example</h2>
        
        <DeliveryCostBreakdown
          :loading="false"
          :error="null"
          :total-delivery-cost="35"
          :seller-groups="minimalSellerGroups"
          :breakdown="minimalBreakdown"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DeliveryCostBreakdown from '@/components/DeliveryCostBreakdown.vue'

// State
const loading = ref(false)
const error = ref(null)
const totalDeliveryCost = ref(0)
const sellerGroups = ref([])
const breakdown = ref({
  total_standard_cost: 0,
  total_express_cost: 0,
  total_mixed_cost: 0
})

// Minimal working data
const minimalSellerGroups = [
  {
    seller_id: 1,
    seller_name: 'Seller 1',
    delivery_cost: 10,
    delivery_type: 'standard',
    breakdown: {
      standard_cost: 10,
      express_cost: 0,
      total_cost: 10
    },
    items: [{ id: 1 }, { id: 2 }]
  },
  {
    seller_id: 2,
    seller_name: 'Seller 2', 
    delivery_cost: 25,
    delivery_type: 'mixed',
    breakdown: {
      standard_cost: 10,
      express_cost: 15,
      total_cost: 25
    },
    items: [{ id: 3 }, { id: 4 }]
  }
]

const minimalBreakdown = {
  total_standard_cost: 20,
  total_express_cost: 15,
  total_mixed_cost: 0
}

// Functions
const loadTestData = () => {
  loading.value = false
  error.value = null
  totalDeliveryCost.value = 35
  sellerGroups.value = [...minimalSellerGroups]
  breakdown.value = { ...minimalBreakdown }
  
  console.log('Test data loaded:', {
    loading: loading.value,
    error: error.value,
    totalDeliveryCost: totalDeliveryCost.value,
    sellerGroups: sellerGroups.value,
    breakdown: breakdown.value
  })
}

// Initialize with test data
loadTestData()
</script>