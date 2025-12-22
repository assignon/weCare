<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader :title="$t('checkout.title')" />
    <div class="p-3 pt-4">

      <!-- Checkout stepper -->
      <div class="mb-4">
        <!-- Stepper header -->
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center space-x-2">
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs mb-0.5',
                  currentStep >= 1 
                    ? 'bg-blue-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
              >
                1
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                {{ $t('checkout.address') }}
              </span>
            </div>
            <div 
              :class="[
                'w-6 h-0.5 rounded-full',
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            ></div>
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs mb-0.5',
                  currentStep >= 2 
                    ? 'bg-blue-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
              >
                2
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                {{ $t('checkout.delivery') }}
              </span>
            </div>
            <div 
              :class="[
                'w-6 h-0.5 rounded-full',
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
              ]"
            ></div>
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs mb-0.5',
                  currentStep >= 3 
                    ? 'bg-blue-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
              >
                3
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                {{ $t('checkout.payment') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Step content -->
        <div class="space-y-3">
          <!-- Step 1: Address Selection -->
          <div v-if="currentStep === 1" class="space-y-3">
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 class="text-base font-bold text-gray-900 mb-4">{{ $t('checkout.delivery_address') }}</h2>

              <!-- Address list -->
              <div v-if="!loading" class="space-y-2">
                <div v-if="addresses.length > 0">
                  <div 
                    v-for="(address, index) in addresses" 
                    :key="index"
                    :class="[
                      'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 mb-2',
                      selectedAddressIndex === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    ]"
                    @click="selectAddress(index)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex items-start space-x-2 flex-1">
                        <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Home v-if="address.type === 'home'" class="w-3 h-3 text-white" />
                          <Building v-else class="w-3 h-3 text-white" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center space-x-2 mb-1">
                            <span class="text-sm font-semibold text-gray-900">{{ address.address_label }}</span>
                            <div v-if="address.latitude && address.longitude" class="flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <MapPin class="w-2.5 h-2.5 mr-0.5" />
                              GPS
                            </div>
                          </div>
                          <div class="text-xs text-gray-600 space-y-0.5">
                            <p>{{ address.phone }}</p>
                            <p>{{ address.address_line1 }}</p>
                            <p>{{ address.city }}, {{ address.state }} {{ address.postal_code }}</p>
                        </div>
                        </div>
                      </div>

                      <button 
                        @click.stop="editAddress(index)"
                        class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                      >
                        <Edit class="w-3.5 h-3.5 text-gray-600" />
                      </button>
                      </div>

                      <!-- Selected indicator -->
                    <div v-if="selectedAddressIndex === index" class="flex items-center justify-end mt-2">
                      <div class="flex items-center text-blue-600 text-xs font-medium">
                        <CheckCircle class="w-3 h-3 mr-1" />
                        {{ $t('checkout.selected') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No addresses state -->
                <div v-else class="text-center py-8">
                  <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MapPinOff class="w-6 h-6 text-gray-400" />
                  </div>
                  <p class="text-sm text-gray-600">{{ $t('checkout.no_addresses_found') }}</p>
                </div>

                <!-- Add new address button -->
                <button 
                  @click="showAddressDialog = true"
                  class="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Plus class="w-4 h-4 mr-1.5" />
                  {{ $t('checkout.add_new_address') }}
                </button>
              </div>

              <!-- Loading skeleton -->
              <div v-else class="space-y-2">
                <div v-for="i in 2" :key="i" class="animate-pulse">
                  <div class="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              </div>

              <!-- Continue button -->
              <button 
                :disabled="selectedAddressIndex === null"
                @click="nextStep"
                class="w-full mt-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {{ $t('checkout.continue_to_delivery') }}
              </button>
            </div>
          </div>

          <!-- Step 2: Delivery Information -->
          <div v-if="currentStep === 2" class="space-y-3">
            <!-- Delivery Address -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-2">{{ $t('checkout.delivery_address') }}</h3>
              <div v-if="selectedAddressIndex !== null" class="text-xs text-gray-600 space-y-0.5">
                <p>{{ selectedAddress.name }}</p>
                <p>{{ selectedAddress.address_line1 }}</p>
                <p>{{ selectedAddress.city }}, {{ selectedAddress.state }} {{ selectedAddress.postal_code }}</p>
                <p>{{ selectedAddress.country }}</p>
                <p>{{ selectedAddress.phone }}</p>
              </div>
            </div>

            <!-- Seller Delivery Groups -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ $t('checkout.delivery_options_by_seller') }}</h3>
              
              <!-- Seller delivery groups -->
              <div class="space-y-3">
                <div 
                  v-for="group in sellerDeliveryGroups" 
                  :key="`${group.seller_id}_${group.delivery_type}`"
                  class="p-3 rounded-lg border bg-white"
                  :class="group.delivery_type === 'express' ? 'border-green-200 bg-green-50' : 'border-gray-200'"
                >
                  <!-- Group header -->
                  <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                      <div 
                        class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                        :class="group.delivery_type === 'express' ? 'bg-green-600' : 'bg-blue-600'"
                      >
                        <Truck v-if="group.delivery_type !== 'express'" class="w-3.5 h-3.5 text-white" />
                        <Zap v-else class="w-3.5 h-3.5 text-white" />
                      </div>
                      <div>
                        <h4 class="text-sm font-semibold text-gray-900">{{ group.seller_name }}</h4>
                        <p class="text-xs text-gray-600 capitalize">
                          {{ $t(`checkout.${group.delivery_type}_delivery`) }}
                          <span v-if="group.is_express_group" class="text-green-600">({{ $t('checkout.express_item') }})</span>
                        </p>
                        <p class="text-xs text-blue-600 mt-0.5">
                          {{ $t('checkout.expected') }}: {{ formatGroupDeliveryDate(group) }}
                        </p>
                      </div>
                    </div>
                    
                    <!-- Group delivery options (only custom for standard groups) -->
                    <div class="flex items-center space-x-1.5">
                      <!-- Always show Custom button for standard and custom groups -->
                      <button
                        v-if="group.delivery_type === 'standard' || group.delivery_type === 'custom'"
                        @click="() => { console.log('🔧 Custom button clicked for group:', group); openCustomDeliveryModalForGroup(group); }"
                        class="flex items-center px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"
                      >
                        <span class="w-3 h-3 mr-1 flex items-center justify-center rounded text-xs bg-gray-200 text-gray-600">
                          📅
                        </span>
                        {{ $t('checkout.custom') }}
                      </button>
                    </div>
                  </div>
                  
                  <!-- Group items -->
                  <div class="space-y-2">
                    <div 
                      v-for="item in group.items" 
                      :key="item.product_id"
                      class="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <!-- Product image -->
                      <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                          :alt="item.product_name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      
                      <!-- Product info -->
                      <div class="flex-1 min-w-0">
                        <h5 class="font-medium text-gray-900 text-xs">{{ item.product_name }}</h5>
                        <p class="text-xs text-gray-600">{{ getTotalQuantityForItem(item) }} {{ $t('checkout.items') }}</p>
                        <div class="flex items-center text-blue-600 text-xs mt-0.5">
                          <Truck class="w-2.5 h-2.5 mr-0.5" />
                          {{ getAdaptiveDeliveryDateForItem(item) }}
                        </div>
                      </div>
                      
                      <!-- Individual item express option -->
                      <div class="flex-shrink-0">
                        <button
                          v-if="isExpressEligibleItem(item)"
                          @click="toggleExpressForItem(item)"
                          :class="[
                            'flex items-center px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 border',
                            expressProductIds.has(item.product_id)
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                          ]"
                        >
                          <span class="w-2.5 h-2.5 mr-1 flex items-center justify-center rounded text-xs" :class="expressProductIds.has(item.product_id) ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'">
                            <span v-if="expressProductIds.has(item.product_id)">✓</span>
                            <span v-else>⚡</span>
                          </span>
                          {{ $t('checkout.express') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Delivery Cost Breakdown -->
            <DeliveryCostBreakdown
              :loading="deliveryCost.loading || isCalculatingDelivery"
              :error="deliveryCost.error"
              :total-delivery-cost="getDeliveryFeeForDisplay()"
              :seller-groups="sellerGroups.length > 0 ? sellerGroups : deliveryCost.deliveryCosts.seller_groups"
              :breakdown="Object.keys(deliveryCostBreakdown).length > 0 ? deliveryCostBreakdown : deliveryCost.deliveryCosts.breakdown"
            />

              <!-- Order summary -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ $t('checkout.order_summary') }}</h3>

                  <!-- Cart items list (up to 3) -->
              <div v-if="groupedCartItems.length > 0" class="space-y-2 mb-4">
                <div 
                  v-for="(item, index) in displayedCartItems" 
                  :key="item.product_id"
                  class="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                      :alt="item.product_name"
                      class="w-full h-full object-cover"
                    />
                      </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-900 truncate">{{ item.product_name }}</p>
                    <p class="text-xs text-gray-600">
                      {{ item.variants.length }} {{ item.variants.length === 1 ? $t('checkout.variant_one') : $t('checkout.variant_other') }} · {{ getTotalQuantity(item) }} {{ $t('checkout.items') }}
                    </p>
                    <div class="flex items-center text-blue-600 text-xs mt-0.5">
                      <Truck class="w-2.5 h-2.5 mr-0.5" />
                      {{ getAdaptiveDeliveryDate(item) }}
                    </div>
                      </div>
                      <div class="text-right">
                    <p class="text-xs font-semibold text-gray-900">
                      {{ formatApiPrice({
                          price: getItemTotal(item),
                        currency_info: cart.items.currency_info 
                      }) }}
                    </p>
                      </div>
                    </div>

                    <!-- View all button when more than 3 items -->
                <button 
                  v-if="groupedCartItems.length > 3"
                  @click="showCartItemsDialog = true"
                  class="w-full py-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                      {{ $t('checkout.view_all_items', { count: groupedCartItems.length }) }}
                </button>
                  </div>

              <!-- Price breakdown -->
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-xs text-gray-600">{{ $t('checkout.subtotal') }}</span>
                  <span class="text-xs font-semibold text-gray-900">
                    {{ formatApiPrice({
                      price: cart.items?.total_amount || 0, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                  </div>

                <!-- Delivery Cost (using new calculation) -->
                <div class="space-y-1">
                  <div class="flex justify-between items-center">
                    <span class="text-xs text-gray-600 flex items-center">
                      <Truck class="w-3 h-3 mr-1" />
                      {{ $t('checkout.delivery') }}
                      <span v-if="deliveryCost.loading || isCalculatingDelivery" class="ml-1.5 text-xs text-blue-600">
                        ({{ $t('checkout.calculating') }})
                      </span>
                    </span>
                    <span class="text-xs font-semibold text-gray-900">
                      {{ formatApiPrice({
                        price: getDeliveryFeeForDisplay(), 
                        currency_info: cart.items.currency_info 
                      }) }}
                    </span>
                  </div>
                </div>

                <div class="border-t border-gray-200 pt-2">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-gray-900">{{ $t('checkout.total') }}</span>
                    <span class="text-lg font-bold text-blue-600">
                      {{ formatApiPrice({
                      price: totalAmount,
                        currency_info: cart.items.currency_info 
                      }) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

              <!-- Navigation buttons -->
            <div class="flex space-x-2">
              <button 
                @click="prevStep"
                class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                {{ $t('checkout.back') }}
              </button>
              <button 
                @click="nextStep"
                class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {{ $t('checkout.next') }}
              </button>
              </div>
            </div>

          <!-- Step 3: Payment -->
          <div v-if="currentStep === 3" class="space-y-3">
              <!-- Summary for this step -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ $t('checkout.order_summary') }}</h3>
              
                            <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin class="w-3 h-3 text-blue-600" />
                  </div>
                    <div>
                    <p class="text-xs font-medium text-gray-900">{{ $t('checkout.delivery_address') }}</p>
                    <p class="text-xs text-gray-600">
                        {{ selectedAddress?.address_line1 }}, {{ selectedAddress?.city }}
                      </p>
                    </div>
                  </div>

                <div class="flex items-center space-x-2">
                  <div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Truck class="w-3 h-3 text-green-600" />
                  </div>
                    <div>
                    <p class="text-xs font-medium text-gray-900">{{ $t('checkout.delivery_option') }}</p>
                    <p class="text-xs text-gray-600">{{ getDeliveryOptionDisplay() }}</p>
                    </div>
                </div>

                <!-- Cart Items Summary -->
                <div class="mt-3 pt-3 border-t border-gray-200">
                  <div class="flex items-center space-x-2 mb-2">
                    <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingBag class="w-3 h-3 text-purple-600" />
                      </div>
                    <div>
                      <p class="text-xs font-medium text-gray-900">{{ $t('checkout.order_items') }}</p>
                      <p class="text-xs text-gray-600">{{ groupedCartItems.length }} {{ groupedCartItems.length === 1 ? $t('checkout.product_one') : $t('checkout.product_other') }}</p>
                    </div>
                  </div>
                  
                  <!-- Cart items list -->
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div 
                      v-for="item in groupedCartItems" 
                      :key="item.product_id"
                      class="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <div class="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                          :alt="item.product_name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium text-gray-900 truncate">{{ item.product_name }}</p>
                        <p class="text-xs text-gray-600">
                          {{ item.variants.length }} {{ item.variants.length === 1 ? $t('checkout.variant_one') : $t('checkout.variant_other') }} · {{ getTotalQuantity(item) }} {{ $t('checkout.items') }}
                        </p>
                        <div class="flex items-center text-blue-600 text-xs mt-0.5">
                          <Truck class="w-2.5 h-2.5 mr-0.5" />
                          {{ getAdaptiveDeliveryDate(item) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="text-xs font-semibold text-gray-900">
                          {{ formatApiPrice({
                            price: getItemTotal(item),
                            currency_info: cart.items.currency_info 
                          }) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment methods -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-4">{{ $t('checkout.payment_method') }}</h3>

              <div class="space-y-2">
                <!-- Mobile Money -->
                <div 
                  :class="[
                    'p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    paymentMethod === 'mobile_money' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  ]"
                  @click="paymentMethod = 'mobile_money'"
                >
                  <div class="flex items-center space-x-2">
                    <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Smartphone class="w-4 h-4 text-white" />
                      </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-900">{{ $t('checkout.mobile_money') }}</span>
                        <div class="w-4 h-4 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div v-if="paymentMethod === 'mobile_money'" class="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      <p class="text-xs text-gray-600 mt-0.5">{{ $t('checkout.pay_with_mobile_money') }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Payment information notice -->
              <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p class="text-xs text-blue-800 leading-relaxed">
                  {{ $t('checkout.payment_notice') }}
                </p>
              </div>
            </div>

            <!-- Payment button -->
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="text-sm font-bold text-gray-900">{{ $t('checkout.total') }}</span>
                <span class="text-lg font-bold text-blue-600">
                  {{ formatApiPrice({
                    price: totalAmount, 
                    currency_info: cart.items.currency_info 
                  }) }}
                </span>
                </div>

              <div class="flex space-x-2">
                <button 
                  @click="prevStep"
                  class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {{ $t('checkout.back') }}
                </button>
                <button 
                  :disabled="processing"
                  @click="placeOrder"
                  class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <span v-if="processing" class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                    {{ $t('checkout.processing') }}...
                  </span>
                  <span v-else>{{ $t('checkout.place_order') }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Address dialog (for add/edit) -->
      <div 
        v-if="showAddressDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showAddressDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">
            {{ editAddressIndex !== null ? $t('checkout.edit_address') : $t('checkout.add_new_address') }}
            </h3>
            <button 
              @click="showAddressDialog = false"
              class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X class="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          <form @submit.prevent="saveAddress" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.address_label') }}*</label>
              <input 
                v-model="addressForm.address_label"
                type="text"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="$t('checkout.address_label')"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.address_line1') }}*</label>
              <input 
                v-model="addressForm.address_line1"
                type="text"
                required
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="$t('checkout.address_line1')"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.address_line2') }}</label>
              <input 
                v-model="addressForm.address_line2"
                type="text"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                :placeholder="$t('checkout.address_line2')"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.city') }}*</label>
                <input 
                  v-model="addressForm.city"
                  type="text"
                  required
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.state') }}</label>
                <input 
                  v-model="addressForm.state"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.postal_code') }}</label>
                <input 
                  v-model="addressForm.postal_code"
                  type="text"
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-700 mb-1.5">{{ $t('checkout.country') }}*</label>
                <select 
                  v-model="addressForm.country"
                  required
                  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">{{ $t('checkout.select_country') }}</option>
                  <option v-for="country in countries" :key="country.name" :value="country.name">
                    {{ country.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <input 
                v-model="addressForm.default"
                type="checkbox"
                id="default-address"
                class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="default-address" class="text-xs text-gray-700">{{ $t('checkout.set_as_default') }}</label>
            </div>

            <div class="flex space-x-2 pt-3">
              <button 
                type="button"
                @click="showAddressDialog = false"
                class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
              {{ $t('checkout.cancel') }}
              </button>
              <button 
                type="submit"
                :disabled="!formValid || addressLoading"
                class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span v-if="addressLoading" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1.5"></div>
                  {{ $t('checkout.saving') }}...
                </span>
                <span v-else>{{ $t('checkout.save_address') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Cart items dialog -->
      <div 
        v-if="showCartItemsDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showCartItemsDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          @click.stop
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('checkout.cart_items') }}</h3>
            <button 
              @click="showCartItemsDialog = false"
              class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors"
            >
              <X class="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>

          <div class="space-y-4">
            <div 
              v-for="item in groupedCartItems" 
              :key="item.product_id"
              class="p-4 bg-gray-50/50 rounded-2xl border border-gray-200"
            >
              <div class="flex items-start space-x-3">
                <div class="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                    :alt="item.product_name"
                    class="w-full h-full object-cover"
                  />
                </div>

                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-900 mb-1">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-600 mb-2">{{ item.seller_name || 'Unknown Seller' }}</p>
                  <div class="flex items-center text-blue-600 text-sm mb-3">
                    <Truck class="w-3 h-3 mr-1" />
                    {{ getAdaptiveDeliveryDate(item) }}
              </div>

                <!-- Variants -->
                  <div class="space-y-2">
                    <div 
                      v-for="variant in item.variants" 
                      :key="variant.id"
                      class="flex justify-between items-center py-2 px-3 bg-white rounded-xl border border-gray-100"
                    >
                  <div>
                        <span class="text-sm font-medium text-blue-600">{{ variant.name }} ML</span>
                        <span class="text-sm text-gray-500 mx-2">×</span>
                        <span class="text-sm font-medium">{{ variant.quantity }}</span>
                  </div>
                      <span class="text-sm font-semibold text-gray-900">
                        {{ formatApiPrice({
                          price: variant.price * variant.quantity, 
                          currency_info: cart.items.currency_info 
                        }) }}
                      </span>
                    </div>
                </div>
              </div>

                <div class="text-right">
                  <p class="font-semibold text-gray-900">
                    {{ formatApiPrice({
                  price: getItemTotal(item),
                      currency_info: cart.items.currency_info 
                    }) }}
                  </p>
                  
                  <!-- Individual product custom delivery button -->
                  <div class="mt-2">
                    <!-- Always show Custom button -->
                    <button
                      v-if="!expressProductIds.has(item.product_id)"
                      @click="openCustomDeliveryModal(item)"
                      class="flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border-2 bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600"
                    >
                      <span class="w-3 h-3 mr-1 flex items-center justify-center rounded-full text-xs bg-gray-200 text-gray-600">
                        📅
                      </span>
                      Custom
                    </button>
                  </div>
              </div>
            </div>
            </div>
          </div>

          <div class="flex justify-end pt-3">
            <button 
              @click="showCartItemsDialog = false"
              class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              {{ $t('checkout.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Date Picker Modal -->
      <!-- Express Selection Dialog -->
      <div v-if="showExpressDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showExpressDialog = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('checkout.select_express_items') }}</h3>
            <button @click="showExpressDialog = false" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <X class="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <div class="space-y-3">
            <div v-for="item in expressEligibleItems" :key="item.product_id" class="flex items-center justify-between p-3 rounded-xl border">
              <div class="flex items-center space-x-3">
                <img :src="'http://localhost:8000' + item.main_image" class="w-10 h-10 rounded-lg object-cover" />
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ item.product_name }}</p>
                  <p class="text-xs text-gray-500">{{ getTotalQuantity(item) }} items</p>
                </div>
              </div>
              <input type="checkbox" :checked="expressProductIds.has(item.product_id)" @change="toggleExpress(item.product_id)" />
            </div>
          </div>
          <div class="flex justify-end pt-3">
            <button @click="confirmExpressSelection" class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200">
              {{ $t('checkout.done') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Per-Item Dates Dialog -->
      <div v-if="showCustomDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showCustomDialog = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-gray-900">{{ $t('checkout.select_custom_dates') }}</h3>
            <button @click="showCustomDialog = false" class="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <X class="w-3.5 h-3.5 text-gray-600" />
            </button>
          </div>
          <div class="space-y-4">
             <div v-for="item in customDateItems" :key="item.product_id" class="p-3 rounded-xl border space-y-2">
              <div class="flex items-center space-x-3">
                <img :src="'http://localhost:8000' + item.main_image" class="w-10 h-10 rounded-lg object-cover" />
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ item.product_name }}</p>
                  <p class="text-xs text-gray-500">Min: {{ minDateForItem(item) }}</p>
                </div>
              </div>
               <div class="relative">
                 <input type="date" :min="minDateForItem(item)" :max="getMaxDeliveryDate()" v-model="customDates[item.product_id]" class="w-full px-3 py-2 pr-10 border rounded-xl" />
                 <button type="button" @click="openItemDatePicker(item)" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                   <Calendar class="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
          <div class="flex justify-end pt-3">
            <button @click="confirmCustomSelection" class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200">
              {{ $t('checkout.done') }}
            </button>
          </div>
        </div>
      </div>
      <div 
        v-if="showDatePicker" 
        class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showDatePicker = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Select Delivery Date</h3>
            <button 
              @click="showDatePicker = false"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div class="space-y-4">
            <div class="grid grid-cols-7 gap-2 text-center">
              <!-- Day headers -->
              <div class="text-sm font-semibold text-gray-600 py-2">Sun</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Mon</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Tue</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Wed</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Thu</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Fri</div>
              <div class="text-sm font-semibold text-gray-600 py-2">Sat</div>
              
              <!-- Calendar days -->
              <div 
                v-for="day in getCalendarDays()" 
                :key="day.date"
                :class="[
                  'p-2 rounded-lg cursor-pointer transition-colors text-sm',
                  day.isCurrentMonth 
                    ? day.isDisabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : day.isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-700 hover:bg-gray-100'
                    : 'text-gray-300'
                ]"
                @click="day.isCurrentMonth && !day.isDisabled ? selectDate(day.date) : null"
              >
                {{ day.dayNumber }}
              </div>
            </div>

            <div class="flex justify-between items-center pt-4">
              <button 
                @click="previousMonth"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft class="w-5 h-5 text-gray-600" />
              </button>
              <span class="text-lg font-semibold text-gray-900">{{ getCurrentMonthYear() }}</span>
              <button 
                @click="nextMonth"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight class="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div class="flex space-x-3 pt-4">
              <button 
                @click="showDatePicker = false"
                class="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                @click="confirmDateSelection"
                class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Custom Delivery Modal -->
      <div v-if="showProductDeliveryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showProductDeliveryModal = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Custom Delivery</h3>
            <button @click="showProductDeliveryModal = false" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div v-if="selectedProductForDelivery" class="space-y-6">
            <!-- Product info -->
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
              <div class="w-12 h-12 rounded-lg overflow-hidden">
                <img 
                  :src="'http://localhost:8000' + selectedProductForDelivery.main_image || 'https://via.placeholder.com/150'"
                  :alt="selectedProductForDelivery.product_name"
                  class="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 class="font-medium text-gray-900">{{ selectedProductForDelivery.product_name }}</h4>
                <p class="text-sm text-gray-600">{{ $t('checkout.standard') }}: {{ getAdaptiveDeliveryDate(selectedProductForDelivery) }}</p>
              </div>
            </div>
            
            <!-- Date selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Custom Delivery Date</label>
              <div class="relative">
                <input 
                  v-model="productCustomDate"
                  type="text"
                  readonly
                  @click="openDatePickerForProduct"
                  :placeholder="productCustomDate ? formatDate(productCustomDate) : 'Select delivery date'"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer bg-white"
                />
                <button type="button" @click="openDatePickerForProduct" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto">
                  <Calendar class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">Must be after {{ getAdaptiveDeliveryDate(selectedProductForDelivery) }}</p>
            </div>
            
            <!-- Time slot selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Time Slot</label>
              <select 
                v-model="productCustomTime"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">Select time slot</option>
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                <option value="evening">Evening (4:00 PM - 8:00 PM)</option>
              </select>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex space-x-3 mt-6">
            <button 
              @click="showProductDeliveryModal = false"
              class="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </button>
            <button 
              @click="confirmProductCustomDelivery"
              :disabled="!productCustomDate || !productCustomTime"
              class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>

      <!-- Group Custom Delivery Modal -->
      <div v-if="showCustomDeliveryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showCustomDeliveryModal = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">{{ $t('checkout.custom_delivery_for_group') }}</h3>
            <button @click="showCustomDeliveryModal = false" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>
          
          <div v-if="currentCustomGroup" class="space-y-6">
            <!-- Group info -->
            <div class="p-4 bg-gray-50 rounded-xl">
              <h4 class="font-semibold text-gray-900 mb-2">{{ currentCustomGroup.seller_name }}</h4>
              <p class="text-sm text-gray-600 mb-3">{{ currentCustomGroup.items.length }} {{ currentCustomGroup.items.length === 1 ? $t('checkout.items') : $t('checkout.items') }}</p>
              
              <!-- Group items -->
              <div class="space-y-2">
                <div 
                  v-for="item in currentCustomGroup.items" 
                  :key="item.product_id"
                  class="flex items-center space-x-2 text-sm"
                >
                  <div class="w-8 h-8 rounded-lg overflow-hidden">
                    <img 
                      :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                      :alt="item.product_name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <span class="text-gray-700">{{ item.product_name }}</span>
                </div>
              </div>
            </div>
            
            <!-- Date selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('checkout.custom_delivery_date') }}</label>
              <div class="relative">
                <input 
                  v-model="customDeliveryDate"
                  type="text"
                  readonly
                  @click="openDatePicker"
                  :placeholder="customDeliveryDate ? formatDate(customDeliveryDate) : $t('checkout.select_delivery_date')"
                  class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer bg-white"
                />
                <button type="button" @click="openDatePicker" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto">
                  <Calendar class="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <p class="text-xs text-gray-500 mt-1">{{ $t('checkout.this_date_will_be_applied') }}</p>
            </div>
            
            <!-- Time slot selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('checkout.time_slot') }}</label>
              <select 
                v-model="customDeliveryTime"
                class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="">{{ $t('checkout.select_time_slot') }}</option>
                <option value="morning">{{ $t('checkout.morning') }}</option>
                <option value="afternoon">{{ $t('checkout.afternoon') }}</option>
                <option value="evening">{{ $t('checkout.evening') }}</option>
              </select>
            </div>
          </div>
          
          <!-- Actions -->
          <div class="flex space-x-3 mt-6">
            <button 
              @click="showCustomDeliveryModal = false"
              class="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              {{ $t('checkout.cancel') }}
            </button>
            <button 
              @click="confirmGroupCustomDelivery"
              :disabled="!customDeliveryDate || !customDeliveryTime"
              class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              {{ $t('checkout.confirm') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Location Confirmation Dialog -->
      <LocationConfirmationDialog
        v-model="locationConfirmation.showLocationDialog.value"
        :address="locationConfirmation.currentAddress.value"
        @locationConfirmed="handleLocationConfirmed"
        @locationSkipped="handleLocationSkipped"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useDeliveryCostStore } from '@/stores/deliveryCost'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import { useLocationConfirmation } from '@/composables/useLocationConfirmation'
import LocationConfirmationDialog from '@/components/LocationConfirmationDialog.vue'
import DeliveryCostBreakdown from '@/components/DeliveryCostBreakdown.vue'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import { useI18n } from 'vue-i18n'
import { 
  ArrowLeft, Home, Building, MapPin, MapPinOff, Edit, CheckCircle, Plus, 
  Truck, Zap, Calendar, Info, Smartphone, X, ChevronLeft, ChevronRight, ShoppingBag 
} from 'lucide-vue-next'

const { t } = useI18n()

const router = useRouter()
const cart = useCartStore()
const deliveryCost = useDeliveryCostStore()
const { formatApiPrice, formatPrice } = useCurrency()
const locationConfirmation = useLocationConfirmation()

// Checkout state
const currentStep = ref(1)
const selectedAddressIndex = ref(null)
const paymentMethod = ref('mobile_money')
const processing = ref(false)
const shippingFee = ref(0)

// Delivery options (now all per-product based)
const customDeliveryDate = ref(null) // Legacy - kept for existing functionality
const customDeliveryTime = ref(null) // Legacy - kept for existing functionality
const expressDeliveryFee = ref(0) // Will be calculated by API
const customDeliveryFee = ref(0) // Will be calculated by API

// Multi-seller delivery cost variables
const multiSellerDeliveryCost = ref(0)
const sellerGroups = ref([])
const deliveryCostBreakdown = ref({})
const isCalculatingDelivery = ref(false)

// Initialize with default values to prevent endless loading
const initializeDefaultDeliveryData = () => {
  console.log('🔧 initializeDefaultDeliveryData called, current values:', {
    multiSellerDeliveryCost: multiSellerDeliveryCost.value,
    sellerGroupsLength: sellerGroups.value.length
  });
  
  // Initialize with empty/default values - real calculation will happen later
  multiSellerDeliveryCost.value = 0;
  sellerGroups.value = [];
  deliveryCostBreakdown.value = {
    total_standard_cost: 0,
    total_express_cost: 0,
    total_mixed_cost: 0
  };
  
  console.log('✅ Default data initialized (empty values):', {
    multiSellerDeliveryCost: multiSellerDeliveryCost.value,
    sellerGroupsLength: sellerGroups.value.length,
    deliveryCostBreakdown: deliveryCostBreakdown.value
  });
  
  // Double-check the values are actually set
  setTimeout(() => {
    console.log('🔍 Verification after 100ms:', {
      multiSellerDeliveryCost: multiSellerDeliveryCost.value,
      sellerGroupsLength: sellerGroups.value.length,
      'Expected in debug': 'TotalCost: 0, SellerGroups: 0, HasMultiple: false'
    });
  }, 100);
};

// Per-item delivery overrides state
const showExpressDialog = ref(false)
const showCustomDialog = ref(false)
const expressProductIds = ref(new Set())
const customDates = ref({})

// Computed property to ensure date is in correct format
const formattedCustomDeliveryDate = computed(() => {
  if (!customDeliveryDate.value) return null;
  
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof customDeliveryDate.value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(customDeliveryDate.value)) {
    return customDeliveryDate.value;
  }
  
  // If it's a Date object or other format, convert to YYYY-MM-DD
  const date = new Date(customDeliveryDate.value);
  if (!isNaN(date.getTime())) {
    // Use timezone-safe formatting to avoid UTC conversion issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  return null;
})

// Address state
const addresses = ref([])
const countries = ref([])
const loadingCountries = ref(false)
const loading = ref(false)
const addressLoading = ref(false)
const editAddressIndex = ref(null)
const showAddressDialog = ref(false)
const formRef = ref(null)

// Success state
const showCartItemsDialog = ref(false)
const showDatePicker = ref(false)

// Product-specific delivery modal state
const showProductDeliveryModal = ref(false)
const selectedProductForDelivery = ref(null)
const productCustomDate = ref(null)
const productCustomTime = ref(null)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Form data
const addressForm = ref({
  address_label: '',
  type: 'home',
  address_line1: '',
  address_line2: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  default: false
})

// Form validation computed property
const formValid = computed(() => {
  return addressForm.value.address_label && 
         addressForm.value.address_line1 && 
         addressForm.value.city && 
         addressForm.value.country
})

// Computed
const totalAmount = computed(() => {
  const subtotal = Number(cart.items?.total_amount) || 0
  
  // Use multi-seller delivery cost if available, otherwise fall back to legacy calculation
  let deliveryFee = 0
  
  // Check if multi-seller delivery cost is available and valid
  if (multiSellerDeliveryCost.value && multiSellerDeliveryCost.value > 0 && !isNaN(multiSellerDeliveryCost.value)) {
    // Use the new multi-seller delivery cost calculation
    deliveryFee = Number(multiSellerDeliveryCost.value) || 0
  } else {
    // Fallback to legacy calculation for backward compatibility
    deliveryFee = Number(shippingFee.value) || 0
    
    // Use the correct delivery fee based on selected options:
    // - Express delivery takes priority over custom
    // - Custom delivery uses same fee as standard delivery
    // - Standard delivery uses base shipping fee
    const hasExpressItems = expressProductIds.value.size > 0
    const hasCustomItems = Object.keys(customDates.value).length > 0
    
    if (hasExpressItems) {
      // Express delivery - use express fee from API
      deliveryFee = Number(expressDeliveryFee.value) || 0
    } else if (hasCustomItems) {
      // Custom delivery - uses same fee as standard delivery (no extra charge)
      deliveryFee = Number(shippingFee.value) || 0
    }
  }
  
  const total = subtotal + deliveryFee
  
  // Ensure total is valid and within reasonable bounds
  const validTotal = Math.round(total * 100) / 100 // Round to 2 decimal places
  return Math.min(Math.max(validTotal, 0), 999999999.99) // Cap at reasonable maximum
})

// Placeholder; defined properly after expressEligibleItems
let expressDeliveryAvailable = null

const selectedAddress = computed(() => {
  if (selectedAddressIndex.value === null) return null
  return addresses.value[selectedAddressIndex.value]
})

// Computed properties for cart items
const groupedCartItems = computed(() => {
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    return [];
  }

  const grouped = {};

  // Group items by product_id
  cart.items.items.forEach(item => {
    if (!grouped[item.product_id]) {
      grouped[item.product_id] = {
        cart_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        seller_name: item.seller_name,
        seller_id: item.seller_id,
        main_image: item.main_image,
        delivery_info: item.delivery_info,
        variants: []
      };
    }

    // Add all variants from this product
    item.variants.forEach(variant => {
      grouped[item.product_id].variants.push({
        ...variant,
        cart_item_id: item.id,
        product_id: item.product_id
      });
    });
  });

  return Object.values(grouped);
});

// New seller-based grouping for delivery options
const sellerDeliveryGroups = computed(() => {
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    return [];
  }

  const groups = {};

  // Group items by seller and delivery option
  cart.items.items.forEach(item => {
    const sellerId = item.seller_id;
    const isExpress = expressProductIds.value.has(item.product_id);
    const hasCustomDate = customDates.value[item.product_id];
    
    // Determine delivery type
    let deliveryType = 'standard';
    if (isExpress) {
      deliveryType = 'express';
    } else if (hasCustomDate) {
      deliveryType = 'custom';
    }

    // Create separate groups for express items from the same seller
    const groupKey = isExpress ? `${sellerId}_express_${item.product_id}` : `${sellerId}_${deliveryType}`;
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        seller_id: sellerId,
        seller_name: item.seller_name,
        delivery_type: deliveryType,
        items: [],
        custom_date: null,
        expected_delivery_date: null,
        is_express_group: isExpress
      };
    }

    // Add item to group
    groups[groupKey].items.push({
      cart_item_id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      main_image: item.main_image,
      delivery_info: item.delivery_info,
      variants: item.variants,
      is_express: isExpress,
      custom_date: hasCustomDate ? customDates.value[item.product_id] : null
    });
  });

  // Calculate expected delivery dates for each group
  Object.values(groups).forEach(group => {
    console.log('🔧 Processing group:', group.delivery_type, group);
    
    if (group.delivery_type === 'express') {
      // For express, use the earliest express delivery date
      group.expected_delivery_date = getEarliestExpressDate(group.items);
      console.log('🔧 Set express group expected_delivery_date:', group.expected_delivery_date);
    } else if (group.delivery_type === 'custom') {
      // For custom, use the custom date (should be the same for all items in group)
      group.custom_date = getCustomDateForGroup(group.items);
      group.expected_delivery_date = group.custom_date;
    } else {
      // For standard, use the latest standard delivery date
      group.expected_delivery_date = getLatestStandardDate(group.items);
    }
  });

  return Object.values(groups);
});

// Helper functions for date calculations
const getEarliestExpressDate = (items) => {
  // For express delivery, use current date (today)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day
  console.log('🔧 getEarliestExpressDate returning:', today);
  return today;
};

const getCustomDateForGroup = (items) => {
  // All items in a custom group should have the same custom date
  const customDates = items.map(item => item.custom_date).filter(Boolean);
  return customDates[0] || null;
};

const getLatestStandardDate = (items) => {
  let latestDate = null;
  items.forEach(item => {
    if (item.delivery_info?.estimated_delivery_date) {
      const standardDate = new Date(item.delivery_info.estimated_delivery_date);
      if (!latestDate || standardDate > latestDate) {
        latestDate = standardDate;
      }
    }
  });
  return latestDate;
};

// Helper functions for the new grouping system
const formatGroupDeliveryDate = (group) => {
  console.log('🔧 formatGroupDeliveryDate called with group:', group);
  console.log('🔧 group.expected_delivery_date:', group.expected_delivery_date);
  
  if (!group.expected_delivery_date) {
    console.log('🔧 No expected_delivery_date, returning TBD');
    return t('checkout.tbd');
  }
  
  const date = new Date(group.expected_delivery_date);
  const formatted = date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  
  console.log('🔧 Formatted date:', formatted);
  return formatted;
};

const hasExpressEligibleItems = (items) => {
  return items.some(item => isExpressEligibleItem(item));
};

const isGroupExpress = (group) => {
  return group.delivery_type === 'express';
};

const getTotalQuantityForItem = (item) => {
  if (!item.variants) return 0;
  return item.variants.reduce((total, variant) => total + (variant.quantity || 0), 0);
};

const getAdaptiveDeliveryDateForItem = (item) => {
  if (item.is_express) {
    // For express delivery, show current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    return t('checkout.express_delivery_date', { date: formattedDate });
  } else if (item.custom_date) {
    const date = new Date(item.custom_date);
    const formattedDate = date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    return t('checkout.custom_delivery_date_label', { date: formattedDate });
  } else if (item.delivery_info?.estimated_delivery_display) {
    return item.delivery_info.estimated_delivery_display;
  } else {
    return t('checkout.standard_delivery');
  }
};

// Individual item express toggle handler
const toggleExpressForItem = (item) => {
  if (expressProductIds.value.has(item.product_id)) {
    // Remove from express - item will go back to standard group
    expressProductIds.value.delete(item.product_id);
    // Clear custom date if it exists
    delete customDates.value[item.product_id];
  } else {
    // Add to express - item will be moved to express group
    expressProductIds.value.add(item.product_id);
    // Clear custom date if it exists
    delete customDates.value[item.product_id];
  }
};

// Get standard delivery dates for all items
const getStandardDeliveryDates = () => {
  const standardDates = {};
  
  console.log('🔧 Debugging cart items for standard delivery dates:');
  console.log('Cart items:', cart.items.items);
  
  // Get all items that are not express or custom
  cart.items.items.forEach(item => {
    const isExpress = expressProductIds.value.has(item.product_id);
    const hasCustomDate = customDates.value[item.product_id];
    
    console.log(`Item ${item.product_id}:`, {
      isExpress,
      hasCustomDate,
      delivery_info: item.delivery_info,
      estimated_delivery_date: item.delivery_info?.estimated_delivery_date
    });
    
    if (!isExpress && !hasCustomDate) {
      // This is a standard delivery item
      // Use the estimated_delivery_date that was already calculated and displayed to the user
      // This ensures consistency between what the user sees and what gets saved in the database
      if (item.delivery_info?.estimated_delivery_date) {
        // Use the pre-calculated delivery date from the product
        standardDates[item.product_id] = item.delivery_info.estimated_delivery_date;
        
        console.log(`Using pre-calculated delivery date for product ${item.product_id}:`, {
          estimated_delivery_date: item.delivery_info.estimated_delivery_date,
          delivery_days: item.delivery_info?.delivery_days
        });
      } else {
        // Fallback: calculate delivery date based on current time (when order is placed)
        const deliveryDays = item.delivery_info?.delivery_days || 2;
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + deliveryDays);
        
        // Format as YYYY-MM-DD for backend
        const formattedDate = deliveryDate.toISOString().split('T')[0];
        standardDates[item.product_id] = formattedDate;
        
        console.log(`Fallback: Calculated standard date for product ${item.product_id}:`, {
          deliveryDays,
          today: today.toISOString().split('T')[0],
          calculatedDate: formattedDate
        });
      }
    }
  });
  
  console.log('🔧 Standard delivery dates being sent:', standardDates);
  return standardDates;
};

// Group-level delivery option handlers (legacy - kept for custom delivery)
const toggleExpressForGroup = (group) => {
  if (group.delivery_type === 'express') {
    // Convert express group back to standard
    group.items.forEach(item => {
      expressProductIds.value.delete(item.product_id);
    });
  } else {
    // Convert standard group to express
    group.items.forEach(item => {
      if (isExpressEligibleItem(item)) {
        expressProductIds.value.add(item.product_id);
        // Clear custom date if it exists
        delete customDates.value[item.product_id];
      }
    });
  }
};

const openCustomDeliveryModalForGroup = (group) => {
  console.log('🔧 openCustomDeliveryModalForGroup called with group:', group);
  
  // Set the current group for custom delivery
  currentCustomGroup.value = group;
  
  // Set the initial date to the highest date in the group
  const highestDate = getHighestDateInGroup(group);
  customDeliveryDate.value = highestDate;
  
  console.log('🔧 Setting showCustomDeliveryModal to true, highestDate:', highestDate);
  showCustomDeliveryModal.value = true;
};

const getHighestDateInGroup = (group) => {
  let highestDate = null;
  
  group.items.forEach(item => {
    let itemDate = null;
    
    if (item.delivery_info?.estimated_delivery_date) {
      itemDate = new Date(item.delivery_info.estimated_delivery_date);
    } else if (item.custom_date) {
      itemDate = new Date(item.custom_date);
    }
    
    if (itemDate && (!highestDate || itemDate > highestDate)) {
      highestDate = itemDate;
    }
  });
  
  // If no date found, use tomorrow
  if (!highestDate) {
    highestDate = new Date();
    highestDate.setDate(highestDate.getDate() + 1);
  }
  
  return highestDate.toISOString().split('T')[0];
};

const displayedCartItems = computed(() => {
  return groupedCartItems.value.slice(0, 3);
});

// Calculate average delivery time as a computed property
const averageDeliveryTime = computed(() => {
  if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
    return "Standard Delivery (3-5 business days)";
  }

  let totalDays = 0;
  let itemCount = 0;
  let farthestDays = 0; // Track the farthest delivery date

  // Extract delivery times from each item
  groupedCartItems.value.forEach(item => {
    const deliveryText = getAdaptiveDeliveryDate(item);

      // Try to extract delivery time range (e.g., "3-5" from "3-5 business days")
      const rangeMatch = deliveryText.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        // For ranges, use the maximum value for worst-case calculation
        const maxDays = parseInt(rangeMatch[2]);

        if (!isNaN(maxDays)) {
          totalDays += maxDays;
          itemCount++;
          // Update farthest delivery date if this is longer
          farthestDays = Math.max(farthestDays, maxDays);
        }
      } else {
        // Try to find a single number (e.g., "3 business days")
        const singleMatch = deliveryText.match(/(\d+)/);
        if (singleMatch) {
          const days = parseInt(singleMatch[1]);

          if (!isNaN(days)) {
            totalDays += days;
            itemCount++;
            // Update farthest delivery date if this is longer
            farthestDays = Math.max(farthestDays, days);
        }
      }
    }
  });

  // If no delivery info could be parsed, return a default
  if (itemCount === 0) {
    return "Standard Delivery (3-5 business days)";
  }

  // Calculate average days (rounded to nearest whole number)
  const avgDays = Math.round(totalDays / itemCount);

  // If average equals farthest, show a single date estimate
  if (avgDays === farthestDays) {
    return t('checkout.delivery_in_days', { days: avgDays });
  } else {
    // Otherwise show the range between average and farthest
    return t('checkout.delivery_between_days', { minDays: avgDays, maxDays: farthestDays });
  }
});

// Methods for cart items
const getTotalQuantity = (item) => {
  return item.variants.reduce((total, variant) => total + variant.quantity, 0);
};

const getItemTotal = (item) => {
  return item.variants.reduce((total, variant) => total + (variant.price * variant.quantity), 0);
};

// Initialize component
onMounted(async () => {
  // Initialize default delivery data immediately
  console.log('=== CHECKOUT PAGE MOUNTED ===');
  initializeDefaultDeliveryData();
  
  // Initialize cart first
  try {
    await cart.fetchCart()
  } catch (error) {
    console.error('Failed to load cart:', error)
    showError('Failed to load cart data')
  }

  await Promise.all([
    fetchAddresses(),
    fetchCountries()
  ])

  // Set default selected address
  if (Array.isArray(addresses.value) && addresses.value.length > 0) {
    // First look for default address
    const defaultIndex = addresses.value.findIndex(addr => addr.default)
    selectedAddressIndex.value = defaultIndex >= 0 ? defaultIndex : 0
  }

  // Calculate multi-seller delivery costs first
  await calculateMultiSellerDeliveryCost();
  
  // Only calculate legacy delivery fee if multi-seller calculation failed
  if (!multiSellerDeliveryCost.value || multiSellerDeliveryCost.value === 0) {
    await calculateDeliveryFee('default');
  } else {
    console.log('Multi-seller calculation successful, using:', multiSellerDeliveryCost.value);
  }
  
  // Initialize delivery cost store with cart data - use fallback to ensure we always have values
  if (cart.items && cart.items.items && cart.items.items.length > 0) {
    console.log('Raw cart items structure:', cart.items.items);
    
    try {
      const formattedCartItems = cart.items.items.map(item => {
        console.log('Processing cart item:', item);
        
        // Handle different possible cart item structures
        let sellerId, sellerName;
        
        if (item.seller_id && item.seller_name) {
          // Direct seller properties (preferred)
          sellerId = item.seller_id;
          sellerName = item.seller_name;
        } else if (item.product && item.product.seller) {
          // Nested seller structure
          sellerId = item.product.seller.id;
          sellerName = item.product.seller.name || item.product.seller.email;
        } else if (item.seller_id) {
          // Only seller_id available
          sellerId = item.seller_id;
          sellerName = `Seller ${item.seller_id}`;
        } else if (item.product && item.product.seller_id) {
          // Another alternative: item.product.seller_id
          sellerId = item.product.seller_id;
          sellerName = `Seller ${item.product.seller_id}`;
        } else {
          // Fallback to default seller
          console.warn('No seller information found in cart item:', item);
          sellerId = 'default';
          sellerName = 'Default Seller';
        }
        
        return {
          product: {
            seller: {
              id: sellerId,
              name: sellerName
            }
          },
          product_id: item.product_id,
          express_delivery: expressProductIds.value.has(item.product_id),
          quantity: item.quantity || 1
        };
      });
      
      console.log('Formatted cart items:', formattedCartItems);
      
      // Always use local calculation as fallback to ensure we have delivery costs
      deliveryCost.calculateDeliveryCostLocally(formattedCartItems);
      
      // Debug: Log the values after calculation
      setTimeout(() => {
        console.log('After calculation:', {
          multiSellerDeliveryCost: multiSellerDeliveryCost.value,
          deliveryCostTotal: deliveryCost.totalDeliveryCost,
          sellerGroups: sellerGroups.value,
          deliveryCostBreakdown: deliveryCostBreakdown.value
        });
      }, 100);
      
    } catch (error) {
      console.error('Error processing cart items for delivery cost:', error);
      // Fallback to default data if cart processing fails
      initializeDefaultDeliveryData();
    }
  } else {
    // If no cart items, initialize default delivery data
    console.log('No cart items found, using default delivery data');
    initializeDefaultDeliveryData();
  }
  
  // Ensure we always have delivery data after a short delay
  setTimeout(() => {
    console.log('🔄 Final check - forcing default delivery data initialization...');
    console.log('Before final init:', {
      multiSellerDeliveryCost: multiSellerDeliveryCost.value,
      sellerGroupsLength: sellerGroups.value.length
    });
    
    initializeDefaultDeliveryData();
    
    console.log('After final init:', {
      multiSellerDeliveryCost: multiSellerDeliveryCost.value,
      sellerGroupsLength: sellerGroups.value.length,
      sellerGroups: sellerGroups.value
    });
    
    // Final verification that will show in console
    setTimeout(() => {
      console.log('🚨 FINAL STATE (should show in debug box):', {
        'Expected': 'TotalCost: 0, SellerGroups: 0, HasMultiple: false',
        'Actual multiSellerDeliveryCost': multiSellerDeliveryCost.value,
        'Actual sellerGroups.length': sellerGroups.value.length,
        'Actual hasMultiple': sellerGroups.value.length > 1
      });
    }, 200);
  }, 500);
})

// Fetch addresses from API
const fetchAddresses = async () => {
  loading.value = true
  try {
    try {
      const response = await apiService.getAddresses()
      console.log('Response:', response.data);

      addresses.value = Array.isArray(response.data.results) ? response.data.results : []
    } catch (apiError) {
      // Fallback to sample data if API fails      
      addresses.value = []
    }
  } catch (error) {
    showError('Failed to load addresses')
    console.error('Error fetching addresses:', error)
    addresses.value = [] // Ensure addresses is an empty array in case of error
  } finally { loading.value = false }
}

// Fetch countries from API
const fetchCountries = async () => {
  loadingCountries.value = true
  try {
    const response = await apiService.getCountries()
    countries.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    showError('Failed to load countries')
  } finally {
    loadingCountries.value = false
  }
}

// Select address
const selectAddress = (index) => {
  console.log('📍 Address selection triggered:', {
    previousIndex: selectedAddressIndex.value,
    newIndex: index,
    previousAddress: selectedAddress.value?.address_line1,
    newAddress: addresses.value[index]?.address_line1
  });
  
  selectedAddressIndex.value = index;
  
  // Force reactivity update by accessing the selected address
  const selected = selectedAddress.value;
  console.log('📍 New address selected:', {
    address: selected?.address_line1,
    city: selected?.city,
    coordinates: selected ? `${selected.latitude}, ${selected.longitude}` : 'No GPS',
    willTriggerDeliveryCostRecalculation: true
  });
}

// Edit address
const editAddress = (index) => {
  editAddressIndex.value = index;
  addressForm.value = { ...addresses.value[index] };
  showAddressDialog.value = true;

  // Give time for form to render with new values, then validate
  setTimeout(() => {
    if (formRef.value) {
      formRef.value.validate();
    }
  }, 100);
}

// Add new address
const addNewAddress = () => {
  // Reset form
  addressForm.value = {
    address_label: '',
    type: 'home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    default: !Array.isArray(addresses.value) || addresses.value.length === 0 // Set as default if it's the first address
  }

  editAddressIndex.value = null
  showAddressDialog.value = true
}

// Save address
const saveAddress = async () => {
  if (!formValid.value) {
    showError('Please fill all required fields');
    return;
  }

  addressLoading.value = true;
  try {
    const addressData = { ...addressForm.value }
    // If setting as default, update other addresses locally    
    if (addressData.default && Array.isArray(addresses.value)) {
      addresses.value.forEach(addr => { addr.default = false })
    } try {
      // Call the API to save the address      
      if (editAddressIndex.value !== null) {
        const addressId = addresses.value[editAddressIndex.value].id
        const response = await apiService.updateAddress(addressId, addressData)
        // Update local data        
        if (response.data) {
          addresses.value[editAddressIndex.value] = response.data
        } else { addresses.value[editAddressIndex.value] = addressData }
        // Update selected address if editing the currently selected one        
        if (selectedAddressIndex.value === editAddressIndex.value) {
          selectedAddressIndex.value = editAddressIndex.value
        } snackbarText.value = 'Address updated successfully'
      } else {
        // Create new address
        const response = await apiService.addAddress(addressData)
        // Add to local array with returned data or use local data        
        if (response.data) {
          addresses.value.push(response.data)
        } else {
          // Fallback if API doesn't return the created address          
          addressData.id = Date.now()
          addresses.value.push(addressData)
        }
        // Auto-select the new address
        selectedAddressIndex.value = addresses.value.length - 1
        snackbarText.value = 'Address added successfully'
      }
      // If address is set as default, call the API to set it as default
      if (addressData.default) {
        const addressId = addresses.value[selectedAddressIndex.value].id
        await apiService.setDefaultAddress(addressId)
      }
      // If no default address exists, make this one default
      if (Array.isArray(addresses.value) && addresses.value.length > 0 &&
        addresses.value.filter(a => a.default).length === 0) {
        addresses.value[0].default = true
        await apiService.setDefaultAddress(addresses.value[0].id)
      }
    } catch (apiError) {
      console.error('API error saving address:', apiError)
      // Fallback to local update if API fails      
      if (editAddressIndex.value !== null) {
        addresses.value[editAddressIndex.value] = addressData
        snackbarText.value = 'Address updated locally (API unavailable)'
      } else {
        addressData.id = Date.now()
        addresses.value.push(addressData)
        selectedAddressIndex.value = addresses.value.length - 1
        snackbarText.value = 'Address added locally (API unavailable)'
      }
    }
    // Show success message
    snackbarColor.value = 'success'
    showSnackbar.value = true
    // Close dialog    
    showAddressDialog.value = false
  } catch (error) {
    showError('Failed to save address')
    console.error('Error saving address:', error)
  } finally { addressLoading.value = false }
}

// Place order
const placeOrder = async () => {
  if (!selectedAddress.value || !paymentMethod.value) {
    showError('Please select an address and payment method')
    return
  }

  // Check if cart has items
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    showError('Your cart is empty. Please add items before checkout.')
    return
  }

  // Custom delivery validation is now handled per-product in the modal



  processing.value = true

  try {
    // Build order data according to API specification
    const orderData = {
      // Note: customer will be set automatically by the backend from authenticated user
      items: cart.items.items.flatMap(cartItem =>
        cartItem.variants.map(variant => ({
          product_id: cartItem.product_id,
          product_variant_id: variant.id,
          quantity: variant.quantity,
          price: variant.price,
          seller_id: cartItem.seller_id
        }))
      ),
      shipping_address: `${selectedAddress.value.address_line1}, ${selectedAddress.value.city}, ${selectedAddress.value.state} ${selectedAddress.value.postal_code}, ${selectedAddress.value.country}`,
      total_amount: totalAmount.value,
      notes: `Payment method: ${paymentMethod.value}`,
      // Delivery options are now handled per-item via express_item_product_ids and custom_item_dates
      delivery_fee: (() => {
        // Use the same logic as totalAmount computed property
        let deliveryFee = 0;
        
        // Check if multi-seller delivery cost is available and valid
        if (multiSellerDeliveryCost.value && multiSellerDeliveryCost.value > 0 && !isNaN(multiSellerDeliveryCost.value)) {
          // Use the new multi-seller delivery cost calculation
          deliveryFee = Number(multiSellerDeliveryCost.value) || 0;
        } else {
          // Fallback to legacy calculation for backward compatibility
          deliveryFee = Number(shippingFee.value) || 0;
          
          // Use the correct delivery fee based on selected options:
          // - Express delivery takes priority over custom
          // - Custom delivery uses same fee as standard delivery
          // - Standard delivery uses base shipping fee
          const hasExpressItems = expressProductIds.value.size > 0;
          const hasCustomItems = Object.keys(customDates.value).length > 0;
          
          if (hasExpressItems) {
            // Express delivery - use express fee from API
            deliveryFee = Number(expressDeliveryFee.value) || 0;
          } else if (hasCustomItems) {
            // Custom delivery - uses same fee as standard delivery (no extra charge)
            deliveryFee = Number(shippingFee.value) || 0;
          }
        }
        
        // Ensure fee is a valid number and within decimal field limits (max 10 digits, 2 decimal places = max 99999999.99)
        deliveryFee = Number(deliveryFee) || 0;
        deliveryFee = Math.round(deliveryFee * 100) / 100; // Round to 2 decimal places
        deliveryFee = Math.min(deliveryFee, 99999999.99); // Cap at maximum allowed value
        deliveryFee = Math.max(deliveryFee, 0); // Ensure non-negative
        
        console.log('Order delivery fee calculation:', { 
          multiSellerDeliveryCost: multiSellerDeliveryCost.value, 
          hasExpressItems: expressProductIds.value.size > 0, 
          hasCustomItems: Object.keys(customDates.value).length > 0,
          shippingFee: shippingFee.value, 
          expressDeliveryFee: expressDeliveryFee.value, 
          finalFee: deliveryFee,
          expressProductIds: Array.from(expressProductIds.value),
          customDates: Object.keys(customDates.value)
        });
        
        return deliveryFee;
      })(),
      // Per-item delivery overrides
      express_item_product_ids: Array.from(expressProductIds.value),
      custom_item_dates: customDates.value,
      standard_item_dates: getStandardDeliveryDates(),
      // Include payment data for processing
      payment_data: {
        payment_method: paymentMethod.value,
        phone_number: selectedAddress.value.phone || '',
        currency: 'CFA'
      }
    }

    // Custom delivery dates are now handled per-product via custom_item_dates

    // Debug: Log the order data being sent
    console.log('🔧 Order data being sent to backend:', {
      express_item_product_ids: orderData.express_item_product_ids,
      custom_item_dates: orderData.custom_item_dates,
      standard_item_dates: orderData.standard_item_dates,
      total_items: orderData.items.length
    });

    // Call order creation API
    const response = await apiService.createOrder(orderData)

    // Check if order was created successfully
    if (response.data) {
      const order = response.data

      // Check payment status if available
      if (order.status === 'failed') {
        // Payment failed - redirect to failed page
        router.push({
          name: 'PaymentFailed',
          query: {
            error: order.payment.error_message || 'Payment processing failed',
            message: 'Your payment could not be processed. Please try again.'
          }
        })
      } else {
        // Order created successfully - redirect to success page
        router.push({
          name: 'PaymentSuccess',
          query: {
            order_id: order.id,
            order_number: order.id, // Use order ID as order number if not provided
            total_amount: totalAmount.value.toFixed(2),
            payment_method: paymentMethod.value
          }
        })
      }
    } else {
      // Unexpected response
      showError('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error creating order:', error)

    // Check if error response contains specific payment failure info
    if (error.response && error.response.data) {
      const errorData = error.response.data

      // Payment failed - redirect to failed page
      router.push({
        name: 'PaymentFailed',
        query: {
          error: errorData.payment?.error_message || errorData.error || 'Payment processing failed',
          message: 'Your payment could not be processed. Please try again.'
        }
      })

      // // Check if it's a payment-related error
      // if (errorData.payment_status === 'failed' || 
      //     (errorData.payment && errorData.payment.status === 'failed')) {
      //   // Payment failed - redirect to failed page
      //   router.push({
      //     name: 'PaymentFailed',
      //     query: {
      //       error: errorData.payment?.error_message || errorData.error || 'Payment processing failed',
      //       message: 'Your payment could not be processed. Please try again.'
      //     }
      //   })
      // } else {
      //   // Other API error
      //   showError(errorData.message || errorData.error || 'Failed to create order')
      // }
    } else {
      // Network or other error
      showError('Failed to create order. Please check your connection and try again.')
    }
  } finally {
    processing.value = false
  }
}

// Show error in snackbar
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}

// Show success in snackbar
const showSuccess = (message) => {
  snackbarColor.value = 'success'
  snackbarText.value = message
  showSnackbar.value = true
}

// Watch dialog visibility changes
watch(showAddressDialog, (isOpen) => {
  if (isOpen) {
    // When dialog opens, allow a moment for the DOM to update
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.resetValidation();
      }
    }, 100);
  }
});

// Navigation functions
const goToStep = (step) => {
  console.log('Going to step:', step);
  currentStep.value = step;
}

const nextStep = async () => {
  // If moving from step 1 (address selection), check GPS coordinates
  if (currentStep.value === 1 && selectedAddress.value) {
    const needsLocationConfirmation = locationConfirmation.checkAddressLocation(
      selectedAddress.value,
      handleLocationConfirmed,
      handleLocationSkipped
    )
    
    if (needsLocationConfirmation) {
      return // Wait for location confirmation
    }
  }
  
  if (currentStep.value < 3) {
    currentStep.value++;
    
    // If moving to step 2 (delivery), ensure delivery costs are calculated
    if (currentStep.value === 2) {
      console.log('🚀 NextStep: Moving to delivery step, ensuring delivery costs are calculated...');
      await calculateMultiSellerDeliveryCost();
      
      // Only calculate legacy delivery fee if multi-seller calculation failed
      if (!multiSellerDeliveryCost.value || multiSellerDeliveryCost.value === 0) {
        console.log('NextStep: Multi-seller calculation failed, falling back to legacy calculation');
        await calculateDeliveryFee('default');
      } else {
        console.log('NextStep: Multi-seller calculation successful, using:', multiSellerDeliveryCost.value);
      }
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Location confirmation handlers
const handleLocationConfirmed = async (coordinates) => {
  if (selectedAddress.value) {
    try {
      // Update the selected address with GPS coordinates
      await apiService.updateAddress(selectedAddress.value.id, {
        ...selectedAddress.value,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
      })
      
      // Update local address data
      addresses.value[selectedAddressIndex.value].latitude = coordinates.latitude
      addresses.value[selectedAddressIndex.value].longitude = coordinates.longitude
      
      showSuccess('Location saved successfully')
    } catch (error) {
      console.error('Failed to update address with GPS coordinates:', error)
      showError('Failed to save location')
    }
  }
  
  // Continue to next step
  currentStep.value++;
}

const handleLocationSkipped = () => {
  // Continue to next step without GPS coordinates
  currentStep.value++;
}

// Get formatted delivery date range
const getDeliveryDateRange = () => {
  if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
    return "";
  }

  let totalDays = 0;
  let itemCount = 0;
  let farthestDays = 0;

  // Extract delivery times from each item
  groupedCartItems.value.forEach(item => {
    const deliveryText = getAdaptiveDeliveryDate(item);

      // Try to extract delivery time range (e.g., "3-5" from "3-5 business days")
      const rangeMatch = deliveryText.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const maxDays = parseInt(rangeMatch[2]);

        if (!isNaN(maxDays)) {
          totalDays += maxDays;
          itemCount++;
          farthestDays = Math.max(farthestDays, maxDays);
        }
      } else {
        // Try to find a single number (e.g., "3 business days")
        const singleMatch = deliveryText.match(/(\d+)/);
        if (singleMatch) {
          const days = parseInt(singleMatch[1]);

          if (!isNaN(days)) {
            totalDays += days;
            itemCount++;
            farthestDays = Math.max(farthestDays, days);
        }
      }
    }
  });

  if (itemCount === 0) {
    return "";
  }

  // Calculate average days
  const avgDays = Math.round(totalDays / itemCount);

  // Calculate actual calendar dates (accounting for business days)
  const avgDate = addBusinessDays(new Date(), avgDays);
  const farthestDate = addBusinessDays(new Date(), farthestDays);

  // Format dates in French
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const avgDateFormatted = avgDate.toLocaleDateString('fr-FR', options);
  const farthestDateFormatted = farthestDate.toLocaleDateString('fr-FR', options);

  if (avgDays === farthestDays) {
    return t('checkout.delivery_by_date', { date: avgDateFormatted });
  } else {
    return t('checkout.delivery_between_dates', { startDate: avgDateFormatted, endDate: farthestDateFormatted });
  }
};

// Helper function to add business days to a date
const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    // Add one day
    result.setDate(result.getDate() + 1);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return result;
};

// Delivery option functions
const getDefaultDeliveryTime = () => {
  return getDeliveryDateRange() || '3-5 business days';
};

const getExpressDeliveryTime = () => {
  const now = new Date();
  const currentHour = now.getHours();
  
  if (currentHour >= 19) { // After 7 PM
    // Can only deliver next day
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = tomorrow.toLocaleDateString('fr-FR', options);
    return t('checkout.next_day_delivery', { date: formattedDate });
  } else {
    // Can deliver same day if ordered before 7 PM
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = now.toLocaleDateString('fr-FR', options);
    return t('checkout.same_day_delivery', { date: formattedDate });
  }
};



const getMinDeliveryDate = () => {
  // Find the product with the farthest delivery date
  if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
    // Fallback to tomorrow if no items
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  let farthestDays = 0;
  let farthestDate = null;

  // Check each product's delivery info
  groupedCartItems.value.forEach(item => {
    const deliveryText = item.delivery_info?.estimated_delivery_display || 'Standard Delivery';
    
    // Try to extract delivery time range (e.g., "3-5" from "3-5 business days")
    const rangeMatch = deliveryText.match(/(\d+)-(\d+)/);
    if (rangeMatch) {
      // For ranges, use the maximum value for worst-case calculation
      const maxDays = parseInt(rangeMatch[2]);
      if (!isNaN(maxDays) && maxDays > farthestDays) {
        farthestDays = maxDays;
        farthestDate = addBusinessDays(new Date(), maxDays);
      }
    } else {
      // Try to find a single number (e.g., "3 business days")
      const singleMatch = deliveryText.match(/(\d+)/);
      if (singleMatch) {
        const days = parseInt(singleMatch[1]);
        if (!isNaN(days) && days > farthestDays) {
          farthestDays = days;
          farthestDate = addBusinessDays(new Date(), days);
        }
      }
    }
  });

  // If we found a farthest date, use it
  if (farthestDate) {
    return formatDateAsYYYYMMDD(farthestDate)
  }
  
  // Fallback to tomorrow if we can't parse any delivery dates
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateAsYYYYMMDD(tomorrow)
};

const getMaxDeliveryDate = () => {
  const now = new Date();
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + 30); // Allow up to 30 days in the future
  return formatDateAsYYYYMMDD(maxDate)
};

const availableTimeSlots = [
  { label: 'Morning (8:00 AM - 12:00 PM)', value: 'morning' },
  { label: 'Afternoon (12:00 PM - 4:00 PM)', value: 'afternoon' },
  { label: 'Evening (4:00 PM - 8:00 PM)', value: 'evening' },
];

const getDeliveryOptionDisplay = () => {
  const hasExpressItems = expressProductIds.value.size > 0;
  const hasCustomItems = Object.keys(customDates.value).length > 0;
  const totalProducts = groupedCartItems.value.length;
  
  if (hasExpressItems && hasCustomItems) {
    return t('checkout.mixed_delivery_all', {
      express: expressProductIds.value.size,
      custom: Object.keys(customDates.value).length,
      standard: totalProducts - expressProductIds.value.size - Object.keys(customDates.value).length
    });
  } else if (hasExpressItems) {
    if (expressProductIds.value.size === totalProducts) {
      return t('checkout.express_delivery_with_time', { time: getExpressDeliveryTime() });
    } else {
      return t('checkout.mixed_delivery_express', {
        express: expressProductIds.value.size,
        standard: totalProducts - expressProductIds.value.size
      });
    }
  } else if (hasCustomItems) {
    if (Object.keys(customDates.value).length === totalProducts) {
      return t('checkout.custom_delivery_multiple');
    } else {
      return t('checkout.mixed_delivery_custom', {
        custom: Object.keys(customDates.value).length,
        standard: totalProducts - Object.keys(customDates.value).length
      });
    }
  } else {
    return t('checkout.standard_delivery_with_time', { time: getDefaultDeliveryTime() });
  }
};

// Function to get adaptive delivery date for each product based on per-product delivery options
const getAdaptiveDeliveryDate = (item) => {
  const productId = item.product_id;
  
  // Check if this product has express delivery selected
  if (expressProductIds.value.has(productId)) {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 19) { // After 7 PM
      // Can only deliver next day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = tomorrow.toLocaleDateString('fr-FR', options);
      return t('checkout.express_delivery_date', { date: formattedDate });
    } else {
      // Can deliver same day if ordered before 7 PM
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = now.toLocaleDateString('fr-FR', options);
      return t('checkout.express_delivery_date', { date: formattedDate });
    }
  }
  
  // Check if this product has custom delivery selected
  if (customDates.value[productId]) {
    const date = new Date(customDates.value[productId]);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('fr-FR', options);
    return t('checkout.custom_delivery_date_label', { date: formattedDate });
  }
  
  // Default: show product's standard delivery date
  return item.delivery_info?.estimated_delivery_display || t('checkout.standard_delivery');
};

// Custom delivery dates are now handled per-product in the modal

// Function to calculate delivery fee based on option
const calculateDeliveryFee = async (option) => {
  try {
    // Default distance - in a real app, this would be calculated based on seller/customer location
    const defaultDistance = 5.0; // 5km default
    
    const response = await apiService.calculateDeliveryFee(defaultDistance, option);
    
    if (response.data) {
      // Helper function to validate and limit delivery fee values
      const validateFee = (fee) => {
        const numFee = Number(fee) || 0;
        const roundedFee = Math.round(numFee * 100) / 100; // Round to 2 decimal places
        const limitedFee = Math.min(Math.max(roundedFee, 0), 99999999.99); // Ensure within valid range
        return limitedFee;
      };
      
      console.log('API response:', response.data);
      
      // Store the total delivery fee for the selected option
      if (option === 'express') {
        expressDeliveryFee.value = validateFee(response.data.delivery_fee);
        shippingFee.value = validateFee(response.data.base_fee); // Standard fee for comparison
      } else if (option === 'custom') {
        customDeliveryFee.value = validateFee(response.data.delivery_fee);
        shippingFee.value = validateFee(response.data.delivery_fee); // Same as standard
      } else {
        // Default/standard delivery
        shippingFee.value = validateFee(response.data.delivery_fee);
        expressDeliveryFee.value = 0;
        customDeliveryFee.value = 0;
      }
      
      console.log('Stored delivery fees:', { 
        shippingFee: shippingFee.value, 
        expressDeliveryFee: expressDeliveryFee.value, 
        customDeliveryFee: customDeliveryFee.value 
      });
    }
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    // Fallback to default values if API fails
    shippingFee.value = 0;
    expressDeliveryFee.value = 0;
    customDeliveryFee.value = 0;
  }
};

// Function to calculate multi-seller delivery costs
const calculateMultiSellerDeliveryCost = async () => {
  console.log('🚀 calculateMultiSellerDeliveryCost called from step:', currentStep.value);
  
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    console.log('No cart items available for multi-seller delivery calculation');
    return;
  }

  try {
    isCalculatingDelivery.value = true;
    
    // Prepare cart items for API call with error handling
    const cartItems = cart.items.items.map(item => {
      let sellerId, sellerName;
      
      try {
        if (item.seller_id && item.seller_name) {
          // Direct seller properties (preferred)
          sellerId = item.seller_id;
          sellerName = item.seller_name;
        } else if (item.product && item.product.seller) {
          // Nested seller structure
          sellerId = item.product.seller.id;
          sellerName = item.product.seller.name || item.product.seller.email;
        } else if (item.seller_id) {
          // Only seller_id available
          sellerId = item.seller_id;
          sellerName = `Seller ${item.seller_id}`;
        } else {
          sellerId = 'default';
          sellerName = 'Default Seller';
        }
      } catch (error) {
        console.error('Error accessing seller info for item:', item, error);
        sellerId = 'default';
        sellerName = 'Default Seller';
      }
      
      return {
        product: {
          seller: {
            id: sellerId,
            name: sellerName
          }
        },
        product_id: item.product_id,
        express_delivery: expressProductIds.value.has(item.product_id),
        quantity: item.quantity || 1
      };
    });

    // Get customer address if available
    const customerAddress = selectedAddress.value ? {
      latitude: selectedAddress.value.latitude,
      longitude: selectedAddress.value.longitude
    } : null;

    const expressItemsInCall = cartItems.filter(item => item.express_delivery);
    const standardItemsInCall = cartItems.filter(item => !item.express_delivery);
    
    console.log('🚛 API Call - Multi-seller delivery cost calculation:', {
      cartItemsCount: cartItems.length,
      expressItemsCount: expressItemsInCall.length,
      standardItemsCount: standardItemsInCall.length,
      cartItems: cartItems.map(item => ({
        product_id: item.product_id,
        seller_id: item.seller_id,
        seller_name: item.seller_name,
        quantity: item.quantity,
        express_delivery: item.express_delivery ? '⚡ EXPRESS' : '🚚 STANDARD'
      })),
      expressItems: expressItemsInCall.map(item => `Product ${item.product_id} (${item.seller_name})`),
      customerAddress: customerAddress ? {
        hasCoordinates: !!(customerAddress.latitude && customerAddress.longitude),
        coordinates: `${customerAddress.latitude}, ${customerAddress.longitude}`
      } : 'No address provided'
    });

    const response = await apiService.calculateMultiSellerDeliveryFee(cartItems, customerAddress);
    
    if (response.data) {
      multiSellerDeliveryCost.value = response.data.total_delivery_cost;
      sellerGroups.value = response.data.seller_groups;
      deliveryCostBreakdown.value = response.data.breakdown;
      
      // Update the new delivery cost store as well
      deliveryCost.deliveryCosts.value = {
        total_delivery_cost: response.data.total_delivery_cost,
        seller_groups: response.data.seller_groups || [],
        breakdown: response.data.breakdown || {
          total_standard_cost: 0,
          total_express_cost: 0,
          total_mixed_cost: 0
        }
      };
      
      console.log('Multi-seller delivery cost calculated:', {
        total: multiSellerDeliveryCost.value,
        totalType: typeof multiSellerDeliveryCost.value,
        sellerGroups: sellerGroups.value,
        breakdown: deliveryCostBreakdown.value
      });
    } else {
      console.log('No data in response');
    }
  } catch (error) {
    console.error('Error calculating multi-seller delivery cost:', error);
    // Fallback to legacy calculation
    multiSellerDeliveryCost.value = 0;
    sellerGroups.value = [];
    deliveryCostBreakdown.value = {};
  } finally {
    isCalculatingDelivery.value = false;
  }
};

// Watch for step changes to recalculate delivery costs
watch(currentStep, async (newStep, oldStep) => {
  console.log('🔄 Step changed from', oldStep, 'to', newStep);
  
  // When moving to step 2 (delivery), recalculate delivery costs
  if (newStep === 2) {
    console.log('📦 Moving to delivery step, recalculating delivery costs...');
    await calculateMultiSellerDeliveryCost();
    
    // Only calculate legacy delivery fee if multi-seller calculation failed
    if (!multiSellerDeliveryCost.value || multiSellerDeliveryCost.value === 0) {
      console.log('Multi-seller calculation failed, falling back to legacy calculation');
      await calculateDeliveryFee('default');
    } else {
      console.log('Multi-seller calculation successful, using:', multiSellerDeliveryCost.value);
    }
  }
});

// Watch for when step 2 becomes active to ensure delivery costs are calculated
watch(() => currentStep.value === 2, async (isStep2) => {
  if (isStep2) {
    console.log('🎯 Step 2 is now active, ensuring delivery costs are calculated...');
    // Small delay to ensure the step transition is complete
    setTimeout(async () => {
      if (currentStep.value === 2) {
        await calculateMultiSellerDeliveryCost();
        
        if (!multiSellerDeliveryCost.value || multiSellerDeliveryCost.value === 0) {
          await calculateDeliveryFee('default');
        }
      }
    }, 100);
  }
});

// Watch for delivery option changes to recalculate fees
watch([expressProductIds, customDates, selectedAddress], async (newValues, oldValues) => {
  const [newExpressIds, newCustomDates, newAddress] = newValues;
  const [oldExpressIds, oldCustomDates, oldAddress] = oldValues || [new Set(), {}, null];
  
  // Detect what changed to trigger this recalculation
  const expressChanged = JSON.stringify(Array.from(newExpressIds).sort()) !== JSON.stringify(Array.from(oldExpressIds).sort());
  const customDatesChanged = JSON.stringify(newCustomDates) !== JSON.stringify(oldCustomDates);
  const addressChanged = newAddress?.id !== oldAddress?.id;
  
  console.log('🔄 Delivery recalculation watcher triggered', {
    triggers: {
      expressDeliveryChanged: expressChanged,
      customDatesChanged: customDatesChanged,
      addressChanged: addressChanged
    },
    expressItems: {
      previous: Array.from(oldExpressIds),
      current: Array.from(newExpressIds),
      count: newExpressIds.size
    }
  });
  
  // Store previous seller groups structure before recalculation
  const previousSellerGroups = [...sellerGroups.value];
  const previousTotalCost = multiSellerDeliveryCost.value;
  
  console.log('📊 Before address change recalculation:', {
    multiSellerDeliveryCost: previousTotalCost,
    sellerGroupsLength: previousSellerGroups.length,
    selectedAddress: selectedAddress.value?.address_line1
  });
  
  // Use the new multi-seller delivery cost calculation
  await calculateMultiSellerDeliveryCost();
  
  console.log('📊 After address change recalculation:', {
    multiSellerDeliveryCost: multiSellerDeliveryCost.value,
    sellerGroupsLength: sellerGroups.value.length,
    change: `${previousTotalCost} → ${multiSellerDeliveryCost.value}`,
    sellerGroupsChanged: previousSellerGroups.length !== sellerGroups.value.length
  });
  
  // CRITICAL FIX: Preserve seller groups structure on address change
  if (previousSellerGroups.length > 0 && sellerGroups.value.length !== previousSellerGroups.length) {
    console.warn('⚠️  Seller groups structure changed unexpectedly on address change! Restoring previous structure...');
    console.log('🔧 Preserving seller groups structure and only updating costs');
    
    // Restore the previous seller groups structure
    sellerGroups.value = previousSellerGroups.map(prevSeller => {
      // Find matching seller in new response
      const newSeller = sellerGroups.value.find(ns => ns.seller_id === prevSeller.seller_id);
      
      if (newSeller) {
        // Preserve structure, update only cost
        return {
          ...prevSeller,
          delivery_cost: newSeller.delivery_cost,
          breakdown: newSeller.breakdown || prevSeller.breakdown
        };
      } else {
        // If seller not found in new response, keep previous data but log warning
        console.warn(`Seller ${prevSeller.seller_id} not found in new response, keeping previous cost`);
        return prevSeller;
      }
    });
    
    // Recalculate total from preserved seller groups
    multiSellerDeliveryCost.value = sellerGroups.value.reduce((total, seller) => total + seller.delivery_cost, 0);
    
    console.log('✅ Structure preserved, costs updated:', {
      multiSellerDeliveryCost: multiSellerDeliveryCost.value,
      sellerGroupsLength: sellerGroups.value.length,
      finalChange: `${previousTotalCost} → ${multiSellerDeliveryCost.value}`,
      structurePreserved: true
    });
  }
  
  // Also try using the delivery cost store as fallback
  if (multiSellerDeliveryCost.value === 0 && cart.items && cart.items.items) {
    try {
      const formattedCartItems = cart.items.items.map(item => ({
        product: {
          seller: {
            id: item.product.seller.id,
            name: item.product.seller.name || item.product.seller.email
          }
        },
        product_id: item.product.id,
        express_delivery: expressProductIds.value.has(item.product.id),
        quantity: item.quantity
      }));
      
      await deliveryCost.calculateDeliveryCostFromAPI(formattedCartItems, selectedAddress.value ? {
        latitude: selectedAddress.value.latitude,
        longitude: selectedAddress.value.longitude
      } : null);
    } catch (error) {
      console.error('Fallback delivery cost calculation failed:', error);
    }
  }
}, { deep: true })

// Date picker state
const currentMonth = ref(new Date())
const selectedDateInPicker = ref(null)
// Track which product (if any) is selecting a custom date via the dialog
const currentCustomProductId = ref(null)
// Track which group is selecting a custom date via the dialog
const currentCustomGroup = ref(null)
const showCustomDeliveryModal = ref(false)

// Helper function to get delivery fee for display
const getDeliveryFeeForDisplay = () => {
  console.log('🔍 getDeliveryFeeForDisplay called:', {
    multiSellerDeliveryCost: multiSellerDeliveryCost.value,
    deliveryCostTotal: deliveryCost.totalDeliveryCost,
    shippingFee: shippingFee.value,
    expressDeliveryFee: expressDeliveryFee.value,
    expressProductIds: Array.from(expressProductIds.value),
    customDates: Object.keys(customDates.value)
  });
  
  // Use the same logic as totalAmount computed property
  if (multiSellerDeliveryCost.value && multiSellerDeliveryCost.value > 0 && !isNaN(multiSellerDeliveryCost.value)) {
    console.log('✅ Using multiSellerDeliveryCost:', multiSellerDeliveryCost.value);
    return Number(multiSellerDeliveryCost.value) || 0
  } else {
    // Calculate based on actual cart items instead of legacy values
    console.log('⚠️ Falling back to cart-based calculation');
    
    if (!cart.items?.items || cart.items.items.length === 0) {
      console.log('❌ No cart items, returning 0');
      return 0;
    }
    
    // Calculate based on actual cart items and their delivery fees
    let totalCost = 0;
    const sellerGroups = {};
    
    // Group items by seller
    cart.items.items.forEach(item => {
      console.log('🔍 Processing cart item:', item);
      
      // Check if product data exists
      if (!item.product) {
        console.error('❌ Item missing product data:', item);
        return;
      }
      
      if (!item.product.seller) {
        console.error('❌ Item missing seller data:', item);
        return;
      }
      
      const sellerId = item.product.seller.id;
      if (!sellerGroups[sellerId]) {
        sellerGroups[sellerId] = {
          seller: item.product.seller,
          items: [],
          hasExpress: false,
          hasStandard: false
        };
      }
      sellerGroups[sellerId].items.push(item);
      
      // Check if this item is selected for express delivery
      const isExpress = expressProductIds.value.has(item.product_id);
      if (isExpress && item.product.express_delivery) {
        sellerGroups[sellerId].hasExpress = true;
      } else {
        sellerGroups[sellerId].hasStandard = true;
      }
      
      console.log(`Item ${item.product_id}: seller=${sellerId}, isExpress=${isExpress}, standardFee=${item.product.standard_delivery_fee}, expressFee=${item.product.express_delivery_fee}`);
    });
    
    // Calculate cost for each seller group
    Object.values(sellerGroups).forEach(group => {
      if (group.hasExpress && group.hasStandard) {
        // Mixed delivery: standard + express
        const standardCost = group.items.reduce((sum, item) => {
          return sum + (item.product.standard_delivery_fee || 0);
        }, 0);
        const expressCost = group.items.reduce((sum, item) => {
          const isExpress = expressProductIds.value.has(item.product_id);
          return sum + (isExpress ? (item.product.express_delivery_fee || 0) : 0);
        }, 0);
        totalCost += standardCost + expressCost;
        console.log(`Mixed delivery for seller ${group.seller.name}: standard=${standardCost}, express=${expressCost}`);
      } else if (group.hasExpress) {
        // All express
        const expressCost = group.items.reduce((sum, item) => {
          return sum + (item.product.express_delivery_fee || 0);
        }, 0);
        totalCost += expressCost;
        console.log(`All express for seller ${group.seller.name}: ${expressCost}`);
      } else {
        // All standard
        const standardCost = group.items.reduce((sum, item) => {
          return sum + (item.product.standard_delivery_fee || 0);
        }, 0);
        totalCost += standardCost;
        console.log(`All standard for seller ${group.seller.name}: ${standardCost}`);
      }
    });
    
    console.log('✅ Calculated total cost from cart items:', totalCost);
    console.log('📊 Seller groups summary:', Object.values(sellerGroups).map(group => ({
      seller: group.seller.name,
      itemCount: group.items.length,
      hasExpress: group.hasExpress,
      hasStandard: group.hasStandard,
      items: group.items.map(item => ({
        id: item.product_id,
        name: item.product.name,
        standardFee: item.product.standard_delivery_fee,
        expressFee: item.product.express_delivery_fee
      }))
    })));
    
    // If cart-based calculation failed, fall back to legacy values
    if (totalCost === 0) {
      console.log('⚠️ Cart-based calculation returned 0, falling back to legacy values');
      const hasExpressItems = expressProductIds.value.size > 0;
      const hasCustomItems = Object.keys(customDates.value).length > 0;
      
      if (hasExpressItems) {
        return Number(expressDeliveryFee.value) || 0;
      } else if (hasCustomItems) {
        return Number(shippingFee.value) || 0;
      } else {
        return Number(shippingFee.value) || 10; // Default fallback
      }
    }
    
    return totalCost;
  }
}

// Helper function to generate delivery breakdown formula for order summary
const getDeliveryBreakdownFormula = () => {
  if (!sellerGroups.value || sellerGroups.value.length <= 1) {
    return ''
  }
  
  const parts = sellerGroups.value.map(seller => {
    const sellerName = seller.seller_name || `Seller ${seller.seller_id}`
    let formula = ''
    
    switch (seller.delivery_type) {
      case 'standard':
        formula = `${sellerName}(${formatPrice(seller.breakdown?.standard_cost || 0)})`
        break
      case 'express':
        formula = `${sellerName}(${formatPrice(seller.breakdown?.express_cost || 0)})`
        break
      case 'mixed':
        const std = formatPrice(seller.breakdown?.standard_cost || 0)
        const exp = formatPrice(seller.breakdown?.express_cost || 0)
        formula = `${sellerName}(${std}+${exp})`
        break
      default:
        formula = `${sellerName}(${formatPrice(seller.delivery_cost || 0)})`
    }
    
    return formula
  })
  
  return parts.join(' + ')
}

// Date picker functions
const getCalendarDays = () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  
  // Get the appropriate standard delivery date
  let standardDeliveryDateStr
  if (selectedProductForDelivery.value && showProductDeliveryModal.value) {
    // Use product-specific delivery date when in product modal
    standardDeliveryDateStr = selectedProductForDelivery.value.delivery_info?.estimated_delivery_date
    if (!standardDeliveryDateStr) {
      // Fallback to parsing from display text
      const deliveryText = selectedProductForDelivery.value.delivery_info?.estimated_delivery_display || '3-5 business days'
      const match = deliveryText.match(/(\d+)-?(\d+)?/)
      const days = match ? parseInt(match[2] || match[1]) : 3
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + days)
      standardDeliveryDateStr = formatDateAsYYYYMMDD(futureDate)
    }
  } else if (currentCustomGroup.value && showCustomDeliveryModal.value) {
    // Use group-specific minimum date when in group custom delivery modal
    standardDeliveryDateStr = getMinDateForGroup(currentCustomGroup.value)
  } else {
    // Use global minimum delivery date for other cases
    standardDeliveryDateStr = getMinDeliveryDate()
  }
  
  // Parse it properly to avoid timezone issues
  const standardDeliveryDate = parseDateYMD(standardDeliveryDateStr)
  
  // Create minimum date (day after standard delivery) at midnight
  const minDate = new Date(standardDeliveryDate.getFullYear(), standardDeliveryDate.getMonth(), standardDeliveryDate.getDate() + 1, 0, 0, 0, 0)
  
  // Debug logging (temporary)
  console.log('Debug Date Picker:')
  console.log('- Standard delivery date string:', standardDeliveryDateStr)
  console.log('- Standard delivery date parsed:', standardDeliveryDate)
  console.log('- Minimum selectable date (day after):', minDate)
  console.log('- Minimum selectable date formatted:', formatDateAsYYYYMMDD(minDate))
  
  // Create maximum date at midnight
  const maxDeliveryDateStr = getMaxDeliveryDate()
  const maxDeliveryDate = parseDateYMD(maxDeliveryDateStr)
  const maxDate = new Date(maxDeliveryDate.getFullYear(), maxDeliveryDate.getMonth(), maxDeliveryDate.getDate(), 23, 59, 59, 999)
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // Create comparison date at midnight to avoid time component issues
    const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
    
    const isCurrentMonth = date.getMonth() === month
    // Disable dates that are before minimum date (dates on or before standard delivery)
    const isDisabled = dateAtMidnight < minDate || dateAtMidnight > maxDate
    const isSelected = selectedDateInPicker.value && 
      date.toDateString() === selectedDateInPicker.value.toDateString()
    
    // Debug logging for first few dates (temporary)
    if (i < 10 && isCurrentMonth) {
      console.log(`Date ${formatDateAsYYYYMMDD(dateAtMidnight)}: disabled=${isDisabled}, minDate=${formatDateAsYYYYMMDD(minDate)}, comparison=${dateAtMidnight < minDate}`)
    }
    
    days.push({
      date: date,
      dayNumber: date.getDate(),
      isCurrentMonth,
      isDisabled,
      isSelected
    })
  }
  
  return days
}

const getCurrentMonthYear = () => {
  return currentMonth.value.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })
}

const previousMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  )
}

const selectDate = (date) => {
  selectedDateInPicker.value = date
}

const confirmDateSelection = () => {
  if (selectedDateInPicker.value) {
    const formatted = formatDateAsYYYYMMDD(selectedDateInPicker.value)
    if (currentCustomProductId.value) {
      // If called from the product-specific modal, update the product date
      if (showProductDeliveryModal.value && selectedProductForDelivery.value) {
        productCustomDate.value = formatted
      } else {
        // Otherwise, update the global custom dates
        customDates.value[currentCustomProductId.value] = formatted
      }
    } else {
      customDeliveryDate.value = formatted
    }
  }
  // Reset dialog state
  currentCustomProductId.value = null
  showDatePicker.value = false
}

// Open the custom date dialog for a specific item
const openItemDatePicker = (item) => {
  currentCustomProductId.value = item.product_id
  // If there is an existing date for the item, preselect it
  const existing = customDates.value[item.product_id]
  selectedDateInPicker.value = existing ? new Date(existing) : null
  // Align the calendar to this item's minimum date
  try {
    const md = minDateForItem(item)
    const d = parseDateYMD(md)
    if (d instanceof Date && !isNaN(d)) {
      currentMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
    }
  } catch (e) { /* noop */ }
  showDatePicker.value = true
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Helper function to format date as YYYY-MM-DD using local timezone
const formatDateAsYYYYMMDD = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Safe parser for YYYY-MM-DD as local date to avoid timezone drift
const parseDateYMD = (ymd) => {
  if (!ymd || typeof ymd !== 'string') return null
  const parts = ymd.split('-')
  if (parts.length !== 3) return null
  const [y, m, d] = parts.map(p => parseInt(p, 10))
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

// Express/custom dialogs helpers
// Helpers to detect truthy express flags across possible formats
const isTruthyExpress = (val) => {
  return val === true || val === 1 || val === '1' || val === 'true' || val === 'True'
}

const isExpressEligibleItem = (item) => {
  if (!item) return false
  
  // Check if current time is after 7 PM (19:00) - express delivery not available
  const now = new Date()
  const currentHour = now.getHours()
  if (currentHour >= 19) { // After 7 PM
    return false
  }
  
  // Note: delivery_info may not include express flag in your API; skip relying on it
  // Check direct flag on item if present
  if (isTruthyExpress(item.express_delivery)) return true
  // Check variants if any carry the flag
  if (Array.isArray(item.variants) && item.variants.some(v => isTruthyExpress(v?.express_delivery))) return true
  return false
}

const expressEligibleItems = computed(() => {
  return groupedCartItems.value.filter(isExpressEligibleItem)
})

const customDateItems = computed(() => {
  // Show all items that are NOT selected for express
  return groupedCartItems.value.filter(item => !expressProductIds.value.has(item.product_id))
})

const toggleExpress = (productId) => {
  if (expressProductIds.value.has(productId)) {
    expressProductIds.value.delete(productId)
  } else {
    expressProductIds.value.add(productId)
    // Remove any custom date previously set for this product
    if (customDates.value[productId]) delete customDates.value[productId]
  }
}

const confirmExpressSelection = () => {
  showExpressDialog.value = false
  // Express items are now tracked per-product, no need to set order-level option
  // After express selection (especially when user chose custom earlier), open custom selection for the rest
  showCustomDialog.value = true
}

const minDateForItem = (item) => {
  // Use the actual estimated_delivery_date as the minimum selectable date
  const est = item.delivery_info?.estimated_delivery_date
  console.log('🔧 minDateForItem called with item:', item.product_name, 'estimated_delivery_date:', est)
  if (est) {
    // Return the actual delivery date (not day after)
    console.log('🔧 Using estimated_delivery_date:', est)
    return est
  }
  // Fallback: use delivery_days when available
  const dd = item.delivery_info?.delivery_days
  if (typeof dd === 'number') {
    const d = new Date()
    d.setDate(d.getDate() + dd)
    return formatDateAsYYYYMMDD(d)
  }
  // Legacy fallback: parse from display text
  let days = 3
  const text = item.delivery_info?.estimated_delivery_display || ''
  const range = text.match(/(\d+)-(\d+)/)
  if (range) {
    days = parseInt(range[2]) || 3
  } else {
    const single = text.match(/(\d+)/)
    if (single) days = parseInt(single[1]) || 3
  }
  const d = addBusinessDays(new Date(), days)
  return formatDateAsYYYYMMDD(d)
}

const confirmCustomSelection = () => {
  showCustomDialog.value = false
}

// Product-specific delivery functions
const toggleExpressForProduct = (productId) => {
  const wasExpressSelected = expressProductIds.value.has(productId);
  const action = wasExpressSelected ? 'disable' : 'enable';
  
  console.log(`⚡ Express delivery ${action} for product ${productId}`, {
    previousExpressItems: Array.from(expressProductIds.value),
    action: action,
    willTriggerDeliveryRecalculation: true
  });
  
  if (expressProductIds.value.has(productId)) {
    expressProductIds.value.delete(productId)
  } else {
    expressProductIds.value.add(productId)
    // Remove custom date if express is selected
    if (customDates.value[productId]) {
      delete customDates.value[productId]
    }
  }
  
  console.log(`⚡ Express delivery ${action} completed`, {
    newExpressItems: Array.from(expressProductIds.value),
    totalExpressItems: expressProductIds.value.size,
    shouldRecalculateDeliveryCosts: true
  });
}

const openCustomDeliveryModal = (product) => {
  console.log('🔧 openCustomDeliveryModal called with product:', product)
  selectedProductForDelivery.value = product
  // Pre-populate if there's already a custom date set
  if (customDates.value[product.product_id]) {
    productCustomDate.value = customDates.value[product.product_id]
  } else {
    productCustomDate.value = null
  }
  productCustomTime.value = null
  showProductDeliveryModal.value = true
}

const confirmProductCustomDelivery = () => {
  if (selectedProductForDelivery.value && productCustomDate.value && productCustomTime.value) {
    const productId = selectedProductForDelivery.value.product_id
    
    // Set custom date
    customDates.value[productId] = productCustomDate.value
    
    // Remove from express if it was selected
    if (expressProductIds.value.has(productId)) {
      expressProductIds.value.delete(productId)
    }
    
    // Close modal
    showProductDeliveryModal.value = false
    selectedProductForDelivery.value = null
    productCustomDate.value = null
    productCustomTime.value = null
  }
}

const confirmGroupCustomDelivery = () => {
  if (currentCustomGroup.value && customDeliveryDate.value && customDeliveryTime.value) {
    // Apply custom date to all items in the group
    currentCustomGroup.value.items.forEach(item => {
      customDates.value[item.product_id] = customDeliveryDate.value
      
      // Remove from express if it was selected
      if (expressProductIds.value.has(item.product_id)) {
        expressProductIds.value.delete(item.product_id)
      }
    })
    
    // Set the group's custom_date property
    currentCustomGroup.value.custom_date = customDeliveryDate.value
    
    // Show success message
    showSuccess(`Custom delivery date set for ${currentCustomGroup.value.items.length} item${currentCustomGroup.value.items.length > 1 ? 's' : ''}!`)
    
    // Close modal
    showCustomDeliveryModal.value = false
    currentCustomGroup.value = null
    customDeliveryDate.value = null
    customDeliveryTime.value = null
  }
}

// Revert functions
const revertToDefaultDelivery = (productId) => {
  // Remove custom date for this product
  delete customDates.value[productId]
  
  // Show success message
  showSuccess('Reverted to default delivery date!')
  
  console.log(`Reverted product ${productId} to default delivery`)
}

const revertProductToDefaultDelivery = () => {
  if (selectedProductForDelivery.value) {
    const productId = selectedProductForDelivery.value.product_id
    
    // Remove custom date for this product
    delete customDates.value[productId]
    
    // Clear the modal fields
    productCustomDate.value = null
    productCustomTime.value = null
    
    // Close modal
    showProductDeliveryModal.value = false
    selectedProductForDelivery.value = null
    
    // Show success message
    showSuccess('Reverted to default delivery date!')
    
    console.log(`Reverted product ${productId} to default delivery`)
  }
}

const revertGroupToDefaultDelivery = (group) => {
  // Remove custom dates for all items in the group
  group.items.forEach(item => {
    delete customDates.value[item.product_id]
  })
  
  // Clear the group's custom_date property
  group.custom_date = null
  
  // Show success message
  showSuccess('Reverted to default delivery dates!')
  
  console.log(`Reverted group to default delivery`)
}

const getMinDateForProduct = (product) => {
  // Get the minimum date as day after standard delivery
  return minDateForItem(product)
}

const getMinDateForGroup = (group) => {
  console.log('🔧 getMinDateForGroup called with group:', group);
  
  // Get the minimum date as the highest standard delivery date in the group
  let minDate = null;
  
  group.items.forEach(item => {
    const itemMinDate = minDateForItem(item);
    const itemDate = parseDateYMD(itemMinDate);
    
    console.log('🔧 Item min date:', itemMinDate, 'parsed:', itemDate);
    
    if (itemDate && (!minDate || itemDate > minDate)) {
      minDate = itemDate;
    }
  });
  
  // If no date found, use tomorrow
  if (!minDate) {
    minDate = new Date();
    minDate.setDate(minDate.getDate() + 1);
  }
  
  const result = formatDateAsYYYYMMDD(minDate);
  console.log('🔧 Group min date result:', result);
  
  return result;
}

const openDatePickerForProduct = () => {
  if (selectedProductForDelivery.value) {
    // Set the product context for the date picker
    currentCustomProductId.value = selectedProductForDelivery.value.product_id
    
    // Pre-populate the date picker if there's already a selected date
    if (productCustomDate.value) {
      selectedDateInPicker.value = new Date(productCustomDate.value)
    } else {
      selectedDateInPicker.value = null
    }
    
    // Set up the calendar for the product's minimum date
    try {
      const minDate = getMinDateForProduct(selectedProductForDelivery.value)
      const d = parseDateYMD(minDate)
      if (d instanceof Date && !isNaN(d)) {
        currentMonth.value = new Date(d.getFullYear(), d.getMonth(), 1)
      }
    } catch (e) {
      // Fallback to current month
      currentMonth.value = new Date()
    }
    
    showDatePicker.value = true
  }
}

const openDatePicker = () => {
  // Set the group context for the date picker
  currentCustomProductId.value = null // Clear product context
  
  // Pre-populate the date picker if there's already a selected date
  if (customDeliveryDate.value) {
    selectedDateInPicker.value = new Date(customDeliveryDate.value)
  } else {
    selectedDateInPicker.value = null
  }
  
  // Set up the calendar for the group's minimum date
  if (currentCustomGroup.value) {
    try {
      const minDate = getMinDateForGroup(currentCustomGroup.value);
      const d = parseDateYMD(minDate);
      if (d instanceof Date && !isNaN(d)) {
        currentMonth.value = new Date(d.getFullYear(), d.getMonth(), 1);
      }
    } catch (e) {
      // Fallback to current month
      currentMonth.value = new Date();
    }
  }
  
  showDatePicker.value = true
}

// Now that expressEligibleItems exists, define expressDeliveryAvailable
expressDeliveryAvailable = computed(() => {
  const now = new Date()
  const currentHour = now.getHours()
  const hasExpressProducts = expressEligibleItems.value.length > 0
  return hasExpressProducts && currentHour < 19 // After 7 PM, express delivery not available
})
</script>

<style scoped>
/* Additional styles if needed */
</style>