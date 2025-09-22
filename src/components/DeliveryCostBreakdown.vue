<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <!-- Header (Always visible) -->
    <div 
      class="px-4 py-3 border-b border-gray-100 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors duration-200 group"
      @click="toggleAccordion"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <h3 class="text-sm font-semibold text-gray-900">Delivery Costs</h3>
        </div>
        <div class="flex items-center space-x-2">
          <Truck class="w-4 h-4 text-gray-500" />
          <span class="text-sm text-gray-600">{{ sellerCount }} seller{{ sellerCount > 1 ? 's' : '' }}</span>
          <!-- Accordion toggle icon -->
          <ChevronDown 
            class="w-4 h-4 text-gray-500 transition-transform duration-200 group-hover:text-gray-700"
            :class="{ 'rotate-180': isExpanded }"
          />
        </div>
      </div>
    </div>

    <!-- Collapsible Body Content -->
    <div 
      v-show="isExpanded" 
      class="transition-all duration-300 ease-in-out overflow-hidden"
      :class="{ 'opacity-100': isExpanded, 'opacity-0': !isExpanded }"
    >
      <!-- Loading state -->
      <div v-if="loading" class="p-4 flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-sm text-gray-600">Calculating delivery costs...</span>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="p-4">
        <div class="flex items-center space-x-2 text-red-600">
          <Info class="w-4 h-4" />
          <span class="text-sm">{{ error }}</span>
        </div>
      </div>

      <!-- Delivery cost breakdown -->
      <div v-else class="p-4">
      <!-- Show default delivery info when no specific breakdown available -->
      <div v-if="totalDeliveryCost === 0 && sellerGroups.length === 0" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-gray-700">Standard Delivery</span>
          <span class="text-sm text-gray-900 font-semibold">10 FCFA</span>
        </div>
        <div class="flex items-center space-x-2">
          <Truck class="w-4 h-4 text-green-500" />
          <span class="text-xs font-medium text-gray-600">Standard Delivery</span>
        </div>
        <div class="bg-blue-50 rounded-lg p-3">
          <p class="text-xs text-blue-700">Default delivery cost. Final cost may vary based on your selected options and location.</p>
        </div>
      </div>
      
      <!-- Single seller case -->
      <div v-else-if="sellerGroups.length === 1" class="space-y-3">
        <div v-for="seller in sellerGroups" :key="seller.seller_id">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">{{ seller.seller_name }}</span>
            <span class="text-sm text-gray-900 font-semibold">{{ formatPrice(seller.delivery_cost) }}</span>
          </div>
          
          <!-- Delivery type indicator -->
          <div class="flex items-center space-x-2 mb-2">
            <div class="flex items-center space-x-1">
              <component 
                :is="getDeliveryIcon(seller.delivery_type)" 
                class="w-4 h-4" 
                :class="getDeliveryIconColor(seller.delivery_type)"
              />
              <span class="text-xs font-medium text-gray-600 capitalize">
                {{ getDeliveryTypeLabel(seller.delivery_type) }}
              </span>
            </div>
          </div>

          <!-- Detailed breakdown for mixed delivery -->
          <div v-if="seller.delivery_type === 'mixed'" class="bg-gray-50 rounded-lg p-3 space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-600">Standard items:</span>
              <span class="text-gray-900">{{ formatPrice(seller.breakdown.standard_cost) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-600">Express items:</span>
              <span class="text-gray-900">{{ formatPrice(seller.breakdown.express_cost) }}</span>
            </div>
            <div class="border-t border-gray-200 pt-2 flex justify-between items-center text-xs font-medium">
              <span class="text-gray-700">Subtotal:</span>
              <span class="text-gray-900">{{ formatPrice(seller.breakdown.total_cost) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Multiple sellers case or any case with seller groups -->
      <div v-else-if="sellerGroups.length > 0" class="space-y-4">
        <div v-for="(seller, index) in sellerGroups" :key="seller.seller_id" class="border border-gray-100 rounded-lg p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">
              {{ seller.seller_name }} 
              <span class="text-xs text-gray-500">({{ getSellerFormula(seller) }})</span>
            </span>
            <span class="text-sm text-gray-900 font-semibold">{{ formatPrice(seller.delivery_cost) }}</span>
          </div>
          
          <!-- Delivery type indicator -->
          <div class="flex items-center space-x-2 mb-2">
            <component 
              :is="getDeliveryIcon(seller.delivery_type)" 
              class="w-4 h-4" 
              :class="getDeliveryIconColor(seller.delivery_type)"
            />
            <span class="text-xs font-medium text-gray-600 capitalize">
              {{ getDeliveryTypeLabel(seller.delivery_type) }}
            </span>
            <span class="text-xs text-gray-500">
              {{ seller.items.length }} item{{ seller.items.length > 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Detailed breakdown for mixed delivery -->
          <div v-if="seller.delivery_type === 'mixed'" class="bg-yellow-50 rounded-lg p-2 space-y-1">
            <div class="text-xs font-medium text-yellow-800 mb-1">Mixed Delivery Breakdown:</div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-600">• Standard items:</span>
              <span class="text-gray-900">{{ formatPrice(seller.breakdown.standard_cost) }}</span>
            </div>
            <div class="flex justify-between items-center text-xs">
              <span class="text-gray-600">• Express items:</span>
              <span class="text-gray-900">{{ formatPrice(seller.breakdown.express_cost) }}</span>
            </div>
            <div class="border-t border-yellow-200 pt-1 mt-1 flex justify-between items-center text-xs font-medium">
              <span class="text-yellow-800">Subtotal:</span>
              <span class="text-yellow-900">{{ formatPrice(seller.breakdown.total_cost) }}</span>
            </div>
          </div>
          
          <!-- Standard or Express only breakdown -->
          <div v-else class="bg-green-50 rounded-lg p-2">
            <div class="text-xs text-green-800">
              {{ seller.delivery_type === 'standard' ? '✓ Standard delivery only' : '⚡ Express delivery only' }}
            </div>
          </div>
        </div>

        <!-- Mathematical sum breakdown -->
        <div class="border-t border-gray-200 pt-4 bg-gray-50 rounded-lg p-3">
          <div class="text-sm font-medium text-gray-800 mb-2">Total Calculation:</div>
          
          <!-- Show the mathematical addition -->
          <div class="space-y-1 text-sm">
            <div v-for="(seller, index) in sellerGroups" :key="seller.seller_id" class="flex justify-between items-center">
              <span class="text-gray-600">
                {{ seller.seller_name }}:
              </span>
              <span class="text-gray-900 font-mono">
                {{ formatPrice(seller.delivery_cost) }}{{ index < sellerGroups.length - 1 ? ' +' : '' }}
              </span>
            </div>
            
            <div class="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center text-base font-bold">
              <span class="text-gray-900">Total Delivery Cost:</span>
              <span class="text-blue-600 font-mono">{{ formatPrice(totalDeliveryCost) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Fallback case -->
      <div v-else class="space-y-3">
        <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div class="text-sm font-medium text-yellow-800">No delivery data available</div>
          <div class="text-xs text-yellow-700 mt-1">
            Debug: TotalCost={{ totalDeliveryCost }}, SellerGroups={{ sellerGroups.length }}, Loading={{ loading }}, Error={{ error }}
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- Footer (Always visible) -->
    <div v-if="!loading && !error" class="border-t border-gray-100 px-4 py-3 bg-gray-50">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm font-medium text-gray-700">Total Delivery Cost</span>
          <div class="w-2 h-2 rounded-full" :class="getTotalCostStatusColor()"></div>
        </div>
        <span class="text-lg font-bold text-gray-900">{{ formatPrice(totalDeliveryCost) }}</span>
      </div>
      
      <!-- Delivery info -->
      <div class="mt-2 text-xs text-gray-500">
        {{ getDeliverySummary() }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Truck, Zap, Calendar, Clock, Info, ChevronDown } from 'lucide-vue-next'
import { useCurrency } from '@/composables/useCurrency'

// Accordion state
const isExpanded = ref(false)

// Toggle accordion
const toggleAccordion = () => {
  isExpanded.value = !isExpanded.value
}

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  totalDeliveryCost: {
    type: Number,
    default: 0
  },
  sellerGroups: {
    type: Array,
    default: () => []
  },
  breakdown: {
    type: Object,
    default: () => ({
      total_standard_cost: 0,
      total_express_cost: 0,
      total_mixed_cost: 0
    })
  }
})

// Debug: log props when they change
import { watch } from 'vue'
watch(() => props, (newProps) => {
  console.log('📦 DeliveryCostBreakdown props updated:', {
    loading: newProps.loading,
    error: newProps.error,
    totalDeliveryCost: newProps.totalDeliveryCost,
    sellerGroupsLength: newProps.sellerGroups.length,
    hasMultiple: newProps.sellerGroups.length > 1,
    sellerGroups: newProps.sellerGroups,
    breakdown: newProps.breakdown
  });
  
  // Log what should appear in debug box
  console.log('🔍 Debug box should show:', {
    'Loading': newProps.loading,
    'Error': newProps.error || 'null', 
    'TotalCost': newProps.totalDeliveryCost,
    'SellerGroups': newProps.sellerGroups.length,
    'HasMultiple': newProps.sellerGroups.length > 1
  });
}, { deep: true, immediate: true })

const { formatApiPrice } = useCurrency()

// Computed properties
const sellerCount = computed(() => props.sellerGroups.length)
const hasMultipleSellers = computed(() => sellerCount.value > 1)

// Helper functions
const formatPrice = (price) => {
  return formatApiPrice(price)
}

const getDeliveryIcon = (deliveryType) => {
  const icons = {
    standard: Truck,
    express: Zap,
    mixed: Calendar
  }
  return icons[deliveryType] || Truck
}

const getDeliveryIconColor = (deliveryType) => {
  const colors = {
    standard: 'text-green-500',
    express: 'text-yellow-500',
    mixed: 'text-blue-500'
  }
  return colors[deliveryType] || 'text-gray-500'
}

const getDeliveryTypeLabel = (deliveryType) => {
  const labels = {
    standard: 'Standard Delivery',
    express: 'Express Delivery',
    mixed: 'Mixed Delivery'
  }
  return labels[deliveryType] || 'Standard Delivery'
}

const getTotalCostStatusColor = () => {
  if (props.totalDeliveryCost === 0) return 'bg-gray-400'
  if (props.totalDeliveryCost < 20) return 'bg-green-400'
  if (props.totalDeliveryCost < 50) return 'bg-yellow-400'
  return 'bg-red-400'
}

const getDeliverySummary = () => {
  if (props.loading) return 'Calculating delivery costs...'
  if (props.error) return 'Error calculating delivery costs'
  if (props.totalDeliveryCost === 0) return 'Free delivery or delivery cost not calculated'
  if (props.sellerGroups.length === 0) return 'Standard delivery for all items'
  
  const standardCount = props.sellerGroups.filter(s => s.delivery_type === 'standard').length
  const expressCount = props.sellerGroups.filter(s => s.delivery_type === 'express').length
  const mixedCount = props.sellerGroups.filter(s => s.delivery_type === 'mixed').length
  
  const parts = []
  if (standardCount > 0) parts.push(`${standardCount} standard`)
  if (expressCount > 0) parts.push(`${expressCount} express`)
  if (mixedCount > 0) parts.push(`${mixedCount} mixed`)
  
  return parts.length > 0 
    ? `Delivery types: ${parts.join(', ')}`
    : 'Standard delivery for all items'
}

// Generate mathematical formula for total calculation
const getCalculationFormula = () => {
  if (!props.sellerGroups || props.sellerGroups.length === 0) {
    return 'Standard delivery cost'
  }
  
  const sellerFormulas = props.sellerGroups.map(seller => {
    return `${seller.seller_name}(${getSellerFormula(seller)})`
  })
  
  return sellerFormulas.join(' + ')
}

// Generate formula for individual seller
const getSellerFormula = (seller) => {
  if (!seller) return 'standard'
  
  switch (seller.delivery_type) {
    case 'standard':
      return 'standard'
    case 'express':
      return 'express'
    case 'mixed':
      return 'standard + express'
    default:
      return 'standard'
  }
}
</script>