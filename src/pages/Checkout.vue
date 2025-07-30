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

            <!-- Delivery Options -->
            <div class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm border border-white/20 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-6">Delivery Options</h3>
              
              <div class="space-y-4">
                <!-- Default Delivery -->
                <div 
                  :class="[
                    'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                    deliveryOption === 'default' 
                      ? 'border-blue-500 bg-blue-50/50' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  ]"
                  @click="deliveryOption = 'default'"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center" style="background: linear-gradient(to right, #2563eb, #9333ea);">
                      <Truck class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-gray-900">Standard Delivery</span>
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div v-if="deliveryOption === 'default'" class="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ getDefaultDeliveryTime() }}</p>
                    </div>
                  </div>
                </div>

                <!-- Express Delivery -->
                <div 
                  v-if="expressDeliveryAvailable"
                  :class="[
                    'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                    deliveryOption === 'express' 
                      ? 'border-green-500 bg-green-50/50' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  ]"
                  @click="deliveryOption = 'express'"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Zap class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-gray-900">Express Delivery</span>
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div v-if="deliveryOption === 'express'" class="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">{{ getExpressDeliveryTime() }}</p>
                      <p v-if="expressDeliveryFee > 0" class="text-sm text-green-600 font-medium mt-1">
                        +{{ formatApiPrice({ price: expressDeliveryFee, currency_info: cart.items.currency_info }) }} extra
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Custom Delivery -->
                <div 
                  :class="[
                    'p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200',
                    deliveryOption === 'custom' 
                      ? 'border-orange-500 bg-orange-50/50' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300'
                  ]"
                  @click="deliveryOption = 'custom'"
                >
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <Calendar class="w-5 h-5 text-white" />
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <span class="font-semibold text-gray-900">Custom Date & Time</span>
                        <div class="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <div v-if="deliveryOption === 'custom'" class="w-3 h-3 bg-orange-500 rounded-full"></div>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600 mt-1">Choose your preferred delivery date and time</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Custom Date & Time Selection -->
              <div v-if="deliveryOption === 'custom'" class="mt-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-200">
                <div class="space-y-4">
                    <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Date</label>
                    <div class="relative">
                      <input 
                        v-model="customDeliveryDate"
                        type="text"
                        readonly
                        @click="showDatePicker = true"
                        :placeholder="customDeliveryDate ? formatDate(customDeliveryDate) : 'Select delivery date'"
                        class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer bg-white"
                      />
                      <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Calendar class="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Preferred Delivery Time</label>
                    <select 
                      v-model="customDeliveryTime"
                      class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select time slot</option>
                      <option v-for="slot in availableTimeSlots" :key="slot.value" :value="slot.value">
                        {{ slot.label }}
                      </option>
                    </select>
                  </div>

                  <div v-if="customDeliveryFee > 0" class="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div class="flex items-center text-blue-700">
                      <Info class="w-4 h-4 mr-2" />
                      <span class="text-sm font-medium">
                        Custom delivery fee: {{ formatApiPrice({ price: customDeliveryFee, currency_info: cart.items.currency_info }) }}
                      </span>
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

                <!-- Show delivery fee based on selected option -->
                <div v-if="deliveryOption === 'express'" class="flex justify-between items-center">
                  <span class="text-gray-600">Express Delivery Fee</span>
                  <span class="font-semibold text-green-600">
                    {{ formatApiPrice({
                      price: expressDeliveryFee, 
                      currency_info: cart.items.currency_info 
                    }) }}
                  </span>
                  </div>

                <div v-else class="flex justify-between items-center">
                  <span class="text-gray-600">Delivery Fee</span>
                  <span class="font-semibold text-gray-900">
                    {{ formatApiPrice({
                      price: shippingFee, 
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
      <div 
        v-if="showDatePicker" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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

// Delivery options
const deliveryOption = ref('default')
const customDeliveryDate = ref(null)
const customDeliveryTime = ref(null)
const expressDeliveryFee = ref(500) // 500 FCFA extra for express
const customDeliveryFee = ref(300) // 300 FCFA extra for custom delivery

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
    return date.toISOString().split('T')[0];
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
  let deliveryFee = 0
  
  // Calculate delivery fee based on option
  if (deliveryOption.value === 'express') {
    // Express: only express fee (no base fee)
    deliveryFee = expressDeliveryFee.value
  } else if (deliveryOption.value === 'custom') {
    // Custom: same as standard delivery
    deliveryFee = shippingFee.value
  } else {
    // Default: standard delivery fee
    deliveryFee = shippingFee.value
  }
  
  return subtotal + deliveryFee
})

// Computed property for express delivery availability (reactive)
const expressDeliveryAvailable = computed(() => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentTime = now.toLocaleTimeString();
  const isAvailable = currentHour < 20; // Available only before 8 PM
  return isAvailable;
})

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
  
  // Ensure express delivery is not selected if it's not available
  if (deliveryOption.value === 'express' && !expressDeliveryAvailable.value) {
    deliveryOption.value = 'default';
  }
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

  // Validate custom delivery option
  if (deliveryOption.value === 'custom') {
    if (!customDeliveryDate.value || !customDeliveryTime.value) {
      showError('Please select both delivery date and time for custom delivery')
      return
    }
  }



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
      // Include delivery information
      delivery_option: deliveryOption.value,
      delivery_fee: deliveryOption.value === 'express' ? expressDeliveryFee.value : shippingFee.value,
      // Include payment data for processing
      payment_data: {
        payment_method: paymentMethod.value,
        phone_number: selectedAddress.value.phone || '',
        currency: 'XOF'
      }
    }

    // Add custom delivery details if applicable
    if (deliveryOption.value === 'custom' && formattedCustomDeliveryDate.value && customDeliveryTime.value) {
      orderData.custom_delivery_date = formattedCustomDeliveryDate.value;
      orderData.custom_delivery_time = customDeliveryTime.value;
    }

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

// Function to get adaptive delivery date for each product based on selected delivery option
const getAdaptiveDeliveryDate = (item) => {
  switch (deliveryOption.value) {
    case 'default':
      // Show default delivery date of the product
      return item.delivery_info?.estimated_delivery_display || 'Standard Delivery';
      
    case 'express':
      // Show current date for express delivery
      const now = new Date();
      const currentHour = now.getHours();
      
      if (currentHour >= 20) { // After 8 PM
        // Can only deliver next day
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return `Express Delivery - ${tomorrow.toLocaleDateString('en-US', options)}`;
      } else {
        // Can deliver same day if ordered before 8 PM
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        return `Express Delivery - ${now.toLocaleDateString('en-US', options)}`;
      }
      
    case 'custom':
      // Show selected date and time for custom delivery
      if (customDeliveryDate.value && customDeliveryTime.value) {
        const date = new Date(customDeliveryDate.value);
        const options = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeSlot = availableTimeSlots.find(slot => slot.value === customDeliveryTime.value);
        return `Custom Delivery - ${date.toLocaleDateString('en-US', options)} ${timeSlot?.label || ''}`;
      }
      return 'Custom Delivery - Date and time to be selected';
      
    default:
      return item.delivery_info?.estimated_delivery_display || 'Standard Delivery';
  }
};

// Initialize custom delivery date to standard delivery date if not set
const initializeCustomDeliveryDate = () => {
  if (!customDeliveryDate.value) {
    // Use the minimum delivery date (which is based on standard delivery)
    customDeliveryDate.value = getMinDeliveryDate();
  }
};

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

// Watch delivery option changes
watch(deliveryOption, async (newOption) => {
  if (newOption === 'custom') {
    initializeCustomDeliveryDate();
  }
  
  // If express delivery is selected but not available, switch to default
  if (newOption === 'express' && !expressDeliveryAvailable.value) {
    deliveryOption.value = 'default';
    return;
  }
  
  // Calculate delivery fee for the selected option
  await calculateDeliveryFee(newOption);
});

// Watch for express delivery availability changes
watch(expressDeliveryAvailable, (isAvailable) => {
  // If express delivery becomes unavailable and it's currently selected, switch to default
  if (!isAvailable && deliveryOption.value === 'express') {
    deliveryOption.value = 'default';
  }
});

// Date picker state
const currentMonth = ref(new Date())
const selectedDateInPicker = ref(null)

// Date picker functions
const getCalendarDays = () => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  const days = []
  const minDate = new Date(getMinDeliveryDate())
  const maxDate = new Date(getMaxDeliveryDate())
  
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isDisabled = date < minDate || date > maxDate
    const isSelected = selectedDateInPicker.value && 
      date.toDateString() === selectedDateInPicker.value.toDateString()
    
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
    customDeliveryDate.value = formatDateAsYYYYMMDD(selectedDateInPicker.value)
  }
  showDatePicker.value = false
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
</script>

<style scoped>
/* Additional styles if needed */
</style>