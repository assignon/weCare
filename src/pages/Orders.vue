<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader :title="$t('orders.title')" />
    <div class="p-3 pt-4">
      <!-- Header Info -->
      <div class="mb-3">
        <p class="text-xs text-gray-600 flex items-center">
          <ShoppingBag class="w-3 h-3 mr-1" />
          {{ totalOrders }} {{ $t('orders.orders_total') }}
        </p>
      </div>

      <!-- Search and Filters -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <!-- Search Bar -->
        <div class="mb-3">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Search class="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              :placeholder="$t('orders.search_placeholder')"
              class="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Status Filters -->
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="status in quickStatusOptions"
            :key="status.value"
            @click="onQuickStatusChange(status.value)"
            :class="[
              'px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1',
              quickStatusFilter === status.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            ]"
          >
            <component :is="getFilterIcon(status.value)" class="w-3 h-3" />
            <span>{{ status.text }}</span>
            <span v-if="statusCounts[status.value]" 
                  :class="[
                    'px-1 py-0.5 rounded text-xs font-bold',
                    quickStatusFilter === status.value ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  ]">
              {{ statusCounts[status.value] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && orders.length === 0" class="text-center py-12">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('orders.loading') }}</h3>
        <p class="text-xs text-gray-600">{{ $t('orders.loading_subtitle') }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <AlertCircle class="w-3.5 h-3.5 text-red-600" />
          </div>
          <div class="flex-1">
            <h4 class="text-xs font-semibold text-red-800 mb-0.5">{{ $t('orders.error_loading') }}</h4>
            <p class="text-xs text-red-700">{{ error }}</p>
          </div>
          <button @click="error = null" class="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
            <X class="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Orders List -->
      <div v-if="!loading && orders.length > 0" class="space-y-2">
        <div 
          v-for="order in orders" 
          :key="order.id"
          @click="goToOrderDetails(order.id)"
          class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all duration-200"
        >
          <!-- Order Header -->
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <div class="flex items-center space-x-1.5 mb-1.5">
                <div class="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag class="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ $t('orders.order') }} #{{ order.id }}</h3>
                  <p class="text-xs text-gray-600 flex items-center mt-0.5">
                    <Calendar class="w-2.5 h-2.5 mr-0.5" />
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>
              </div>
              
              <!-- Status Badge -->
              <div class="flex items-center space-x-1.5 mb-2">
                <div 
                  :class="[
                    'px-2 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1',
                    getStatusClasses(order.status)
                  ]"
                >
                  <component :is="getStatusIcon(order.status)" class="w-2.5 h-2.5" />
                  <span>{{ formatStatus(order.status) }}</span>
                </div>
                <span class="text-xs text-gray-500">
                  {{ order.items?.length || 0 }} {{ order.items?.length !== 1 ? $t('orders.items') : $t('orders.item') }}
                </span>
              </div>
            </div>
            
            <div class="text-right flex-shrink-0">
              <h4 class="text-sm font-bold text-blue-600">
                {{ formatApiPrice({
                  price: (parseFloat(order.total_amount) || 0) + (parseFloat(order.delivery_fee) || 0), 
                  currency_info: order.currency_info
                }) }}
              </h4>
            </div>
          </div>

          <!-- Products Preview -->
          <div class="mb-2">
            <div class="space-y-1.5">
              <div 
                v-for="(item, index) in order.items?.slice(0, 2)" 
                :key="index"
              >
                <div class="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      v-if="item.product?.main_image"
                      :src="item.product.main_image" 
                      :alt="item.product?.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Package class="w-3 h-3 text-gray-400" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">
                      {{ item.product?.name || 'Product' }}
                    </p>
                    <p class="text-xs text-gray-600 flex items-center mt-0.5">
                      <Hash class="w-2 h-2 mr-0.5" />
                      {{ $t('orders.qty') }}: {{ item.quantity }}
                    </p>
                  </div>
                </div>
              </div>
              <p v-if="order.items?.length > 2" class="text-xs text-gray-500 text-center py-1.5 bg-gray-50 rounded-lg">
                {{ (order.items.length - 2) === 1 ? $t('orders.more_items', { count: order.items.length - 2 }) : $t('orders.more_items_plural', { count: order.items.length - 2 }) }}
              </p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex space-x-1.5">
              <!-- On Hold Status Action Buttons -->
              <div v-if="order.status === 'on_hold'" class="flex space-x-1.5">
                <button 
                  @click.stop="cancelOrder(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <X v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>{{ $t('orders.cancel') }}</span>
                </button>
                <button 
                  @click.stop="proceedOrder(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Play v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>{{ $t('orders.proceed') }}</span>
                </button>
              </div>

              <!-- Delivered No Confirmation Action Button -->
              <div v-if="order.status === 'delivered_no_confirmation'">
                <button 
                  @click.stop="confirmDelivery(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <CheckCircle v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>{{ $t('orders.confirm_delivery') }}</span>
                </button>
              </div>
            </div>

            <button 
              @click.stop="goToOrderDetails(order.id)"
              class="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center space-x-1"
            >
              <ArrowRight class="w-3 h-3" />
              <span>{{ $t('order_detail.view_details') }}</span>
            </button>
          </div>
        </div>

        <!-- Infinite Scroll Loading -->
        <div v-if="hasMoreOrders" ref="loadMoreTrigger" class="text-center py-4">
          <div v-if="loadingMore" class="flex items-center justify-center space-x-2">
            <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
              <Loader2 class="w-3.5 h-3.5 text-blue-600 animate-spin" />
            </div>
            <span class="text-xs text-gray-600 font-medium">{{ $t('orders.loading_more') }}</span>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreOrders && isFiltered && !loadingMore" class="text-center py-4">
          <button 
            @click="loadMoreOrders"
            :disabled="loadingMore"
            class="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
          >
            <span v-if="loadingMore" class="flex items-center space-x-1.5">
              <Loader2 class="w-3.5 h-3.5 animate-spin" />
              <span>{{ $t('common.loading') }}</span>
            </span>
            <span v-else class="flex items-center space-x-1.5">
              <Download class="w-3.5 h-3.5" />
              <span>{{ $t('orders.load_more') }}</span>
            </span>
          </button>
        </div>

        <!-- End of Results -->
        <div v-if="!hasMoreOrders && orders.length > 0" class="text-center py-6">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('orders.all_loaded') }}</h3>
          <p class="text-xs text-gray-600">{{ $t('orders.end_of_history') }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!loading && orders.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ $t('orders.no_orders_found') }}</h3>
        <p class="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          {{ searchTerm || selectedStatus ? $t('orders.no_match_filters') : $t('orders.no_orders_yet') }}
        </p>
        <div class="space-x-2">
          <button 
            v-if="!searchTerm && !selectedStatus"
            @click="$router.push({ name: 'Home' })"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1.5 mx-auto"
          >
            <ShoppingCart class="w-4 h-4" />
            <span>{{ $t('orders.start_shopping') }}</span>
          </button>
          <button 
            v-else
            @click="clearFilters"
            class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 flex items-center space-x-1.5 mx-auto"
          >
            <RefreshCw class="w-4 h-4" />
            <span>{{ $t('orders.clear_filters') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Cancel Order Confirmation Dialog -->
    <div 
      v-if="showCancelDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showCancelDialog = false"
    >
      <div 
        class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">{{ $t('orders.cancel_order_title') }}</h3>
            <p class="text-gray-600 text-xs">{{ $t('orders.order') }} #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-4">{{ $t('orders.cancel_order_message') }}</p>
        <div class="flex space-x-2">
          <button 
            @click="showCancelDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            {{ $t('orders.keep_order') }}
          </button>
          <button 
            @click="executeCancelOrder"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-3.5 h-3.5 animate-spin" />
            <X v-else class="w-3.5 h-3.5" />
            <span>{{ $t('orders.cancel_order') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Proceed Order Confirmation Dialog -->
    <div 
      v-if="showProceedDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showProceedDialog = false"
    >
      <div 
        class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <Play class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">{{ $t('orders.proceed_order_title') }}</h3>
            <p class="text-gray-600 text-xs">{{ $t('orders.order') }} #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-4">{{ $t('orders.proceed_order_message') }}</p>
        <div class="flex space-x-2">
          <button 
            @click="showProceedDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            {{ $t('orders.keep_on_hold') }}
          </button>
          <button 
            @click="executeProceedOrder"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-3.5 h-3.5 animate-spin" />
            <Play v-else class="w-3.5 h-3.5" />
            <span>{{ $t('orders.proceed') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Delivery Confirmation Dialog -->
    <div 
      v-if="showDeliveryConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showDeliveryConfirmDialog = false"
    >
      <div 
        class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <CheckCircle class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">{{ $t('orders.confirm_delivery_title') }}</h3>
            <p class="text-gray-600 text-xs">{{ $t('orders.order') }} #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-4">{{ $t('orders.confirm_delivery_message') }}</p>
        <div class="flex space-x-2">
          <button 
            @click="showDeliveryConfirmDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            {{ $t('orders.not_yet') }}
          </button>
          <button 
            @click="executeDeliveryConfirmation"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-3.5 h-3.5 animate-spin" />
            <CheckCircle v-else class="w-3.5 h-3.5" />
            <span>{{ $t('orders.confirm_delivery') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import { debounce } from 'lodash'
import { useCurrency } from '@/composables/useCurrency'
import BottomNavigation from '@/components/BottomNavigation.vue'
import BackButtonHeader from '@/components/BackButtonHeader.vue'

const { t } = useI18n()
import { 
  Search, Package, ArrowRight, Loader2, AlertCircle, X, CheckCircle, 
  Play, AlertTriangle, Clock, Truck, CheckCircle2, XCircle, Calendar,
  Filter, ShoppingBag, Download, RefreshCw, Hash, ShoppingCart
} from 'lucide-vue-next'

const router = useRouter()
const { formatApiPrice } = useCurrency()

// Reactive data
const orders = ref([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref(null)
const searchTerm = ref('')
const selectedStatus = ref(null)
const selectedDateRange = ref('all')
const quickStatusFilter = ref(null)
const statusCounts = ref({})
const totalOrders = ref(0)
const hasMoreOrders = ref(true)
const loadMoreTrigger = ref(null)
const updatingOrderId = ref(null)
const showCancelDialog = ref(false)
const showProceedDialog = ref(false)
const showDeliveryConfirmDialog = ref(false)
const orderToUpdate = ref(null)

// Pagination data
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// Filter options
const statusOptions = [
  { title: 'Pending', value: 'pending' },
  { title: 'On Hold', value: 'on_hold' },
  { title: 'Processed', value: 'assigned_to_driver' },
  { title: 'Picked up', value: 'picked_up' },
  { title: 'Delivered (Confirmation Needed)', value: 'delivered_no_confirmation' },
  { title: 'Delivered', value: 'delivered' },
  { title: 'Cancelled', value: 'cancelled' }
]

const quickStatusOptions = computed(() => [
  { text: t('orders.all'), value: 'all' },
  { text: t('orders.pending'), value: 'pending' },
  { text: t('orders.delivered'), value: 'delivered' },
  { text: t('orders.cancelled'), value: 'cancelled' }
])

const dateRangeOptions = [
  { title: 'All Time', value: 'all' },
  { title: 'Last 7 Days', value: '7days' },
  { title: 'Last 30 Days', value: '30days' },
  { title: 'Last 3 Months', value: '3months' }
]

// Intersection Observer for infinite scroll
let observer = null

// Computed
const debouncedSearch = debounce(() => {
  resetAndLoadOrders()
}, 500)

// Check if any filters are applied
const isFiltered = computed(() => {
  return !!(searchTerm.value || selectedStatus.value || selectedDateRange.value !== 'all')
})

// Methods
const loadOrders = async (append = false) => {
  if (!append) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  error.value = null

  try {
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.pageSize
    }

    // Add search term
    if (searchTerm.value) {
      params.search = searchTerm.value
    }

    // Add status filter
    if (selectedStatus.value) {
      params.status = selectedStatus.value
    }

    // Add date range filter
    if (selectedDateRange.value !== 'all') {
      const now = new Date()
      let startDate

      switch (selectedDateRange.value) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        case '3months':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          break
      }

      if (startDate) {
        params.start_date = startDate.toISOString().split('T')[0]
      }
    }

    const response = await apiService.getOrders(params)

    let newOrders = []
    let total = 0

    if (response.data.results) {
      newOrders = response.data.results
      total = response.data.count
    } else {
      newOrders = response.data
      total = response.data.length
    }

    if (append) {
      orders.value = [...orders.value, ...newOrders]
    } else {
      orders.value = newOrders
      totalOrders.value = total
    }

    pagination.value.total = total

    // Check if there are more orders to load
    hasMoreOrders.value = orders.value.length < total

    console.log('Orders loaded:', {
      append,
      newOrdersCount: newOrders.length,
      totalOrdersNow: orders.value.length,
      totalAvailable: total,
      hasMoreOrders: hasMoreOrders.value,
      currentPage: pagination.value.page
    })

    // Load status counts only on initial load
    if (!append) {
      await loadStatusCounts()
    }

  } catch (err) {
    console.error('Error loading orders:', err)
    error.value = 'Failed to load orders. Please try again.'
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

const loadMoreOrders = async () => {
  console.log('loadMoreOrders called', {
    loadingMore: loadingMore.value,
    hasMoreOrders: hasMoreOrders.value,
    currentPage: pagination.value.page,
    totalOrders: orders.value.length,
    totalCount: pagination.value.total
  })

  if (loadingMore.value || !hasMoreOrders.value) {
    console.log('Skipping load more - already loading or no more orders')
    return
  }

  pagination.value.page += 1
  console.log('Loading page:', pagination.value.page)
  await loadOrders(true)
}

const resetAndLoadOrders = async () => {
  pagination.value.page = 1
  hasMoreOrders.value = true
  // Disconnect existing observer before loading new data
  if (observer) {
    observer.disconnect()
  }
  await loadOrders(false)
}

const setupInfiniteScroll = () => {
  if (observer) {
    observer.disconnect()
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreOrders.value && !loadingMore.value && !loading.value) {
        console.log('Infinite scroll triggered - loading more orders')
        loadMoreOrders()
      }
    },
    {
      threshold: 0.1,
      rootMargin: '50px'
    }
  )

  nextTick(() => {
    if (loadMoreTrigger.value) {
      console.log('Setting up observer on trigger element')
      observer.observe(loadMoreTrigger.value)
    } else {
      console.log('Load more trigger element not found')
    }
  })
}

const loadStatusCounts = async () => {
  try {
    // Get counts for different status groups
    const activeStatuses = ['pending', 'processing', 'ready_for_pickup', 'picked_up']

    const [allResponse, deliveredResponse, cancelledResponse] = await Promise.all([
      apiService.getOrders({ page_size: 1 }),
      apiService.getOrders({ status: 'delivered', page_size: 1 }),
      apiService.getOrders({ status: 'cancelled', page_size: 1 })
    ])

    // Get active orders count
    const activeResponse = await apiService.getOrders({
      status: activeStatuses.join(','),
      page_size: 1
    })

    statusCounts.value = {
      all: allResponse.data.count || allResponse.data.length || 0,
      active: activeResponse.data.count || activeResponse.data.length || 0,
      delivered: deliveredResponse.data.count || deliveredResponse.data.length || 0,
      cancelled: cancelledResponse.data.count || cancelledResponse.data.length || 0
    }
  } catch (err) {
    console.error('Error loading status counts:', err)
  }
}

const applyFilters = () => {
  resetAndLoadOrders()
}

const onQuickStatusChange = (value) => {
  quickStatusFilter.value = value
  if (value === 'all') {
    selectedStatus.value = null
  } else if (value === 'active') {
    selectedStatus.value = 'pending,processing,ready_for_pickup,picked_up'
  } else {
    selectedStatus.value = value
  }
  applyFilters()
  // Re-setup infinite scroll after filter change
  nextTick(() => {
    setupInfiniteScroll()
  })
}

const clearFilters = () => {
  searchTerm.value = ''
  selectedStatus.value = null
  selectedDateRange.value = 'all'
  quickStatusFilter.value = null
  resetAndLoadOrders()
  // Re-setup infinite scroll after clearing filters
  nextTick(() => {
    setupInfiniteScroll()
  })
}

const goToOrderDetails = (orderId) => {
  router.push({ name: 'OrderStatus', params: { id: orderId } })
}

const trackOrder = (orderId) => {
  router.push({ name: 'OrderStatus', params: { id: orderId }, query: { tab: 'tracking' } })
}

const canTrackOrder = (status) => {
  return ['processing', 'ready_for_pickup', 'picked_up'].includes(status)
}

const canCancelOrder = (status) => {
  return ['pending', 'ready_to_pickup'].includes(status)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatStatus = (status) => {
  const statusKey = `orders.status_${status}`
  const translated = t(statusKey)
  // If translation exists, use it; otherwise fallback to formatted status
  return translated !== statusKey ? translated : status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusClasses = (status) => {
  const classes = {
    all: 'bg-blue-100 text-blue-700',
    active: 'bg-yellow-100 text-yellow-700',
    pending: 'bg-orange-100 text-orange-700',
    processing: 'bg-blue-100 text-blue-700',
    ready_for_pickup: 'bg-purple-100 text-purple-700',
    picked_up: 'bg-indigo-100 text-indigo-700',
    delivered_no_confirmation: 'bg-amber-100 text-amber-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    not_received: 'bg-yellow-100 text-yellow-700',
    not_returned: 'bg-yellow-100 text-yellow-700',
    returned: 'bg-yellow-100 text-yellow-700',
    rescheduled: 'bg-blue-100 text-blue-700',
    wrong_delivery: 'bg-red-100 text-red-700',
    assigned_to_admin: 'bg-blue-100 text-blue-700',
    assigned_to_driver: 'bg-blue-100 text-blue-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: Clock,
    processing: Package,
    ready_for_pickup: CheckCircle2,
    picked_up: Truck,
    delivered_no_confirmation: CheckCircle,
    delivered: CheckCircle2,
    cancelled: XCircle
  }
  return icons[status] || Package
}

const getFilterIcon = (status) => {
  const icons = {
    all: Package,
    pending: AlertTriangle,
    delivered: CheckCircle2,
    cancelled: XCircle
  }
  return icons[status] || Package
}

// Order action methods
const cancelOrder = (orderId) => {
  orderToUpdate.value = orderId
  showCancelDialog.value = true
}

const proceedOrder = (orderId) => {
  orderToUpdate.value = orderId
  showProceedDialog.value = true
}

const confirmDelivery = (orderId) => {
  orderToUpdate.value = orderId
  showDeliveryConfirmDialog.value = true
}

const executeCancelOrder = async () => {
  if (orderToUpdate.value) {
    updatingOrderId.value = orderToUpdate.value
    try {
      await apiService.updateOrderStatus(orderToUpdate.value, {
        status: 'cancelled',
        notes: 'Order cancelled by customer'
      })
      await loadOrders()
      showCancelDialog.value = false
      orderToUpdate.value = null
    } catch (error) {
      console.error('Error cancelling order:', error)
      error.value = 'Failed to cancel order. Please try again.'
    } finally {
      updatingOrderId.value = null
    }
  }
}

const executeProceedOrder = async () => {
  if (orderToUpdate.value) {
    updatingOrderId.value = orderToUpdate.value
    try {
      await apiService.updateOrderStatus(orderToUpdate.value, {
        status: 'rescheduled',
        notes: 'Order proceeded by customer from on-hold status'
      })
      await loadOrders()
      showProceedDialog.value = false
      orderToUpdate.value = null
    } catch (error) {
      console.error('Error proceeding with order:', error)
      error.value = 'Failed to proceed with order. Please try again.'
    } finally {
      updatingOrderId.value = null
    }
  }
}

const executeDeliveryConfirmation = async () => {
  if (orderToUpdate.value) {
    updatingOrderId.value = orderToUpdate.value
    try {
      await apiService.updateOrderStatus(orderToUpdate.value, {
        status: 'delivered',
        notes: 'Delivery confirmed by customer'
      })
      await loadOrders()
      showDeliveryConfirmDialog.value = false
      orderToUpdate.value = null
    } catch (error) {
      console.error('Error confirming delivery:', error)
      error.value = 'Failed to confirm delivery. Please try again.'
    } finally {
      updatingOrderId.value = null
    }
  }
}

// Watch for orders changes to re-setup infinite scroll
watch(orders, () => {
  if (orders.value.length > 0) {
    nextTick(() => {
      setupInfiniteScroll()
    })
  }
}, { flush: 'post' })

// Watch for hasMoreOrders changes
watch(hasMoreOrders, (newValue) => {
  console.log('hasMoreOrders changed:', newValue)
  if (!newValue && observer) {
    observer.disconnect()
  }
})

// Lifecycle
onMounted(async () => {
  await loadOrders()
  // Setup infinite scroll after initial load
  nextTick(() => {
    setupInfiniteScroll()
  })
})

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
