<template>
  <div class="min-h-screen bg-white pb-32">
    <BackButtonHeader :title="`#${orderId}`" />
    <div class="p-3 pt-4">
      <!-- Header Info -->
      <div class="mb-3 flex items-center justify-between">
        <p v-if="order" class="text-xs text-gray-600 flex items-center">
          <Calendar class="w-3 h-3 mr-1" />
          {{ $t('order_detail.placed_on') }} {{ formatDate(order.created_at) }}
        </p>
        
        <!-- Status Badge -->
        <div v-if="order" 
             :class="[
               'px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1',
               getStatusClasses(order.status)
             ]"
        >
          <component :is="getStatusIcon(order.status)" class="w-2.5 h-2.5" />
          <span>{{ formatStatus(order.status) }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('order_detail.loading') }}</h3>
        <p class="text-xs text-gray-600">{{ $t('order_detail.loading_subtitle') }}</p>
      </div>

      <!-- Error State -->
      <div v-if="error" class="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <div class="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
            <AlertCircle class="w-3.5 h-3.5 text-red-600" />
          </div>
          <div class="flex-1">
            <h4 class="text-xs font-semibold text-red-800 mb-0.5">{{ $t('order_detail.error_loading') }}</h4>
            <p class="text-xs text-red-700">{{ error }}</p>
          </div>
          <button @click="error = null" class="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0">
            <X class="w-3.5 h-3.5 text-red-600" />
          </button>
        </div>
      </div>

      <!-- Order Content -->
      <div v-if="!loading && order" class="space-y-2">
            <!-- Order Notes -->
        <div v-if="order.notes || order.status === 'on_hold'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <FileText class="w-3 h-3 text-blue-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.order_notes') }}</h3>
          </div>
          
          <!-- On Hold Status Special Notes -->
          <div v-if="order.status === 'on_hold'" class="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
            <div class="flex items-start space-x-2">
              <AlertTriangle class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-xs font-semibold text-amber-800 mb-1.5">{{ $t('order_detail.order_on_hold') }}</p>
                <p class="text-amber-700 text-xs mb-2">
                  {{ $t('order_detail.order_on_hold_message') }}
                </p>
                
                <!-- Show new expected delivery date if available -->
                <div v-if="order.expected_delivery_date" class="bg-amber-100 p-2 rounded-lg border border-amber-300">
                  <div class="flex items-center space-x-1.5 mb-1">
                    <Calendar class="w-3 h-3 text-amber-700" />
                    <span class="text-xs font-medium text-amber-800">{{ $t('order_detail.new_expected_delivery_date') }}</span>
                  </div>
                  <p class="text-amber-700 text-xs">
                    <strong>{{ formatDate(order.expected_delivery_date) }}</strong>
                  </p>
                  <p class="text-amber-600 text-xs mt-1">
                    This is the new delivery date set by the seller when your order was put on hold.
                  </p>
                </div>
                
                <!-- Show delivery time if available -->
                <div v-if="order.expected_delivery_time" class="bg-amber-100 p-2 rounded-lg border border-amber-300 mt-1.5">
                  <div class="flex items-center space-x-1.5 mb-1">
                    <Clock class="w-3 h-3 text-amber-700" />
                    <span class="text-xs font-medium text-amber-800">{{ $t('order_detail.expected_delivery_time') }}</span>
                  </div>
                  <p class="text-amber-700 text-xs">
                    <strong>{{ formatTimeSlot(order.expected_delivery_time) }}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Regular order notes -->
          <div v-if="order.notes && order.status !== 'wrong_delivery'" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p class="text-xs text-gray-700">{{ order.notes }}</p>
          </div>
          <div v-if="order.status === 'wrong_delivery'" class="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div class="flex items-start space-x-2">
              <AlertTriangle class="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p class="text-xs font-semibold text-amber-800 mb-1">{{ $t('order_detail.wrong_delivery_reported') }}</p>
                <p class="text-amber-700 text-xs">
                  {{ $t('order_detail.wrong_delivery_message') }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-1.5 justify-end">
          <!-- Delivery Confirmation Button -->
          <button 
            v-if="order.status === 'delivered_no_confirmation'"
            @click="showDeliveryConfirmDialog = true"
            :disabled="updatingStatus"
            class="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <Loader2 v-if="updatingStatus" class="w-3 h-3 animate-spin" />
            <CheckCircle v-else class="w-3 h-3" />
            <span>{{ $t('order_detail.confirm_delivery') }}</span>
          </button>

          <!-- Wrong Delivery Report Button -->
          <button 
            v-if="order.status === 'delivered' && canReportWrongDelivery"
            @click="showWrongDeliveryDialog = true"
            :disabled="updatingStatus"
            class="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
          >
            <AlertTriangle class="w-3 h-3" />
            <span>{{ $t('order_detail.report_wrong_delivery') }}</span>
          </button>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Package class="w-3 h-3 text-purple-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.order_items') }}</h3>
          </div>
          
          <div class="space-y-2">
            <div 
              v-for="(item, index) in order.items" 
              :key="index"
              class="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                <img 
                  v-if="item.product?.main_image" 
                  :src="item.product.main_image" 
                  :alt="item.product?.name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Package class="w-4 h-4 text-gray-400" />
                </div>
            </div>

              <div class="flex-1 min-w-0">
                <h4 class="text-xs font-semibold text-gray-900 truncate">
                  {{ item.product?.name || $t('order_detail.product') }}
                </h4>
                <p class="text-xs text-gray-600 mt-0.5">
                  {{ $t('order_detail.variant') }}: {{ item.product_variant?.name || $t('order_detail.standard') }} ML
                </p>
                <p class="text-xs text-gray-600">
                  {{ $t('order_detail.quantity') }}: {{ item.quantity }}
                </p>
                <!-- Delivery info for each product -->
                <div v-if="item.delivery_date || item.delivery_timeslot || order.expected_delivery_date" class="mt-1.5 p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                  <div class="flex items-center space-x-1 mb-0.5">
                    <Truck class="w-2.5 h-2.5 text-amber-600" />
                    <span class="text-xs font-medium text-amber-700">{{ $t('order_detail.delivery_info') }}</span>
                  </div>
                  <div v-if="item.delivery_date || order.expected_delivery_date" class="text-xs text-amber-600">
                    <strong>Date:</strong> {{ formatDate(item.delivery_date || order.expected_delivery_date) }}
                  </div>
                  <div v-if="item.delivery_timeslot || order.expected_delivery_time" class="text-xs text-amber-600">
                    <strong>Timeslot:</strong> {{ formatTimeSlot(item.delivery_timeslot || order.expected_delivery_time) }}
                  </div>
                </div>
              </div>

              <div class="text-right flex-shrink-0">
                <p class="text-xs font-semibold text-gray-900">
                  {{ formatApiPrice({ price: item.price * item.quantity, currency_info: item.currency_info }) }}
                </p>
              </div>
            </div>
          </div>
            </div>

        <!-- Delivery Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Truck class="w-3 h-3 text-green-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.delivery_information') }}</h3>
            </div>

          <div class="space-y-1.5">
            <div class="flex items-center space-x-1.5 text-xs">
              <MapPin class="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span class="text-gray-700">{{ order.shipping_address }}</span>
            </div>
            <div v-if="order.expected_delivery_time" class="flex items-center space-x-1.5 text-xs">
              <Clock class="w-3 h-3 text-gray-500 flex-shrink-0" />
              <span class="text-gray-700">{{ $t('order_detail.expected') }}: {{ formatDeliveryTime(order.expected_delivery_time) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Receipt class="w-3 h-3 text-blue-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.order_summary') }}</h3>
          </div>
          
          <div class="space-y-2">
            <!-- Product Breakdown -->
            <div v-if="order.items && order.items.length > 0" class="space-y-1.5">
              <h4 class="text-xs font-semibold text-gray-700 mb-1.5">{{ $t('order_detail.product_details') }}:</h4>
              <div class="space-y-1.5 max-h-32 overflow-y-auto">
                <div 
                  v-for="(item, index) in order.items" 
                  :key="index"
                  class="p-2 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div class="flex items-start space-x-1.5">
                    <div class="w-6 h-6 rounded-lg overflow-hidden flex-shrink-0">
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
                      <h5 class="text-xs font-semibold text-gray-900 truncate">
                        {{ item.product?.name || 'Product' }}
                      </h5>
                      <div class="space-y-0.5 mt-0.5">
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-gray-600">{{ $t('order_detail.variant') }}:</span>
                          <span class="font-medium text-gray-900">{{ item.product_variant?.name || $t('order_detail.standard') }} ML</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-gray-600">{{ $t('order_detail.quantity') }}:</span>
                          <span class="font-medium text-gray-900">{{ item.quantity }}</span>
                        </div>
                        <div class="flex justify-between items-center text-xs">
                          <span class="text-gray-600">{{ $t('order_detail.price') }}:</span>
                          <span class="font-medium text-gray-900">
                            {{ formatApiPrice({ price: item.price, currency_info: order.currency_info }) }} {{ $t('order_detail.each') }}
                          </span>
                        </div>
                        <div class="flex justify-between items-center text-xs font-semibold text-gray-900 pt-0.5 border-t border-gray-200">
                          <span>{{ $t('order_detail.subtotal') }}:</span>
                          <span>{{ formatApiPrice({ price: item.price * item.quantity, currency_info: order.currency_info }) }}</span>
                        </div>
                        <!-- Delivery info for each product in summary -->
                        <div v-if="item.delivery_date || item.delivery_timeslot || order.expected_delivery_date" class="mt-1.5 pt-1.5 border-t border-gray-200">
                          <div class="flex items-center space-x-1 mb-0.5">
                            <Truck class="w-2.5 h-2.5 text-green-600" />
                            <span class="text-xs font-medium text-green-700">{{ $t('order_detail.delivery') }}</span>
                          </div>
                          <div v-if="item.delivery_date || order.expected_delivery_date" class="text-xs text-gray-600">
                            <strong>{{ $t('order_detail.date') }}:</strong> {{ formatDate(item.delivery_date || order.expected_delivery_date) }}
                          </div>
                          <div v-if="item.delivery_timeslot || order.expected_delivery_time" class="text-xs text-gray-600">
                            <strong>{{ $t('order_detail.time') }}:</strong> {{ formatTimeSlot(item.delivery_timeslot || order.expected_delivery_time) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Price Summary -->
            <div class="space-y-1.5 pt-2 border-t border-gray-200">
              <div class="flex justify-between items-center text-xs">
                <span class="text-gray-600">{{ $t('order_detail.subtotal') }}</span>
                <span class="font-semibold text-gray-900">
                  {{ formatApiPrice({ price: parseFloat(order.total_amount) || 0, currency_info: order.currency_info }) }}
                </span>
                  </div>
              <div v-if="order.delivery_fee && parseFloat(order.delivery_fee) > 0" class="flex justify-between items-center text-xs">
                <span class="text-gray-600">{{ $t('order_detail.delivery_fee') }}</span>
                <span class="font-semibold text-gray-900">
                  {{ formatApiPrice({ price: parseFloat(order.delivery_fee) || 0, currency_info: order.currency_info }) }}
                </span>
                  </div>
              <div class="flex justify-between items-center pt-1.5 border-t border-gray-200">
                <span class="text-sm font-bold text-gray-900">{{ $t('order_detail.total') }}</span>
                <span class="text-base font-bold text-blue-600">
                      {{ formatApiPrice({ price: (parseFloat(order.total_amount) || 0) + (parseFloat(order.delivery_fee) || 0), currency_info: order.currency_info }) }}
                    </span>
                  </div>
                </div>
          </div>
        </div>

            <!-- Payment Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CreditCard class="w-3 h-3 text-green-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.payment_information') }}</h3>
          </div>
          
          <div class="space-y-1.5">
            <div v-if="order.payment" class="flex justify-between items-center text-xs">
              <span class="text-gray-600">{{ $t('order_detail.payment_method') }}:</span>
              <span class="font-medium text-gray-900 capitalize">
                {{ formatPaymentMethod(order.payment.payment_method) || $t('order_detail.not_specified') }}
              </span>
            </div>
            
            <div v-if="order.payment" class="flex justify-between items-center text-xs">
              <span class="text-gray-600">{{ $t('order_detail.payment_status') }}:</span>
              <span class="font-medium text-gray-900 capitalize">
                {{ formatPaymentStatus(order.payment.payment_status) || $t('order_detail.not_specified') }}
              </span>
            </div>
            
            <div v-if="!order.payment" class="text-center py-3">
              <div class="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1.5">
                <CreditCard class="w-4 h-4 text-gray-400" />
              </div>
              <p class="text-gray-500 text-xs">{{ $t('order_detail.no_payment_info') }}</p>
            </div>
          </div>
                </div>

        <!-- Order Timeline -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-1.5 mb-2">
            <div class="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock class="w-3 h-3 text-purple-600" />
            </div>
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('order_detail.order_timeline') }}</h3>
                </div>
          
          <OrderStatusTimeline :order="order" />
        </div>

        <!-- Action Buttons - Moved to fixed footer -->
      </div>
    </div>

    <!-- Fixed Action Buttons Footer -->
    <div v-if="order" class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-lg z-50">
      <div class="max-w-md mx-auto flex gap-2">
        <!-- Proceed Order Button (for on_hold status) -->
        <button 
          v-if="order.status === 'on_hold'"
          @click="showProceedConfirmDialog = true"
          class="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5"
        >
          <CheckCircle class="w-3.5 h-3.5" />
            <span>{{ $t('order_detail.proceed_with_order') }}</span>
        </button>

        <!-- Cancel Order Button -->
        <button 
          v-if="canCancel(order.status)"
          @click="showCancelConfirmDialog = true"
          class="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5"
        >
          <X class="w-3.5 h-3.5" />
          <span>{{ $t('order_detail.cancel_order') }}</span>
        </button>

        <!-- Reorder Items Button -->
        <button 
          v-if="canReorder(order.status)"
          @click="reorderItems"
          class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5"
        >
          <RefreshCw class="w-3.5 h-3.5" />
          <span>{{ $t('order_detail.reorder_items') }}</span>
        </button>
      </div>
    </div>

    <!-- Cancel Order Confirmation Dialog -->
    <div 
      v-if="showCancelConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showCancelConfirmDialog = false"
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
            <h3 class="text-base font-bold text-gray-900">Cancel Order</h3>
            <p class="text-gray-600 text-xs">Order #{{ orderId }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-4">Are you sure you want to cancel this order? This action cannot be undone.</p>
        <div class="flex space-x-2">
          <button 
            @click="showCancelConfirmDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Keep Order
          </button>
          <button 
            @click="executeCancelOrder"
            :disabled="updatingStatus"
            class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingStatus" class="w-3.5 h-3.5 animate-spin" />
            <X v-else class="w-3.5 h-3.5" />
            <span>Cancel Order</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Proceed Order Confirmation Dialog -->
    <div 
      v-if="showProceedConfirmDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showProceedConfirmDialog = false"
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
            <h3 class="text-base font-bold text-gray-900">Proceed with Order</h3>
            <p class="text-gray-600 text-xs">Order #{{ orderId }}</p>
          </div>
        </div>
        <div class="mb-4">
          <p class="text-sm text-gray-700 mb-3">Are you sure you want to proceed with this order? It will be moved to pending status.</p>
          
          <!-- Express Delivery Refund Notice -->
          <div v-if="hasExpressDelivery && expressDeliveryCost > 0" class="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div class="flex items-start space-x-2">
              <div class="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap class="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div class="flex-1">
                <h4 class="text-xs font-semibold text-amber-800 mb-1.5">Express Delivery Refund</h4>
                <p class="text-amber-700 text-xs mb-2">
                  Since your order cannot be delivered the same day as originally planned, you will receive a refund for the express delivery cost.
                </p>
                <div class="bg-amber-100 p-2 rounded-lg border border-amber-300">
                  <div class="flex items-center justify-between">
                    <span class="text-amber-800 font-medium text-xs">Express Delivery Refund:</span>
                    <span class="text-amber-900 font-bold text-xs">{{ formatApiPrice(expressDeliveryCost) }} CFA</span>
                  </div>
                  <p class="text-amber-600 text-xs mt-1">This amount will be processed back to your account</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="showProceedConfirmDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Keep on Hold
          </button>
          <button 
            @click="executeProceedOrder"
            :disabled="updatingStatus"
            class="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingStatus" class="w-3.5 h-3.5 animate-spin" />
            <Play v-else class="w-3.5 h-3.5" />
            <span>Proceed</span>
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
            <h3 class="text-base font-bold text-gray-900">{{ $t('order_detail.confirm_delivery') }}</h3>
            <p class="text-gray-600 text-xs">Order #{{ orderId }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-4">Please confirm that you have received your order. This will mark the order as delivered.</p>
        <div class="flex space-x-2">
          <button 
            @click="showDeliveryConfirmDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Not Yet
          </button>
          <button 
            @click="executeDeliveryConfirmation"
            :disabled="updatingStatus"
            class="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingStatus" class="w-3.5 h-3.5 animate-spin" />
            <CheckCircle v-else class="w-3.5 h-3.5" />
            <span>{{ $t('order_detail.confirm_delivery') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Wrong Delivery Dialog -->
    <div 
      v-if="showWrongDeliveryDialog" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click="showWrongDeliveryDialog = false"
    >
      <div 
        class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
        @click.stop
      >
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 class="text-base font-bold text-gray-900">Report Wrong Delivery</h3>
            <p class="text-gray-600 text-xs">Order #{{ orderId }}</p>
          </div>
        </div>
        <p class="text-sm text-gray-700 mb-3">Please describe what was wrong with your delivery:</p>
        <textarea 
          v-model="wrongDeliveryReason"
          placeholder="Describe the issue with your delivery..."
          class="w-full p-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
          rows="4"
        ></textarea>
        <div class="flex space-x-2 mt-4">
          <button 
            @click="showWrongDeliveryDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
              Cancel
          </button>
          <button 
            @click="executeWrongDeliveryReport"
            :disabled="updatingStatus"
            class="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="updatingStatus" class="w-3.5 h-3.5 animate-spin" />
            <AlertTriangle v-else class="w-3.5 h-3.5" />
            <span>{{ $t('order_detail.report_wrong_delivery') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import OrderStatusTimeline from '@/components/OrderStatusTimeline.vue'
import { useCurrency } from '@/composables/useCurrency'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { 
  ArrowLeft, Calendar, Loader2, AlertCircle, X, FileText, AlertTriangle, 
  CheckCircle, Play, Clock, Package, Eye, Truck, MapPin, Zap, Receipt, 
  CreditCard, Store, Mail, Phone, RefreshCw, Download
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const { formatApiPrice } = useCurrency()
const { t } = useI18n()

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
  return date.toLocaleDateString('fr-FR', {
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
  const statusMap = {
    'pending': t('timeline.pending'),
    'processing': t('orders.processing'),
    'assigned_to_driver': t('timeline.assigned_to_driver'),
    'picked_up': t('timeline.picked_up'),
    'delivered': t('timeline.delivered'),
    'delivered_no_confirmation': t('timeline.delivered'),
    'cancelled': t('timeline.cancelled'),
    'on_hold': t('orders.pending')
  }
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatPaymentMethod = (method) => {
  if (!method) return null
  const methodMap = {
    'mobile_money': t('payment_methods.mobile_money'),
    'card': t('payment_methods.card'),
    'cash': t('payment_methods.cash'),
    'bank_transfer': t('payment_methods.bank_transfer')
  }
  return methodMap[method] || method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatPaymentStatus = (status) => {
  if (!status) return null
  const statusMap = {
    'pending': t('timeline.pending'),
    'completed': t('timeline.delivered'),
    'failed': t('errors.generic'),
    'cancelled': t('timeline.cancelled')
  }
  return statusMap[status] || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
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
