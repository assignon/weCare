<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-32">
    <div class="p-4">
      <!-- Modern Header -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-3">
            <button 
              @click="$router.back()"
              class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
            >
              <ArrowLeft class="w-5 h-5 text-slate-700" />
            </button>
            <div>
              <h1 class="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Order #{{ orderId }}
              </h1>
              <p v-if="order" class="text-slate-600 text-sm mt-0.5 flex items-center">
                <Calendar class="w-3 h-3 mr-1" />
                Placed on {{ formatDate(order.created_at) }}
              </p>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div v-if="order" 
               :class="[
                 'px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm',
                 getStatusClasses(order.status)
               ]"
          >
            <component :is="getStatusIcon(order.status)" class="w-3 h-3" />
            <span>{{ formatStatus(order.status) }}</span>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg" 
             style="background: linear-gradient(to right, #dbeafe, #e0e7ff);">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">Loading Order Details</h3>
        <p class="text-slate-600">Please wait while we fetch your order information</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-6 p-6 bg-red-50 border border-red-200 rounded-3xl shadow-sm">
        <div class="flex items-center">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <AlertCircle class="w-5 h-5 text-red-600" />
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-red-800 mb-1">Error Loading Order</h4>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
          <button @click="error = null" class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors">
            <X class="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Order Content -->
      <div v-if="!loading && order" class="space-y-4">
            <!-- Order Notes -->
        <div v-if="order.notes || order.status === 'on_hold'" class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText class="w-4 h-4 text-blue-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Order Notes</h3>
          </div>
          
          <!-- On Hold Status Special Notes -->
          <div v-if="order.status === 'on_hold'" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-3">
            <div class="flex items-start space-x-3">
              <AlertTriangle class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-semibold text-amber-800 mb-2">Order On Hold</p>
                <p class="text-amber-700 text-sm mb-3">
                  Your order has been temporarily placed on hold. You can proceed with the order using the button below.
                </p>
                
                <!-- Show new expected delivery date if available -->
                <div v-if="order.expected_delivery_date" class="bg-amber-100 p-3 rounded-lg border border-amber-300">
                  <div class="flex items-center space-x-2 mb-1">
                    <Calendar class="w-4 h-4 text-amber-700" />
                    <span class="text-sm font-medium text-amber-800">New Expected Delivery Date</span>
                  </div>
                  <p class="text-amber-700 text-sm">
                    <strong>{{ formatDate(order.expected_delivery_date) }}</strong>
                  </p>
                  <p class="text-amber-600 text-xs mt-1">
                    This is the new delivery date set by the seller when your order was put on hold.
                  </p>
                </div>
                
                <!-- Show delivery time if available -->
                <div v-if="order.expected_delivery_time" class="bg-amber-100 p-3 rounded-lg border border-amber-300 mt-2">
                  <div class="flex items-center space-x-2 mb-1">
                    <Clock class="w-4 h-4 text-amber-700" />
                    <span class="text-sm font-medium text-amber-800">Expected Delivery Time</span>
                  </div>
                  <p class="text-amber-700 text-sm">
                    <strong>{{ formatTimeSlot(order.expected_delivery_time) }}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Regular order notes -->
          <div v-if="order.notes && order.status !== 'wrong_delivery'" class="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p class="text-slate-700">{{ order.notes }}</p>
          </div>
          <div v-if="order.status === 'wrong_delivery'" class="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
            <div class="flex items-start space-x-3">
              <AlertTriangle class="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="font-semibold text-amber-800 mb-2">Wrong Delivery Reported</p>
                <p class="text-amber-700 text-sm">
                  Between 3 working days, one of our drivers will come and collect the items. 
                  From there, you will be refunded the full amount of the order or the correct items will be delivered to you.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2 justify-end">
          <!-- Delivery Confirmation Button -->
          <button 
            v-if="order.status === 'delivered_no_confirmation'"
            @click="showDeliveryConfirmDialog = true"
            :disabled="updatingStatus"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm text-sm"
          >
            <Loader2 v-if="updatingStatus" class="w-3 h-3 animate-spin" />
            <CheckCircle v-else class="w-3 h-3" />
            <span>Confirm Delivery</span>
          </button>

          <!-- Wrong Delivery Report Button -->
          <button 
            v-if="order.status === 'delivered' && canReportWrongDelivery"
            @click="showWrongDeliveryDialog = true"
            :disabled="updatingStatus"
            class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1 shadow-sm text-sm"
          >
            <AlertTriangle class="w-3 h-3" />
            <span>Report Wrong Delivery</span>
          </button>
        </div>

        <!-- Order Items -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Package class="w-4 h-4 text-purple-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Order Items</h3>
          </div>
          
          <div class="space-y-3">
            <div 
              v-for="(item, index) in order.items" 
              :key="index"
              class="flex items-start space-x-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100"
            >
              <div class="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.product?.main_image" 
                  :src="item.product.main_image" 
                  :alt="item.product?.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-slate-200 flex items-center justify-center">
                  <Package class="w-6 h-6 text-slate-400" />
                </div>
            </div>

              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-semibold text-slate-900 truncate">
                  {{ item.product?.name || 'Product' }}
                </h4>
                <p class="text-xs text-slate-600 mt-1">
                  Variant: {{ item.product_variant?.name || 'Standard' }} ML
                </p>
                <p class="text-xs text-slate-600">
                  Quantity: {{ item.quantity }}
                </p>
                <!-- Delivery info for each product -->
                <div v-if="item.delivery_date || item.delivery_timeslot || order.expected_delivery_date" class="mt-2 p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <div class="flex items-center space-x-1 mb-1">
                    <Truck class="w-3 h-3 text-amber-600" />
                    <span class="text-xs font-medium text-amber-700">Delivery Info</span>
                  </div>
                  <div v-if="item.delivery_date || order.expected_delivery_date" class="text-xs text-amber-600">
                    <strong>Date:</strong> {{ formatDate(item.delivery_date || order.expected_delivery_date) }}
                  </div>
                  <div v-if="item.delivery_timeslot || order.expected_delivery_time" class="text-xs text-amber-600">
                    <strong>Timeslot:</strong> {{ formatTimeSlot(item.delivery_timeslot || order.expected_delivery_time) }}
                  </div>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatApiPrice({ price: item.price * item.quantity, currency_info: item.currency_info }) }}
                </p>
              </div>
            </div>
          </div>
            </div>

        <!-- Delivery Information -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <Truck class="w-4 h-4 text-green-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Delivery Information</h3>
            </div>

          <div class="space-y-2">
            <div class="flex items-center space-x-2 text-sm">
              <MapPin class="w-3 h-3 text-slate-500" />
              <span class="text-slate-700">{{ order.shipping_address }}</span>
            </div>
            <div v-if="order.expected_delivery_time" class="flex items-center space-x-2 text-sm">
              <Clock class="w-3 h-3 text-slate-500" />
              <span class="text-slate-700">Expected: {{ formatDeliveryTime(order.expected_delivery_time) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Receipt class="w-4 h-4 text-blue-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Order Summary</h3>
          </div>
          
          <div class="space-y-3">
            <!-- Product Breakdown -->
            <div v-if="order.items && order.items.length > 0" class="space-y-2">
              <h4 class="text-xs font-semibold text-slate-700 mb-2">Product Details:</h4>
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div 
                  v-for="(item, index) in order.items" 
                  :key="index"
                  class="p-2 bg-slate-50/50 rounded-lg border border-slate-100"
                >
                  <div class="flex items-start space-x-2">
                    <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        v-if="item.product?.main_image" 
                        :src="item.product.main_image" 
                        :alt="item.product?.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Package class="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div class="flex-1 min-w-0">
                      <h5 class="text-xs font-semibold text-slate-900 truncate">
                        {{ item.product?.name || 'Product' }}
                      </h5>
                      <div class="space-y-0.5 mt-1">
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-slate-600">Variant:</span>
                          <span class="font-medium text-slate-900">{{ item.product_variant?.name || 'Standard' }} ML</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-slate-600">Quantity:</span>
                          <span class="font-medium text-slate-900">{{ item.quantity }}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-slate-600">Price:</span>
                          <span class="font-medium text-slate-900">
                            {{ formatApiPrice({ price: item.price, currency_info: order.currency_info }) }} each
                          </span>
                        </div>
                        <div class="flex justify-between items-center text-xs font-semibold text-slate-900 pt-0.5 border-t border-slate-200">
                          <span>Subtotal:</span>
                          <span>{{ formatApiPrice({ price: item.price * item.quantity, currency_info: order.currency_info }) }}</span>
                        </div>
                        <!-- Delivery info for each product in summary -->
                        <div v-if="item.delivery_date || item.delivery_timeslot || order.expected_delivery_date" class="mt-2 pt-2 border-t border-slate-200">
                          <div class="flex items-center space-x-1 mb-1">
                            <Truck class="w-3 h-3 text-green-600" />
                            <span class="text-xs font-medium text-green-700">Delivery</span>
                          </div>
                          <div v-if="item.delivery_date || order.expected_delivery_date" class="text-xs text-slate-600">
                            <strong>Date:</strong> {{ formatDate(item.delivery_date || order.expected_delivery_date) }}
                          </div>
                          <div v-if="item.delivery_timeslot || order.expected_delivery_time" class="text-xs text-slate-600">
                            <strong>Time:</strong> {{ formatTimeSlot(item.delivery_timeslot || order.expected_delivery_time) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Price Summary -->
            <div class="space-y-2 pt-2 border-t border-slate-200">
              <!-- Debug info - remove after testing -->
              <div class="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                Debug: total_amount={{ order.total_amount }}, delivery_fee={{ order.delivery_fee }}, type={{ typeof order.delivery_fee }}
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-600">Subtotal</span>
                <span class="font-semibold text-slate-900">
                  {{ formatApiPrice({ price: parseFloat(order.total_amount) || 0, currency_info: order.currency_info }) }}
                </span>
                  </div>
              <div v-if="order.delivery_fee && parseFloat(order.delivery_fee) > 0" class="flex justify-between items-center text-sm">
                <span class="text-slate-600">Delivery Fee</span>
                <span class="font-semibold text-slate-900">
                  {{ formatApiPrice({ price: parseFloat(order.delivery_fee) || 0, currency_info: order.currency_info }) }}
                </span>
                  </div>
              <div class="flex justify-between items-center pt-2 border-t border-slate-200">
                <span class="text-base font-bold text-slate-900">Total</span>
                <span class="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text">
                      {{ formatApiPrice({ price: (parseFloat(order.total_amount) || 0) + (parseFloat(order.delivery_fee) || 0), currency_info: order.currency_info }) }}
                    </span>
                  </div>
                </div>
          </div>
        </div>

            <!-- Payment Information -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CreditCard class="w-4 h-4 text-green-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Payment Information</h3>
          </div>
          
          <div class="space-y-2">
            <div v-if="order.payment" class="flex justify-between items-center text-sm">
              <span class="text-slate-600">Method:</span>
              <span class="font-medium text-slate-900 capitalize">
                {{ order.payment.payment_method?.replace('_', ' ') || 'Not specified' }}
              </span>
            </div>
            
            <div v-if="order.payment" class="flex justify-between items-center text-sm">
              <span class="text-slate-600">Status:</span>
              <span class="font-medium text-slate-900 capitalize">
                {{ order.payment.payment_status?.replace('_', ' ') || 'Not specified' }}
              </span>
            </div>
            
            <div v-if="!order.payment" class="text-center py-4">
              <div class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CreditCard class="w-6 h-6 text-slate-400" />
              </div>
              <p class="text-slate-500 text-sm">No payment information available</p>
            </div>
          </div>
                </div>

        <!-- Order Timeline -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-4">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock class="w-4 h-4 text-purple-600" />
            </div>
            <h3 class="text-base font-semibold text-slate-900">Order Timeline</h3>
                </div>
          
          <OrderStatusTimeline :order="order" />
        </div>

        <!-- Action Buttons - Moved to fixed footer -->
      </div>
    </div>

    <!-- Fixed Action Buttons Footer -->
    <div v-if="order" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50">
      <div class="max-w-md mx-auto flex gap-3">
        <!-- Proceed Order Button (for on_hold status) -->
        <button 
          v-if="order.status === 'on_hold'"
          @click="showProceedConfirmDialog = true"
          class="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 text-sm"
        >
          <CheckCircle class="w-4 h-4" />
          <span>Proceed with Order</span>
        </button>

        <!-- Cancel Order Button -->
        <button 
          v-if="canCancel(order.status)"
          @click="showCancelConfirmDialog = true"
          class="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 text-sm"
        >
          <X class="w-4 h-4" />
          <span>Cancel Order</span>
        </button>

        <!-- Reorder Items Button -->
        <button 
          v-if="canReorder(order.status)"
          @click="reorderItems"
          class="flex-1 px-4 py-3 text-white font-semibold rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center space-x-2 hover:shadow-md text-sm"
          style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
          onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Reorder Items</span>
        </button>
      </div>
    </div>

    <!-- Enhanced Cancel Order Confirmation Dialog -->
    <div 
      v-if="showCancelConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showCancelConfirmDialog = false"
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
            <p class="text-slate-600 text-sm">Order #{{ orderId }}</p>
          </div>
        </div>
        <p class="text-slate-700 mb-6">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div class="flex space-x-4">
          <button 
            @click="showCancelConfirmDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Keep Order
          </button>
          <button 
            @click="executeCancelOrder"
            :disabled="updatingStatus"
            class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingStatus" class="w-4 h-4 animate-spin" />
            <X v-else class="w-4 h-4" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Proceed Order Confirmation Dialog -->
    <div 
      v-if="showProceedConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showProceedConfirmDialog = false"
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
            <p class="text-slate-600 text-sm">Order #{{ orderId }}</p>
          </div>
        </div>
        <div class="mb-6">
          <p class="text-slate-700 mb-4">Are you sure you want to proceed with this order? It will be moved to pending status.</p>
          
          <!-- Express Delivery Refund Notice -->
          <div v-if="hasExpressDelivery && expressDeliveryCost > 0" class="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap class="w-4 h-4 text-amber-600" />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-amber-800 mb-2">Express Delivery Refund</h4>
                <p class="text-amber-700 text-sm mb-3">
                  Since your order cannot be delivered the same day as originally planned, you will receive a refund for the express delivery cost.
                </p>
                <div class="bg-amber-100 p-3 rounded-lg border border-amber-300">
                  <div class="flex items-center justify-between">
                    <span class="text-amber-800 font-medium text-sm">Express Delivery Refund:</span>
                    <span class="text-amber-900 font-bold">{{ formatApiPrice(expressDeliveryCost) }} CFA</span>
                  </div>
                  <p class="text-amber-600 text-xs mt-1">This amount will be processed back to your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex space-x-4">
          <button 
            @click="showProceedConfirmDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Keep on Hold
          </button>
          <button 
            @click="executeProceedOrder"
            :disabled="updatingStatus"
            class="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingStatus" class="w-4 h-4 animate-spin" />
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
            <p class="text-slate-600 text-sm">Order #{{ orderId }}</p>
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
            :disabled="updatingStatus"
            class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingStatus" class="w-4 h-4 animate-spin" />
            <CheckCircle v-else class="w-4 h-4" />
            <span>Confirm Delivery</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Enhanced Wrong Delivery Dialog -->
    <div 
      v-if="showWrongDeliveryDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      @click="showWrongDeliveryDialog = false"
    >
      <div 
        class="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
        @click.stop
      >
        <div class="flex items-center mb-6">
          <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mr-4">
            <AlertTriangle class="w-7 h-7 text-amber-600" />
          </div>
          <div>
            <h3 class="text-xl font-bold text-slate-900">Report Wrong Delivery</h3>
            <p class="text-slate-600 text-sm">Order #{{ orderId }}</p>
          </div>
        </div>
        <p class="text-slate-700 mb-4">Please describe what was wrong with your delivery:</p>
        <textarea 
          v-model="wrongDeliveryReason"
          placeholder="Describe the issue with your delivery..."
          class="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
          rows="4"
        ></textarea>
        <div class="flex space-x-4 mt-6">
          <button 
            @click="showWrongDeliveryDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
              Cancel
          </button>
          <button 
            @click="executeWrongDeliveryReport"
            :disabled="updatingStatus"
            class="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Loader2 v-if="updatingStatus" class="w-4 h-4 animate-spin" />
            <AlertTriangle v-else class="w-4 h-4" />
            <span>Report Issue</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import OrderStatusTimeline from '@/components/OrderStatusTimeline.vue'
import { useCurrency } from '@/composables/useCurrency'
import { 
  ArrowLeft, Calendar, Loader2, AlertCircle, X, FileText, AlertTriangle, 
  CheckCircle, Play, Clock, Package, Eye, Truck, MapPin, Zap, Receipt, 
  CreditCard, Store, Mail, Phone, RefreshCw, Download
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { formatApiPrice } = useCurrency()

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
const downloadingInvoice = ref(false)

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

// Check if order has express delivery
const hasExpressDelivery = computed(() => {
  if (!order.value) return false
  // Check if any order item has express delivery
  return order.value.items?.some(item => item.express_delivery) || 
         order.value.delivery_option === 'express'
})

// Calculate express delivery cost (25% of total delivery fee)
const expressDeliveryCost = computed(() => {
  if (!order.value || !hasExpressDelivery.value || !order.value.delivery_fee) return 0
  
  // Express delivery is charged as 25% of the total delivery fee
  const totalDeliveryFee = parseFloat(order.value.delivery_fee)
  const expressPortionCost = totalDeliveryFee * 0.25 // 25% of total delivery fee
  return Math.round(expressPortionCost)
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
  downloadingInvoice.value = true
  try {
    await apiService.downloadOrderInvoice(orderId.value)
  } catch (err) {
    console.error('Error downloading invoice:', err)
    error.value = 'Failed to download invoice. Please try again.'
  } finally {
    downloadingInvoice.value = false
  }
}

const goToProduct = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
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

const formatDeliveryTime = (timeString) => {
  if (!timeString) return ''
  return timeString.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatTimeSlot = (timeSlot) => {
  if (!timeSlot) return ''
  const timeMap = {
    'morning': 'Morning (8:00 AM - 12:00 PM)',
    'afternoon': 'Afternoon (12:00 PM - 4:00 PM)',
    'evening': 'Evening (4:00 PM - 8:00 PM)'
  }
  return timeMap[timeSlot] || timeSlot.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
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
    ready_for_pickup: CheckCircle,
    picked_up: Truck,
    delivered_no_confirmation: CheckCircle,
    delivered: CheckCircle,
    cancelled: X,
    on_hold: AlertTriangle
  }
  return icons[status] || Package
}

const getDeliveryOptionDisplay = (option) => {
  const displays = {
    default: 'Standard Delivery',
    express: 'Express Delivery',
    custom: 'Custom Delivery'
  }
  return displays[option] || 'Standard Delivery'
}

const getDeliveryOptionClasses = (option) => {
  const classes = {
    default: 'bg-blue-100 text-blue-700',
    express: 'bg-green-100 text-green-700',
    custom: 'bg-orange-100 text-orange-700'
  }
  return classes[option] || 'bg-blue-100 text-blue-700'
}

const getDeliveryOptionIcon = (option) => {
  const icons = {
    default: Truck,
    express: Zap,
    custom: Clock
  }
  return icons[option] || Truck
}

// Update order status method
const updateOrderStatus = async (newStatus) => {
  try {
    updatingStatus.value = true
    await apiService.updateOrderStatus(orderId.value, {
      status: newStatus,
      notes: `Status updated to ${newStatus}`
    })
    // Reload order to get updated status
    await loadOrder()
  } catch (err) {
    console.error('Error updating order status:', err)
    error.value = 'Failed to update order status. Please try again.'
  } finally {
    updatingStatus.value = false
  }
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
  try {
    updatingStatus.value = true
    
    // Check if order has express delivery and needs refund
    const hasExpressDeliveryLocal = order.value.items?.some(item => item.express_delivery) || 
                                   order.value.delivery_option === 'express'
    
    console.log('Proceeding with order:', {
      orderId: order.value.id,
      hasExpressDelivery: hasExpressDeliveryLocal,
      deliveryFee: order.value.delivery_fee,
      orderItems: order.value.items?.map(item => ({
        id: item.id,
        express_delivery: item.express_delivery,
        product_name: item.product?.name
      })),
      deliveryOption: order.value.delivery_option,
      expressDeliveryCost: expressDeliveryCost.value,
      willCreateRefund: hasExpressDeliveryLocal && expressDeliveryCost.value > 0
    })
    
    // If order has express delivery and delivery fee > 0, create refund for express delivery cost
    if (hasExpressDelivery.value && expressDeliveryCost.value > 0) {
      try {
        console.log('Creating express delivery refund for order...', {
          expressDeliveryCost: expressDeliveryCost.value,
          totalDeliveryFee: order.value.delivery_fee
        })
        
        // Create refund for express delivery cost only
        await apiService.requestRefund(order.value.id, {
          amount: expressDeliveryCost.value,
          reason: 'Express delivery refund - order cannot be delivered same day as planned',
          refund_type: 'express_delivery_fee'
        })
        
        console.log('Express delivery refund created successfully')
      } catch (refundError) {
        console.error('Error creating express delivery refund:', refundError)
        // Don't fail the entire operation if refund fails
        error.value = 'Order status updated, but failed to process express delivery refund. Please contact support.'
      }
    }
    
    // Update order status to rescheduled
    await updateOrderStatus('rescheduled')
    showProceedConfirmDialog.value = false
  } catch (err) {
    console.error('Error proceeding with order:', err)
    error.value = 'Failed to proceed with order. Please try again.'
  } finally {
    updatingStatus.value = false
  }
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

// Helper methods for conditional button visibility
const canCancel = (status) => {
  return ['pending', 'on_hold', 'ready_for_pickup'].includes(status)
}

const canReorder = (status) => {
  return ['delivered', 'cancelled', 'not_received', 'wrong_delivery'].includes(status)
}

onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
