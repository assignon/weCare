<template>
  <div class="min-h-screen bg-white">
    <!-- Map Container -->
    <div class="relative h-screen">
      <!-- Map -->
      <div id="parcel-map" class="absolute inset-0 z-0"></div>

      <!-- Header -->
      <div class="absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/60 to-transparent">
        <div class="p-4">
          <div class="flex items-center justify-between">
            <button 
              @click="goBack"
              class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft class="w-5 h-5 text-gray-700" />
            </button>
            <h1 class="text-xl font-bold text-white">Send Parcel</h1>
            <div class="w-10"></div>
          </div>
        </div>
      </div>

      <!-- Active Drivers Count (Middle) -->
      <div class="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
        <div class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex items-center space-x-2">
          <Truck class="w-4 h-4 text-blue-600" />
          <span class="text-sm font-semibold text-gray-900">{{ activeDriversCount }} Active Drivers</span>
        </div>
      </div>

      <!-- Bottom Sheet -->
      <div 
        class="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40"
        :style="{ maxHeight: '70vh' }"
      >
        <div class="p-6 overflow-y-auto" style="max-height: 65vh;">
          <!-- Drag Handle -->
          <div class="flex justify-center mb-4">
            <div class="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <!-- Step 1: Location Selection -->
          <div v-if="currentStep === 1" class="space-y-4">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Select Locations</h2>
            
            <!-- Pickup Location Search -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="pickupSearchQuery"
                  @input="searchLocation('pickup')"
                  @focus="showPickupSuggestions = true"
                  @blur="hidePickupSuggestions"
                  type="text"
                  placeholder="Search for pickup location in Lomé..."
                  class="input pl-10 pr-10 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <!-- Pickup Suggestions Dropdown -->
              <div 
                v-if="showPickupSuggestions && pickupSuggestions.length > 0"
                class="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                style="top: 100%; left: 0;"
              >
                <div
                  v-for="(suggestion, index) in pickupSuggestions"
                  :key="index"
                  @mousedown.prevent="selectLocation('pickup', suggestion)"
                  class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <p class="text-sm font-semibold text-gray-900">{{ suggestion.display_name }}</p>
                </div>
              </div>
              
              <!-- Selected Pickup Location -->
              <div v-if="pickupLocation" class="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-green-600" />
                  <p class="text-sm text-green-900">{{ pickupLocation.display_name }}</p>
                  <button @click="clearLocation('pickup')" class="ml-auto text-red-600 hover:text-red-700">
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Dropoff Location Search -->
            <div class="relative">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dropoff Location</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="dropoffSearchQuery"
                  @input="searchLocation('dropoff')"
                  @focus="showDropoffSuggestions = true"
                  @blur="hideDropoffSuggestions"
                  type="text"
                  placeholder="Search for dropoff location in Lomé..."
                  class="input pl-10 pr-10 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <Search class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <!-- Dropoff Suggestions Dropdown -->
              <div 
                v-if="showDropoffSuggestions && dropoffSuggestions.length > 0"
                class="absolute z-50 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                style="top: 100%; left: 0;"
              >
                <div
                  v-for="(suggestion, index) in dropoffSuggestions"
                  :key="index"
                  @mousedown.prevent="selectLocation('dropoff', suggestion)"
                  class="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <p class="text-sm font-semibold text-gray-900">{{ suggestion.display_name }}</p>
                </div>
              </div>
              
              <!-- Selected Dropoff Location -->
              <div v-if="dropoffLocation" class="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div class="flex items-center space-x-2">
                  <MapPin class="w-4 h-4 text-red-600" />
                  <p class="text-sm text-red-900">{{ dropoffLocation.display_name }}</p>
                  <button @click="clearLocation('dropoff')" class="ml-auto text-red-600 hover:text-red-700">
                    <X class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Next Button -->
            <button
              @click="goToStep(2)"
              :disabled="!pickupLocation || !dropoffLocation"
              class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              Next
            </button>
          </div>

          <!-- Step 2: Package Details -->
          <div v-if="currentStep === 2" class="space-y-4">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Package Details</h2>
            <!-- Delivery Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Delivery Type</label>
              <div class="grid grid-cols-2 gap-3">
                <button
                  @click="form.delivery_type = 'same_day'"
                  :class="[
                    'p-3 rounded-xl border-2 transition-all',
                    form.delivery_type === 'same_day' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  ]"
                >
                  <Clock class="w-5 h-5 mx-auto mb-1" :class="form.delivery_type === 'same_day' ? 'text-blue-600' : 'text-gray-500'" />
                  <p :class="['text-sm font-semibold', form.delivery_type === 'same_day' ? 'text-blue-600' : 'text-gray-700']">Same Day</p>
                </button>
                <button
                  @click="form.delivery_type = 'scheduled'"
                  :class="[
                    'p-3 rounded-xl border-2 transition-all',
                    form.delivery_type === 'scheduled' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  ]"
                >
                  <Calendar class="w-5 h-5 mx-auto mb-1" :class="form.delivery_type === 'scheduled' ? 'text-blue-600' : 'text-gray-500'" />
                  <p :class="['text-sm font-semibold', form.delivery_type === 'scheduled' ? 'text-blue-600' : 'text-gray-700']">Scheduled</p>
                </button>
              </div>
            </div>

            <!-- Scheduled Date/Time (if scheduled delivery) -->
            <div v-if="form.delivery_type === 'scheduled'" class="space-y-3">
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Delivery Date</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    v-model="form.scheduled_date" 
                    type="date"
                    :min="today"
                    class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">Preferred Time</label>
                <div class="relative group">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input 
                    v-model="form.scheduled_time" 
                    type="time"
                    class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <!-- Package Size -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Package Size</label>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="size in packageSizes"
                  :key="size.value"
                  @click="form.package_size = size.value"
                  :class="[
                    'p-3 rounded-xl border-2 transition-all',
                    form.package_size === size.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300'
                  ]"
                >
                  <Package class="w-5 h-5 mx-auto mb-1" :class="form.package_size === size.value ? 'text-blue-600' : 'text-gray-500'" />
                  <p :class="['text-xs font-semibold', form.package_size === size.value ? 'text-blue-600' : 'text-gray-700']">{{ size.label }}</p>
                </button>
              </div>
            </div>

            <!-- Pickup Landmark -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Pickup Landmark/Address</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="form.pickup_landmark" 
                  type="text"
                  placeholder="e.g., Opposite Kofi Market"
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Dropoff Landmark -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Dropoff Landmark/Address</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="form.dropoff_landmark" 
                  type="text"
                  placeholder="e.g., Near Ecobank"
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex space-x-3">
              <button
                @click="goToStep(1)"
                class="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                @click="goToStep(3)"
                :disabled="costLoading"
                class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Next
              </button>
            </div>
          </div>

          <!-- Step 3: Recipient Details -->
          <div v-if="currentStep === 3" class="space-y-4">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Recipient Details</h2>

            <!-- Recipient Name -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="form.recipient_name" 
                  type="text"
                  placeholder="Full name"
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Recipient Phone -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  v-model="form.recipient_phone" 
                  type="tel"
                  placeholder="+228 XX XX XX XX"
                  class="input pl-10 pr-3 h-12 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <!-- Package Description (Optional) -->
            <div class="space-y-1">
              <div class="relative group">
                <div class="absolute top-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <Package class="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <textarea 
                  v-model="form.package_description" 
                  rows="3"
                  placeholder="Describe what's in the package..."
                  class="input pl-10 pr-3 pt-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex space-x-3">
              <button
                @click="goToStep(2)"
                class="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                @click="goToStep(4)"
                :disabled="!isFormValid"
                class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg disabled:opacity-50"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                Review
              </button>
            </div>
          </div>

          <!-- Step 4: Review & Confirm -->
          <div v-if="currentStep === 4" class="space-y-4">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Review Delivery</h2>

            <!-- Locations Summary -->
            <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Locations</h3>
              <div class="space-y-3">
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin class="w-4 h-4 text-green-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500 mb-1">Pickup</p>
                    <p class="text-sm font-semibold text-gray-900">{{ pickupLocation?.display_name }}</p>
                    <p v-if="form.pickup_landmark" class="text-xs text-gray-600 mt-1">{{ form.pickup_landmark }}</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin class="w-4 h-4 text-red-600" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs text-gray-500 mb-1">Dropoff</p>
                    <p class="text-sm font-semibold text-gray-900">{{ dropoffLocation?.display_name }}</p>
                    <p v-if="form.dropoff_landmark" class="text-xs text-gray-600 mt-1">{{ form.dropoff_landmark }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Package Details Summary -->
            <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Package Details</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Package Size:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ getPackageSizeLabel(form.package_size) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Delivery Type:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ form.delivery_type === 'same_day' ? 'Same Day' : 'Scheduled' }}</span>
                </div>
                <div v-if="form.delivery_type === 'scheduled' && form.scheduled_date" class="flex justify-between">
                  <span class="text-xs text-gray-600">Scheduled:</span>
                  <span class="text-sm font-semibold text-gray-900">
                    {{ formatDate(form.scheduled_date) }} 
                    <span v-if="form.scheduled_time">at {{ form.scheduled_time }}</span>
                  </span>
                </div>
                <div v-if="form.package_description" class="pt-2 border-t border-gray-100">
                  <p class="text-xs text-gray-600 mb-1">Description:</p>
                  <p class="text-sm text-gray-700">{{ form.package_description }}</p>
                </div>
              </div>
            </div>

            <!-- Recipient Summary -->
            <div class="bg-white rounded-xl p-4 border-2 border-gray-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Recipient</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Name:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ form.recipient_name }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Phone:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ form.recipient_phone }}</span>
                </div>
              </div>
            </div>

            <!-- Pricing Breakdown -->
            <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border-2 border-blue-200">
              <h3 class="text-sm font-semibold text-gray-700 mb-3">Pricing Breakdown</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-xs text-gray-600">Distance:</span>
                  <span class="text-sm font-semibold text-gray-900">{{ distance ? distance.toFixed(1) : '0' }} km</span>
                </div>
                <div v-if="costData" class="space-y-1 pt-2 border-t border-blue-200">
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-600">Base Fee:</span>
                    <span class="text-sm font-semibold text-gray-900">{{ costData.base_fee }} CFA</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-xs text-gray-600">Distance Fee:</span>
                    <span class="text-sm font-semibold text-gray-900">{{ costData.distance_fee }} CFA</span>
                  </div>
                  <div v-if="costData.package_size_multiplier > 1" class="flex justify-between">
                    <span class="text-xs text-gray-600">Package Size ({{ getPackageSizeLabel(form.package_size) }}):</span>
                    <span class="text-sm font-semibold text-gray-900">+{{ ((costData.subtotal * (costData.package_size_multiplier - 1))).toFixed(0) }} CFA</span>
                  </div>
                  <div v-if="costData.delivery_type_multiplier < 1" class="flex justify-between">
                    <span class="text-xs text-gray-600">Scheduled Discount:</span>
                    <span class="text-sm font-semibold text-green-600">-{{ ((costData.subtotal * costData.package_size_multiplier * (1 - costData.delivery_type_multiplier))).toFixed(0) }} CFA</span>
                  </div>
                  <div v-if="costData.express_fee && costData.express_fee > 0" class="flex justify-between">
                    <span class="text-xs text-gray-600">Express Fee (Same Day):</span>
                    <span class="text-sm font-semibold text-gray-900">+{{ costData.express_fee }} CFA</span>
                  </div>
                </div>
                <div class="flex justify-between pt-2 border-t-2 border-blue-300">
                  <span class="text-base font-bold text-gray-900">Total:</span>
                  <span class="text-2xl font-bold text-blue-600">
                    {{ costData?.total || 0 }} CFA
                  </span>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex space-x-3">
              <button
                @click="goToStep(3)"
                class="flex-1 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Back
              </button>
              <button
                @click="requestDriver"
                :disabled="loading || sending || !isFormValid || !costData"
                class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <Loader2 class="w-5 h-5 animate-spin mr-2" />
                  Processing...
                </span>
                <span v-else class="flex items-center justify-center">
                  <Truck class="w-5 h-5 mr-2" />
                  Find Driver
                </span>
              </button>
            </div>
          </div>

          <!-- Step 5: Driver Search Status (Express Only) -->
          <div v-if="currentStep === 5" class="space-y-4">
            <div class="text-center py-8">
              <!-- Searching Driver -->
              <div v-if="searchingDriver && !driverFound" class="space-y-4">
                <Loader2 class="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                <h2 class="text-xl font-bold text-gray-900">Searching for Driver</h2>
                <p class="text-gray-600">Looking for an available driver nearby...</p>
              </div>

              <!-- Driver Found, Waiting for Acceptance -->
              <div v-else-if="driverFound && waitingForDriver" class="space-y-4">
                <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <User class="w-8 h-8 text-green-600" />
                </div>
                <h2 class="text-xl font-bold text-gray-900">Driver Found!</h2>
                <div v-if="driverInfo" class="bg-white rounded-xl p-4 border-2 border-gray-200 space-y-2">
                  <p class="text-lg font-semibold text-gray-900">{{ driverInfo.name }}</p>
                  <p class="text-sm text-gray-600">{{ driverInfo.vehicle_type }}</p>
                  <p v-if="driverInfo.phone" class="text-sm text-gray-600">{{ driverInfo.phone }}</p>
                </div>
                <div class="flex items-center justify-center space-x-2 mt-4">
                  <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
                  <p class="text-gray-600">Waiting for driver to accept your request...</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">The driver has been notified and will respond shortly</p>
              </div>

              <!-- Driver Accepted -->
              <div v-else-if="driverFound && !waitingForDriver && driverInfo?.accepted" class="space-y-4">
                <div class="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle class="w-12 h-12 text-white" />
                </div>
                <h2 class="text-2xl font-bold text-green-600">Driver Accepted!</h2>
                <div class="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                  <p class="text-lg font-semibold text-gray-900 mb-2">{{ driverInfo.name }}</p>
                  <p class="text-sm text-gray-600">{{ driverInfo.vehicle_type }}</p>
                  <p v-if="driverInfo.phone" class="text-sm text-gray-600 mt-1">{{ driverInfo.phone }}</p>
                </div>
                <button
                  v-if="parcelId"
                  @click="router.push({ name: 'ParcelTracking', params: { id: parcelId } })"
                  class="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Parcel Details
                </button>
                <button
                  @click="resetForm"
                  class="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Send Another Parcel
                </button>
              </div>

              <!-- No Driver Found / Admin Fallback -->
              <div v-else-if="!searchingDriver && !driverFound && !waitingForDriver" class="space-y-4">
                <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info class="w-12 h-12 text-orange-600" />
                </div>
                <h2 class="text-2xl font-bold text-orange-600">No Drivers Available</h2>
                <div class="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                  <p class="text-gray-700 mb-2">
                    We couldn't find an available driver at the moment.
                  </p>
                  <p class="text-gray-700">
                    An admin will manually assign a driver to your delivery shortly.
                  </p>
                  <p class="text-sm text-gray-600 mt-3">
                    You will be notified once a driver is assigned.
                  </p>
                </div>
                <button
                  v-if="parcelId"
                  @click="router.push({ name: 'ParcelTracking', params: { id: parcelId } })"
                  class="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Parcel Details
                </button>
                <button
                  @click="resetForm"
                  class="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Send Another Parcel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useParcelStore } from '@/stores/parcel'
import apiService from '@/services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { 
  ArrowLeft, MapPin, Info, Clock, Calendar, Package, Truck, Loader2, Search, X, User, Phone,
  CheckCircle, AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const parcelStore = useParcelStore()

// Access cost loading and error from store
const costLoading = computed(() => parcelStore.costLoading)
const costError = computed(() => parcelStore.costError)

// Map and markers
const map = ref(null)
const pickupMarker = ref(null)
const dropoffMarker = ref(null)
const driverMarkers = ref([])
const activeDriversCount = ref(0)
const driverInterval = ref(null)

// Location search
const pickupSearchQuery = ref('')
const dropoffSearchQuery = ref('')
const pickupSuggestions = ref([])
const dropoffSuggestions = ref([])
const showPickupSuggestions = ref(false)
const showDropoffSuggestions = ref(false)

// Locations
const pickupLocation = ref(null)
const dropoffLocation = ref(null)
const distance = ref(0)
const costData = ref(null)

// Form
const form = ref({
  delivery_type: 'same_day',
  scheduled_date: null,
  scheduled_time: null,
  package_size: 'small',
  pickup_landmark: '',
  dropoff_landmark: '',
  recipient_name: '',
  recipient_phone: '',
  package_description: ''
})

// UI State
const currentStep = ref(1)
const loading = ref(false)
const sending = ref(false)
const searchTimeout = ref(null)
const searchingDriver = ref(false)
const driverFound = ref(false)
const driverInfo = ref(null)
const waitingForDriver = ref(false)
const parcelId = ref(null)

const packageSizes = [
  { value: 'small', label: '1-10kg' },
  { value: 'medium', label: '10-20kg' },
  { value: 'large', label: '>20kg' }
]

const today = computed(() => {
  const date = new Date()
  return date.toISOString().split('T')[0]
})

const isFormValid = computed(() => {
  return form.value.recipient_name && 
         form.value.recipient_phone && 
         pickupLocation.value && 
         dropoffLocation.value &&
         costData.value
})

// Initialize map
const initializeMap = () => {
  // Fix Leaflet default markers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  // Default center (Lomé, Togo) - zoomed in
  const defaultCoords = [6.13, 1.22]
  
  map.value = L.map('parcel-map', {
    center: defaultCoords,
    zoom: 15, // Zoomed in on Lomé
    zoomControl: false // We'll add custom zoom control
  })

  // Add zoom control to top right
  L.control.zoom({
    position: 'topright'
  }).addTo(map.value)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  // Map click handler disabled - using search instead
  // map.value.on('click', handleMapClick)

  // Don't override with user location - keep zoomed on Lomé
  // if ('geolocation' in navigator) {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       const userLat = position.coords.latitude
  //       const userLng = position.coords.longitude
  //       map.value.setView([userLat, userLng], 14)
  //     },
  //     (error) => {
  //       console.warn('Could not get user location:', error)
  //     }
  //   )
  // }

  // Load active drivers
  loadActiveDrivers()
}

// Load active drivers and show on map
const loadActiveDrivers = async () => {
  try {
    const response = await apiService.getActiveDrivers()
    const drivers = response.data?.results || response.data || []
    
    activeDriversCount.value = drivers.length
    
    // Clear existing driver markers
    driverMarkers.value.forEach(marker => {
      if (map.value) {
        map.value.removeLayer(marker)
      }
    })
    driverMarkers.value = []
    
    // Create markers for each driver
    drivers.forEach(driver => {
      if (driver.latitude && driver.longitude) {
        // Create custom icon for driver
        const driverIcon = L.divIcon({
          className: 'driver-marker',
          html: `<div style="
            width: 20px;
            height: 20px;
            background-color: #3b82f6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
        
        const marker = L.marker(
          [parseFloat(driver.latitude), parseFloat(driver.longitude)],
          { icon: driverIcon }
        ).addTo(map.value)
        
        // Add popup with driver info
        const driverName = driver.driver?.full_name || driver.driver?.email || 'Driver'
        marker.bindPopup(`<div class="text-sm"><strong>${driverName}</strong><br/>Active Driver</div>`)
        
        driverMarkers.value.push(marker)
      }
    })
  } catch (error) {
    console.error('Failed to load active drivers:', error)
    activeDriversCount.value = 0
  }
}

// Search location using Nominatim (OpenStreetMap)
const searchLocation = async (type) => {
  const query = type === 'pickup' ? pickupSearchQuery.value : dropoffSearchQuery.value
  
  if (query.length < 3) {
    if (type === 'pickup') {
      pickupSuggestions.value = []
    } else {
      dropoffSuggestions.value = []
    }
    return
  }

  // Clear previous timeout
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  // Debounce search
  searchTimeout.value = setTimeout(async () => {
    try {
      // Limit search to Lomé, Togo area
      // Bounding box format: min_lon,min_lat,max_lon,max_lat
      const bbox = '1.0,6.0,1.4,6.3' // Lomé bounding box
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&bounded=1&viewbox=${bbox}&addressdetails=1&countrycodes=tg`
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'afriQExpress/1.0',
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Filter to ensure results are in Lomé area
      const filteredData = data.filter(item => {
        const lat = parseFloat(item.lat)
        const lon = parseFloat(item.lon)
        return lat >= 6.0 && lat <= 6.3 && lon >= 1.0 && lon <= 1.4
      })
      
      if (type === 'pickup') {
        pickupSuggestions.value = filteredData
      } else {
        dropoffSuggestions.value = filteredData
      }
    } catch (error) {
      console.error('Error searching location:', error)
      // Clear suggestions on error
      if (type === 'pickup') {
        pickupSuggestions.value = []
      } else {
        dropoffSuggestions.value = []
      }
    }
  }, 300)
}

// Select location from suggestions
const selectLocation = (type, suggestion) => {
  const location = {
    lat: parseFloat(suggestion.lat),
    lng: parseFloat(suggestion.lon),
    display_name: suggestion.display_name,
    address: suggestion.address || {}
  }

  if (type === 'pickup') {
    pickupLocation.value = location
    pickupSearchQuery.value = suggestion.display_name
    showPickupSuggestions.value = false
    setPickupLocation({ lat: location.lat, lng: location.lng })
  } else {
    dropoffLocation.value = location
    dropoffSearchQuery.value = suggestion.display_name
    showDropoffSuggestions.value = false
    setDropoffLocation({ lat: location.lat, lng: location.lng })
  }

  // Calculate cost if both locations are set (only if we're on step 2 or later)
  if (pickupLocation.value && dropoffLocation.value && currentStep.value >= 2) {
    // Small delay to ensure map markers are set
    setTimeout(() => {
      calculateCost()
    }, 100)
  }
}

// Clear location
const clearLocation = (type) => {
  if (type === 'pickup') {
    pickupLocation.value = null
    pickupSearchQuery.value = ''
    pickupSuggestions.value = []
    if (pickupMarker.value) {
      map.value.removeLayer(pickupMarker.value)
      pickupMarker.value = null
    }
  } else {
    dropoffLocation.value = null
    dropoffSearchQuery.value = ''
    dropoffSuggestions.value = []
    if (dropoffMarker.value) {
      map.value.removeLayer(dropoffMarker.value)
      dropoffMarker.value = null
    }
  }
  costData.value = null
  distance.value = 0
}

// Navigate between steps
const goToStep = (step) => {
  currentStep.value = step
  // Recalculate cost when going to step 2 if package size changed
  if (step === 2 && pickupLocation.value && dropoffLocation.value) {
    calculateCost()
  }
  // Ensure cost is calculated before review step
  if (step === 4 && pickupLocation.value && dropoffLocation.value && !costData.value) {
    calculateCost()
  }
}

// Get package size label
const getPackageSizeLabel = (size) => {
  const sizeMap = {
    'small': '1-10kg',
    'medium': '10-20kg',
    'large': '>20kg'
  }
  return sizeMap[size] || size
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Handle map click (optional - can be removed if not needed)
const handleMapClick = (e) => {
  // Map clicks disabled - using search instead
}

// Set pickup location on map
const setPickupLocation = (latlng) => {
  if (!map.value) return

  // Remove old marker if exists
  if (pickupMarker.value) {
    map.value.removeLayer(pickupMarker.value)
  }

  // Create green marker for pickup
  const greenIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })

  pickupMarker.value = L.marker([latlng.lat, latlng.lng], {
    icon: greenIcon,
    draggable: true
  }).addTo(map.value)

  pickupMarker.value.bindPopup('Pickup Location').openPopup()

  // Handle marker drag
  pickupMarker.value.on('dragend', (e) => {
    const newLatLng = e.target.getLatLng()
    if (pickupLocation.value) {
      pickupLocation.value.lat = newLatLng.lat
      pickupLocation.value.lng = newLatLng.lng
    }
    calculateCost()
  })

  // Update map view
  if (dropoffLocation.value) {
    const bounds = L.latLngBounds([
      [latlng.lat, latlng.lng],
      [dropoffLocation.value.lat, dropoffLocation.value.lng]
    ])
    map.value.fitBounds(bounds, { padding: [50, 50] })
  } else {
    map.value.setView([latlng.lat, latlng.lng], 15)
  }
}

// Set dropoff location on map
const setDropoffLocation = (latlng) => {
  if (!map.value) return

  // Remove old marker if exists
  if (dropoffMarker.value) {
    map.value.removeLayer(dropoffMarker.value)
  }

  // Create red marker for dropoff
  const redIcon = L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32]
  })

  dropoffMarker.value = L.marker([latlng.lat, latlng.lng], {
    icon: redIcon,
    draggable: true
  }).addTo(map.value)

  dropoffMarker.value.bindPopup('Dropoff Location').openPopup()

  // Handle marker drag
  dropoffMarker.value.on('dragend', (e) => {
    const newLatLng = e.target.getLatLng()
    if (dropoffLocation.value) {
      dropoffLocation.value.lat = newLatLng.lat
      dropoffLocation.value.lng = newLatLng.lng
    }
    calculateCost()
  })

  // Fit bounds to show both markers
  if (pickupLocation.value) {
    const bounds = L.latLngBounds([
      [pickupLocation.value.lat, pickupLocation.value.lng],
      [latlng.lat, latlng.lng]
    ])
    map.value.fitBounds(bounds, { padding: [50, 50] })
  } else {
    map.value.setView([latlng.lat, latlng.lng], 15)
  }
}

// Use my location (optional helper - can be added as a button if needed)
const useMyLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        
        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`, {
          headers: {
            'User-Agent': 'afriQExpress/1.0'
          }
        })
        .then(res => res.json())
        .then(data => {
          const location = {
            lat: lat,
            lng: lng,
            display_name: data.display_name,
            address: data.address || {}
          }
          pickupLocation.value = location
          pickupSearchQuery.value = data.display_name
          setPickupLocation({ lat, lng })
          map.value.setView([lat, lng], 15)
        })
        .catch(err => {
          console.error('Reverse geocoding failed:', err)
        })
      },
      (error) => {
        alert('Could not get your location. Please search for your location.')
      }
    )
  } else {
    alert('Geolocation is not supported by your browser.')
  }
}

// Calculate cost
const calculateCost = async () => {
  if (!pickupLocation.value || !dropoffLocation.value) return

  try {
    // Round coordinates to 6 decimal places to match backend validation
    const pickupCoords = {
      lat: parseFloat(pickupLocation.value.lat.toFixed(6)),
      lng: parseFloat(pickupLocation.value.lng.toFixed(6))
    }
    const dropoffCoords = {
      lat: parseFloat(dropoffLocation.value.lat.toFixed(6)),
      lng: parseFloat(dropoffLocation.value.lng.toFixed(6))
    }

    const result = await parcelStore.calculateDeliveryCost(
      pickupCoords,
      dropoffCoords,
      form.value.package_size,
      form.value.delivery_type
    )

    costData.value = result
    distance.value = result.distance_km
  } catch (error) {
    console.error('Failed to calculate cost:', error)
    costData.value = null
    distance.value = 0
  }
}

// Watch for package size and delivery type changes - recalculate cost
watch([() => form.value.package_size, () => form.value.delivery_type], () => {
  if (pickupLocation.value && dropoffLocation.value && currentStep.value >= 2) {
    calculateCost()
  }
})

// Hide suggestions with delay
const hidePickupSuggestions = () => {
  setTimeout(() => {
    showPickupSuggestions.value = false
  }, 200)
}

const hideDropoffSuggestions = () => {
  setTimeout(() => {
    showDropoffSuggestions.value = false
  }, 200)
}

// Request driver
const requestDriver = async () => {
  if (!isFormValid.value) return
  
  // Prevent duplicate submissions
  if (loading.value || sending.value) {
    return
  }

  loading.value = true
  sending.value = true

  try {
    // Round coordinates to 6 decimal places to match backend validation
    const parcelData = {
      pickup_location: {
        latitude: parseFloat(Number(pickupLocation.value.lat).toFixed(6)),
        longitude: parseFloat(Number(pickupLocation.value.lng).toFixed(6)),
        landmark: form.value.pickup_landmark || pickupLocation.value.display_name,
        address: pickupLocation.value.display_name
      },
      dropoff_location: {
        latitude: parseFloat(Number(dropoffLocation.value.lat).toFixed(6)),
        longitude: parseFloat(Number(dropoffLocation.value.lng).toFixed(6)),
        landmark: form.value.dropoff_landmark || dropoffLocation.value.display_name,
        address: dropoffLocation.value.display_name
      },
      recipient_name: form.value.recipient_name,
      recipient_phone: form.value.recipient_phone,
      package_description: form.value.package_description,
      package_size: form.value.package_size,
      delivery_type: form.value.delivery_type,
      scheduled_date: form.value.scheduled_date || null,
      scheduled_time: form.value.scheduled_time || null
    }

    const parcel = await parcelStore.createParcelDelivery(parcelData)
    parcelId.value = parcel.id

    // For both express and scheduled delivery, show live driver search
    // Keep shopper on page until driver accepts
    searchingDriver.value = true
    loading.value = false
    // The backend will send WebSocket events that we'll handle
    // Show a step 5 overlay for driver search status
    currentStep.value = 5
  } catch (error) {
    console.error('Failed to create parcel delivery:', error)
    alert('Failed to create parcel delivery. Please try again.')
    loading.value = false
    sending.value = false
  }
}

// Handle driver search updates via WebSocket
const handleDriverSearchUpdate = (event) => {
  console.log('Driver search update:', event)
  
  switch (event.event_type) {
    case 'searching_driver':
      searchingDriver.value = true
      driverFound.value = false
      waitingForDriver.value = false
      break
      
    case 'driver_found':
      searchingDriver.value = false
      driverFound.value = true
      waitingForDriver.value = true
      driverInfo.value = event.data.driver
      break
      
    case 'driver_accepted':
      // Show acceptance confirmation in bottom sheet (NO AUTO-REDIRECT)
      waitingForDriver.value = false
      searchingDriver.value = false
      driverFound.value = true  // Keep driver info visible
      
      // Update driver info with acceptance status
      if (event.data?.driver) {
        driverInfo.value = {
          ...driverInfo.value,
          ...event.data.driver,
          accepted: true
        }
      }
      
      // Store parcel ID for link (DO NOT AUTO-REDIRECT)
      if (event.data?.parcel_id) {
        parcelId.value = event.data.parcel_id
      }
      break
      
    case 'driver_declined':
      // Driver declined, searching for another
      searchingDriver.value = true
      driverFound.value = false
      waitingForDriver.value = false
      driverInfo.value = null
      break
      
    case 'driver_timeout':
      // Driver didn't respond in time, searching for another
      searchingDriver.value = true
      driverFound.value = false
      waitingForDriver.value = false
      driverInfo.value = null
      break
      
    case 'no_driver_found':
      // No driver available, admin will assign (NO AUTO-REDIRECT)
      searchingDriver.value = false
      driverFound.value = false
      waitingForDriver.value = false
      // Store parcel ID if provided
      if (event.data?.parcel_id) {
        parcelId.value = event.data.parcel_id
      }
      break
      
    case 'admin_fallback':
      // Admin will assign driver (NO AUTO-REDIRECT)
      searchingDriver.value = false
      driverFound.value = false
      waitingForDriver.value = false
      // Store parcel ID if provided
      if (event.data?.parcel_id) {
        parcelId.value = event.data.parcel_id
      }
      break
  }
}

// Go back
const goBack = () => {
  router.back()
}

// Reset form to send another parcel
const resetForm = () => {
  // Reset all form fields
  form.value = {
    pickup_location: '',
    dropoff_location: '',
    pickup_landmark: '',
    dropoff_landmark: '',
    delivery_type: 'same_day',
    scheduled_date: '',
    scheduled_time: '',
    package_size: 'small',
    package_description: '',
    recipient_name: '',
    recipient_phone: ''
  }
  
  // Reset location data
  pickupLocation.value = null
  dropoffLocation.value = null
  pickupSearchQuery.value = ''
  dropoffSearchQuery.value = ''
  
  // Reset cost data
  costData.value = null
  distance.value = 0
  
  // Reset driver search states
  searchingDriver.value = false
  driverFound.value = false
  waitingForDriver.value = false
  driverInfo.value = null
  parcelId.value = null
  
  // Go back to step 1
  currentStep.value = 1
  
  // Clear markers from map
  if (pickupMarker.value) {
    map.value.removeLayer(pickupMarker.value)
    pickupMarker.value = null
  }
  if (dropoffMarker.value) {
    map.value.removeLayer(dropoffMarker.value)
    dropoffMarker.value = null
  }
}

// Handle WebSocket custom events from notificationService
const handleWebSocketEvent = (event) => {
  console.log('WebSocket event received:', event)
  
  // Handle different event formats
  let eventData = null
  
  if (event.detail) {
    // CustomEvent with detail
    eventData = event.detail
  } else if (event.event_type) {
    // Direct event object
    eventData = event
  } else if (event.type === 'custom_event' && event.data) {
    // Notification service format
    eventData = {
      event_type: event.data.event_type || event.data.type,
      data: event.data.data || event.data
    }
  }
  
  if (eventData && eventData.event_type) {
    handleDriverSearchUpdate(eventData)
  }
}

// Also listen for specific custom events dispatched by notificationService
const handleCustomEvent = (event) => {
  console.log('Custom event received:', event)
  if (event.detail) {
    handleDriverSearchUpdate(event.detail)
  }
}

onMounted(() => {
  initializeMap()
  
  // Set up WebSocket listener for driver search updates
  // Listen for custom events dispatched by notificationService
  window.addEventListener('customEvent', handleWebSocketEvent)
  
  // Also listen for specific parcel-related events
  window.addEventListener('searching_driver', handleCustomEvent)
  window.addEventListener('driver_found', handleCustomEvent)
  window.addEventListener('driver_accepted', handleCustomEvent)
  window.addEventListener('driver_declined', handleCustomEvent)
  window.addEventListener('driver_timeout', handleCustomEvent)
  window.addEventListener('no_driver_found', handleCustomEvent)
  window.addEventListener('admin_fallback', handleCustomEvent)
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showPickupSuggestions.value = false
      showDropoffSuggestions.value = false
    }
  })

  // Refresh drivers every 30 seconds
  driverInterval.value = setInterval(() => {
    if (map.value) {
      loadActiveDrivers()
    }
  }, 30000)
})

onUnmounted(() => {
  // Remove WebSocket listeners
  window.removeEventListener('customEvent', handleWebSocketEvent)
  window.removeEventListener('searching_driver', handleCustomEvent)
  window.removeEventListener('driver_found', handleCustomEvent)
  window.removeEventListener('driver_accepted', handleCustomEvent)
  window.removeEventListener('driver_declined', handleCustomEvent)
  window.removeEventListener('driver_timeout', handleCustomEvent)
  window.removeEventListener('no_driver_found', handleCustomEvent)
  window.removeEventListener('admin_fallback', handleCustomEvent)
  
  // Clear driver refresh interval
  if (driverInterval.value) {
    clearInterval(driverInterval.value)
  }
  
  // Clear driver markers
  driverMarkers.value.forEach(marker => {
    if (map.value) {
      map.value.removeLayer(marker)
    }
  })
  driverMarkers.value = []
  
  if (map.value) {
    map.value.remove()
  }
})
</script>

<style scoped>
#parcel-map {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.leaflet-control-attribution {
  display: none !important;
}

/* Ensure leaflet container doesn't overlap bottom sheet */
.leaflet-container {
  z-index: 1 !important;
}

/* Ensure leaflet panes stay below bottom sheet */
.leaflet-pane {
  z-index: auto !important;
}

/* Ensure markers are visible but below bottom sheet */
.leaflet-marker-pane {
  z-index: 10 !important;
}

.leaflet-popup-pane {
  z-index: 15 !important;
}

/* Driver marker styling */
.driver-marker {
  background: transparent !important;
  border: none !important;
}
</style>

