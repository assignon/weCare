<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 pb-24">
    <div class="p-4">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <button 
          @click="$router.push({ name: 'Cart' })"
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-700" />
        </button>

        <h1 class="text-xl font-bold text-gray-900">Checkout</h1>

        <div class="w-10"></div>
      </div>

      <!-- Checkout stepper -->
      <div class="mb-6">
        <!-- Stepper header -->
        <div class="flex items-center justify-center mb-8">
          <div class="flex items-center space-x-4">
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1',
                  currentStep >= 1 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
                :style="currentStep >= 1 ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
              >
                1
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 1 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                Address
              </span>
            </div>
            <div 
              :class="[
                'w-8 h-1 rounded-full',
                currentStep >= 2 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
              ]"
              :style="currentStep >= 2 ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
            ></div>
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1',
                  currentStep >= 2 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
                :style="currentStep >= 2 ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
              >
                2
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 2 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                Delivery
              </span>
            </div>
            <div 
              :class="[
                'w-8 h-1 rounded-full',
                currentStep >= 3 ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-300'
              ]"
              :style="currentStep >= 3 ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
            ></div>
            <div class="flex flex-col items-center">
              <div 
                :class="[
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm mb-1',
                  currentStep >= 3 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                    : 'border-2 border-gray-300 text-gray-500'
                ]"
                :style="currentStep >= 3 ? 'background: linear-gradient(to right, #2563eb, #9333ea);' : ''"
              >
                3
              </div>
              <span 
                :class="[
                  'text-xs font-medium',
                  currentStep >= 3 ? 'text-gray-900' : 'text-gray-500'
                ]"
              >
                Payment
              </span>
            </div>
          </div>
        </div>

        <!-- Step content -->
        <div class="space-y-6">
          <!-- Step 1: Address Selection -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Delivery Address</h2>

              <!-- Address list -->
              <div v-if="!loading" class="space-y-4">
                <div v-if="addresses.length > 0">
                  <div 
                    v-for="(address, index) in addresses" 
                    :key="index"
                    :class="[
                      'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 mb-3',
                      selectedAddressIndex === index 
                        ? 'border-blue-500 bg-blue-50/50' 
                        : 'border-gray-200 bg-white/50 hover:border-gray-300'
                    ]"
                    @click="selectAddress(index)"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex items-start space-x-3 flex-1">
                        <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                          <Home v-if="address.type === 'home'" class="w-4 h-4 text-white" />
                          <Building v-else class="w-4 h-4 text-white" />
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center space-x-2 mb-2">
                            <span class="font-semibold text-gray-900">{{ address.address_label }}</span>
                            <div v-if="address.latitude && address.longitude" class="flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              <MapPin class="w-3 h-3 mr-1" />
                              GPS
                            </div>
                          </div>
                          <div class="text-sm text-gray-600 space-y-1">
                            <p>{{ address.phone }}</p>
                            <p>{{ address.address_line1 }}</p>
                            <p>{{ address.city }}, {{ address.state }} {{ address.postal_code }}</p>
                        </div>
                        </div>
                      </div>

                      <button 
                        @click.stop="editAddress(index)"
                        class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                      >
                        <Edit class="w-4 h-4 text-gray-600" />
                      </button>
                      </div>

                      <!-- Selected indicator -->
                    <div v-if="selectedAddressIndex === index" class="flex items-center justify-end mt-3">
                      <div class="flex items-center text-blue-600 text-sm font-medium">
                        <CheckCircle class="w-4 h-4 mr-1" />
                        Selected
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No addresses state -->
                <div v-else class="text-center py-12">
                  <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPinOff class="w-8 h-8 text-gray-400" />
                  </div>
                  <p class="text-gray-600">No delivery addresses found</p>
                </div>

                <!-- Add new address button -->
                <button 
                  @click="showAddressDialog = true"
                  class="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-all duration-200 flex items-center justify-center"
                >
                  <Plus class="w-5 h-5 mr-2" />
                  Add New Address
                </button>
              </div>

              <!-- Loading skeleton -->
              <div v-else class="space-y-4">
                <div v-for="i in 2" :key="i" class="animate-pulse">
                  <div class="h-24 bg-gray-200 rounded-2xl"></div>
                </div>
              </div>

              <!-- Continue button -->
              <button 
                :disabled="selectedAddressIndex === null"
                @click="nextStep"
                class="w-full mt-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Continue to Delivery
              </button>
            </div>
          </div>

          <!-- Step 2: Delivery Information -->
          <div v-if="currentStep === 2" class="space-y-6">
            <!-- Delivery Address -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div v-if="selectedAddressIndex !== null" class="text-sm text-gray-600 space-y-1">
                <p>{{ selectedAddress.name }}</p>
                <p>{{ selectedAddress.address_line1 }}</p>
                <p>{{ selectedAddress.city }}, {{ selectedAddress.state }} {{ selectedAddress.postal_code }}</p>
                <p>{{ selectedAddress.country }}</p>
                <p>{{ selectedAddress.phone }}</p>
              </div>
            </div>

            <!-- Product Delivery Options -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Delivery Options</h3>
              
              <!-- Default delivery information -->
              <div class="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/50 mb-6">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                    <Truck class="w-5 h-5 text-white" />
                  </div>
                  <div class="flex-1">
                    <span class="font-semibold text-gray-900">Standard Delivery</span>
                    <p class="text-sm text-gray-600 mt-1">{{ getDefaultDeliveryTime() }}</p>
                    <p class="text-xs text-blue-600 mt-1">Each product has its own delivery date. Customize individual products below.</p>
                  </div>
                </div>
              </div>

              <!-- Products with delivery options -->
              <div class="space-y-4">
                <div 
                  v-for="item in groupedCartItems" 
                  :key="item.product_id"
                  class="p-4 rounded-2xl border border-gray-200 bg-white/50"
                >
                  <div class="flex items-start space-x-3">
                    <!-- Product image -->
                    <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                        :alt="item.product_name"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    
                    <!-- Product info and delivery options -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <h4 class="font-medium text-gray-900">{{ item.product_name }}</h4>
                          <p class="text-sm text-gray-600">{{ getTotalQuantity(item) }} items</p>
                          <div class="flex items-center text-blue-600 text-sm mt-1">
                            <Truck class="w-3 h-3 mr-1" />
                            {{ getAdaptiveDeliveryDate(item) }}
                          </div>
                        </div>
                      </div>
                      
                      <!-- Delivery option links at bottom -->
                      <div class="mt-4 flex items-center space-x-3">
                        <!-- Express delivery option -->
                        <button
                          v-if="isExpressEligibleItem(item)"
                          @click="toggleExpressForProduct(item.product_id)"
                          :class="[
                            'flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2',
                            expressProductIds.has(item.product_id)
                              ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-200 hover:text-green-600'
                          ]"
                        >
                          <span class="w-4 h-4 mr-2 flex items-center justify-center rounded-full text-xs" :class="expressProductIds.has(item.product_id) ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'">
                            <span v-if="expressProductIds.has(item.product_id)">✓</span>
                            <span v-else>⚡</span>
                          </span>
                          Express Delivery
                        </button>
                        
                        <!-- Custom delivery option -->
                        <button
                          @click="openCustomDeliveryModal(item)"
                          :class="[
                            'flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2',
                            customDates[item.product_id]
                              ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-600'
                          ]"
                        >
                          <span class="w-4 h-4 mr-2 flex items-center justify-center rounded-full text-xs" :class="customDates[item.product_id] ? 'bg-orange-200 text-orange-800' : 'bg-gray-200 text-gray-600'">
                            <span v-if="customDates[item.product_id]">✓</span>
                            <span v-else>📅</span>
                          </span>
                          Custom Delivery
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

              <!-- Order summary -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Order Summary</h3>

                  <!-- Cart items list (up to 3) -->
              <div v-if="groupedCartItems.length > 0" class="space-y-4 mb-6">
                <div 
                  v-for="(item, index) in displayedCartItems" 
                  :key="item.product_id"
                  class="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-2xl"
                >
                  <div class="w-12 h-12 rounded-2xl overflow-hidden flex-shrink-0">
                    <img 
                      :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                      :alt="item.product_name"
                      class="w-full h-full object-cover"
                    />
                      </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ item.product_name }}</p>
                    <p class="text-sm text-gray-600">
                      {{ item.variants.length }} variant(s) · {{ getTotalQuantity(item) }} items
                    </p>
                    <div class="flex items-center text-blue-600 text-sm mt-1">
                      <Truck class="w-3 h-3 mr-1" />
                      {{ getAdaptiveDeliveryDate(item) }}
                    </div>
                      </div>
                      <div class="text-right">
                    <p class="font-semibold text-gray-900">
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
                  class="w-full py-3 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                      View all {{ groupedCartItems.length }} items
                </button>
                  </div>

              <!-- Price breakdown -->
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Subtotal</span>
                  <span class="font-semibold text-gray-900">
                    {{ formatApiPrice({
                      price: cart.items?.total_amount || 0, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                  </div>

                <!-- Base delivery fee -->
                <div class="flex justify-between items-center">
                  <span class="text-gray-600">Base Delivery Fee</span>
                  <span class="font-semibold text-gray-900">
                    {{ formatApiPrice({
                      price: shippingFee, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                </div>

                <!-- Express delivery fees -->
                <div v-if="expressProductIds.size > 0" class="flex justify-between items-center">
                  <span class="text-gray-600">Express Delivery ({{ expressProductIds.size }} items)</span>
                  <span class="font-semibold text-green-600">
                    {{ formatApiPrice({
                      price: expressProductIds.size * 500, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                </div>

                <!-- Custom delivery fees -->
                <div v-if="Object.keys(customDates).length > 0" class="flex justify-between items-center">
                  <span class="text-gray-600">Custom Delivery ({{ Object.keys(customDates).length }} items)</span>
                  <span class="font-semibold text-orange-600">
                    {{ formatApiPrice({
                      price: Object.keys(customDates).length * 300, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                </div>

                <div class="border-t border-gray-200 pt-3">
                  <div class="flex justify-between items-center">
                    <span class="text-lg font-bold text-gray-900">Total</span>
                    <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
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
            <div class="flex space-x-3">
              <button 
                @click="prevStep"
                class="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
                Back
              </button>
              <button 
                @click="nextStep"
                class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Next
              </button>
              </div>
            </div>

          <!-- Step 3: Payment -->
          <div v-if="currentStep === 3" class="space-y-6">
              <!-- Summary for this step -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
                            <div class="space-y-3">
                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin class="w-4 h-4 text-blue-600" />
                  </div>
                    <div>
                    <p class="text-sm font-medium text-gray-900">Delivery Address</p>
                    <p class="text-xs text-gray-600">
                        {{ selectedAddress?.address_line1 }}, {{ selectedAddress?.city }}
                      </p>
                    </div>
                  </div>

                <div class="flex items-center space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck class="w-4 h-4 text-green-600" />
                  </div>
                    <div>
                    <p class="text-sm font-medium text-gray-900">Delivery Option</p>
                    <p class="text-xs text-gray-600">{{ getDeliveryOptionDisplay() }}</p>
                    </div>
                </div>

                <!-- Cart Items Summary -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center space-x-3 mb-3">
                    <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <ShoppingBag class="w-4 h-4 text-purple-600" />
                      </div>
                    <div>
                      <p class="text-sm font-medium text-gray-900">Order Items</p>
                      <p class="text-xs text-gray-600">{{ groupedCartItems.length }} product{{ groupedCartItems.length > 1 ? 's' : '' }}</p>
                    </div>
                  </div>
                  
                  <!-- Cart items list -->
                  <div class="space-y-3 max-h-48 overflow-y-auto">
                    <div 
                      v-for="item in groupedCartItems" 
                      :key="item.product_id"
                      class="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100"
                    >
                      <div class="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                          :alt="item.product_name"
                          class="w-full h-full object-cover"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 truncate text-sm">{{ item.product_name }}</p>
                        <p class="text-xs text-gray-600">
                          {{ item.variants.length }} variant{{ item.variants.length > 1 ? 's' : '' }} · {{ getTotalQuantity(item) }} item{{ getTotalQuantity(item) > 1 ? 's' : '' }}
                        </p>
                        <div class="flex items-center text-blue-600 text-xs mt-1">
                          <Truck class="w-3 h-3 mr-1" />
                          {{ getAdaptiveDeliveryDate(item) }}
                        </div>
                      </div>
                      <div class="text-right">
                        <p class="font-semibold text-gray-900 text-sm">
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
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Payment Method</h3>

              <div class="space-y-4">
                <!-- Mobile Money -->
                <div 
                  :class="[
                    'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                    paymentMethod === 'mobile_money' 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  ]"
                  @click="paymentMethod = 'mobile_money'"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                      <Smartphone class="w-5 h-5 text-white" />
                      </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-gray-900">Mobile Money</span>
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div v-if="paymentMethod === 'mobile_money'" class="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">Pay with your mobile money account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment button -->
            <div class="space-y-4">
              <div class="flex justify-between items-center p-4 bg-gray-50/50 rounded-2xl">
                <span class="text-lg font-bold text-gray-900">Total</span>
                <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  {{ formatApiPrice({
                    price: totalAmount, 
                    currency_info: cart.items.currency_info 
                  }) }}
                </span>
                </div>

              <div class="flex space-x-3">
                <button 
                  @click="prevStep"
                  class="flex-1 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  Back
                </button>
                <button 
                  :loading="processing"
                  @click="placeOrder"
                  class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  style="background: linear-gradient(to right, #2563eb, #9333ea);"
                >
                  <span v-if="processing" class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                  <span v-else>Place Order</span>
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
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">
            {{ editAddressIndex !== null ? 'Edit Address' : 'Add New Address' }}
            </h3>
            <button 
              @click="showAddressDialog = false"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X class="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <form @submit.prevent="saveAddress" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address Label*</label>
              <input 
                v-model="addressForm.address_label"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="e.g., Home, Office"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 1*</label>
              <input 
                v-model="addressForm.address_line1"
                type="text"
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Street address"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
              <input 
                v-model="addressForm.address_line2"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">City*</label>
                <input 
                  v-model="addressForm.city"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                <input 
                  v-model="addressForm.state"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                <input 
                  v-model="addressForm.postal_code"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Country*</label>
                <select 
                  v-model="addressForm.country"
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">Select country</option>
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
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label for="default-address" class="text-sm text-gray-700">Set as default address</label>
            </div>

            <div class="flex space-x-3 pt-4">
              <button 
                type="button"
                @click="showAddressDialog = false"
                class="flex-1 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
              >
              Cancel
              </button>
              <button 
                type="submit"
                :disabled="!formValid || addressLoading"
                class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="addressLoading" class="flex items-center justify-center">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
                <span v-else>Save Address</span>
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
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Cart Items</h3>
            <button 
              @click="showCartItemsDialog = false"
              class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
            >
              <X class="w-4 h-4 text-gray-600" />
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
              </div>
            </div>
            </div>
          </div>

          <div class="flex justify-end pt-4">
            <button 
              @click="showCartItemsDialog = false"
              class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Date Picker Modal -->
      <!-- Express Selection Dialog -->
      <div v-if="showExpressDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showExpressDialog = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Select Express Items</h3>
            <button @click="showExpressDialog = false" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X class="w-4 h-4 text-gray-600" />
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
          <div class="flex justify-end pt-4">
            <button @click="confirmExpressSelection" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200" style="background: linear-gradient(to right, #2563eb, #9333ea);">
              Done
            </button>
          </div>
        </div>
      </div>

      <!-- Custom Per-Item Dates Dialog -->
      <div v-if="showCustomDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click="showCustomDialog = false">
        <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-gray-900">Select Custom Dates</h3>
            <button @click="showCustomDialog = false" class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors">
              <X class="w-4 h-4 text-gray-600" />
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
          <div class="flex justify-end pt-4">
            <button @click="confirmCustomSelection" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200" style="background: linear-gradient(to right, #2563eb, #9333ea);">
              Done
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
                <p class="text-sm text-gray-600">Standard: {{ getAdaptiveDeliveryDate(selectedProductForDelivery) }}</p>
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
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import { useLocationConfirmation } from '@/composables/useLocationConfirmation'
import LocationConfirmationDialog from '@/components/LocationConfirmationDialog.vue'
import { 
  ArrowLeft, Home, Building, MapPin, MapPinOff, Edit, CheckCircle, Plus, 
  Truck, Zap, Calendar, Info, Smartphone, X, ChevronLeft, ChevronRight, ShoppingBag 
} from 'lucide-vue-next'

const router = useRouter()
const cart = useCartStore()
const { formatApiPrice } = useCurrency()
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
const expressDeliveryFee = ref(500) // 500 FCFA extra for express
const customDeliveryFee = ref(300) // 300 FCFA extra for custom delivery
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
  const subtotal = cart.items.total_amount || 0
  let deliveryFee = shippingFee.value // Base delivery fee
  
  // Add express delivery fees for selected express products
  const expressCount = expressProductIds.value.size
  const expressFeePerProduct = 500 // 500 FCFA per express product
  deliveryFee += expressCount * expressFeePerProduct
  
  // Add custom delivery fees for products with custom dates
  const customCount = Object.keys(customDates.value).length
  const customFeePerProduct = 300 // 300 FCFA per custom product
  deliveryFee += customCount * customFeePerProduct
  
  return subtotal + deliveryFee
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
    return `Product will be delivered in ${avgDays} business days`;
  } else {
    // Otherwise show the range between average and farthest
    return `Product will be delivered between ${avgDays} and ${farthestDays} business days`;
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

  // Initialize delivery fee for default option
  await calculateDeliveryFee('default');
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
  console.log('Selected address index:', index);
  selectedAddressIndex.value = index;
  // Force reactivity update by accessing the selected address
  const selected = selectedAddress.value;
  console.log('Selected address:', selected);
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
      // Include delivery information (default for all products, overridden by per-item settings)
      delivery_option: 'default',
      delivery_fee: totalAmount.value - (cart.items.total_amount || 0), // Total delivery fees
      // Per-item delivery overrides
      express_item_product_ids: Array.from(expressProductIds.value),
      custom_item_dates: customDates.value,
      // Include payment data for processing
      payment_data: {
        payment_method: paymentMethod.value,
        phone_number: selectedAddress.value.phone || '',
        currency: 'XOF'
      }
    }

    // Custom delivery dates are now handled per-product via custom_item_dates

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

const nextStep = () => {
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

  // Format dates
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const avgDateFormatted = avgDate.toLocaleDateString('en-US', options);
  const farthestDateFormatted = farthestDate.toLocaleDateString('en-US', options);

  if (avgDays === farthestDays) {
    return `By ${avgDateFormatted}`;
  } else {
    return `Between ${avgDateFormatted} and ${farthestDateFormatted}`;
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
  
  if (currentHour >= 20) { // After 8 PM
    // Can only deliver next day
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return `Next day delivery (${tomorrow.toLocaleDateString('en-US', options)})`;
  } else {
    // Can deliver same day if ordered before 8 PM
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return `Same day delivery (${now.toLocaleDateString('en-US', options)})`;
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
  switch (deliveryOption.value) {
    case 'default':
      return `Standard Delivery - ${getDefaultDeliveryTime()}`;
    case 'express':
      return `Express Delivery - ${getExpressDeliveryTime()}`;
    case 'custom':
      if (customDeliveryDate.value && customDeliveryTime.value) {
        const date = new Date(customDeliveryDate.value);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeSlot = availableTimeSlots.find(slot => slot.value === customDeliveryTime.value);
        return `Custom Delivery - ${date.toLocaleDateString('en-US', options)} ${timeSlot?.label || ''}`;
      }
      return 'Custom Delivery - Date and time to be selected';
    default:
      return 'Standard Delivery';
  }
};

// Function to get adaptive delivery date for each product based on per-product delivery options
const getAdaptiveDeliveryDate = (item) => {
  const productId = item.product_id;
  
  // Check if this product has express delivery selected
  if (expressProductIds.value.has(productId)) {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (currentHour >= 20) { // After 8 PM
      // Can only deliver next day
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return `Express - ${tomorrow.toLocaleDateString('en-US', options)}`;
    } else {
      // Can deliver same day if ordered before 8 PM
      const options = { weekday: 'short', month: 'short', day: 'numeric' };
      return `Express - ${now.toLocaleDateString('en-US', options)}`;
    }
  }
  
  // Check if this product has custom delivery selected
  if (customDates.value[productId]) {
    const date = new Date(customDates.value[productId]);
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return `Custom - ${date.toLocaleDateString('en-US', options)}`;
  }
  
  // Default: show product's standard delivery date
  return item.delivery_info?.estimated_delivery_display || 'Standard Delivery';
};

// Custom delivery dates are now handled per-product in the modal

// Function to calculate delivery fee based on option
const calculateDeliveryFee = async (option) => {
  try {
    // Default distance - in a real app, this would be calculated based on seller/customer location
    const defaultDistance = 5.0; // 5km default
    
    const response = await apiService.calculateDeliveryFee(defaultDistance, option);
    
    if (response.data) {
      // Update fees based on API response
      shippingFee.value = response.data.base_fee || 0;
      expressDeliveryFee.value = response.data.express_fee || 0;
      customDeliveryFee.value = response.data.custom_fee || 0;
    }
  } catch (error) {
    console.error('Error calculating delivery fee:', error);
    // Fallback to default values if API fails
    shippingFee.value = 0;
    expressDeliveryFee.value = 0;
    customDeliveryFee.value = 0;
  }
};

// No longer need order-level delivery option watch since all delivery is per-product

// Express delivery is now handled per-product, no need for order-level watches

// Date picker state
const currentMonth = ref(new Date())
const selectedDateInPicker = ref(null)
// Track which product (if any) is selecting a custom date via the dialog
const currentCustomProductId = ref(null)

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
  // Enforce min date strictly after the standard delivery date
  const est = item.delivery_info?.estimated_delivery_date
  if (est) {
    const d = parseDateYMD(est)
    d.setDate(d.getDate() + 1) // next day after standard
    return formatDateAsYYYYMMDD(d)
  }
  // Fallback: use delivery_days when available
  const dd = item.delivery_info?.delivery_days
  if (typeof dd === 'number') {
    const d = new Date()
    d.setDate(d.getDate() + dd + 1)
    return formatDateAsYYYYMMDD(d)
  }
  // Legacy fallback: parse from display text and add one business day beyond max
  let days = 3
  const text = item.delivery_info?.estimated_delivery_display || ''
  const range = text.match(/(\d+)-(\d+)/)
  if (range) {
    days = parseInt(range[2]) || 3
  } else {
    const single = text.match(/(\d+)/)
    if (single) days = parseInt(single[1]) || 3
  }
  const d = addBusinessDays(new Date(), days + 1)
  return formatDateAsYYYYMMDD(d)
}

const confirmCustomSelection = () => {
  showCustomDialog.value = false
}

// Product-specific delivery functions
const toggleExpressForProduct = (productId) => {
  if (expressProductIds.value.has(productId)) {
    expressProductIds.value.delete(productId)
  } else {
    expressProductIds.value.add(productId)
    // Remove custom date if express is selected
    if (customDates.value[productId]) {
      delete customDates.value[productId]
    }
  }
}

const openCustomDeliveryModal = (product) => {
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

const getMinDateForProduct = (product) => {
  // Get the minimum date as day after standard delivery
  return minDateForItem(product)
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

// Now that expressEligibleItems exists, define expressDeliveryAvailable
expressDeliveryAvailable = computed(() => {
  const now = new Date()
  const currentHour = now.getHours()
  const hasExpressProducts = expressEligibleItems.value.length > 0
  return hasExpressProducts && currentHour < 20
})
</script>

<style scoped>
/* Additional styles if needed */
</style>