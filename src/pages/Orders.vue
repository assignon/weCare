<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
              {{ $t('orders.title') }}
            </h1>
            <p class="text-slate-600 text-sm mt-0.5 flex items-center">
              <ShoppingBag class="w-3 h-3 mr-1" />
              {{ totalOrders }} {{ $t('orders.orders_total') }}
            </p>
          </div>
          <div class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/20 flex items-center justify-center">
            <Package class="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </div>

      <!-- Enhanced Search and Filters -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4 mb-4">
        <!-- Search Bar -->
        <div class="mb-4">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search class="h-4 w-4 text-slate-400" />
            </div>
            <input
              v-model="searchTerm"
              type="text"
              :placeholder="$t('orders.search_placeholder')"
              class="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm text-sm"
              @input="debouncedSearch"
            />
          </div>
        </div>

        <!-- Modern Status Filters -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="status in quickStatusOptions"
            :key="status.value"
            @click="onQuickStatusChange(status.value)"
            :class="[
              'px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-1 shadow-sm',
              quickStatusFilter === status.value
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-105'
                : 'bg-white/70 text-slate-700 hover:bg-white hover:shadow-md border border-slate-200'
            ]"
            :style="quickStatusFilter === status.value ? 'background: linear-gradient(to right, #2563eb, #4f46e5);' : ''"
          >
            <component :is="getFilterIcon(status.value)" class="w-3 h-3" />
            <span>{{ status.text }}</span>
            <span v-if="statusCounts[status.value]" 
                  :class="[
                    'px-1.5 py-0.5 rounded-full text-xs font-bold',
                    quickStatusFilter === status.value ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                  ]">
              {{ statusCounts[status.value] }}
            </span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading && orders.length === 0" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" 
             style="background: linear-gradient(to right, #dbeafe, #e0e7ff);">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ $t('orders.loading') }}</h3>
        <p class="text-slate-600">{{ $t('orders.loading_subtitle') }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 p-6 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-1">{{ $t('orders.error_loading') }}</h4>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
          <button @click="error = null" class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
            <X class="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Modern Orders List -->
      <div v-if="!loading && orders.length > 0" class="space-y-4">
        <div 
          v-for="order in orders" 
          :key="order.id"
          @click="goToOrderDetails(order.id)"
          class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group"
        >
          <!-- Order Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center shadow-sm">
                  <ShoppingBag class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ $t('orders.order') }} #{{ order.id }}</h3>
                  <p class="text-xs text-slate-600 flex items-center mt-0.5">
                    <Calendar class="w-3 h-3 mr-1" />
                    {{ formatDate(order.created_at) }}
                  </p>
                </div>
              </div>
              
              <!-- Status Badge -->
              <div class="flex items-center space-x-2 mb-3">
                <div 
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm',
                    getStatusClasses(order.status)
                  ]"
                >
                  <component :is="getStatusIcon(order.status)" class="w-3 h-3" />
                  <span>{{ formatStatus(order.status) }}</span>
                </div>
                <span class="text-xs text-slate-500">
                  {{ order.items?.length || 0 }} {{ order.items?.length !== 1 ? $t('orders.items') : $t('orders.item') }}
                </span>
              </div>
            </div>
            
            <div class="text-right">
              <h4 class="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                {{ formatApiPrice({
                  price: (parseFloat(order.total_amount) || 0) + (parseFloat(order.delivery_fee) || 0), 
                  currency_info: order.currency_info
                }) }}
              </h4>
            </div>
          </div>

          <!-- Enhanced Products Preview -->
          <div class="mb-4">
            <div class="flex items-center space-x-2 mb-3">
              <div class="w-6 h-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                <Package class="w-3 h-3 text-purple-600" />
              </div>
              <span class="text-xs font-semibold text-slate-700">{{ $t('orders.products') }}</span>
            </div>
            <div class="space-y-2">
              <div 
                v-for="(item, index) in order.items?.slice(0, 2)" 
                :key="index"
                class="space-y-2"
              >
                <div class="flex items-center space-x-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50/30 rounded-xl border border-slate-100">
                  <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img 
                      v-if="item.product?.main_image"
                      :src="item.product.main_image" 
                      :alt="item.product?.name"
                      class="w-full h-full object-cover"
                    />
                    <div v-else class="w-full h-full bg-gradient-to-r from-slate-200 to-slate-300 flex items-center justify-center">
                      <Package class="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold text-slate-900 truncate">
                      {{ item.product?.name || 'Product' }}
                    </p>
                    <p class="text-xs text-slate-600 flex items-center mt-0.5">
                      <Hash class="w-2.5 h-2.5 mr-1" />
                      Qty: {{ item.quantity }}
                    </p>
                  </div>
                </div>
              </div>
              <p v-if="order.items?.length > 2" class="text-xs text-slate-500 text-center py-3 bg-slate-50 rounded-xl">
                +{{ order.items.length - 2 }} more item{{ order.items.length - 2 !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>

          <!-- Enhanced Action Buttons -->
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div class="flex space-x-2">
              <!-- On Hold Status Action Buttons -->
              <div v-if="order.status === 'on_hold'" class="flex space-x-2">
                <button 
                  @click.stop="cancelOrder(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
                >
                  <X v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>Cancel</span>
                </button>
                <button 
                  @click.stop="proceedOrder(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
                >
                  <Play v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>Proceed</span>
                </button>
              </div>

              <!-- Delivered No Confirmation Action Button -->
              <div v-if="order.status === 'delivered_no_confirmation'">
                <button 
                  @click.stop="confirmDelivery(order.id)"
                  :disabled="updatingOrderId === order.id"
                  class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm"
                >
                  <CheckCircle v-if="updatingOrderId !== order.id" class="w-3 h-3" />
                  <Loader2 v-else class="w-3 h-3 animate-spin" />
                  <span>Confirm Delivery</span>
                </button>
              </div>
            </div>

            <button 
              @click.stop="goToOrderDetails(order.id)"
              class="px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center space-x-1 shadow-sm group-hover:shadow-md"
            >
              <ArrowRight class="w-3 h-3" />
              <span>{{ $t('order_detail.view_details') }}</span>
            </button>
          </div>
        </div>

        <!-- Enhanced Infinite Scroll Loading -->
        <div v-if="hasMoreOrders" ref="loadMoreTrigger" class="text-center py-8">
          <div v-if="loadingMore" class="flex items-center justify-center space-x-3">
            <div class="w-8 h-8 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
              <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <span class="text-slate-600 font-medium">Loading more orders...</span>
          </div>
        </div>

        <!-- Enhanced Load More Button -->
        <div v-if="hasMoreOrders && isFiltered && !loadingMore" class="text-center py-8">
          <button 
            @click="loadMoreOrders"
            :disabled="loadingMore"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 mx-auto"
            style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          >
            <span v-if="loadingMore" class="flex items-center space-x-2">
              <Loader2 class="w-5 h-5 animate-spin" />
              <span>Loading...</span>
            </span>
            <span v-else class="flex items-center space-x-2">
              <Download class="w-5 h-5" />
              <span>Load More Orders</span>
            </span>
          </button>
        </div>

        <!-- Enhanced End of Results -->
        <div v-if="!hasMoreOrders && orders.length > 0" class="text-center py-12">
          <div class="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" 
               style="background: linear-gradient(to right, #dcfce7, #d1fae5);">
            <CheckCircle class="w-10 h-10 text-green-600" />
          </div>
          <h3 class="text-xl font-semibold text-slate-800 mb-2">All Orders Loaded</h3>
          <p class="text-slate-600">You've reached the end of your order history</p>
        </div>
      </div>

      <!-- Enhanced Empty State -->
      <div v-else-if="!loading && orders.length === 0" class="text-center py-20">
        <div class="w-32 h-32 bg-gradient-to-r from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
          <ShoppingBag class="w-16 h-16 text-slate-400" />
        </div>
        <h3 class="text-3xl font-bold text-slate-900 mb-4">No Orders Found</h3>
        <p class="text-slate-600 mb-10 max-w-md mx-auto text-lg">
          {{ searchTerm || selectedStatus ? 'No orders match your current filters.' : "You haven't placed any orders yet." }}
        </p>
        <div class="space-x-4">
          <button 
            v-if="!searchTerm && !selectedStatus"
            @click="$router.push({ name: 'Home' })"
            class="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
            style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          >
            <ShoppingCart class="w-5 h-5" />
            <span>Start Shopping</span>
          </button>
          <button 
            v-else
            @click="clearFilters"
            class="px-8 py-4 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <RefreshCw class="w-5 h-5" />
            <span>Clear Filters</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Enhanced Cancel Order Confirmation Dialog -->
    <div 
      v-if="showCancelDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showCancelDialog = false"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        @click.stop
      >
        <div class="flex items-center mb-6">
          <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertTriangle class="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Cancel Order</h3>
            <p class="text-slate-600 text-sm">Order #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-slate-700 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div class="flex space-x-4">
          <button 
            @click="showCancelDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Keep Order
          </button>
          <button 
            @click="executeCancelOrder"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-4 h-4 animate-spin" />
            <X v-else class="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Proceed Order Confirmation Dialog -->
    <div 
      v-if="showProceedDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showProceedDialog = false"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        @click.stop
      >
        <div class="flex items-center mb-6">
          <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mr-4">
            <Play class="w-7 h-7 text-green-600" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Proceed with Order</h3>
            <p class="text-slate-600 text-sm">Order #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-slate-700 mb-6">Are you sure you want to proceed with this order? It will be moved to rescheduled status.</p>
        <div class="flex space-x-4">
          <button 
            @click="showProceedDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Keep on Hold
          </button>
          <button 
            @click="executeProceedOrder"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-4 h-4 animate-spin" />
            <Play v-else class="w-4 h-4" />
            <span>Proceed</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Delivery Confirmation Dialog -->
    <div 
      v-if="showDeliveryConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showDeliveryConfirmDialog = false"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        @click.stop
      >
        <div class="flex items-center mb-6">
          <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <CheckCircle class="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Confirm Delivery</h3>
            <p class="text-slate-600 text-sm">Order #{{ orderToUpdate }}</p>
          </div>
        </div>
        <p class="text-slate-700 mb-6">Please confirm that you have received your order. This will mark the order as delivered.</p>
        <div class="flex space-x-4">
          <button 
            @click="showDeliveryConfirmDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Not Yet
          </button>
          <button 
            @click="executeDeliveryConfirmation"
            :disabled="updatingOrderId === orderToUpdate"
            class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingOrderId === orderToUpdate" class="w-4 h-4 animate-spin" />
            <CheckCircle v-else class="w-4 h-4" />
            <span>Confirm Delivery</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { debounce } from 'lodash'
import { useCurrency } from '@/composables/useCurrency'
import BottomNavigation from '@/components/BottomNavigation.vue'
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

const quickStatusOptions = [
  { text: 'All', value: 'all' },
  { text: 'Pending', value: 'pending' },
  { text: 'Delivered', value: 'delivered' },
  { text: 'Cancelled', value: 'cancelled' }
]

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
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
