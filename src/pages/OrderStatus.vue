<template>
  <div class="order-status-page">
    <v-container>
      <!-- Header -->
      <div class="d-flex align-center mb-1">
        <v-btn icon="mdi-arrow-left" variant="text" @click="$router.back()" class="me-3" />
        <div class="flex-grow-1">
          <h1 class="text-h6 font-weight-bold">Order #{{ orderId }}</h1>
          <p v-if="order" class="text-body-1 text-caption text-medium-emphasis mb-0 text-primary">
            Placed on {{ formatDate(order.created_at) }}
          </p>
        </div>
        <v-chip v-if="order" :color="getStatusColor(order.status)"
          :variant="order.status === 'delivered' ? 'flat' : 'outlined'" size="small">
          <v-icon start :icon="getStatusIcon(order.status)" />
          {{ formatStatus(order.status) }}
        </v-chip>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-body-1">Loading order details...</p>
      </div>

      <!-- Error State -->
      <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = null">
        {{ error }}
      </v-alert>

      <!-- Order Content -->
      <div v-if="!loading && order">
        <v-row>
          <!-- Main Content -->
          <v-col cols="12" lg="8">
            <!-- Order Notes -->
            <v-card v-if="order.notes" class="mb-6" elevation="1">
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-note-text</v-icon>
                Order Notes
              </v-card-title>
              <v-card-text>
                <v-alert type="info" variant="tonal" v-if="order.status !== 'wrong_delivery'">
                  {{ order.notes }}
                </v-alert>
                <v-alert type="warning" variant="tonal" v-if="order.status === 'wrong_delivery'">
                  <p>
                    <strong>Note:</strong> Between 3 working days, one of our driver will come and collect the items.
                    From there, you will be refunded the full amount of the order or the correct items will be delivered
                    to you.
                  </p>
                </v-alert>
              </v-card-text>
            </v-card>

            <!-- Delivery Confirmation Button for delivered_no_confirmation status -->
            <div class="d-flex gap-3 mb-6 justify-end" v-if="order.status === 'delivered_no_confirmation'">
              <v-btn color="success" class="text-none" variant="flat" size="small"
                @click="showDeliveryConfirmDialog = true" :loading="updatingStatus" rounded>
                <v-icon start>mdi-check</v-icon>
                Confirm Delivery
              </v-btn>
            </div>

            <!-- On Hold Order Actions -->
            <div class="d-flex gap-3 mb-6 justify-end" v-if="order.status === 'on_hold'">
              <v-btn color="error" class="text-none mr-3" variant="outlined" size="small" @click="confirmCancelOrder"
                :loading="updatingStatus" rounded>
                <v-icon start>mdi-cancel</v-icon>
                Cancel Order
              </v-btn>
              <v-btn color="success" class="text-none" variant="flat" size="small" @click="confirmProceedOrder"
                :loading="updatingStatus" rounded>
                <v-icon start>mdi-play</v-icon>
                Proceed with Order
              </v-btn>
            </div>

            <!-- Wrong Delivery Button for delivered orders (within 24h) -->
            <div class="d-flex gap-3 mb-6 justify-end" v-if="order.status === 'delivered' && canReportWrongDelivery">
              <v-btn color="warning" class="text-none" size="small" @click="showWrongDeliveryDialog = true"
                :loading="updatingStatus" rounded>
                <v-icon start>mdi-alert-circle</v-icon>
                Report Wrong Delivery
              </v-btn>
            </div>

            <!-- Order Status Timeline -->
            <v-card class="mb-6" elevation="1">
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-timeline-clock</v-icon>
                Order Timeline
              </v-card-title>
              <v-card-text>
                <OrderStatusTimeline :order="order" />
              </v-card-text>
            </v-card>

            <!-- Order Items -->
            <v-card class="mb-6" elevation="1">
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-package-variant</v-icon>
                Order Items ({{ order.items?.length || 0 }})
              </v-card-title>
              <v-card-text>
                <div v-for="(item, index) in order.items" :key="index" class="order-item"
                  :class="{ 'border-bottom': index < order.items.length - 1 }">
                  <v-row align="center">
                    <v-col cols="auto">
                      <v-avatar size="80" rounded="lg">
                        <v-img v-if="item.product?.main_image" :src="item.product.main_image" :alt="item.product?.name"
                          cover />
                        <v-icon v-else size="40" color="grey-lighten-1">
                          mdi-package-variant
                        </v-icon>
                      </v-avatar>
                    </v-col>

                    <v-col>
                      <h3 class="text-h6 font-weight-medium mb-1">
                        {{ item.product?.name || 'Product' }}
                      </h3>
                      <p v-if="item.product?.description" class="text-body-2 text-medium-emphasis mb-2">
                        {{ truncateText(item.product.description, 100) }}
                      </p>
                      <div class="d-flex align-center gap-4">
                        <v-chip size="small" variant="outlined">
                          Qty: {{ item.quantity }}
                        </v-chip>
                        <v-chip size="small" variant="outlined" color="primary" class="ml-2">
                          ${{ formatAmount(item.price) }} each
                        </v-chip>
                      </div>
                    </v-col>

                    <v-col cols="auto" class="text-right">
                      <h3 class="text-h6 font-weight-bold text-primary">
                        ${{ formatAmount(item.price * item.quantity) }}
                      </h3>
                      <v-btn v-if="item.product?.id" variant="flat" rounded size="small" color="secondary"
                        class="text-none" @click="goToProduct(item.product.id)">
                        View Product
                      </v-btn>
                    </v-col>
                  </v-row>
                </div>
              </v-card-text>
            </v-card>

            <!-- Delivery Information -->
            <v-card v-if="order.shipping_address || order.expected_delivery_time" class="mb-6" elevation="1">
              <v-card-title class="d-flex align-center">
                <v-icon class="me-2">mdi-truck-delivery</v-icon>
                Delivery Information
              </v-card-title>
              <v-card-text>
                <v-row>
                  <v-col v-if="order.shipping_address" cols="12" md="6">
                    <h4 class="text-subtitle-1 font-weight-medium mb-2">
                      Delivery Address
                    </h4>
                    <p class="text-body-2">{{ order.shipping_address }}</p>
                  </v-col>

                  <v-col v-if="order.expected_delivery_time" cols="12" md="6">
                    <h4 class="text-subtitle-1 font-weight-medium mb-2">
                      Expected Delivery
                    </h4>
                    <p class="text-body-2">{{ formatDate(order.expected_delivery_time) }}</p>
                  </v-col>
                </v-row>

                <v-alert v-if="order.notes" type="info" variant="tonal" class="mt-4">
                  <strong>Note:</strong> {{ order.notes }}
                </v-alert>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Sidebar -->
          <v-col cols="12" lg="4">
            <!-- Order Summary -->
            <v-card class="mb-6" elevation="1">
              <v-card-title>Order Summary</v-card-title>
              <v-card-text>
                <div class="order-summary">
                  <div class="d-flex justify-space-between mb-2">
                    <span>Subtotal:</span>
                    <span>${{ formatAmount(calculateSubtotal()) }}</span>
                  </div>
                  <div v-if="order.delivery_fee" class="d-flex justify-space-between mb-2">
                    <span>Delivery Fee:</span>
                    <span>${{ formatAmount(order.delivery_fee) }}</span>
                  </div>
                  <v-divider class="my-3" />
                  <div class="d-flex justify-space-between">
                    <span class="font-weight-bold">Total:</span>
                    <span class="font-weight-bold text-h6 text-primary">
                      ${{ formatAmount(order.total_amount) }}
                    </span>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Payment Information -->
            <v-card v-if="order.payment" class="mb-6" elevation="1">
              <v-card-title>Payment Information</v-card-title>
              <v-card-text>
                <div class="payment-info">
                  <div class="d-flex justify-space-between mb-2">
                    <span>Payment Method:</span>
                    <span class="text-capitalize">{{ order.payment.payment_method?.replace('_', ' ') }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>Transaction ID:</span>
                    <span class="text-caption">{{ order.payment.transaction_id || 'N/A' }}</span>
                  </div>
                  <div class="d-flex justify-space-between">
                    <span>Status:</span>
                    <v-chip :color="order.payment.status === 'paid' ? 'success' : 'warning'" size="small"
                      variant="flat">
                      {{ order.payment.status }}
                    </v-chip>
                  </div>
                </div>
              </v-card-text>
            </v-card>

            <!-- Seller Information -->
            <v-card v-if="order.seller" class="mb-6" elevation="1">
              <v-card-title>Seller Information</v-card-title>
              <v-card-text>
                <div class="seller-info">
                  <h4 class="text-subtitle-1 font-weight-medium mb-2">
                    {{ order.seller.business_name || order.seller.first_name + ' ' + order.seller.last_name }}
                  </h4>
                  <p v-if="order.seller.email" class="text-body-2 mb-1">
                    <v-icon size="small" class="me-1">mdi-email</v-icon>
                    {{ order.seller.email }}
                  </p>
                  <p v-if="order.seller.phone_number" class="text-body-2">
                    <v-icon size="small" class="me-1">mdi-phone</v-icon>
                    {{ order.seller.phone_number }}
                  </p>
                </div>
              </v-card-text>
            </v-card>

            <!-- Actions -->
            <v-card elevation="1">
              <v-card-title>Actions</v-card-title>
              <v-card-text>
                <div class="d-flex flex-column gap-3">
                  <v-btn v-if="canCancelOrder(order.status)" color="error" variant="outlined" block
                    @click="showCancelDialog = true">
                    <v-icon start>mdi-cancel</v-icon>
                    Cancel Order
                  </v-btn>

                  <!-- Wrong Delivery Button for delivered status (within 24 hours) -->
                  <v-btn v-if="canReportWrongDelivery" color="warning" block @click="showWrongDeliveryDialog = true"
                    class="text-none mb-4" rounded>
                    <v-icon start>mdi-alert-circle</v-icon>
                    Report Wrong Delivery
                  </v-btn>

                  <v-btn v-if="canReorder(order.status)" color="primary" variant="flat" block @click="reorderItems"
                    class="text-none" rounded>
                    <v-icon start>mdi-repeat</v-icon>
                    Reorder Items
                  </v-btn>

                  <!-- <v-btn color="primary" variant="outlined" block @click="downloadInvoice">
                    <v-icon start>mdi-download</v-icon>
                    Download Invoice
                  </v-btn> -->

                  <!-- <v-btn variant="text" block @click="contactSupport">
                    <v-icon start>mdi-help-circle</v-icon>
                    Contact Support
                  </v-btn> -->
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <!-- Cancel Order Dialog -->
      <v-dialog v-model="showCancelDialog" max-width="500">
        <v-card>
          <v-card-title>Cancel Order</v-card-title>
          <v-card-text>
            <p class="mb-4">Are you sure you want to cancel this order?</p>
            <v-textarea v-model="cancelReason" label="Reason for cancellation (optional)" variant="outlined" rows="3" />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn @click="showCancelDialog = false">Cancel</v-btn>
            <v-btn color="error" @click="cancelOrder" class="text-none">Confirm Cancellation</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delivery Confirmation Dialog -->
      <v-dialog v-model="showDeliveryConfirmDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6">Confirm Delivery</v-card-title>
          <v-card-text>
            <p class="mb-3">Are you sure you want to confirm delivery for Order #{{ orderId }}?</p>
            <p class="text-body-2 text-medium-emphasis">This will mark the order as delivered and complete the order
              process.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showDeliveryConfirmDialog = false">
              Cancel
            </v-btn>
            <v-btn color="success" variant="flat" @click="executeDeliveryConfirmation" :loading="updatingStatus">
              Confirm Delivery
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Wrong Delivery Dialog -->
      <v-dialog v-model="showWrongDeliveryDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6">Report Wrong Delivery</v-card-title>
          <v-card-text>
            <v-alert type="warning" variant="tonal" class="mb-4">
              <strong>Note:</strong> This action can only be performed within 24 hours of delivery.
            </v-alert>
            <p class="mb-3">Are you sure you want to report this delivery as incorrect for Order #{{ orderId }}?</p>
            <p class="text-body-2 text-medium-emphasis mb-4">This will change the order status to "Wrong Delivery" and
              notify the seller to take appropriate action.</p>
            <v-textarea v-model="wrongDeliveryReason" label="Reason for wrong delivery report (optional)"
              variant="outlined" rows="3" placeholder="Please describe what was wrong with the delivery..." />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showWrongDeliveryDialog = false">
              Cancel
            </v-btn>
            <v-btn color="warning" variant="flat" rounded class="text-none" @click="executeWrongDeliveryReport"
              :loading="updatingStatus">
              Report Wrong Delivery
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Cancel Order Confirmation Dialog (for on_hold orders) -->
      <v-dialog v-model="showCancelConfirmDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6">Cancel Order</v-card-title>
          <v-card-text>
            <p class="mb-3">Are you sure you want to cancel Order #{{ orderId }}?</p>
            <p class="text-body-2 text-medium-emphasis">This action cannot be undone. The order will be marked
              as cancelled.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showCancelConfirmDialog = false">
              Cancel
            </v-btn>
            <v-btn color="error" variant="flat" @click="executeCancelOrder" :loading="updatingStatus" class="text-none"
              rounded>
              Cancel Order
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Proceed Order Confirmation Dialog (for on_hold orders) -->
      <v-dialog v-model="showProceedConfirmDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6">Proceed with Order</v-card-title>
          <v-card-text>
            <p class="mb-3">Are you sure you want to proceed with Order #{{ orderId }}?</p>
            <p class="text-body-2 text-medium-emphasis">The order will be moved to pending status and processing
              will begin.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="grey" variant="text" @click="showProceedConfirmDialog = false">
              Cancel
            </v-btn>
            <v-btn color="success" variant="flat" @click="executeProceedOrder" :loading="updatingStatus"
              class="text-none" rounded>
              Confirm Proceed
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import OrderStatusTimeline from '@/components/OrderStatusTimeline.vue'

const route = useRoute()
const router = useRouter()

// Reactive data
const order = ref(null)
const loading = ref(true)
const error = ref(null)
const showCancelDialog = ref(false)
const showDeliveryConfirmDialog = ref(false)
const showWrongDeliveryDialog = ref(false)
const showCancelConfirmDialog = ref(false)
const showProceedConfirmDialog = ref(false)
const cancelReason = ref('')
const wrongDeliveryReason = ref('')
const updatingStatus = ref(false)

// Computed
const orderId = computed(() => route.params.id)

// Check if wrong delivery can be reported (within 24 hours of delivery)
const canReportWrongDelivery = computed(() => {
  if (!order.value || order.value.status !== 'delivered') return false

  const deliveredTime = new Date(order.value.updated_at)
  const currentTime = new Date()
  const timeDifference = currentTime - deliveredTime
  const hoursDifference = timeDifference / (1000 * 60 * 60)
  return hoursDifference < 24
})

// Methods
const loadOrder = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await apiService.getOrderDetails(orderId.value)
    order.value = response.data
  } catch (err) {
    console.error('Error loading order:', err)
    error.value = 'Failed to load order details. Please try again.'
  } finally {
    loading.value = false
  }
}

const calculateSubtotal = () => {
  if (!order.value?.items) return 0
  return order.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
}

const canCancelOrder = (status) => {
  return ['pending', 'processing'].includes(status)
}

const canReorder = (status) => {
  return ['delivered', 'cancelled'].includes(status)
}

const cancelOrder = async () => {
  try {
    await apiService.cancelOrder(orderId.value, { reason: cancelReason.value })
    showCancelDialog.value = false
    cancelReason.value = ''
    // Reload order to get updated status
    await loadOrder()
  } catch (err) {
    console.error('Error cancelling order:', err)
    error.value = 'Failed to cancel order. Please try again.'
  }
}

const reorderItems = async () => {
  try {
    // Add all items from this order to cart
    const items = order.value.items.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))

    await apiService.createCart(items)
    router.push({ name: 'Cart' })
  } catch (err) {
    console.error('Error reordering items:', err)
    error.value = 'Failed to add items to cart. Please try again.'
  }
}

const downloadInvoice = async () => {
  try {
    await apiService.downloadOrderInvoice(orderId.value)
  } catch (err) {
    console.error('Error downloading invoice:', err)
    error.value = 'Failed to download invoice. Please try again.'
  }
}

const contactSupport = () => {
  // Implement support contact
  console.log('Contact support for order:', orderId.value)
}

const goToProduct = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

// Order status update functionality
const updateOrderStatus = async (newStatus) => {
  try {
    updatingStatus.value = true
    await apiService.updateOrderStatus(orderId.value, { status: newStatus })

    // Reload order to get updated status
    await loadOrder()
  } catch (err) {
    console.error('Error updating order status:', err)
    error.value = 'Failed to update order status. Please try again.'
  } finally {
    updatingStatus.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatAmount = (amount) => {
  return parseFloat(amount || 0).toFixed(2)
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    ready_for_pickup: 'purple',
    picked_up: 'indigo',
    delivered_no_confirmation: 'amber',
    delivered: 'success',
    wrong_delivery: 'red',
    cancelled: 'error'
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
    wrong_delivery: 'mdi-alert-circle',
    cancelled: 'mdi-close-circle'
  }
  return icons[status] || 'mdi-package-variant-closed'
}

const getDefaultStatusNote = (status) => {
  const notes = {
    pending: 'Order has been placed and is awaiting processing',
    processing: 'Order is being prepared by the seller',
    ready_for_pickup: 'Order is ready for pickup by delivery driver',
    picked_up: 'Order has been picked up and is on the way',
    delivered: 'Order has been successfully delivered'
  }
  return notes[status] || ''
}

// Confirmation methods for on_hold orders
const confirmCancelOrder = () => {
  showCancelConfirmDialog.value = true
}

const confirmProceedOrder = () => {
  showProceedConfirmDialog.value = true
}

const executeCancelOrder = async () => {
  await updateOrderStatus('cancelled')
  showCancelConfirmDialog.value = false
}

const executeProceedOrder = async () => {
  await updateOrderStatus('pending')
  showProceedConfirmDialog.value = false
}

// Delivery confirmation method
const executeDeliveryConfirmation = async () => {
  await updateOrderStatus('delivered')
  showDeliveryConfirmDialog.value = false
}

// Wrong delivery report method
const executeWrongDeliveryReport = async () => {
  try {
    // Check if 24 hours have passed since delivery
    if (!canReportWrongDelivery.value) {
      error.value = 'Cannot report wrong delivery. The 24-hour window has passed since delivery.'
      showWrongDeliveryDialog.value = false
      return
    }

    updatingStatus.value = true

    // Update status to wrong_delivery with reason
    await apiService.updateOrderStatus(orderId.value, {
      status: 'wrong_delivery',
      notes: wrongDeliveryReason.value || 'Customer reported wrong delivery'
    })

    // Reload order to get updated status
    await loadOrder()

    showWrongDeliveryDialog.value = false
    wrongDeliveryReason.value = ''
  } catch (err) {
    console.error('Error reporting wrong delivery:', err)
    if (err.response?.data?.error) {
      error.value = err.response.data.error
    } else {
      error.value = 'Failed to report wrong delivery. Please try again.'
    }
  } finally {
    updatingStatus.value = false
  }
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-status-page {
  padding-bottom: 64px;
}

.order-item {
  padding: 16px 0;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.order-summary,
.payment-info,
.seller-info {
  line-height: 1.6;
}

.order-summary .v-divider {
  margin: 12px 0;
}

@media (max-width: 960px) {
  .order-item .v-col:last-child {
    text-align: left !important;
    margin-top: 16px;
  }
}
</style>
