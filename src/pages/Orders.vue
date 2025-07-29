<template>
    <div class="orders-page">
        <v-container>
            <!-- Header -->
            <div class="d-flex justify-space-between align-center mb-6">
                <h1 class="text-h5 font-weight-bold">My Orders</h1>
                <v-chip :color="getStatusColor('all')">
                    {{ totalOrders }} Orders
                </v-chip>
            </div>

            <!-- Search and Filters -->
            <v-card class="mb-2" elevation="0">
                <v-card-text>
                    <v-row>
                        <!-- Search -->
                        <!-- <v-col cols="12" md="6">
              <v-text-field
                v-model="searchTerm"
                label="Search orders..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                clearable
                @input="debouncedSearch"
              />
            </v-col> -->

                        <!-- Status Filter -->
                        <v-col cols="6" md="3">
                            <v-select v-model="selectedStatus" :items="statusOptions" label="Filter by Status"
                                variant="outlined" rounded density="compact" clearable
                                @update:model-value="applyFilters" />
                        </v-col>

                        <!-- Date Range -->
                        <v-col cols="6" md="3">
                            <v-select v-model="selectedDateRange" :items="dateRangeOptions" label="Date Range"
                                variant="outlined" rounded density="compact" @update:model-value="applyFilters" />
                        </v-col>
                    </v-row>

                    <!-- Quick Status Filters -->
                    <div class="mt-1">
                        <v-chip-group v-model="quickStatusFilter" selected-class="text-primary"
                            @update:model-value="onQuickStatusChange">
                            <v-chip v-for="status in quickStatusOptions" :key="status.value" :value="status.value"
                                :color="getStatusColor(status.value)" density="compact">
                                {{ status.text }}
                                <v-badge v-if="statusCounts[status.value]" :content="statusCounts[status.value]"
                                    color="primary" inline />
                            </v-chip>
                        </v-chip-group>
                    </div>
                </v-card-text>
            </v-card>

            <!-- Loading State -->
            <div v-if="loading && orders.length === 0" class="text-center py-8">
                <v-progress-circular indeterminate color="primary" size="64" />
                <p class="mt-4 text-body-1">Loading your orders...</p>
            </div>

            <!-- Error State -->
            <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
                {{ error }}
            </v-alert>

            <!-- Orders List -->
            <div v-if="!loading && orders.length > 0">
                <v-row>
                    <v-col v-for="order in orders" :key="order.id" cols="12">
                        <v-card class="order-card" elevation="2" hover @click="goToOrderDetails(order.id)">
                            <v-card-text>
                                <v-row align="center">
                                    <!-- Order Info with Status Chip -->
                                    <v-col cols="12" md="3">
                                        <div class="d-flex justify-space-between align-start">
                                            <div class="order-info">
                                                <h3 class="text-h6 font-weight-bold mb-1">
                                                    Order #{{ order.id }}
                                                </h3>
                                                <p class="text-body-2 text-medium-emphasis mb-1">
                                                    {{ formatDate(order.created_at) }}
                                                </p>
                                                <p class="text-body-2 text-medium-emphasis">
                                                    {{ order.items?.length || 0 }} item(s)
                                                </p>
                                            </div>
                                            <v-chip :color="getStatusColor(order.status)"
                                                :variant="order.status === 'delivered' ? 'flat' : 'outlined'"
                                                size="small" class="status-chip">
                                                <v-icon start :icon="getStatusIcon(order.status)" />
                                                {{ formatStatus(order.status) }}
                                            </v-chip>
                                        </div>
                                    </v-col>

                                    <!-- Products Preview -->
                                    <v-col cols="12" md="6">
                                        <div class="products-preview">
                                            <div v-for="(item, index) in order.items?.slice(0, 1)" :key="index"
                                                class="d-flex align-center mb-1">
                                                <v-avatar size="32" class="me-2">
                                                    <v-img v-if="item.product?.main_image"
                                                        :src="item.product.main_image" :alt="item.product?.name" />
                                                    <v-icon v-else icon="mdi-package-variant" />
                                                </v-avatar>
                                                <div class="flex-grow-1">
                                                    <p class="text-body-2 mb-0 text-truncate">
                                                        {{ item.product?.name || 'Product' }}
                                                    </p>
                                                    <p class="text-caption text-medium-emphasis">
                                                        Qty: {{ item.quantity }}
                                                    </p>
                                                </div>
                                            </div>
                                            <p v-if="order.items?.length > 2" class="text-caption text-medium-emphasis">
                                                +{{ order.items.length - 2 }} more item(s)
                                            </p>
                                        </div>
                                    </v-col>

                                    <!-- Amount -->
                                    <v-col cols="12" md="3" class="text-right">
                                        <div class="amount-section">
                                            <h3 class="text-h6 font-weight-bold text-primary mb-2">
                                                {{ formatApiPrice({
                                                    price: order.total_amount, currency_info:
                                                        order.currency_info
                                                }) }}
                                            </h3>
                                        </div>
                                    </v-col>
                                </v-row>

                                <!-- Action Buttons -->
                                <div class="action-buttons">
                                    <!-- On Hold Status Action Buttons -->
                                    <div v-if="order.status === 'on_hold'" class="mt-2 d-flex gap-2">
                                        <v-btn color="error" variant="outlined" size="small" class="text-none"
                                            @click.stop="cancelOrder(order.id)" :loading="updatingOrderId === order.id"
                                            rounded>
                                            <v-icon start size="small">mdi-close</v-icon>
                                            Cancel Order
                                        </v-btn>
                                        <v-btn color="success" variant="flat" size="small" class="text-none"
                                            @click.stop="proceedOrder(order.id)" :loading="updatingOrderId === order.id"
                                            rounded>
                                            <v-icon start size="small">mdi-play</v-icon>
                                            Proceed Order
                                        </v-btn>
                                    </div>

                                    <!-- Delivered No Confirmation Action Button -->
                                    <div v-if="order.status === 'delivered_no_confirmation'" class="mt-2">
                                        <v-btn color="primary" variant="flat" size="small" class="text-none"
                                            @click.stop="confirmDelivery(order.id)"
                                            :loading="updatingOrderId === order.id" rounded>
                                            <v-icon start size="small">mdi-check</v-icon>
                                            Confirm Delivery
                                        </v-btn>
                                    </div>
                                </div>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- Infinite Scroll Loading -->
                <div v-if="hasMoreOrders" ref="loadMoreTrigger" class="text-center py-6">
                    <v-progress-circular v-if="loadingMore" indeterminate color="primary" size="32" />
                    <p v-if="loadingMore" class="text-body-2 text-medium-emphasis mt-2">
                        Loading more orders...
                    </p>
                </div>

                <!-- Load More Button for filtered results -->
                <div v-if="hasMoreOrders && isFiltered && !loadingMore" class="text-center py-6">
                    <v-btn color="primary" variant="outlined" @click="loadMoreOrders" :loading="loadingMore">
                        Load More Orders
                    </v-btn>
                </div>

                <!-- End of Results -->
                <div v-if="!hasMoreOrders && orders.length > 0" class="text-center py-6">
                    <v-icon color="grey-lighten-1" size="32" class="mb-2">
                        mdi-check-circle
                    </v-icon>
                    <p class="text-body-2 text-medium-emphasis">
                        You've reached the end of your orders
                    </p>
                </div>
            </div>

            <!-- Empty State -->
            <v-card v-else-if="!loading && orders.length === 0" class="text-center py-12" elevation="0">
                <v-icon size="64" color="grey-lighten-1" class="mb-4">
                    mdi-package-variant-closed
                </v-icon>
                <h3 class="text-h5 mb-2">No Orders Found</h3>
                <p class="text-body-1 text-medium-emphasis mb-4">
                    {{ searchTerm || selectedStatus ? 'No orders match your current filters.' :
                        "You haven't placed any orders yet." }}
                </p>
                <v-btn v-if="!searchTerm && !selectedStatus" color="primary" variant="flat" to="/">
                    Start Shopping
                </v-btn>
                <v-btn v-else color="primary" variant="outlined" @click="clearFilters">
                    Clear Filters
                </v-btn>
            </v-card>
        </v-container>

        <!-- Bottom Navigation -->
        <BottomNavigation />

        <!-- Cancel Order Confirmation Dialog -->
        <v-dialog v-model="showCancelDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h6">Cancel Order</v-card-title>
                <v-card-text>
                    <p class="mb-3">Are you sure you want to cancel Order #{{ orderToUpdate }}?</p>
                    <p class="text-body-2 text-medium-emphasis">This action cannot be undone. The order will be marked
                        as cancelled.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" variant="text" @click="showCancelDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="error" variant="flat" @click="executeCancelOrder"
                        :loading="updatingOrderId === orderToUpdate" class="text-none" rounded>
                        Confirm Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Proceed Order Confirmation Dialog -->
        <v-dialog v-model="showProceedDialog" max-width="500">
            <v-card>
                <v-card-title class="text-h6">Proceed with Order</v-card-title>
                <v-card-text>
                    <p class="mb-3">Are you sure you want to proceed with Order #{{ orderToUpdate }}?</p>
                    <p class="text-body-2 text-medium-emphasis">The order will be moved to pending status and processing
                        will begin.</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer />
                    <v-btn color="grey" variant="text" @click="showProceedDialog = false">
                        Cancel
                    </v-btn>
                    <v-btn color="success" variant="flat" @click="executeProceedOrder"
                        :loading="updatingOrderId === orderToUpdate" class="text-none" rounded>
                        Confirm Proceed
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>

    <!-- Delivery Confirmation Dialog -->
    <v-dialog v-model="showDeliveryConfirmDialog" max-width="500">
        <v-card>
            <v-card-title class="text-h6">Confirm Delivery</v-card-title>
            <v-card-text>
                <p class="mb-3">Are you sure you want to confirm delivery for Order #{{ orderToUpdate }}?</p>
                <p class="text-body-2 text-medium-emphasis">This will mark the order as delivered and complete the order
                    process.</p>
            </v-card-text>
            <v-card-actions>
                <v-spacer />
                <v-btn color="grey" variant="text" @click="showDeliveryConfirmDialog = false">
                    Cancel
                </v-btn>
                <v-btn color="success" variant="flat" @click="executeDeliveryConfirmation"
                    :loading="updatingOrderId === orderToUpdate" class="text-none" rounded>
                    Confirm Delivery
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { debounce } from 'lodash'
import { useCurrency } from '@/composables/useCurrency'
import BottomNavigation from '@/components/BottomNavigation.vue'

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
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

// Remove formatAmount function as we now use formatPrice from useCurrency

const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const getStatusColor = (status) => {
    const colors = {
        all: 'primary',
        active: 'warning',
        pending: 'orange',
        processing: 'blue',
        ready_for_pickup: 'purple',
        picked_up: 'indigo',
        delivered_no_confirmation: 'amber',
        delivered: 'success',
        cancelled: 'error',
        on_hold: 'warning',
        not_received: 'warning',
        not_returned: 'warning',
        returned: 'warning',
        rescheduled: 'info',
        wrong_delivery: 'error',
        assigned_to_admin: 'info',
        assigned_to_driver: 'info'
    }
    return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
    const icons = {
        pending: 'mdi-clock-outline',
        processing: 'mdi-package-variant',
        ready_for_pickup: 'mdi-package-check',
        picked_up: 'mdi-truck',
        delivered_no_confirmation: 'mdi-check-clock',
        delivered: 'mdi-check-circle',
        cancelled: 'mdi-close-circle'
    }
    return icons[status] || 'mdi-package-variant-closed'
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
                status: 'pending',
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
.orders-page {
    padding-bottom: 64px;
}

.order-card {
    cursor: pointer;
    transition: all 0.3s ease;
}

.order-card:hover {
    transform: translateY(-2px);
}

.order-info h3 {
    color: rgb(var(--v-theme-primary));
}

.status-chip {
    flex-shrink: 0;
}

.products-preview {
    max-height: 80px;
    overflow: hidden;
}

.amount-section {
    text-align: right;
}

.action-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-end;
}

.gap-2 {
    gap: 8px;
}

@media (max-width: 960px) {
    .amount-section {
        text-align: left;
    }

    .action-buttons {
        flex-direction: column;
        align-items: flex-start;
    }

    .action-buttons .d-flex {
        flex-wrap: wrap;
        width: 100%;
    }

    .status-chip {
        margin-top: 8px;
    }
}
</style>
