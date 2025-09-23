<template>
  <div>
    <!-- Normal Home Interface -->
    <div v-if="!shouldShowPharmacyInterface" class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div class="p-4 pb-24">
      <!-- Enhanced Header -->
      <AppHeader />

      <!-- Select Default Store Category Dialog -->
      <Transition name="dialog">
        <div v-if="showStoreDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg transform transition-all duration-300">
            <!-- Header -->
            <div class="p-8 pb-6">
              <h3 class="text-2xl font-bold text-center text-slate-900 mb-2">Choose Your Store</h3>
              <p class="text-center text-slate-600 text-sm leading-relaxed">Select a store category to personalize your shopping experience</p>
              <div class="mt-3 text-center">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                  Required
                </span>
              </div>
            </div>

            <!-- Categories List -->
            <div class="px-8 pb-6">
              <div class="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
                <button v-for="cat in storeCategories" :key="cat.id"
                        @click="selectDefaultStore(cat.id)"
                        class="group w-full text-left p-4 rounded-2xl border border-slate-200/60 hover:border-blue-400 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-white/80 backdrop-blur-sm">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-indigo-100 transition-all duration-300">
                      <svg class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">{{ cat.name }}</div>
                      <div class="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">{{ cat.description || 'Explore amazing products' }}</div>
                    </div>
                    <div class="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                      <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-8 pb-8">
              <div class="text-center">
                <div class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-sm text-blue-700 font-medium">Please select a store category to continue</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Popular Products Section -->
      <div v-if="productStore.popularProducts.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">Popular Products</h2>
            <p class="text-sm text-slate-600">Trending items you'll love</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">🔥</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- Popular products with horizontal scroll -->
        <div v-else class="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div class="flex gap-4 pb-2">
            <div 
              v-for="product in productStore.popularProducts.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-44 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-40 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold text-slate-700">🔥</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-sm font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-blue-600">
                    {{ formatApiPrice(product) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- New Arrivals Section -->
      <div v-if="productStore.newArrivals.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">New Arrivals</h2>
            <p class="text-sm text-slate-600">Fresh products just for you</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">✨</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- New arrivals with horizontal scroll -->
        <div v-else class="overflow-x-auto overflow-y-hidden scrollbar-hide">
          <div class="flex gap-4 pb-2">
            <div 
              v-for="product in productStore.newArrivals.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-72 h-40 bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="flex h-full">
                <div class="relative w-32 h-full flex-shrink-0">
                  <img 
                    :src="product.main_image || packagingImage" 
                    class="w-full h-full object-cover" 
                    alt="Product"
                  />
                  <div class="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <span class="text-xs font-bold text-slate-700">✨</span>
                  </div>
                </div>
                <div class="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h3 class="text-sm font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                    <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                  </div>
                  <div class="flex items-center justify-between">
                    <div>
                      <span 
                        v-if="product.original_price && product.original_price > product.price"
                        class="text-xs line-through text-slate-500 mr-2"
                      >
                        {{ formatApiPrice({ price: product.original_price }) }}
                      </span>
                      <span class="text-sm font-semibold text-blue-600">
                        {{ formatApiPrice(product) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommended Products Section -->
      <div v-if="productStore.recommendedProducts.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">Recommended For You</h2>
            <p class="text-sm text-slate-600">Personalized picks just for you</p>
          </div>
          <div class="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <span class="text-white text-xs font-bold">💫</span>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center my-8">
          <div class="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
            <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-2xl mb-4 flex items-center space-x-2">
          <div class="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
            <span class="text-red-600 text-xs">!</span>
          </div>
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- Recommended products in 2x2 grid -->
        <div v-else>
          <div class="grid grid-cols-2 gap-4">
            <div 
              v-for="product in productStore.recommendedProducts.slice(0, 4)" 
              :key="product.id"
              class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-100 hover:border-gray-200"
              @click="navigateToDetails(product.id)"
            >
              <div class="relative">
                <img 
                  :src="product.main_image || packagingImage" 
                  class="w-full h-32 object-cover" 
                  alt="Product"
                />
                <div class="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span class="text-xs font-bold text-slate-700">💫</span>
                </div>
              </div>
              <div class="p-3">
                <h3 class="text-xs font-medium mb-1 line-clamp-2 capitalize text-slate-900">{{ product.name }}</h3>
                <p class="text-xs text-slate-600 mb-2 truncate">{{ product.seller_name || 'weCare' }}</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm font-semibold text-blue-600">
                    {{ formatApiPrice(product) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>

    <!-- Pharmacy Interface -->
    <div v-else class="pharmacy-map-container relative">
      <!-- Full-screen OpenStreetMap -->
      <div id="pharmacy-map" class="w-full h-screen"></div>
      
      <!-- Search animation overlay on map -->
      <div v-if="isSearching" class="absolute inset-0 pointer-events-none z-40">
        <!-- Animated search ripples -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div class="search-ripple-1"></div>
          <div class="search-ripple-2"></div>
          <div class="search-ripple-3"></div>
          
          <!-- Central search icon -->
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        
        <!-- Search status overlay -->
        <div class="absolute bottom-32 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg">
          <div class="flex items-center space-x-3">
            <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div class="text-sm">
              <div class="font-semibold text-slate-900">Searching {{ searchRadius }}km radius</div>
              <div class="text-slate-600">{{ searchTimer }}s elapsed</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Transparent floating top bar -->
      <div class="absolute top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <div class="pointer-events-auto">
        <div class="flex items-center justify-center">
          <!-- Location pill -->
          <div class="flex-1 max-w-xs">
            <div class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div class="flex items-center justify-center space-x-2">
                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="text-sm font-medium text-slate-700">{{ currentLocationText }}</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Draggable bottom sheet -->
      <div 
        class="absolute bottom-0 left-0 right-0 transition-all duration-200 ease-out" 
        :style="{ height: `${bottomSheetHeight}px`, zIndex: 9999 }"
      >
        <!-- Handle for dragging -->
        <div 
          class="flex justify-center py-2 cursor-grab active:cursor-grabbing"
          @mousedown="startDrag"
          @touchstart="startDrag"
        >
          <div class="w-8 h-1 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors"></div>
        </div>
        
        <!-- Bottom sheet content -->
        <div class="bg-white rounded-t-3xl shadow-2xl h-full overflow-hidden flex flex-col">
          <!-- Search Status Display (when searching) -->
          <div v-if="isSearching" class="p-4 flex-1 overflow-y-auto">
            <div class="text-center mb-4">
              <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">Searching Pharmacies</h3>
              <p class="text-sm text-slate-600">{{ searchStatus.currentStep }}</p>
              <div class="text-xs text-slate-500 mt-1">{{ searchTimer }}s elapsed • {{ searchRadius }}km radius</div>
            </div>
            
            <!-- Search Progress Messages -->
            <div class="space-y-2 mb-4">
              <h4 class="text-sm font-semibold text-slate-700 mb-2">Search Activity:</h4>
              <div class="max-h-32 overflow-y-auto space-y-1">
                <div v-for="message in searchStatus.messages" :key="message.id" 
                  class="flex items-start space-x-2 text-xs p-2 rounded-lg"
                  :class="{
                    'bg-blue-50 text-blue-700': message.type === 'info',
                    'bg-green-50 text-green-700': message.type === 'success',
                    'bg-yellow-50 text-yellow-700': message.type === 'warning',
                    'bg-red-50 text-red-700': message.type === 'error'
                  }"
                >
                  <div class="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                    :class="{
                      'bg-blue-500': message.type === 'info',
                      'bg-green-500': message.type === 'success',
                      'bg-yellow-500': message.type === 'warning',
                      'bg-red-500': message.type === 'error'
                    }"
                  ></div>
                  <div class="flex-1">
                    <div class="font-medium">{{ message.message }}</div>
                    <div class="text-slate-500 text-xs">{{ message.timestamp }}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contacted Pharmacies -->
            <div v-if="searchStatus.selectedPharmacies.length > 0" class="mb-4">
              <h4 class="text-sm font-semibold text-slate-700 mb-2">
                Contacted Pharmacies ({{ searchStatus.selectedPharmacies.length }}):
              </h4>
              <div class="space-y-1">
                <div v-for="pharmacy in searchStatus.selectedPharmacies" :key="pharmacy.name"
                  class="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg"
                >
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span class="font-medium">{{ pharmacy.name }}</span>
                  </div>
                  <div class="flex items-center space-x-2 text-slate-500">
                    <span>{{ pharmacy.distance }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full"
                      :class="{
                        'bg-blue-100 text-blue-700': pharmacy.status === 'contacted',
                        'bg-green-100 text-green-700': pharmacy.status === 'responding',
                        'bg-yellow-100 text-yellow-700': pharmacy.status === 'declined'
                      }"
                    >
                      {{ pharmacy.status }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Response Counter -->
            <div v-if="searchStatus.responseCount > 0" class="text-center">
              <div class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                {{ searchStatus.responseCount }} offer{{ searchStatus.responseCount > 1 ? 's' : '' }} received
              </div>
            </div>
          </div>
          
          <!-- Collapsed state: Quick actions -->
          <div v-else-if="!isExpanded" class="p-6">
            <div class="text-center mb-6">
              <div class="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z"></path>
                </svg>
              </div>
              <h2 class="text-xl font-bold text-slate-900 mb-2">Pharmacy Request</h2>
              <p class="text-sm text-slate-600">Request medicines from nearby pharmacies</p>
            </div>

            <!-- Show submitted medicines if any -->
            <div v-if="submittedMedicines.length > 0" class="mb-4 space-y-2">
              <h3 class="text-sm font-medium text-slate-700 mb-2">Submitted Requests ({{ submittedMedicines.length }}):</h3>
              <div v-for="medicine in submittedMedicines" :key="medicine.id" 
                class="bg-green-50 border border-green-200 rounded-lg p-3 text-sm hover:bg-green-100 transition-colors duration-200 cursor-pointer">
                <div class="flex justify-between items-start">
                  <div @click="editMedicine(medicine)" class="flex-1">
                    <p class="font-medium text-green-900">{{ medicine.name }}</p>
                    <p class="text-green-700">Qty: {{ medicine.quantity }}{{ medicine.form ? ` (${medicine.form})` : '' }}</p>
                    <p v-if="medicine.urgency === 'asap'" class="text-red-600 text-xs font-medium">URGENT</p>
                    <p class="text-xs text-blue-600 mt-1">Click to edit</p>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="text-xs text-green-600">
                      {{ medicine.submittedAt }}
                    </div>
                    <button @click.stop="removeMedicine(medicine.id)" 
                      class="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors duration-200">
                      <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-3">
              <button @click="expandBottomSheet" 
                class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-2xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                {{ submittedMedicines.length > 0 ? 'Add Another Medicine' : 'Add Medicine' }}
              </button>
              
              <!-- Submit all button (only show when there are medicines) -->
              <button v-if="submittedMedicines.length > 0" 
                @click="submitAllRequests" 
                :disabled="isSubmitting"
                :class="[
                  'w-full py-4 rounded-2xl font-semibold shadow-lg transition-all duration-200',
                  !isSubmitting
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                ]"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting Requests...
                </span>
                <span v-else>Submit All Requests ({{ submittedMedicines.length }})</span>
              </button>
            </div>
          </div>

          <!-- Expanded state: Request composer -->
          <div v-else class="flex-1 p-6 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ isEditing ? 'Edit Medicine' : 'Request Medicine' }}
                </h2>
                <p v-if="isEditing" class="text-sm text-blue-600 mt-1">Updating existing medicine request</p>
              </div>
              <button @click="cancelEdit" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>

            <!-- Medicine request form -->
            <div class="space-y-4">
              <!-- Medicine name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Medicine Name</label>
                <input 
                  v-model="medicineRequest.name" 
                  type="text" 
                  placeholder="Enter medicine name..."
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Quantity -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                <input 
                  v-model="medicineRequest.quantity" 
                  type="number" 
                  placeholder="1"
                  min="1"
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <!-- Form (optional) -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Form (Optional)</label>
                <select 
                  v-model="medicineRequest.form" 
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select form...</option>
                  <option value="tablet">Tablet</option>
                  <option value="capsule">Capsule</option>
                  <option value="syrup">Syrup</option>
                  <option value="injection">Injection</option>
                  <option value="cream">Cream</option>
                  <option value="drops">Drops</option>
                </select>
              </div>

              <!-- Urgency -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Urgency</label>
                <div class="flex space-x-3">
                  <button 
                    @click="medicineRequest.urgency = 'normal'"
                    :class="[
                      'flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200',
                      medicineRequest.urgency === 'normal' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    ]"
                  >
                    Normal
                  </button>
                  <button 
                    @click="medicineRequest.urgency = 'asap'"
                    :class="[
                      'flex-1 py-3 px-4 rounded-xl border-2 transition-all duration-200',
                      medicineRequest.urgency === 'asap' 
                        ? 'border-red-500 bg-red-50 text-red-700' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    ]"
                  >
                    ASAP
                  </button>
                </div>
              </div>

              <!-- Search radius -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Search Radius: {{ searchRadius }}km</label>
                <input 
                  v-model="searchRadius" 
                  type="range" 
                  min="1" 
                  max="20" 
                  step="1"
                  class="w-full"
                />
                <div class="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1km</span>
                  <span>20km</span>
                </div>
              </div>

              <!-- Additional notes -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Additional Notes (Optional)</label>
                <textarea 
                  v-model="medicineRequest.additional_notes" 
                  placeholder="Any additional information..."
                  rows="3"
                  class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Submit button -->
            <div class="mt-6 pt-4 border-t border-slate-100">
              <button 
                @click="submitRequest" 
                :disabled="!canSubmit || isSubmitting"
                :class="[
                  'w-full py-4 rounded-2xl font-semibold shadow-lg transition-all duration-200',
                  canSubmit && !isSubmitting
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                ]"
                style="background: linear-gradient(to right, #2563eb, #9333ea);"
              >
                <span v-if="isSubmitting" class="flex items-center justify-center">
                  <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Searching Pharmacies...
                </span>
                <span v-else>{{ isEditing ? 'Update Medicine' : 'Send Request' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Retry Options UI (appears when no pharmacies found) -->
      <div v-if="showRetryOptions" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">No Pharmacies Found</h3>
          <p class="text-sm text-slate-600 mb-6">No pharmacies responded within {{ searchRadius }}km. Your request has been sent to our admin team.</p>
          
          <!-- Retry Options (pharmacy-flow.txt lines 132-136) -->
          <div class="space-y-3">
            <button @click="expandRadius" class="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
              Expand Radius ({{ searchRadius + 5 }}km)
            </button>
            <button @click="retrySearch" class="w-full py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              Try Again
            </button>
            <button @click="notifyWhenAvailable" class="w-full py-3 px-4 bg-green-100 text-green-700 rounded-xl font-medium hover:bg-green-200 transition-colors">
              Notify When Available
            </button>
            <button @click="closeRetryOptions" class="w-full py-2 px-4 text-slate-500 rounded-xl font-medium hover:text-slate-700 transition-colors">
              Keep Medicines & Close
            </button>
          </div>
        </div>
      </div>

      <!-- Pharmacy Offers Modal (pharmacy-flow.txt lines 213-216) -->
      <div v-if="showOffersModal" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-6 mx-4 max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <h3 class="text-xl font-bold text-slate-900">Pharmacy Offers</h3>
            <button @click="closeOffersModal" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Offers List -->
          <div class="flex-1 overflow-y-auto space-y-3">
            <div v-for="offer in pharmacyOffers" :key="offer.id" class="border border-slate-200 rounded-2xl p-4 hover:border-blue-300 transition-colors">
              <!-- Pharmacy Info -->
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-semibold text-slate-900">{{ offer.pharmacy_name || 'Pharmacy' }}</h4>
                  <div class="flex items-center space-x-2 mt-1">
                    <!-- Rating -->
                    <div class="flex items-center">
                      <svg class="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <span class="text-sm text-slate-600 ml-1">{{ offer.pharmacy_rating || '4.5' }}</span>
                    </div>
                    <!-- Distance -->
                    <span class="text-sm text-slate-500">•</span>
                    <span class="text-sm text-slate-600">{{ offer.distance_km || '2.1' }}km</span>
                  </div>
                </div>
                <!-- Price -->
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600">${{ offer.total_price || offer.price || '25.00' }}</div>
                  <div class="text-xs text-slate-500">{{ offer.eta || '30 min' }} ETA</div>
                </div>
              </div>
              
              <!-- Offer Details -->
              <div v-if="offer.message" class="text-sm text-slate-600 mb-3 bg-slate-50 rounded-lg p-2">
                {{ offer.message }}
              </div>
              
              <!-- Action Buttons -->
              <div class="flex space-x-2">
                <button @click="acceptOffer(offer)" class="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                  Accept Offer
                </button>
                <button @click="chatWithPharmacy(offer)" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </button>
                <button @click="callPharmacy(offer)" class="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </button>
                <button @click="viewRoute(offer)" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <!-- No Offers Message -->
          <div v-if="pharmacyOffers.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7"></path>
              </svg>
            </div>
            <p class="text-slate-600">No offers received yet...</p>
          </div>
        </div>
      </div>

      <!-- Delivery Choice Modal (pharmacy-flow.txt lines 222-243) -->
      <div v-if="showDeliveryChoice" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-6 mx-4 max-w-md w-full shadow-2xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Choose Delivery Option</h3>
            <p class="text-sm text-slate-600">How would you like to receive your medicines?</p>
          </div>
          
          <!-- Delivery Options -->
          <div class="space-y-4 mb-6">
            <!-- Option 1: Use Delivery Service -->
            <button @click="chooseDelivery" class="w-full p-4 border-2 border-slate-200 rounded-2xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all group">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-slate-900 mb-1">Delivery Service</h4>
                  <p class="text-sm text-slate-600 mb-2">We'll deliver to your location</p>
                  <div class="text-xs text-slate-500">
                    <div>• Delivery fee: $2.50</div>
                    <div>• Estimated time: 25-40 minutes</div>
                    <div>• Provider: AfriQ Express Delivery</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600">$2.50</div>
                  <div class="text-xs text-slate-500">+ order total</div>
                </div>
              </div>
            </button>
            
            <!-- Option 2: Pick up myself -->
            <button @click="choosePickup" class="w-full p-4 border-2 border-slate-200 rounded-2xl text-left hover:border-green-300 hover:bg-green-50 transition-all group">
              <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <div class="flex-1">
                  <h4 class="font-semibold text-slate-900 mb-1">Pick up myself</h4>
                  <p class="text-sm text-slate-600 mb-2">Collect from pharmacy directly</p>
                  <div class="text-xs text-slate-500">
                    <div>• No delivery fee</div>
                    <div>• Ready for pickup: 15-30 minutes</div>
                    <div>• Pharmacy: {{ selectedOffer?.pharmacy_name || 'Selected Pharmacy' }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-lg font-bold text-green-600">FREE</div>
                  <div class="text-xs text-slate-500">Self pickup</div>
                </div>
              </div>
            </button>
          </div>
          
          <!-- Cancel Button -->
          <button @click="closeDeliveryChoice" class="w-full py-3 px-4 text-slate-500 rounded-xl font-medium hover:text-slate-700 hover:bg-slate-100 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      <!-- Searching overlay -->
      <div v-if="isSearching" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div class="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 class="text-lg font-bold text-slate-900 mb-2">Searching Pharmacies</h3>
          <p class="text-sm text-slate-600 mb-4">Broadcasting your request to nearby pharmacies...</p>
          <div class="text-xs text-slate-500">
            <div class="flex items-center justify-center space-x-1 mb-2">
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <span>{{ searchRadius }}km radius • {{ searchTimer }}s</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed, ref, watch, nextTick } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useRouter } from 'vue-router'
import packagingImage from '@/assets/packaging_10471395.png'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { usePharmacyStore } from '@/stores/pharmacy'
import { useCurrency } from '@/composables/useCurrency'
import AppHeader from '@/components/AppHeader.vue'
import apiService from '@/services/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const productStore = useProductStore()
const cart = useCartStore()
const router = useRouter()
const notification = useNotificationStore()
const auth = useAuthStore()
const pharmacyStore = usePharmacyStore()
const { formatApiPrice } = useCurrency()

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const showStoreDialog = ref(false)
const storeCategories = ref([])

// Check if pharmacy interface should be shown
const shouldShowPharmacyInterface = computed(() => pharmacyStore.shouldShowPharmacyInterface)

// Pharmacy-related reactive data
const map = ref(null)
const currentLocationText = ref('Lomé, Togo')
const isExpanded = ref(false)
const isSubmitting = ref(false)
const isSearching = ref(false)
const searchRadius = ref(5)
const searchTimer = ref(0)
const showRetryOptions = ref(false)
const pharmacyOffers = ref([])
const showOffersModal = ref(false)
const pharmacyMarkers = ref([])
const bottomSheetHeight = ref(300) // Default collapsed height
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartHeight = ref(0)
const showDeliveryChoice = ref(false)
const selectedOffer = ref(null)
let searchInterval = null

// Search status tracking (pharmacy-flow.txt implementation)
const searchStatus = ref({
  isSearching: false,
  messages: [],
  currentStep: '',
  searchStartTime: null,
  foundOffers: [],
  selectedPharmacies: [],
  responseCount: 0
})

// WebSocket for real-time updates (would be replaced with actual WebSocket)
let searchStatusInterval = null

// Medicine request form data
const medicineRequest = ref({
  name: '',
  quantity: 1,
  form: '',
  urgency: 'normal',
  additional_notes: ''
})

// Track submitted medicines for multiple requests
const submittedMedicines = ref([])

// Edit mode state
const isEditing = ref(false)
const editingMedicineId = ref(null)

// Computed properties
const canSubmit = computed(() => {
  return medicineRequest.value.name.trim() && medicineRequest.value.quantity > 0
})

const navigateToProfile = () => {
  router.push({ name: 'Profile' })
}

const navigateToDetails = (productId) => {
  router.push({ name: 'ProductDetails', params: { id: productId } })
}

onMounted(async () => {
  console.log('Home page mounted - starting initialization')

  try {
    // Initialize cart state
    cart.initCartState()
    console.log('Cart state initialized')

    await Promise.all([
      cart.fetchCart().then(() => console.log('Cart fetched')).catch(err => {
        console.error('Cart fetch failed, continuing anyway:', err)
      })
    ])

    // init notification store
    await notification.init()

    // Initialize pharmacy store from session
    await pharmacyStore.initializeFromSession()

    console.log('Starting to fetch products...')

          // Ensure default store category is set in session
      try {
        const resp = await apiService.getStoreCategories({ is_active: true })
        storeCategories.value = resp.data?.results || resp.data || []
        const defaultStore = sessionStorage.getItem('defaultStore')
        if (!defaultStore) {
          showStoreDialog.value = true
        }
      } catch (e) {
        console.warn('Failed to load store categories on Home:', e)
      }

    // Fetch popular products, new arrivals, and store-filtered products
    const defaultStore = sessionStorage.getItem('defaultStore')
    const params = defaultStore ? { store_category: defaultStore } : {}
    await Promise.all([
      productStore.fetchPopularProducts(params),
      productStore.fetchNewArrivals(params),
    ])

    // Fetch products for selected store category (defaultStore) for home sections
    if (defaultStore && productStore.setStoreProducts) {
      try {
        const { data } = await apiService.getProducts({ store_category: defaultStore, page_size: 12 })
        productStore.setStoreProducts(data?.results || data || [])
      } catch (e) {
        console.warn('Failed to load products by store category for home:', e)
      }
    }
  } catch (error) {
    console.error('Error during Home page initialization:', error)
  }
})

// Watch for pharmacy interface activation to initialize map
watch(shouldShowPharmacyInterface, async (newValue) => {
  if (newValue) {
    console.log('🗺️ Pharmacy interface activated, initializing map...')
    // Wait for DOM to update
    await nextTick()
    // Initialize map after a small delay to ensure DOM is ready
    setTimeout(() => {
      initializeMap()
      // Load pharmacy pins after map initialization (pharmacy-flow.txt line 70)
      setTimeout(loadPharmacyMarkers, 500)
    }, 100)
  } else {
    console.log('🗺️ Pharmacy interface deactivated, cleaning up...')
    // Cleanup map when leaving pharmacy interface
    if (map.value) {
      map.value.remove()
      map.value = null
    }
    if (searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    }
  }
}, { immediate: true })

const navigateToNotification = () => {
  router.push({ name: 'Notification' })
}

// Pharmacy methods (kept for potential future use)
const exitPharmacyMode = () => {
  pharmacyStore.resetPharmacyState()
  // Reset medicine request form
  medicineRequest.value = {
    name: '',
    quantity: 1,
    form: '',
    urgency: 'normal',
    additional_notes: ''
  }
  isExpanded.value = false
  isSubmitting.value = false
  isSearching.value = false
  if (searchInterval) {
    clearInterval(searchInterval)
    searchInterval = null
  }
  if (map.value) {
    map.value.remove()
    map.value = null
  }
}

const expandBottomSheet = () => {
  // Reset edit mode when adding new medicine
  if (isEditing.value) {
    isEditing.value = false
    editingMedicineId.value = null
    medicineRequest.value = {
      name: '',
      quantity: 1,
      form: '',
      urgency: 'normal',
      additional_notes: ''
    }
  }
  isExpanded.value = true
  // Set bottom sheet to expanded height to show the form and submit button
  bottomSheetHeight.value = window.innerHeight * 0.7
}

const collapseBottomSheet = () => {
  isExpanded.value = false
  // Reset to collapsed height
  bottomSheetHeight.value = 300
}

const submitRequest = () => {
  if (!canSubmit.value) return
  
  if (isEditing.value) {
    // Update existing medicine
    const medicineIndex = submittedMedicines.value.findIndex(med => med.id === editingMedicineId.value)
    if (medicineIndex > -1) {
      submittedMedicines.value[medicineIndex] = {
        ...submittedMedicines.value[medicineIndex],
        name: medicineRequest.value.name,
        quantity: medicineRequest.value.quantity,
        form: medicineRequest.value.form,
        urgency: medicineRequest.value.urgency,
        submittedAt: new Date().toLocaleTimeString() // Update timestamp
      }
      
      console.log('Medicine updated:', submittedMedicines.value[medicineIndex])
      
      notification.addNotification({
        type: 'success',
        title: 'Medicine Updated!',
        message: `${medicineRequest.value.name} has been updated successfully.`
      })
    }
  } else {
    // Add new medicine to the local list (no API call)
    submittedMedicines.value.push({
      id: Date.now(), // Simple unique ID
      name: medicineRequest.value.name,
      quantity: medicineRequest.value.quantity,
      form: medicineRequest.value.form,
      urgency: medicineRequest.value.urgency,
      submittedAt: new Date().toLocaleTimeString()
    })

    console.log('Medicine added locally:', medicineRequest.value)
    
    notification.addNotification({
      type: 'success',
      title: 'Medicine Added!',
      message: `${submittedMedicines.value[submittedMedicines.value.length - 1].name} has been added to your request list.`
    })
  }

  // Reset form after adding/updating medicine
  medicineRequest.value = {
    name: '',
    quantity: 1,
    form: '',
    urgency: 'normal',
    additional_notes: ''
  }
  
  // Reset edit mode
  isEditing.value = false
  editingMedicineId.value = null
  
  // Collapse bottom sheet to show the list
  isExpanded.value = false
}

const editMedicine = (medicine) => {
  // Populate form with medicine data
  medicineRequest.value = {
    name: medicine.name,
    quantity: medicine.quantity,
    form: medicine.form,
    urgency: medicine.urgency,
    additional_notes: medicine.additional_notes || ''
  }
  
  // Set edit mode
  isEditing.value = true
  editingMedicineId.value = medicine.id
  
  // Expand form
  isExpanded.value = true
  
  console.log('Editing medicine:', medicine)
}

const cancelEdit = () => {
  // Reset form
  medicineRequest.value = {
    name: '',
    quantity: 1,
    form: '',
    urgency: 'normal',
    additional_notes: ''
  }
  
  // Reset edit mode
  isEditing.value = false
  editingMedicineId.value = null
  
  // Collapse form
  isExpanded.value = false
}

const removeMedicine = (medicineId) => {
  const medicineIndex = submittedMedicines.value.findIndex(medicine => medicine.id === medicineId)
  if (medicineIndex > -1) {
    const removedMedicine = submittedMedicines.value[medicineIndex]
    submittedMedicines.value.splice(medicineIndex, 1)
    
    notification.addNotification({
      type: 'info',
      title: 'Medicine Removed',
      message: `${removedMedicine.name} has been removed from your request list.`
    })
  }
}

const submitAllRequests = async () => {
  if (submittedMedicines.value.length === 0 || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // Get user location
    let userLocation = { latitude: 6.13, longitude: 1.22 } // Default to Lomé
    
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000
          })
        })
        userLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }
      } catch (geoError) {
        console.warn('Could not get precise location, using default:', geoError)
      }
    }

    // Prepare request data with all medicines
    const requestData = {
      pickup_latitude: userLocation.latitude,
      pickup_longitude: userLocation.longitude,
      search_radius_km: searchRadius.value,
      urgency: 'normal', // Use default or could be based on highest priority
      items: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form || null
      }))
    }

    console.log('Submitting all medicine requests:', requestData)

    // Submit all requests to backend
    const response = await apiService.createMedicineRequest(requestData)
    const createdRequest = response.data

    console.log('All medicine requests created:', createdRequest)

    // Start searching animation and reduce bottom sheet height
    isSubmitting.value = false
    isSearching.value = true
    searchTimer.value = 0
    
    // Reduce bottom sheet height during search (as requested)
    bottomSheetHeight.value = 200
    isExpanded.value = false
    
    // Initialize search status
    searchStatus.value = {
      isSearching: true,
      messages: [],
      currentStep: 'Initializing search...',
      searchStartTime: Date.now(),
      foundOffers: [],
      selectedPharmacies: [],
      responseCount: 0
    }
    
    // Start search timer
    searchInterval = setInterval(() => {
      searchTimer.value++
    }, 1000)
    
    // Start real-time search status updates
    startSearchStatusUpdates(createdRequest.id)

    // Store request ID for tracking
    sessionStorage.setItem('currentMedicineRequestId', createdRequest.id)

    // DON'T clear medicines - keep them for potential retry (pharmacy-flow.txt line 249)
    // submittedMedicines.value = [] // REMOVED - keep medicines for retry

    // Simulate waiting for pharmacy responses (in real implementation, use WebSocket)
    setTimeout(async () => {
      try {
        // Check for offers
        const offersResponse = await apiService.getPharmacyOffers(createdRequest.id)
        const offers = offersResponse.data

        isSearching.value = false
        stopSearchStatusUpdates()
        if (searchInterval) {
          clearInterval(searchInterval)
          searchInterval = null
        }

        if (offers && offers.length > 0) {
          // Navigate to offers page or show offers
          // Stop search animation
          isSearching.value = false
          if (searchInterval) {
            clearInterval(searchInterval)
            searchInterval = null
          }
          
          // Increase bottom sheet height to show search results properly
          bottomSheetHeight.value = window.innerHeight * 0.75 // 75% of screen height for offers
          isExpanded.value = true
          
          // Store offers and show them (pharmacy-flow.txt lines 213-216)
          pharmacyOffers.value = offers
          showOffersModal.value = true
          
          notification.addNotification({
            type: 'success',
            title: 'Pharmacy Responses Received!',
            message: `${offers.length} pharmacy(ies) responded to your request.`
          })
          
          console.log('Received offers:', offers)
        } else {
          // No offers received - implement pharmacy-flow.txt lines 249-251
          handleNoResponseTimeout(createdRequest.id)
        }
      } catch (error) {
        console.error('Error checking offers:', error)
        isSearching.value = false
        if (searchInterval) {
          clearInterval(searchInterval)
          searchInterval = null
        }
        notification.addNotification({
          type: 'error',
          title: 'Search Error',
          message: 'There was an error checking for pharmacy responses.'
        })
      }
    }, 8000) // Wait 8 seconds for responses

  } catch (error) {
    console.error('Error submitting all medicine requests:', error)
    isSubmitting.value = false
    
    let errorMessage = 'Failed to submit medicine requests. Please try again.'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.response?.data?.error) {
      errorMessage = error.response.data.error
    }
    
    notification.addNotification({
      type: 'error',
      title: 'Request Failed',
      message: errorMessage
    })
  }
}

// Real-time search status updates function
const startSearchStatusUpdates = (requestId) => {
  // Clear any existing status updates
  if (searchStatusInterval) {
    clearInterval(searchStatusInterval)
  }
  
  let stepIndex = 0
  const statusSteps = [
    'Broadcasting request to nearby pharmacies...',
    'Analyzing pharmacy availability...',
    'Contacting pharmacy systems...',
    'Waiting for pharmacy responses...',
    'Processing incoming offers...'
  ]
  
  // Add initial message
  addSearchMessage('Request sent successfully', 'success')
  
  searchStatusInterval = setInterval(() => {
    // Update current step
    if (stepIndex < statusSteps.length) {
      searchStatus.value.currentStep = statusSteps[stepIndex]
      addSearchMessage(statusSteps[stepIndex], 'info')
      stepIndex++
    }
    
    // Simulate some pharmacy responses for demo
    if (searchTimer.value >= 3 && searchStatus.value.selectedPharmacies.length === 0) {
      simulatePharmacyResponses()
    }
    
    // Stop after 10 seconds if no real responses
    if (searchTimer.value >= 10) {
      clearInterval(searchStatusInterval)
      searchStatusInterval = null
    }
  }, 2000) // Update every 2 seconds
}

// Add search status message
const addSearchMessage = (message, type = 'info') => {
  const timestamp = new Date().toLocaleTimeString()
  searchStatus.value.messages.push({
    id: Date.now(),
    message,
    type,
    timestamp
  })
  
  // Keep only last 5 messages
  if (searchStatus.value.messages.length > 5) {
    searchStatus.value.messages.shift()
  }
}

// Simulate pharmacy responses for demo (replace with real WebSocket data)
const simulatePharmacyResponses = () => {
  const demoPharmacies = [
    { name: 'PharmaCare Plus', status: 'contacted', distance: '1.2km' },
    { name: 'HealthLine Pharmacy', status: 'responding', distance: '2.8km' },
    { name: 'MediCenter Togo', status: 'contacted', distance: '0.9km' }
  ]
  
  demoPharmacies.forEach((pharmacy, index) => {
    setTimeout(() => {
      searchStatus.value.selectedPharmacies.push(pharmacy)
      addSearchMessage(`Request sent to ${pharmacy.name}`, 'success')
      
      // Simulate response
      setTimeout(() => {
        if (pharmacy.status === 'responding') {
          searchStatus.value.responseCount++
          addSearchMessage(`${pharmacy.name} is preparing an offer`, 'success')
        } else {
          addSearchMessage(`${pharmacy.name} declined - out of stock`, 'warning')
        }
      }, 1500 + (index * 500))
    }, index * 1000)
  })
}

// Stop search status updates
const stopSearchStatusUpdates = () => {
  if (searchStatusInterval) {
    clearInterval(searchStatusInterval)
    searchStatusInterval = null
  }
  searchStatus.value.isSearching = false
}

// Handle no response timeout according to pharmacy-flow.txt lines 249-251
const handleNoResponseTimeout = async (requestId) => {
  console.log('⏰ No pharmacy responses received for request:', requestId)
  
  // Stop the search animation and status updates
  isSearching.value = false
  stopSearchStatusUpdates()
  if (searchInterval) {
    clearInterval(searchInterval)
    searchInterval = null
  }
  
  // Update UI to show no pharmacy found message (pharmacy-flow.txt line 249)
  notification.addNotification({
    type: 'warning',
    title: 'No Pharmacies Found',
    message: 'No pharmacies responded to your request. Your request has been sent to our admin team for manual assistance.'
  })
  
  // Show retry options UI (pharmacy-flow.txt lines 132-136, 249)
  // Increase bottom sheet height to show retry options properly
  bottomSheetHeight.value = window.innerHeight * 0.6 // 60% of screen height for retry options
  isExpanded.value = true
  showRetryOptions.value = true
  
  try {
    // Send Discord notification to live_search channel with random admin mention
    // (pharmacy-flow.txt line 251)
    await apiService.post('/orders/medicine-requests/notify-admin/', {
      request_id: requestId,
      type: 'no_responses'
    })
    
    console.log('✅ Discord notification sent to admin team')
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error)
  }
}

// Retry options functions (pharmacy-flow.txt lines 132-136)
const expandRadius = () => {
  searchRadius.value += 5
  showRetryOptions.value = false
  // Automatically retry with expanded radius
  retrySearch()
}

const retrySearch = () => {
  showRetryOptions.value = false
  // Restart the search with current medicines
  sendMedicineRequestsToPharmacies()
}

const notifyWhenAvailable = async () => {
  try {
    // Set up notification for when pharmacies become available
    await apiService.post('/orders/medicine-requests/watch/', {
      medicines: submittedMedicines.value,
      radius: searchRadius.value,
      shopper_location: {
        latitude: userLocation.value?.lat || 6.13,
        longitude: userLocation.value?.lng || 1.22
      }
    })
    
    notification.addNotification({
      type: 'success',
      title: 'Watch Set Up',
      message: 'We\'ll notify you when pharmacies become available in your area.'
    })
    
    showRetryOptions.value = false
  } catch (error) {
    console.error('Error setting up watch:', error)
    notification.addNotification({
      type: 'error',
      title: 'Watch Failed',
      message: 'Could not set up pharmacy availability watch. Please try again.'
    })
  }
}

const closeRetryOptions = () => {
  showRetryOptions.value = false
  // Keep medicines in the list for future use (pharmacy-flow.txt line 249)
}

// Offer handling functions (pharmacy-flow.txt lines 215-217)
const closeOffersModal = () => {
  showOffersModal.value = false
}

const acceptOffer = async (offer) => {
  try {
    console.log('Accepting offer:', offer)
    
    // Store selected offer and show delivery choice modal (pharmacy-flow.txt lines 225-243)
    selectedOffer.value = offer
    showOffersModal.value = false
    showDeliveryChoice.value = true
    
  } catch (error) {
    console.error('Error accepting offer:', error)
    notification.addNotification({
      type: 'error',
      title: 'Accept Failed',
      message: 'Could not accept the offer. Please try again.'
    })
  }
}

const chatWithPharmacy = (offer) => {
  console.log('Opening chat with pharmacy:', offer)
  // TODO: Implement chat functionality
  notification.addNotification({
    type: 'info',
    title: 'Chat Feature',
    message: 'Chat functionality will be available soon.'
  })
}

const callPharmacy = (offer) => {
  console.log('Calling pharmacy:', offer)
  // Simulate phone call action
  if (offer.pharmacy_phone) {
    window.open(`tel:${offer.pharmacy_phone}`)
  } else {
    notification.addNotification({
      type: 'info',
      title: 'Phone Number',
      message: 'Pharmacy phone number not available.'
    })
  }
}

const viewRoute = (offer) => {
  console.log('Viewing route to pharmacy:', offer)
  // TODO: Implement route viewing on map
  notification.addNotification({
    type: 'info',
    title: 'Route Feature',
    message: 'Route viewing will be available soon.'
  })
}

// Draggable bottom sheet functions (pharmacy-flow.txt lines 39-43)
const startDrag = (event) => {
  isDragging.value = true
  dragStartY.value = event.type === 'touchstart' ? event.touches[0].clientY : event.clientY
  dragStartHeight.value = bottomSheetHeight.value
  
  // Add global event listeners
  document.addEventListener('mousemove', handleDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', handleDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const handleDrag = (event) => {
  if (!isDragging.value) return
  
  event.preventDefault()
  const currentY = event.type === 'touchmove' ? event.touches[0].clientY : event.clientY
  const deltaY = dragStartY.value - currentY
  const newHeight = Math.max(200, Math.min(window.innerHeight * 0.8, dragStartHeight.value + deltaY))
  
  bottomSheetHeight.value = newHeight
  
  // Auto-expand/collapse based on height thresholds
  if (newHeight > 400 && !isExpanded.value) {
    isExpanded.value = true
  } else if (newHeight < 350 && isExpanded.value) {
    isExpanded.value = false
  }
}

const endDrag = () => {
  isDragging.value = false
  
  // Snap to positions
  if (bottomSheetHeight.value < 250) {
    bottomSheetHeight.value = 200 // Collapsed
    isExpanded.value = false
  } else if (bottomSheetHeight.value > 500) {
    bottomSheetHeight.value = window.innerHeight * 0.7 // Expanded
    isExpanded.value = true
  } else {
    // Snap to nearest state
    bottomSheetHeight.value = isExpanded.value ? window.innerHeight * 0.7 : 300
  }
  
  // Remove global event listeners
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
}

// Delivery choice functions (pharmacy-flow.txt lines 227-243)
const closeDeliveryChoice = () => {
  showDeliveryChoice.value = false
  selectedOffer.value = null
}

const chooseDelivery = async () => {
  try {
    console.log('Choosing delivery service for offer:', selectedOffer.value)
    
    // Create order with delivery option (pharmacy-flow.txt lines 230-236)
    const orderData = {
      offer_id: selectedOffer.value.id,
      delivery_method: 'delivery',
      delivery_fee: 2.50,
      medicines: submittedMedicines.value,
      pharmacy_details: selectedOffer.value
    }
    
    // Submit order to backend
    const response = await apiService.post('/orders/pharmacy-orders/', orderData)
    
    notification.addNotification({
      type: 'success',
      title: 'Order Confirmed!',
      message: 'Your order has been submitted. A delivery driver will be assigned shortly.'
    })
    
    showDeliveryChoice.value = false
    
    // TODO: Navigate to order tracking page
    // router.push({ name: 'OrderTracking', params: { orderId: response.data.id } })
    
  } catch (error) {
    console.error('Error creating delivery order:', error)
    notification.addNotification({
      type: 'error',
      title: 'Order Failed',
      message: 'Could not create your order. Please try again.'
    })
  }
}

const choosePickup = async () => {
  try {
    console.log('Choosing pickup for offer:', selectedOffer.value)
    
    // Create order with pickup option (pharmacy-flow.txt lines 239-242)
    const orderData = {
      offer_id: selectedOffer.value.id,
      delivery_method: 'pickup',
      delivery_fee: 0,
      medicines: submittedMedicines.value,
      pharmacy_details: selectedOffer.value
    }
    
    // Submit order to backend
    const response = await apiService.post('/orders/pharmacy-orders/', orderData)
    
    // Generate pickup code
    const pickupCode = `PU${Date.now().toString().slice(-6)}`
    
    notification.addNotification({
      type: 'success',
      title: 'Pickup Order Confirmed!',
      message: `Your pickup code is ${pickupCode}. Show this at the pharmacy.`
    })
    
    showDeliveryChoice.value = false
    
    // TODO: Show pickup details modal with address, code, and directions
    
  } catch (error) {
    console.error('Error creating pickup order:', error)
    notification.addNotification({
      type: 'error',
      title: 'Order Failed',
      message: 'Could not create your order. Please try again.'
    })
  }
}

// Fetch pharmacy sellers from database
const fetchPharmacySellers = async () => {
  try {
    console.log('🏥 Fetching pharmacy sellers...')
    
    // Get pharmacy sellers with their locations
    const sellersResponse = await apiService.getPharmacySellers({ pharmacy: true })
    const pharmacySellers = sellersResponse.data?.results || sellersResponse.data || []
    
    console.log('🏥 Found pharmacy sellers:', pharmacySellers)
    return pharmacySellers
    
  } catch (error) {
    console.error('❌ Error fetching pharmacy sellers:', error)
    return []
  }
}

// Initialize map
const initializeMap = () => {
  // Fix Leaflet default markers
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
  })

  // Center on Lomé, Togo as specified in pharmacy-flow.txt
  const lomeCoords = [6.13, 1.22]
  
  map.value = L.map('pharmacy-map', {
    center: lomeCoords,
    zoom: 15,
    minZoom: 13,
    maxZoom: 18,
    zoomControl: false
  })

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map.value)

  // Add custom zoom control to bottom right
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map.value)

  // Add user location marker
  const userMarker = L.marker(lomeCoords, {
    title: 'Your location'
  }).addTo(map.value)
  
  userMarker.bindPopup('Your current location')

  // Add pharmacy markers to the map
  loadPharmacyMarkers()

  // Try to get user's actual location
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude
        
        // Update map center to user location
        map.value.setView([userLat, userLng], 15)
        
        // Update marker position
        userMarker.setLatLng([userLat, userLng])
        
        // Update location text (simplified for demo)
        currentLocationText.value = `${userLat.toFixed(3)}, ${userLng.toFixed(3)}`
      },
      (error) => {
        console.warn('Could not get user location:', error)
        // Keep default Lomé location
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }
}

// Load and display pharmacy markers on the map
const loadPharmacyMarkers = async () => {
  if (!map.value) return
  
  try {
    const pharmacySellers = await fetchPharmacySellers()
    console.log('🏥 Loaded pharmacy sellers for markers:', pharmacySellers)
    
    // Create proper pharmacy icon (not circle)
    const createPharmacyIcon = (name) => {
      return L.divIcon({
        className: 'pharmacy-marker',
        html: `<div class="pharmacy-marker-container">
                 <!-- Pharmacy Icon -->
                 <div class="pharmacy-icon">
                   <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M19 8h-2V6a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v2H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1zM9 6h6v2H9V6zm8 12H7v-8h10v8zm-7-6h4v1h-4v-1zm0 2h4v1h-4v-1z"/>
                     <rect x="10" y="4" width="4" height="1"/>
                     <rect x="10" y="12" width="4" height="1"/>
                     <rect x="11.5" y="10.5" width="1" height="4"/>
                   </svg>
                 </div>
                 <!-- Pharmacy Name on Top -->
                 <div class="pharmacy-name">${name}</div>
               </div>`,
        iconSize: [120, 60],
        iconAnchor: [60, 45],
        popupAnchor: [0, -45]
      })
    }
    
    // Add marker and label for each pharmacy seller
    pharmacySellers.forEach(seller => {
      // Check if seller has valid coordinates
      if (seller.latitude && seller.longitude) {
        const pharmacyName = seller.business_name || seller.name || 'Pharmacy'
        
        // Add main pharmacy marker
        const marker = L.marker([seller.latitude, seller.longitude], {
          icon: pharmacyIcon,
          title: pharmacyName
        }).addTo(map.value)
        
        // Add permanent name label slightly offset from marker
        const labelMarker = L.marker([seller.latitude + 0.0003, seller.longitude], {
          icon: createPharmacyLabel(pharmacyName),
          interactive: false
        }).addTo(map.value)
        
        // Create detailed popup with pharmacy info
        const popupContent = `
          <div class="text-center p-3 min-w-[200px]">
            <div class="font-bold text-green-700 mb-2 text-lg">${pharmacyName}</div>
            <div class="text-sm text-slate-600 mb-2">${seller.address || 'Pharmacy location'}</div>
            ${seller.phone ? `<div class="text-sm text-blue-600 mb-2">📞 ${seller.phone}</div>` : ''}
            <div class="text-xs text-slate-500 italic">Available for medicine requests</div>
          </div>
        `
        
        marker.bindPopup(popupContent, {
          closeButton: true,
          offset: [0, -20],
          className: 'pharmacy-popup'
        })
        
        // Show popup on click
        marker.on('click', () => {
          console.log('🏥 Pharmacy selected:', seller)
          marker.openPopup()
        })
      }
    })
    
    console.log('🗺️ Added', pharmacySellers.length, 'pharmacy markers with labels to map')
    
  } catch (error) {
    console.error('❌ Error loading pharmacy markers:', error)
  }
}

async function selectDefaultStore(id) {
  sessionStorage.setItem('defaultStore', String(id))
  
  // Check if selected category is pharmacy
  const selectedCategory = storeCategories.value.find(cat => cat.id === id)
  console.log('🔍 [PHARMACY DEBUG] Selected category:', selectedCategory)
  console.log('🔍 [PHARMACY DEBUG] Category name:', selectedCategory?.name)
  
  // Update pharmacy store state
  await pharmacyStore.checkCategoryForPharmacy(parseInt(id), selectedCategory?.name)
  
  showStoreDialog.value = false
  
  // If not pharmacy, reload to refresh with selected store
  if (!pharmacyStore.shouldShowPharmacyInterface) {
    location.reload()
  }
}


</script>

<style scoped>
/* Hide scrollbar for webkit browsers */
.scrollbar-hide {
  -ms-overflow-style: none;  /* Internet Explorer 10+ */
  scrollbar-width: none;  /* Firefox */
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;  /* Safari and Chrome */
}

/* Custom width for bundle cards */
.w-70 {
  width: 17.5rem;
}

.h-30 {
  height: 7.5rem;
}

/* Enhanced hover effects */
.hover\:-translate-y-2:hover {
  transform: translateY(-0.5rem);
}

/* Smooth transitions */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Glass morphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* Enhanced shadows */
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.shadow-xl {
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Line clamp utility for product names */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Custom scrollbar for category list */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Dialog transitions */
.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dialog-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(-20px);
}

.dialog-leave-to {
  opacity: 0;
  transform: scale(1.1) translateY(20px);
}

/* Gradient text animation */
@keyframes gradient-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.bg-gradient-to-r {
  background-size: 200% 200%;
  animation: gradient-shift 3s ease infinite;
}

/* Pharmacy interface styles */
.pharmacy-map-container {
  position: relative;
}

/* Search animation ripples */
.search-ripple-1,
.search-ripple-2,
.search-ripple-3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #3b82f6;
  border-radius: 50%;
  animation: ripple 2s linear infinite;
}

.search-ripple-1 {
  width: 60px;
  height: 60px;
  animation-delay: 0s;
}

.search-ripple-2 {
  width: 100px;
  height: 100px;
  animation-delay: 0.5s;
}

.search-ripple-3 {
  width: 140px;
  height: 140px;
  animation-delay: 1s;
}

@keyframes ripple {
  0% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
  }
}

/* Pharmacy marker styles */
.pharmacy-marker {
  background: transparent !important;
  border: none !important;
}

.pharmacy-map-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

#pharmacy-map {
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  z-index: 1 !important;
}

/* Hide default leaflet attribution */
.leaflet-control-attribution {
  display: none !important;
}

/* Search ripple animations */
.search-ripple-1, .search-ripple-2, .search-ripple-3 {
  position: absolute;
  top: 50%;
  left: 50%;
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: ripple 2s infinite ease-out;
  transform: translate(-50%, -50%);
}

.search-ripple-1 {
  width: 60px;
  height: 60px;
  animation-delay: 0s;
}

.search-ripple-2 {
  width: 80px;
  height: 80px;
  animation-delay: 0.7s;
}

.search-ripple-3 {
  width: 100px;
  height: 100px;
  animation-delay: 1.4s;
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
    border-color: rgba(59, 130, 246, 0.8);
  }
  50% {
    opacity: 0.6;
    border-color: rgba(59, 130, 246, 0.4);
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
    border-color: rgba(59, 130, 246, 0);
  }
}

/* Pharmacy marker styles */
.pharmacy-marker {
  background: transparent !important;
  border: none !important;
}

.pharmacy-marker div {
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
  transition: all 0.2s ease;
}

.pharmacy-marker:hover div {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(34, 197, 94, 0.4);
}

/* Pharmacy label styles */
.pharmacy-label {
  background: transparent !important;
  border: none !important;
  pointer-events: none !important;
}

.pharmacy-label div {
  pointer-events: none !important;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Pharmacy popup styles */
.pharmacy-popup {
  min-width: 200px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.pharmacy-popup h3 {
  margin: 0 0 8px 0;
  color: #166534;
  font-weight: bold;
  font-size: 16px;
}

.pharmacy-popup p {
  margin: 4px 0;
  color: #4b5563;
  font-size: 14px;
}

.leaflet-popup-content-wrapper {
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Custom scrollbar for bottom sheet */
.max-h-\[70vh\]::-webkit-scrollbar {
  width: 4px;
}

.max-h-\[70vh\]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 2px;
}

.max-h-\[70vh\]::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

/* Custom range slider */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: #e2e8f0;
  height: 4px;
  border-radius: 2px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #3b82f6;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

input[type="range"]::-moz-range-track {
  background: #e2e8f0;
  height: 4px;
  border-radius: 2px;
  border: none;
}

input[type="range"]::-moz-range-thumb {
  background: #3b82f6;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Animation classes */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>