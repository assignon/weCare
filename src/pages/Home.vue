<template>
  <div>
    <!-- Normal Home Interface -->
    <div v-if="!shouldShowPharmacyInterface" class="min-h-screen bg-white">
      <div class="p-4 pb-24 pt-20">
      <!-- Enhanced Header -->
      <AppHeader v-if="!shouldShowPharmacyInterface" />

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
                  <AlertTriangle class="w-3 h-3 mr-1" />
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
                      <Tag class="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors duration-300" />
                    </div>
                    <div class="flex-1">
                      <div class="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors duration-300">{{ cat.name }}</div>
                      <div class="text-xs text-slate-500 group-hover:text-blue-600 transition-colors duration-300">{{ cat.description || 'Explore amazing products' }}</div>
                    </div>
                    <div class="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors duration-300">
                      <ChevronRight class="w-full h-full" />
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Footer -->
            <div class="px-8 pb-8">
              <div class="text-center">
                <div class="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl">
                  <Info class="w-4 h-4 text-blue-600" />
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
          <div class="flex gap-3 pb-2">
            <div 
              v-for="product in productStore.popularProducts.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-44 flex flex-col"
            >
              <!-- Product Card - Only contains image -->
              <div 
                @click="navigateToDetails(product.id, product.item_type)"
                class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square cursor-pointer relative"
              >
                <img 
                  :src="product.main_image || packagingImage" 
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
                <!-- Verified Badge (only for verified store products) -->
                <button
                  v-if="product.item_type === 'store_product' && product.seller_is_verified && product.seller_account_status === 'APPROVED'"
                  @click.stop="showVerificationDialog = true; selectedProduct = product"
                  class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
                >
                  <BadgeCheck class="w-4 h-4 text-blue-600" />
                </button>
              </div>
              
              <!-- Product Info - Outside the card -->
              <div class="space-y-1">
                <!-- Store Name Caption (only for store products, not shopper listings) -->
                <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-500 mb-0.5">
                  {{ product.seller_name || product.store_name || 'weCare' }}
                </p>
                
                <!-- Product Name -->
                <h3 
                  @click="navigateToDetails(product.id, product.item_type)"
                  class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
                >
                  {{ product.name }}
                </h3>
                
                <!-- Price and Quantity -->
                <div class="flex items-center justify-between">
                  <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-blue-600'">
                    {{ formatApiPrice(product) }}
                    <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                      / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                    </span>
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
          <div class="flex gap-3 pb-2">
            <div 
              v-for="product in productStore.newArrivals.slice(0, 10)" 
              :key="product.id"
              class="flex-shrink-0 w-44 flex flex-col"
            >
              <!-- Product Card - Only contains image -->
              <div 
                @click="navigateToDetails(product.id, product.item_type)"
                class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square cursor-pointer relative"
              >
                <img 
                  :src="product.main_image || packagingImage" 
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
                <!-- Verified Badge (only for verified store products) -->
                <button
                  v-if="product.item_type === 'store_product' && product.seller_is_verified && product.seller_account_status === 'APPROVED'"
                  @click.stop="showVerificationDialog = true; selectedProduct = product"
                  class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
                >
                  <BadgeCheck class="w-4 h-4 text-blue-600" />
                </button>
              </div>
              
              <!-- Product Info - Outside the card -->
              <div class="space-y-1">
                <!-- Store Name Caption (only for store products, not shopper listings) -->
                <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-500 mb-0.5">
                  {{ product.seller_name || product.store_name || 'weCare' }}
                </p>
                
                <!-- Product Name -->
                <h3 
                  @click="navigateToDetails(product.id, product.item_type)"
                  class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
                >
                  {{ product.name }}
                </h3>
                
                <!-- Price and Quantity -->
                <div class="flex items-center justify-between">
                  <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-blue-600'">
                    {{ formatApiPrice(product) }}
                    <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                      / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- All Products Section -->
      <div v-if="allProducts.length > 0" class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <div>
            <h2 class="text-xl font-bold text-slate-900 mb-1">All Products</h2>
            <p class="text-sm text-slate-600">Browse all available products</p>
          </div>
        </div>

        <!-- All products grid -->
        <div class="grid grid-cols-2 gap-3">
          <div 
            v-for="product in allProducts" 
            :key="product.id" 
            class="flex flex-col"
          >
            <!-- Product Card - Only contains image -->
            <div class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square relative">
              <img 
                @click="navigateToDetails(product.id, product.item_type)"
                :src="product.main_image || packagingImage" 
                :alt="product.name"
                class="w-full h-full object-cover rounded-lg"
              />
              <!-- Verified Badge (for all approved store products) -->
              <button
                v-if="product.item_type === 'store_product' && product.seller_account_status === 'APPROVED'"
                @click.stop="showVerificationDialog = true; selectedProduct = product"
                class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
              >
                <BadgeCheck class="w-4 h-4 text-blue-600" />
              </button>
            </div>
            
            <!-- Product Info - Outside the card -->
            <div class="space-y-1">
              <!-- Store Name Caption (only for store products, not shopper listings) -->
              <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-500 mb-0.5">
                {{ product.seller_name || product.store_name || 'weCare' }}
              </p>
              
              <!-- Product Name -->
              <h3 
                @click="navigateToDetails(product.id, product.item_type)"
                class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
              >
                {{ product.name }}
              </h3>
              
                <!-- Price and Quantity -->
                <div class="flex items-center justify-between">
                  <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-blue-600'">
                    {{ formatApiPrice(product) }}
                    <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                      / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                    </span>
                  </span>
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
          <div class="grid grid-cols-2 gap-3">
            <div 
              v-for="product in productStore.recommendedProducts.slice(0, 4)" 
              :key="product.id"
              class="flex flex-col"
            >
              <!-- Product Card - Only contains image -->
              <div 
                @click="navigateToDetails(product.id, product.item_type)"
                class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square cursor-pointer relative"
              >
                <img 
                  :src="product.main_image || packagingImage" 
                  :alt="product.name"
                  class="w-full h-full object-cover rounded-lg"
                />
                <!-- Verified Badge (only for verified store products) -->
                <button
                  v-if="product.item_type === 'store_product' && product.seller_is_verified && product.seller_account_status === 'APPROVED'"
                  @click.stop="showVerificationDialog = true; selectedProduct = product"
                  class="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all z-10"
                >
                  <BadgeCheck class="w-4 h-4 text-blue-600" />
                </button>
              </div>
              
              <!-- Product Info - Outside the card -->
              <div class="space-y-1">
                <!-- Store Name Caption (only for store products, not shopper listings) -->
                <p v-if="product.item_type === 'store_product'" class="text-xs text-gray-500 mb-0.5">
                  {{ product.seller_name || product.store_name || 'weCare' }}
                </p>
                
                <!-- Product Name -->
                <h3 
                  @click="navigateToDetails(product.id, product.item_type)"
                  class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight cursor-pointer hover:text-blue-600 transition-colors capitalize"
                >
                  {{ product.name }}
                </h3>
                
                <!-- Price and Quantity -->
                <div class="flex items-center justify-between">
                  <span :class="product.item_type === 'shopper_listing' ? 'font-bold text-sm text-orange-600' : 'font-bold text-sm text-blue-600'">
                    {{ formatApiPrice(product) }}
                    <span v-if="product.quantity || product.weight" class="text-xs font-normal text-gray-600">
                      / {{ product.quantity ? product.quantity + ' ' + (product.unit || 'unit') : product.weight || '' }}
                    </span>
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
      <div id="pharmacy-map" class="w-full pharmacy-map-height"></div>
      
      
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
        <div class="absolute left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg" 
             :style="{ bottom: `${bottomSheetHeight + 96}px` }">
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
        <div class="pointer-events-auto" style="margin-top: 0px;width: 60%;">
        <div class="flex items-center justify-center">
          <!-- Location pill -->
          <div class="flex-1 max-w-xs">
            <div class="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
              <div class="flex items-center justify-center space-x-2">
                <MapPin class="w-4 h-4 text-blue-600" />
                <span class="text-sm font-medium text-slate-700">{{ currentLocationText }}</span>
                <!-- Pharmacy Count -->
                <div class="pharmacy-count-inline">
                  <Package class="pharmacy-count-icon-inline w-3.5 h-3.5" />
                  <span class="pharmacy-count-number pharmacy-count">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Draggable bottom sheet -->
      <div 
        class="absolute left-0 right-0 transition-all duration-200 ease-out bg-white rounded-t-3xl shadow-2xl" 
        :style="{ 
          height: `${bottomSheetHeight}px`, 
          bottom: '0px', /* Sit directly on bottom menu */
          zIndex: 10 
        }"
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
        <div class="bg-white rounded-t-3xl h-full overflow-hidden flex flex-col">
          
          <!-- ==================== STATE-BASED UI MODES ==================== -->
          
          <!-- MODE 1: SEARCHING - Waiting for seller to acknowledge -->
          <div v-if="pharmacyRequestState === 'searching' && hasActiveSession" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <div class="animate-spin">
                  <RefreshCw class="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Searching for Pharmacies</h3>
              <p class="text-base text-slate-600 mb-4">Finding the best pharmacy near you...</p>
              <div class="flex items-center justify-center space-x-2 py-4">
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
              
              <!-- Cancel Request Button -->
              <button 
                @click="clearStuckSession"
                class="mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Cancel Request
              </button>
            </div>
          </div>
          
          <!-- MODE 2: SELLER_ACKNOWLEDGED - Seller reviewing, preparing offer -->
          <div v-else-if="pharmacyRequestState === 'seller_acknowledged' && activeSession?.sellerData" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle class="w-10 h-10 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Pharmacy Found! ✅</h3>
              <p class="text-base text-slate-600">Waiting for an offer...</p>
            </div>
            
            <!-- Seller Details Card -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div class="flex items-center justify-center space-x-3 mb-4">
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span class="text-white font-bold text-2xl">{{ (activeSession.sellerData.name || 'P').charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1 text-center">
                  <h4 class="text-xl font-bold text-slate-900">{{ activeSession.sellerData.name }}</h4>
                  <p class="text-sm text-slate-500 mt-1" v-if="activeSession.sellerData.address">{{ activeSession.sellerData.address }}</p>
                  <p class="text-sm text-slate-500" v-if="activeSession.sellerData.phone">📞 {{ activeSession.sellerData.phone }}</p>
                </div>
              </div>
              
              <!-- Animated waiting indicator -->
              <div class="flex items-center justify-center space-x-2 py-4">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                <div class="w-2 h-2 bg-green-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
              </div>
              <p class="text-center text-sm text-slate-600">Preparing your offer...</p>
            </div>
          </div>
          
          <!-- MODE 3: OFFER_RECEIVED - Seller made an offer, choose delivery -->
          <div v-else-if="pharmacyRequestState === 'offer_received' && activeSession?.sellerData" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span class="text-4xl">🎉</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Offer Received!</h3>
              <p class="text-base text-slate-600">Choose how to get your medicine</p>
            </div>
            
            <!-- Seller & Offer Details -->
            <div class="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-md mb-4">
              <!-- Seller Info -->
              <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center ring-4 ring-yellow-200">
                  <span class="text-white font-bold text-2xl">{{ (activeSession.sellerData.name || 'P').charAt(0).toUpperCase() }}</span>
                </div>
                <div class="flex-1">
                  <h4 class="text-xl font-bold text-slate-900">{{ activeSession.sellerData.name }}</h4>
                  <p class="text-sm text-slate-600" v-if="activeSession.sellerData.address">{{ activeSession.sellerData.address }}</p>
                  <p class="text-sm text-slate-600" v-if="activeSession.sellerData.phone">📞 {{ activeSession.sellerData.phone }}</p>
                </div>
              </div>
              
              <!-- Offer Price -->
              <div v-if="activeSession.sellerData.offer" class="bg-white rounded-xl p-4 mb-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-sm font-medium text-slate-700">Total Price:</span>
                  <span class="text-2xl font-bold text-green-600">{{ formatApiPrice(activeSession.sellerData.offer.total_price) }}</span>
                </div>
                <div v-if="activeSession.sellerData.offer.message" class="text-sm text-slate-600 border-t pt-2 mt-2">
                  <strong>Message:</strong> {{ activeSession.sellerData.offer.message }}
                </div>
              </div>
              
              <!-- Delivery Choice Buttons -->
              <div class="space-y-3">
                <p class="text-center text-sm font-medium text-slate-700 mb-2">How would you like to receive your medicine?</p>
                
                <!-- Pick up myself button -->
                <button 
                  @click="selectPickupOption({ ...activeSession.sellerData, requestId: activeSession.requestId })"
                  class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Package class="w-5 h-5" />
                  <span>Pick Up Myself</span>
                </button>
                
                <!-- Use AfriQExpress delivery button -->
                <button 
                  @click="selectDeliveryOption({ ...activeSession.sellerData, requestId: activeSession.requestId })"
                  class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <Truck class="w-5 h-5" />
                  <span>Use AfriQExpress Delivery</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- MODE 4: NO_SELLERS_FOUND - Admin takeover -->
          <div v-else-if="pharmacyRequestState === 'no_sellers_found'" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="text-4xl">👨‍💼</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">No Pharmacies Available</h3>
              <p class="text-base text-slate-600 mb-4">Don't worry! One of our admins will personally take care of your request.</p>
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 text-left">
                <p class="text-sm text-blue-800">
                  <strong>ℹ️ What happens next:</strong><br>
                  • Our team has been notified<br>
                  • An admin will contact you shortly<br>
                  • They'll find the medicine for you<br>
                  • You'll receive updates via phone
                </p>
              </div>
            </div>
          </div>
          
          <!-- Legacy: Seller Notifications Section (fallback) -->
          <div v-else-if="showSellerNotifications && foundSellers.length > 0" class="p-4 flex-1 overflow-y-auto">
            <div class="text-center mb-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                <span class="text-white text-xl">🏥</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">Found Pharmacies</h3>
              <p class="text-sm text-slate-600">{{ foundSellers.length }} pharmacy{{ foundSellers.length > 1 ? 'ies' : '' }} found</p>
            </div>
            
            <!-- Seller List -->
            <div class="space-y-3">
              <div v-for="seller in foundSellers" :key="seller.id" 
                class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center space-x-3">
                      <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span class="text-white font-bold text-sm">{{ (seller.seller_name || seller.name || 'P').charAt(0).toUpperCase() }}</span>
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-slate-900">{{ seller.seller_name || seller.name || 'Pharmacy' }}</h4>
                        <div class="flex items-center space-x-2 text-sm text-slate-600">
                          <span>{{ seller.distance || 'Nearby' }}km</span>
                          <span class="w-1 h-1 bg-slate-400 rounded-full"></span>
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            :class="{
                              'bg-blue-100 text-blue-700': seller.status === 'found',
                              'bg-green-100 text-green-700': seller.status === 'acknowledged',
                              'bg-yellow-100 text-yellow-700': seller.status === 'offered',
                              'bg-red-100 text-red-700': seller.status === 'declined'
                            }"
                          >
                            {{ seller.status === 'found' ? 'Found' : 
                               seller.status === 'acknowledged' ? 'Reviewing' :
                               seller.status === 'offered' ? 'Offered' :
                               seller.status === 'declined' ? 'Declined' : seller.status }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Chat Button -->
                  <button 
                    v-if="seller.chatEnabled && seller.status !== 'declined'"
                    @click="openChat(seller)"
                    class="ml-3 p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                    title="Chat with pharmacy"
                  >
                    <MessageCircle class="w-5 h-5" />
                  </button>
                </div>
                
                <!-- Status-specific content -->
                <div v-if="seller.status === 'acknowledged'" class="mt-3 p-2 bg-blue-50 rounded-lg">
                  <div class="flex items-center space-x-2 text-sm text-blue-700">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Pharmacy is reviewing your request...</span>
                  </div>
                </div>
                
                <div v-if="seller.status === 'offered' && seller.offer" class="mt-3 p-2 bg-green-50 rounded-lg">
                  <div class="text-sm text-green-700">
                    <div class="font-medium">Offer Received!</div>
                    <div class="text-xs text-green-600 mt-1">{{ seller.offer.message || 'Check details in offers' }}</div>
                  </div>
                </div>
                
                <div v-if="seller.status === 'declined'" class="mt-3 p-2 bg-red-50 rounded-lg">
                  <div class="flex items-center space-x-2 text-sm text-red-700">
                    <span>❌</span>
                    <span>This pharmacy declined your request</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No sellers found message -->
            <div v-if="foundSellers.length === 0" class="text-center py-8">
              <div class="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl">🚫</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">No Pharmacies Found</h3>
              <p class="text-sm text-slate-600 mb-4">No pharmacies were found in your area. Try expanding your search radius.</p>
              <button 
                @click="expandRadius"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Expand Search Radius
              </button>
            </div>
          </div>
          
          <!-- Seller Found (when seller acknowledged) -->
          <div v-if="foundSellers.some(s => s.status === 'acknowledged') && !foundSellers.some(s => s.status === 'offered')" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle class="w-10 h-10 text-white" />
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Seller Found</h3>
              <p class="text-base text-slate-600">Waiting for an offer from seller</p>
            </div>
            
            <!-- Seller List -->
            <div class="space-y-4">
              <div v-for="seller in foundSellers.filter(s => s.status === 'acknowledged')" :key="seller.id" 
                class="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div class="flex items-center justify-center space-x-3 mb-4">
                  <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-2xl">{{ (seller.seller_name || seller.business_name || seller.name || 'P').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1 text-center">
                    <h4 class="text-xl font-bold text-slate-900">
                      {{ seller.seller_name || seller.business_name || seller.name || 'Pharmacy' }}
                    </h4>
                    <p class="text-sm text-slate-500 mt-1">Preparing your offer...</p>
                  </div>
                </div>
                
                <!-- Animated waiting indicator -->
                <div class="flex items-center justify-center space-x-2 py-4">
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0s"></div>
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                  <div class="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Seller Made an Offer (when offer received) -->
          <div v-else-if="foundSellers.some(s => s.status === 'offered')" class="p-6 flex-1 overflow-y-auto">
            <div class="text-center mb-6">
              <div class="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <span class="text-4xl">🎉</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-2">Seller Made an Offer!</h3>
              <p class="text-base text-slate-600">Choose how to get your medicine</p>
            </div>
            
            <!-- Offers List -->
            <div class="space-y-4 mb-6">
              <div v-for="seller in foundSellers.filter(s => s.status === 'offered')" :key="seller.id" 
                class="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 shadow-md">
                
                <!-- Seller Info -->
                <div class="flex items-center space-x-4 mb-4">
                  <div class="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center ring-4 ring-yellow-200">
                    <span class="text-white font-bold text-2xl">{{ (seller.seller_name || seller.business_name || seller.name || 'P').charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-xl font-bold text-slate-900">
                      {{ seller.seller_name || seller.business_name || seller.name || 'Pharmacy' }}
                    </h4>
                    <p class="text-sm text-slate-600">{{ seller.business_address || 'Nearby pharmacy' }}</p>
                  </div>
                </div>
                
                <!-- Offer Details -->
                <div v-if="seller.offer" class="bg-white rounded-xl p-4 mb-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm font-medium text-slate-700">Total Price:</span>
                    <span class="text-2xl font-bold text-green-600">{{ formatApiPrice(seller.offer.total_price) }}</span>
                  </div>
                  <div v-if="seller.offer.message" class="text-sm text-slate-600 border-t pt-2 mt-2">
                    <strong>Message:</strong> {{ seller.offer.message }}
                  </div>
                </div>
                
                <!-- View Offer Button -->
                <button 
                  @click="viewOfferDetails(seller)"
                  class="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold mb-4 transition-colors duration-200"
                >
                  View Offer Details
                </button>
                
                <!-- Delivery Choice Buttons -->
                <div class="space-y-3">
                  <p class="text-center text-sm font-medium text-slate-700 mb-2">How would you like to receive your medicine?</p>
                  
                  <!-- Pick up myself button -->
                  <button 
                    @click="selectPickupOption(seller)"
                    class="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Package class="w-5 h-5" />
                    <span>Pick Up Myself</span>
                  </button>
                  
                  <!-- Use AfriQExpress delivery button -->
                  <button 
                    @click="selectDeliveryOption(seller)"
                    class="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 rounded-xl font-semibold shadow-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Truck class="w-5 h-5" />
                    <span>Use AfriQExpress Delivery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Search Status Display (when searching but no sellers found yet) -->
          <div v-else-if="isSearching && (!showSellerNotifications || foundSellers.length === 0)" class="p-4 flex-1 overflow-y-auto">
            <div class="text-center mb-4">
              <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                   :class="{
                     'bg-gradient-to-r from-blue-500 to-indigo-600': searchStatus.isSearching,
                     'bg-gradient-to-r from-green-500 to-emerald-600': searchStatus.status === 'success',
                     'bg-gradient-to-r from-yellow-500 to-orange-500': searchStatus.status === 'no_results',
                     'bg-gradient-to-r from-red-500 to-pink-500': searchStatus.status === 'error'
                   }">
                <div v-if="searchStatus.isSearching" class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <div v-else-if="searchStatus.status === 'success'" class="w-6 h-6 text-white">✅</div>
                <div v-else-if="searchStatus.status === 'no_results'" class="w-6 h-6 text-white">⚠️</div>
                <div v-else-if="searchStatus.status === 'error'" class="w-6 h-6 text-white">❌</div>
                <div v-else class="w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-1">
                <span v-if="searchStatus.isSearching">Searching Pharmacies</span>
                <span v-else-if="searchStatus.status === 'success'" class="text-green-600">✅ Pharmacies Found!</span>
                <span v-else-if="searchStatus.status === 'no_results'" class="text-yellow-600">⚠️ No Pharmacies Found</span>
                <span v-else-if="searchStatus.status === 'error'" class="text-red-600">❌ Search Error</span>
                <span v-else>Search Complete</span>
              </h3>
              <p class="text-sm text-slate-600">{{ searchStatus.message || searchStatus.currentStep }}</p>
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
          </div>
          
          <!-- Collapsed state: Quick actions (only show before search starts) -->
          <div v-else-if="!isExpanded && !isSearching && !showSellerNotifications && foundSellers.length === 0 && !hasEverSearched" class="p-6">
            <div class="text-center mb-6">
              
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
                      <X class="w-3 h-3 text-red-600" />
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
          <div v-else-if="isExpanded && !showSellerNotifications && foundSellers.length === 0 && !hasEverSearched" class="flex-1 p-6 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-xl font-bold text-slate-900">
                  {{ isEditing ? 'Edit Medicine' : 'Request Medicine' }}
                </h2>
                <p v-if="isEditing" class="text-sm text-blue-600 mt-1">Updating existing medicine request</p>
              </div>
              <button @click="cancelEdit" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <ChevronDown class="w-4 h-4 text-slate-600" />
              </button>
            </div>

            <!-- Medicine request form -->
            <div class="space-y-4">
              <!-- Medicine name with autocomplete -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-2">Medicine Name</label>
                <div class="relative">
                  <input 
                    v-model="medicineRequest.name" 
                    @input="onMedicineNameInput"
                    @focus="showAutocomplete = true"
                    @blur="hideAutocomplete"
                    type="text" 
                    placeholder="Enter medicine name..."
                    class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <!-- Autocomplete dropdown -->
                  <div v-if="showAutocomplete && autocompleteSuggestions.length > 0" 
                       class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <div v-for="suggestion in autocompleteSuggestions" 
                         :key="suggestion"
                         @click="selectSuggestion(suggestion)"
                         class="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-b-0">
                      {{ suggestion }}
                    </div>
                  </div>
                </div>
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
          
          <!-- Fallback: Show seller notifications when expanded but should show results -->
          <div v-else-if="isExpanded && (showSellerNotifications || foundSellers.length > 0 || hasEverSearched)" class="flex-1 p-6 overflow-y-auto">
            <!-- Seller Notifications Section (when expanded but should show results) -->
            <div v-if="showSellerNotifications && foundSellers.length > 0">
              <div class="text-center mb-4">
                <div class="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <span class="text-white text-xl">🏥</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Found Pharmacies</h3>
                <p class="text-sm text-slate-600">{{ foundSellers.length }} pharmacy{{ foundSellers.length > 1 ? 'ies' : '' }} found</p>
              </div>
              
              <!-- Seller List -->
              <div class="space-y-3">
                <div v-for="seller in foundSellers" :key="seller.id" 
                  class="bg-white border-2 rounded-xl p-4 shadow-sm hover:shadow-md transition-all"
                  :class="{
                    'border-blue-200 bg-blue-50/30': seller.status === 'found',
                    'border-green-200 bg-green-50/30': seller.status === 'acknowledged',
                    'border-yellow-300 bg-yellow-50/30': seller.status === 'offered',
                    'border-red-200 bg-red-50/30': seller.status === 'declined'
                  }"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-start space-x-3">
                        <!-- Pharmacy Avatar -->
                        <div class="relative flex-shrink-0">
                          <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <span class="text-white font-bold text-lg">{{ (seller.seller_name || seller.name || 'P').charAt(0).toUpperCase() }}</span>
                          </div>
                          <!-- Status indicator dot -->
                          <div class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                            :class="{
                              'bg-blue-500': seller.status === 'found',
                              'bg-green-500 animate-pulse': seller.status === 'acknowledged',
                              'bg-yellow-500': seller.status === 'offered',
                              'bg-red-500': seller.status === 'declined'
                            }"
                          ></div>
                        </div>
                        
                        <div class="flex-1 min-w-0">
                          <h4 class="font-semibold text-slate-900 text-base truncate">
                            {{ seller.seller_name || seller.business_name || seller.name || 'Pharmacy' }}
                          </h4>
                          
                          <!-- Additional pharmacy info -->
                          <div class="mt-1 space-y-1">
                            <div class="flex items-center space-x-2 text-xs text-slate-600">
                              <MapPin class="w-3 h-3" />
                              <span>{{ seller.distance || seller.delivery_radius || 'Nearby' }}</span>
                              <span v-if="seller.response_time" class="w-1 h-1 bg-slate-400 rounded-full"></span>
                              <span v-if="seller.response_time">{{ seller.response_time }}</span>
                            </div>
                            
                            <div v-if="seller.phone_number" class="flex items-center space-x-2 text-xs text-slate-600">
                              <Phone class="w-3 h-3" />
                              <span>{{ seller.phone_number }}</span>
                            </div>
                          </div>
                          
                          <!-- Status badge -->
                          <div class="mt-2">
                            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              :class="{
                                'bg-blue-100 text-blue-800 border border-blue-200': seller.status === 'found',
                                'bg-green-100 text-green-800 border border-green-200': seller.status === 'acknowledged',
                                'bg-yellow-100 text-yellow-800 border border-yellow-200': seller.status === 'offered',
                                'bg-red-100 text-red-800 border border-red-200': seller.status === 'declined'
                              }"
                            >
                              <span v-if="seller.status === 'found'">📍 Request Received</span>
                              <span v-else-if="seller.status === 'acknowledged'">✅ Reviewing Request</span>
                              <span v-else-if="seller.status === 'offered'">💰 Offer Available</span>
                              <span v-else-if="seller.status === 'declined'">❌ Unavailable</span>
                              <span v-else>{{ seller.status }}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex flex-col space-y-2 ml-3">
                      <!-- View Offer Button (only if offered) -->
                      <button 
                        v-if="seller.status === 'offered'"
                        @click="openOffersModal(seller.requestId)"
                        class="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        title="View offer"
                      >
                        <Eye class="w-5 h-5" />
                      </button>
                      
                      <!-- Chat Button -->
                      <button 
                        v-if="seller.chatEnabled && seller.status !== 'declined'"
                        @click="openChat(seller)"
                        class="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Chat with pharmacy"
                      >
                        <MessageCircle class="w-5 h-5" />
                      </button>
                      
                      <!-- Call Button -->
                      <button 
                        v-if="seller.phone_number && seller.status !== 'declined'"
                        @click="window.open(`tel:${seller.phone_number}`)"
                        class="p-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Call pharmacy"
                      >
                        <Phone class="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <!-- Status-specific content -->
                  <div v-if="seller.status === 'acknowledged'" class="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                    <div class="flex items-center space-x-2 text-sm text-green-700">
                      <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span class="font-medium">Pharmacy is reviewing your request...</span>
                    </div>
                  </div>
                  
                  <div v-if="seller.status === 'offered' && seller.offer" class="mt-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                    <div class="text-sm">
                      <div class="font-semibold text-yellow-800 flex items-center">
                        <span class="text-lg mr-2">🎉</span>
                        Offer Received!
                      </div>
                      <div class="text-yellow-700 mt-1">
                        {{ seller.offer.message || 'Tap "View Offer" to see details and accept' }}
                      </div>
                      <div v-if="seller.offer.delivery_time" class="text-xs text-yellow-600 mt-1">
                        ⏱️ Est. delivery: {{ seller.offer.delivery_time }}
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="seller.status === 'declined'" class="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div class="text-sm text-red-700">
                      <div class="font-medium flex items-center">
                        <span class="mr-2">❌</span>
                        Request Declined
                      </div>
                      <div v-if="seller.decline_reason" class="text-xs text-red-600 mt-1">
                        Reason: {{ seller.decline_reason }}
                      </div>
                      <div v-else class="text-xs text-red-600 mt-1">
                        This pharmacy cannot fulfill your request at this time
                      </div>
                    </div>
                  </div>
                  
                  <!-- Initial contact message -->
                  <div v-if="seller.status === 'found'" class="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="flex items-center space-x-2 text-sm text-blue-700">
                      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span>Waiting for pharmacy response...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- No sellers found message -->
            <div v-else-if="foundSellers.length === 0 && hasEverSearched" class="text-center py-8">
              <div class="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl">🚫</span>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-2">No Pharmacies Found</h3>
              <p class="text-sm text-slate-600 mb-4">No pharmacies were found in your area. Try expanding your search radius.</p>
              <button 
                @click="expandRadius"
                class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200"
              >
                Expand Search Radius
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Retry Options UI (appears when no pharmacies found) -->
      <div v-if="showRetryOptions" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl">
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle class="w-8 h-8 text-yellow-600" />
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
              <X class="w-4 h-4 text-slate-600" />
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
                      <Star class="w-4 h-4 text-yellow-400 fill-current" />
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
                  <MessageCircle class="w-4 h-4" />
                </button>
                <button @click="callPharmacy(offer)" class="px-4 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </button>
                <button @click="viewRoute(offer)" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors">
                  <MapPin class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- No Offers Message -->
          <div v-if="pharmacyOffers.length === 0" class="text-center py-8">
            <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package class="w-8 h-8 text-slate-400" />
            </div>
            <p class="text-slate-600">No offers received yet...</p>
          </div>
        </div>
      </div>

      <!-- Chat Dialog -->
      <div v-if="showChatDialog" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl mx-4 max-w-md w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex justify-between items-center p-6 pb-4 border-b border-slate-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span class="text-white font-bold text-sm">{{ (selectedSeller?.seller_name || selectedSeller?.name || 'P').charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900">{{ selectedSeller?.seller_name || selectedSeller?.name || 'Pharmacy' }}</h3>
                <p class="text-sm text-slate-600">Online now</p>
              </div>
            </div>
            <button @click="closeChat" class="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
              <X class="w-4 h-4 text-slate-600" />
            </button>
          </div>
          
          <!-- Chat Messages -->
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div v-for="message in chatMessages" :key="message.id" 
              :class="message.sender === 'shopper' ? 'flex justify-end' : 'flex justify-start'"
            >
              <div 
                :class="message.sender === 'shopper' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                  : 'bg-slate-100 text-slate-900'"
                class="max-w-xs px-4 py-2 rounded-2xl text-sm"
              >
                <div>{{ message.message }}</div>
                <div class="text-xs mt-1 opacity-70">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>
          </div>
          
          <!-- Chat Input -->
          <div class="p-4 border-t border-slate-200">
            <div class="flex items-center space-x-2">
              <input 
                v-model="newChatMessage"
                @keyup.enter="sendChatMessage"
                type="text" 
                placeholder="Type your message..."
                class="flex-1 px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                @click="sendChatMessage"
                :disabled="!newChatMessage.trim()"
                class="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Delivery Choice Modal (pharmacy-flow.txt lines 222-243) -->
      <div v-if="showDeliveryChoice" class="absolute inset-0 bg-black/50 backdrop-blur-sm z-70 flex items-center justify-center">
        <div class="bg-white rounded-3xl p-6 mx-4 max-w-md w-full shadow-2xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw class="w-8 h-8 text-blue-600" />
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
                  <Info class="w-6 h-6 text-blue-600" />
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
                  <MapPin class="w-6 h-6 text-green-600" />
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

    <!-- Verification Dialog -->
    <Transition name="dialog">
      <div v-if="showVerificationDialog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showVerificationDialog = false"></div>
        <div class="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md transform transition-all duration-300">
          <!-- Header -->
          <div class="p-6 pb-4">
            <div class="flex items-center justify-center mb-4">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <BadgeCheck class="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 class="text-xl font-bold text-center text-slate-900 mb-2">Verified by AfriQExpress</h3>
            <p class="text-center text-slate-600 text-sm leading-relaxed">
              This product and seller have been verified by AfriQExpress. You can shop with confidence knowing that this seller has been authenticated and approved.
            </p>
          </div>

          <!-- Actions -->
          <div class="p-6 pt-4">
            <button
              @click="showVerificationDialog = false"
              class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>
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
import { 
  Flag, AlertTriangle, Tag, ChevronRight, ChevronDown, Info, MapPin, Truck, 
  Package, CheckCircle, XCircle, Clock, Star, Phone, Mail, BadgeCheck,
  Navigation, ArrowRight, ArrowLeft, Plus, Minus, X, Search,
  Heart, Share2, ShoppingCart, User, Bell, Settings, LogOut,
  RefreshCw, Loader2, MessageCircle, Eye, Send
} from 'lucide-vue-next'

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
const allProducts = ref([])
const showVerificationDialog = ref(false)
const selectedProduct = ref(null)

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
// Bottom sheet height management
const bottomSheetHeight = ref(200) // Default: lowest height for initial view
const isDragging = ref(false)
const dragStartY = ref(0)
const dragStartHeight = ref(0)

// Medicine autocomplete
const showAutocomplete = ref(false)
const autocompleteSuggestions = ref([])
const autocompleteTimeout = ref(null)

// Height constants for different states
const HEIGHTS = {
  LOWEST: 200,    // Initial view - just show content
  MIDDLE: 400,    // Live updates visible
  HIGHEST: 600    // Full form for adding medicine
}
const showDeliveryChoice = ref(false)
const selectedOffer = ref(null)
let searchInterval = null

// ==================== PHARMACY REQUEST STATE MACHINE ====================
// States: idle, searching, seller_acknowledged, offer_received, no_sellers_found
const pharmacyRequestState = ref('idle')
const activeSession = ref(null)

// Session structure:
// {
//   sessionId: string,
//   requestId: number,
//   state: string,
//   sellerData: { id, name, address, phone, status },
//   startedAt: timestamp,
//   expiresAt: timestamp
// }

// Initialize session from localStorage on mount
const initializeSession = () => {
  const savedSession = localStorage.getItem('pharmacy_request_session')
  if (savedSession) {
    try {
      const session = JSON.parse(savedSession)
      
      // Check if session is still valid (not expired)
      if (session.expiresAt && new Date(session.expiresAt) > new Date()) {
        // Additional validation: check if session is in a terminal state
        // If in offer_received or no_sellers_found for >5 minutes, clear it
        const sessionAge = Date.now() - new Date(session.startedAt).getTime()
        const fiveMinutes = 5 * 60 * 1000
        
        if ((session.state === 'offer_received' || session.state === 'no_sellers_found') && sessionAge > fiveMinutes) {
          console.log('⏰ Session in terminal state for too long, clearing...')
          clearSession()
          return
        }
        
        activeSession.value = session
        pharmacyRequestState.value = session.state || 'searching'
        console.log('📦 Restored session from localStorage:', session)
        
        // If in searching state but session is old (>30 min), clear it
        if (session.state === 'searching' && sessionAge > 30 * 60 * 1000) {
          console.log('⏰ Searching session too old, clearing...')
          clearSession()
        }
      } else {
        // Session expired, clear it
        console.log('⏰ Session expired, clearing...')
        clearSession()
      }
    } catch (e) {
      console.error('Failed to parse saved session:', e)
      localStorage.removeItem('pharmacy_request_session')
    }
  }
}

// Save session to localStorage
const saveSession = () => {
  if (activeSession.value) {
    localStorage.setItem('pharmacy_request_session', JSON.stringify(activeSession.value))
    console.log('💾 Session saved to localStorage')
  }
}

// Clear session
const clearSession = () => {
  activeSession.value = null
  pharmacyRequestState.value = 'idle'
  localStorage.removeItem('pharmacy_request_session')
  console.log('🗑️ Session cleared')
}

// Start new session
const startSession = (requestId) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  activeSession.value = {
    sessionId,
    requestId,
    state: 'searching',
    sellerData: null,
    startedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
  }
  pharmacyRequestState.value = 'searching'
  saveSession()
  console.log('🚀 Session started:', activeSession.value)
}

// Update session state
const updateSessionState = (newState, data = {}) => {
  if (activeSession.value) {
    activeSession.value.state = newState
    pharmacyRequestState.value = newState
    
    // Update seller data if provided
    if (data.sellerData) {
      activeSession.value.sellerData = data.sellerData
    }
    
    // Extend expiration if needed
    if (newState === 'seller_acknowledged' || newState === 'offer_received') {
      activeSession.value.expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
    
    saveSession()
    console.log('🔄 Session state updated:', newState, data)
  }
}

// End session
const endSession = () => {
  console.log('🏁 Session ended')
  clearSession()
  // Reset UI state
  isSearching.value = false
  isSubmitting.value = false
  hasEverSearched.value = false
  submittedMedicines.value = []
}

// Check if session is active
const hasActiveSession = computed(() => {
  return activeSession.value !== null && pharmacyRequestState.value !== 'idle'
})

// Legacy compatibility - keep for now but map to new state
const searchStatus = ref({
  isSearching: false,
  messages: [],
  currentStep: '',
  searchStartTime: null,
  foundOffers: [],
  selectedPharmacies: [],
  responseCount: 0
})

// Seller notifications and chat (kept for compatibility)
const foundSellers = ref([])
const showSellerNotifications = ref(false)
const showChatDialog = ref(false)
const selectedSeller = ref(null)
const chatMessages = ref([])
const newChatMessage = ref('')
const hasEverSearched = ref(false)

// WebSocket for real-time updates (would be replaced with actual WebSocket)
let searchStatusInterval = null

// Medicine request form data
const medicineRequest = ref({
  name: '',
  quantity: 1,
  form: 'tablet', // Default to tablet instead of empty string
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

const navigateToDetails = (productId, itemType = 'store_product') => {
  if (itemType === 'shopper_listing') {
    router.push({ name: 'ShopperProduct', params: { id: productId } })
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId } })
  }
}

// Developer helper function to clear stuck sessions
const clearStuckSession = () => {
  console.log('🧹 Manually clearing session...')
  clearSession()
  isSearching.value = false
  isSubmitting.value = false
  hasEverSearched.value = false
  submittedMedicines.value = []
  console.log('✅ Session cleared! You can now submit a new request.')
}

// Expose to window for developer access
if (typeof window !== 'undefined') {
  window.clearStuckSession = clearStuckSession
  console.log('💡 Developer helper available: clearStuckSession()')
}

onMounted(async () => {
  console.log('Home page mounted - starting initialization')

  try {
    // ✅ Initialize pharmacy request session from localStorage
    initializeSession()
    console.log('Pharmacy request session initialized')
    
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

    // Fetch popular products, new arrivals, and all products (no store filter)
    await Promise.all([
      productStore.fetchPopularProducts({}),
      productStore.fetchNewArrivals({}),
    ])

    // Fetch all products for "All Products" section
    try {
      const { data } = await apiService.getProducts({ page_size: 24 })
      allProducts.value = data?.results || data || []
    } catch (e) {
      console.warn('Failed to load all products for home:', e)
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
    form: 'tablet',
    urgency: 'normal',
    additional_notes: ''
  }
  isExpanded.value = false
  isSubmitting.value = false
  isSearching.value = false
  hasEverSearched.value = false
  showSellerNotifications.value = false
  foundSellers.value = []
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
      form: 'tablet',
      urgency: 'normal',
      additional_notes: ''
    }
  }
  isExpanded.value = true
  // Set bottom sheet to highest height for adding medicine
  bottomSheetHeight.value = HEIGHTS.HIGHEST
}

const collapseBottomSheet = () => {
  isExpanded.value = false
  // Reset to lowest height for initial view
  bottomSheetHeight.value = HEIGHTS.LOWEST
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
    form: 'tablet',
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
    form: 'tablet',
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

// Reset pharmacy search state
const resetPharmacySearch = () => {
  console.log('🔄 Resetting pharmacy search state')
  
  // Clear all search-related state
  submittedMedicines.value = []
  foundSellers.value = []
  showSellerNotifications.value = false
  isSearching.value = false
  isSubmitting.value = false
  isExpanded.value = false
  hasEverSearched.value = false
  
  // Reset medicine request form
  medicineRequest.value = {
    name: '',
    quantity: 1,
    form: '',
    urgency: 'normal',
    notes: ''
  }
  
  // Reset bottom sheet
  bottomSheetHeight.value = HEIGHTS.LOWEST
  
  // Clear search status
  searchStatus.value = {
    isSearching: false,
    messages: [],
    currentStep: '',
    searchStartTime: null,
    foundOffers: [],
    selectedPharmacies: [],
    responseCount: 0
  }
}

const submitAllRequests = async () => {
  // ✅ BLOCK: Check if session is already active
  if (hasActiveSession.value) {
    // Show more helpful message with option to clear
    console.warn('🚫 Blocked duplicate request - session already active:', activeSession.value)
    notification.addNotification({
      type: 'warning',
      title: 'Request In Progress',
      message: `You have an active request (${pharmacyRequestState.value}). If this is stuck, refresh the page or check console and type: clearStuckSession()`,
      timeout: 8000
    })
    return
  }
  
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
      pickup_address: `Togo, Lomé (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)})`,
      search_radius_km: searchRadius.value,
      urgency: medicineRequest.value.urgency, // Use default or could be based on highest priority
      additional_notes: medicineRequest.value.additional_notes,
      items: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form || 'tablet' // Default to tablet if form is empty
      }))
    }

    console.log('Submitting all medicine requests:', requestData)

    // Submit all requests to backend
    const response = await apiService.createMedicineRequest(requestData)
    const createdRequest = response.data

    console.log('All medicine requests created:', createdRequest)

    // ✅ START SESSION
    startSession(createdRequest.id)

    // Start searching animation and reduce bottom sheet height
    isSubmitting.value = false
    isSearching.value = true
    hasEverSearched.value = true
    searchTimer.value = 0
    
    // Set bottom sheet to middle height for live updates visibility
    bottomSheetHeight.value = HEIGHTS.MIDDLE
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
    
    // Start search timer (reduced frequency to 5 seconds for better performance)
    searchInterval = setInterval(() => {
      searchTimer.value += 5
    }, 5000)
    
    // Start real-time search status updates
    startSearchStatusUpdates(createdRequest.id)

    // Store request ID for tracking
    sessionStorage.setItem('currentMedicineRequestId', createdRequest.id)

    // DON'T clear medicines - keep them for potential retry (pharmacy-flow.txt line 249)
    // submittedMedicines.value = [] // REMOVED - keep medicines for retry

    // Start polling for pharmacy responses
    startPollingForOffers(createdRequest.id)

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
    
    // Real pharmacy responses will come via WebSocket from the backend
    
    // Stop after 10 seconds if no real responses
    if (searchTimer.value >= 10) {
      clearInterval(searchStatusInterval)
      searchStatusInterval = null
    }
  }, 5000) // Update every 5 seconds (reduced frequency)
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

// Real pharmacy responses will be handled via WebSocket from the backend

// Stop search status updates
const stopSearchStatusUpdates = () => {
  if (searchStatusInterval) {
    clearInterval(searchStatusInterval)
    searchStatusInterval = null
  }
  searchStatus.value.isSearching = false
}

// Polling replaced by WebSocket events (see notificationService dispatch)
let offerPollingInterval = null
const startPollingForOffers = (requestId) => {
  console.log('🟢 WS mode: waiting for real-time offers for request:', requestId)
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
  
  // Update search status to show no results
  searchStatus.value.isSearching = false
  searchStatus.value.status = 'no_results'
  searchStatus.value.message = 'No pharmacies found with your medicines'
  addSearchMessage('❌ No pharmacies found with your medicines', 'warning')
  
  // Update UI to show no pharmacy found message (pharmacy-flow.txt line 249)
  notification.addNotification({
    type: 'warning',
    title: 'No Pharmacies Found',
    message: 'No pharmacies responded to your request. Your request has been sent to our admin team for manual assistance.'
  })
  
  // Show retry options UI (pharmacy-flow.txt lines 132-136, 249)
  // Keep searching view visible for retry options
  bottomSheetHeight.value = HEIGHTS.MIDDLE // Stay at middle height for searching view
  isExpanded.value = false
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

// Handle real-time pharmacy events from notification service
window.addEventListener('pharmacyOffersReceived', (event) => {
  try {
    const { requestId, offersCount, hasActionButton, actionButton, timeoutSeconds } = event.detail || {}
    console.log('📡 WS: pharmacy offers received:', requestId, offersCount, hasActionButton)
    
    isSearching.value = false
    stopSearchStatusUpdates()
    if (searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    }
    searchStatus.value.isSearching = false
    searchStatus.value.status = 'success'
    searchStatus.value.message = `Found ${offersCount} pharmacy(ies) with your medicines!`
    addSearchMessage(`✅ Found ${offersCount} pharmacy(ies) with your medicines!`, 'success')
    bottomSheetHeight.value = HEIGHTS.MIDDLE
    isExpanded.value = false
    
    // If there's an action button, show persistent notification with countdown
    if (hasActionButton && actionButton) {
      console.log('🎯 Showing offer notification with action button and countdown')
      
      // Show persistent notification with action button
      notification.addNotification({
        id: `offer_${requestId}_${Date.now()}`,
        type: 'success',
        title: 'Medicine Offers Received!',
        message: `You have ${offersCount} pharmacy offer(s) for your medicine request`,
        persistent: true,
        timeout: 0,
        category: 'pharmacy_offers',
        data: {
          requestId: requestId,
          offersCount: offersCount,
          actionButton: actionButton,
          timeoutSeconds: timeoutSeconds || 300  // Default to 5 minutes
        },
        onActionClick: () => {
          // Open medicine request details dialog
          openOffersModal(requestId)
        },
        onTimeout: () => {
          // Handle timeout - search for more pharmacies
          console.log('⏰ Offer review timeout, searching for more pharmacies')
          addSearchMessage('⏰ Offer review timeout, searching for more pharmacies...', 'warning')
          // Trigger escalation
          window.dispatchEvent(new CustomEvent('offerReviewTimeout', {
            detail: { requestId }
          }))
        }
      })
    } else {
      // Fallback to old behavior
      apiService.getPharmacyOffers(requestId).then(res => {
        pharmacyOffers.value = res.data || []
        showOffersModal.value = true
      }).catch(() => {
        showOffersModal.value = true
      })
    }
  } catch (e) {
    console.warn('Failed to handle WS offers:', e)
  }
})

window.addEventListener('pharmacyNoOffers', (event) => {
  try {
    const { requestId } = event.detail || {}
    console.log('📡 WS: no offers for request:', requestId)
    handleNoResponseTimeout(requestId)
  } catch (e) {}
})

// Handle intelligent pharmacy search updates
window.addEventListener('pharmacySearchUpdate', (event) => {
  try {
    const { eventType, requestId, title, message, status, progress, data } = event.detail || {}
    console.log('🔍 Intelligent search update:', eventType, title, message)
    
    // Update search status based on event type
    switch (eventType) {
      case 'search_started':
        isSearching.value = true
        hasEverSearched.value = true
        searchStatus.value.isSearching = true
        searchStatus.value.status = 'searching'
        searchStatus.value.message = message
        addSearchMessage(`🔍 ${message}`, 'info')
        break
        
      case 'pharmacies_found':
        searchStatus.value.message = message
        addSearchMessage(`📍 ${message}`, 'info')
        break
        
      case 'pharmacy_contacted':
        const pharmacyName = data.pharmacy_name || 'Pharmacy'
        addSearchMessage(`📞 Contacted ${pharmacyName}`, 'info')
        break
        
      case 'pharmacy_acknowledged':
        const reviewingPharmacy = data.pharmacy_name || 'Pharmacy'
        searchStatus.value.message = `${reviewingPharmacy} is reviewing your request`
        addSearchMessage(`👀 ${reviewingPharmacy} is reviewing`, 'success')
        break
        
      case 'pharmacy_timeout':
        const timeoutPharmacy = data.pharmacy_name || 'Pharmacy'
        addSearchMessage(`⏰ ${timeoutPharmacy} did not respond`, 'warning')
        break
        
      case 'radius_expanded':
        const newRadius = data.new_radius || 'wider'
        searchStatus.value.message = `Expanding search to ${newRadius}km radius`
        addSearchMessage(`🔍 Expanded search radius to ${newRadius}km`, 'info')
        break
        
      case 'no_pharmacies':
        isSearching.value = false
        stopSearchStatusUpdates()
        searchStatus.value.isSearching = false
        searchStatus.value.status = 'no_results'
        searchStatus.value.message = message
        addSearchMessage(`❌ ${message}`, 'warning')
        showRetryOptions.value = true
        break
        
      default:
        console.log('Unknown search event type:', eventType)
    }
    
    // Update progress if provided
    if (progress && progress > 0) {
      console.log(`Search progress: ${progress}%`)
    }
    
  } catch (e) {
    console.warn('Failed to handle intelligent search update:', e)
  }
})

// Handle offer review timeout
window.addEventListener('offerReviewTimeout', (event) => {
  try {
    const { requestId } = event.detail || {}
    console.log('⏰ Offer review timeout for request:', requestId)
    
    // Restart search for more pharmacies
    isSearching.value = true
    hasEverSearched.value = true
    searchStatus.value.isSearching = true
    searchStatus.value.status = 'searching'
    searchStatus.value.message = 'Searching for more pharmacies...'
    addSearchMessage('🔍 Searching for more pharmacies...', 'info')
    
    // Trigger escalation in backend
    // This would typically be handled by the backend timeout task
    console.log('Escalation triggered for request:', requestId)
    
  } catch (e) {
    console.warn('Failed to handle offer review timeout:', e)
  }
})

// Function to open offers modal
const openOffersModal = async (requestId) => {
  try {
    console.log('🎯 Opening offers modal for request:', requestId)
    
    // Fetch offers from API
    const response = await apiService.getPharmacyOffers(requestId)
    pharmacyOffers.value = response.data || []
    
    // Show offers modal
    showOffersModal.value = true
    
    // Remove the persistent notification since user clicked the action button
    notification.removeNotification(`offer_${requestId}`)
    
  } catch (error) {
    console.error('Error opening offers modal:', error)
    notification.addNotification({
      type: 'error',
      title: 'Error',
      message: 'Failed to load pharmacy offers'
    })
  }
}

// Seller notification functions
const addFoundSeller = (seller) => {
  console.log('🏥 Adding found seller:', seller)
  const existingSeller = foundSellers.value.find(s => s.id === seller.id)
  if (!existingSeller) {
    foundSellers.value.push({
      ...seller,
      status: 'found', // 'found', 'acknowledged', 'declined', 'offered'
      timestamp: new Date().toISOString(),
      chatEnabled: true
    })
    showSellerNotifications.value = true
    
    // Keep searching overlay visible but show seller notifications in it
    // This allows real-time updates while showing found pharmacies
    bottomSheetHeight.value = HEIGHTS.MIDDLE // Show at middle height for better visibility
    isExpanded.value = true // Ensure sheet is expanded to show sellers
    
    addSearchMessage(`🏥 Found pharmacy: ${seller.seller_name || seller.name}`, 'success')
    
    // Bottom sheet will show the seller - no snackbar notification
  }
}

const updateSellerStatus = (sellerId, status, data = {}) => {
  console.log('📊 Updating seller status:', { sellerId, status, data })
  const seller = foundSellers.value.find(s => s.id === sellerId)
  if (seller) {
    seller.status = status
    seller.timestamp = new Date().toISOString()
    Object.assign(seller, data)
    
    // Add appropriate message and notification based on status
    switch (status) {
      case 'acknowledged':
        // Update bottom sheet only - no snackbar notification
        addSearchMessage(`✅ ${seller.seller_name || seller.name} found and reviewing`, 'success')
        break
      case 'declined':
        // Remove seller from list and go back to searching mode
        foundSellers.value = foundSellers.value.filter(s => s.id !== sellerId)
        addSearchMessage(`❌ ${seller.seller_name || seller.name} declined - searching for other pharmacies`, 'warning')
        
        // If no sellers left, show searching mode
        if (foundSellers.value.length === 0) {
          showSellerNotifications.value = false
          isSearching.value = true
        }
        break
      case 'offered':
        // Update bottom sheet only - no snackbar notification
        addSearchMessage(`🎉 ${seller.seller_name || seller.name} made an offer!`, 'success')
        // Ensure we show seller notifications when an offer comes in
        showSellerNotifications.value = true
        break
    }
  } else {
    console.warn('⚠️ Seller not found in foundSellers array:', sellerId)
    // If seller not found, try to add them first with the data provided
    if (data.seller_name || data.name) {
      addFoundSeller({
        id: sellerId,
        seller_name: data.seller_name || data.name,
        name: data.name || data.seller_name,
        ...data
      })
      // Then try to update status again
      setTimeout(() => updateSellerStatus(sellerId, status, data), 100)
    }
  }
}

const openChat = (seller) => {
  selectedSeller.value = seller
  showChatDialog.value = true
  // Load chat messages for this seller
  loadChatMessages(seller.id)
}

const loadChatMessages = async (sellerId) => {
  try {
    // TODO: Implement API call to load chat messages
    chatMessages.value = [
      {
        id: 1,
        sender: 'seller',
        message: 'Hello! I received your medicine request. Do you have a prescription?',
        timestamp: new Date().toISOString()
      }
    ]
  } catch (error) {
    console.error('Error loading chat messages:', error)
  }
}

const sendChatMessage = async () => {
  if (!newChatMessage.value.trim() || !selectedSeller.value) return
  
  try {
    const message = {
      id: Date.now(),
      sender: 'shopper',
      message: newChatMessage.value,
      timestamp: new Date().toISOString()
    }
    
    chatMessages.value.push(message)
    
    // TODO: Implement API call to send message
    console.log('Sending message to seller:', selectedSeller.value.id, message)
    
    newChatMessage.value = ''
  } catch (error) {
    console.error('Error sending message:', error)
  }
}

const closeChat = () => {
  showChatDialog.value = false
  selectedSeller.value = null
  chatMessages.value = []
  newChatMessage.value = ''
}

// Utility function to format time
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// "Dispatched" phase feedback — keep searching view but surface waiting message
window.addEventListener('pharmacyDispatched', (event) => {
  try {
    const { requestId, radiusKm } = event.detail || {}
    console.log('📡 WS: request dispatched to pharmacies:', requestId, radiusKm)
    // Ensure searching overlay remains, but refresh copy to waiting state
    isSearching.value = true
    hasEverSearched.value = true
    if (!searchStatusInterval) {
      startSearchStatusUpdates()
    }
    searchStatus.value.isSearching = true
    searchStatus.value.currentStep = `Waiting for pharmacy responses…`
    addSearchMessage(`📡 Request dispatched to pharmacies within ${radiusKm || searchRadius.value}km`, 'info')
  } catch (e) {}
})

// Seller notification WebSocket listeners
window.addEventListener('sellerFound', (event) => {
  try {
    const { seller, requestId } = event.detail || {}
    console.log('🏥 Seller found event received:', { seller, requestId })
    
    // Store the current request ID for later use
    if (requestId) {
      sessionStorage.setItem('currentMedicineRequestId', requestId)
    }
    
    // Add seller with requestId
    addFoundSeller({
      ...seller,
      requestId: requestId || sessionStorage.getItem('currentMedicineRequestId')
    })
  } catch (e) {
    console.warn('Failed to handle seller found event:', e)
  }
})

// ==================== STATE MACHINE EVENT HANDLERS ====================

window.addEventListener('sellerAcknowledged', (event) => {
  try {
    const sellerData = event.detail || {}
    console.log('✅ sellerAcknowledged event:', sellerData)
    
    // Validate session
    if (!activeSession.value || activeSession.value.requestId !== sellerData.requestId) {
      console.warn('⚠️ Ignoring event - no active session or requestId mismatch')
      return
    }
    
    // ✅ TRANSITION: searching → seller_acknowledged
    const { 
      sellerId, 
      sellerName, 
      business_name, 
      business_address, 
      phone_number,
      delivery_radius,
      response_time
    } = sellerData
    
    updateSessionState('seller_acknowledged', {
      sellerData: {
        id: sellerId,
        name: sellerName || business_name || 'Pharmacy',
        businessName: business_name,
        address: business_address || '',
        phone: phone_number || '',
        deliveryRadius: delivery_radius || 5,
        responseTime: response_time || '10-15 mins'
      }
    })
    
    // Stop searching UI
    isSearching.value = false
    if (searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    }
    
    console.log('✅ State transitioned to SELLER_ACKNOWLEDGED')
    
  } catch (e) {
    console.error('❌ Failed to handle seller acknowledged:', e)
  }
})

window.addEventListener('sellerDeclined', (event) => {
  try {
    const { sellerId, sellerName, reason, requestId } = event.detail || {}
    console.log('❌ sellerDeclined event:', { sellerId, sellerName, reason, requestId })
    
    // Validate session
    if (!activeSession.value || activeSession.value.requestId !== requestId) {
      console.warn('⚠️ Ignoring event - no active session or requestId mismatch')
      return
    }
    
    console.log('🔍 Current session before clearing:', JSON.parse(JSON.stringify(activeSession.value)))
    
    // ✅ TRANSITION: seller_acknowledged/searching → searching
    // Backend continues searching for another seller
    // Explicitly clear seller data
    if (activeSession.value) {
      activeSession.value.state = 'searching'
      activeSession.value.sellerData = null
      pharmacyRequestState.value = 'searching'
      saveSession()
    }
    
    console.log('🔍 Session after clearing:', JSON.parse(JSON.stringify(activeSession.value)))
    
    // Resume searching UI
    isSearching.value = true
    
    // Add notification about decline
    notification.addNotification({
      type: 'info',
      title: 'Seller Declined',
      message: `${sellerName || 'Pharmacy'} declined your request. Searching for another pharmacy...`,
      timeout: 5000
    })
    
    console.log('✅ State transitioned back to SEARCHING after decline')
    console.log('✅ pharmacyRequestState:', pharmacyRequestState.value)
    console.log('✅ activeSession.sellerData:', activeSession.value?.sellerData)
    
  } catch (e) {
    console.error('❌ Failed to handle seller declined:', e)
  }
})

window.addEventListener('sellerOffered', (event) => {
  try {
    const sellerData = event.detail || {}
    console.log('💰 sellerOffered event:', sellerData)
    
    const { 
      sellerId, sellerName, offer, requestId,
      seller_name, business_name, business_address, phone_number
    } = sellerData
    
    // Validate session
    if (!activeSession.value || activeSession.value.requestId !== requestId) {
      console.warn('⚠️ Ignoring event - no active session or requestId mismatch')
      return
    }
    
    // ✅ TRANSITION: seller_acknowledged → offer_received
    updateSessionState('offer_received', {
      sellerData: {
        id: sellerId,
        name: sellerName || business_name || seller_name || 'Pharmacy',
        businessName: business_name || seller_name,
        address: business_address || '',
        phone: phone_number || '',
        offer: offer
      }
    })
    
    // Stop searching UI
    isSearching.value = false
    if (searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    }
    stopSearchStatusUpdates()
    
    // Fetch full offer details
    if (requestId) {
      apiService.getPharmacyOffers(requestId)
        .then(response => {
          pharmacyOffers.value = response.data || []
          console.log('📋 Fetched pharmacy offers:', pharmacyOffers.value.length)
        })
        .catch(err => {
          console.error('Failed to fetch offers:', err)
        })
    }
    
    console.log('✅ State transitioned to OFFER_RECEIVED')
    
  } catch (e) {
    console.error('❌ Failed to handle seller offered:', e)
  }
})

window.addEventListener('noSellersFound', (event) => {
  try {
    const { requestId, message } = event.detail || {}
    console.log('🚫 noSellersFound event:', { requestId, message })
    
    // Validate session
    if (!activeSession.value || activeSession.value.requestId !== requestId) {
      console.warn('⚠️ Ignoring event - no active session or requestId mismatch')
      return
    }
    
    // ✅ TRANSITION: searching → no_sellers_found
    updateSessionState('no_sellers_found', {
      sellerData: null
    })
    
    // Stop searching UI
    isSearching.value = false
    if (searchInterval) {
      clearInterval(searchInterval)
      searchInterval = null
    }
    stopSearchStatusUpdates()
    
    // Show admin takeover notification
    notification.addNotification({
      type: 'info',
      title: 'Admin Assistance',
      message: 'No pharmacies available. One of our admins will take over your request.',
      timeout: 0, // Persistent
      persistent: true
    })
    
    console.log('✅ State transitioned to NO_SELLERS_FOUND')
    
  } catch (e) {
    console.error('❌ Failed to handle no sellers found:', e)
  }
})

// Handle acknowledgment timeout (5 min timer expired without seller acknowledging)
window.addEventListener('acknowledgmentTimeout', (event) => {
  try {
    const { requestId, pharmacy_id } = event.detail || {}
    console.log('⏰ acknowledgmentTimeout event:', { requestId, pharmacy_id })
    
    // Validate session
    if (!activeSession.value || activeSession.value.requestId !== requestId) {
      console.warn('⚠️ Ignoring timeout - no active session or requestId mismatch')
      return
    }
    
    // ✅ TRANSITION: seller_acknowledged/searching → searching
    // Backend automatically continues to next pharmacy
    updateSessionState('searching', {
      sellerData: null
    })
    
    // Resume searching UI
    isSearching.value = true
    
    // Show timeout notification
    notification.addNotification({
      type: 'info',
      title: 'Searching Continues',
      message: 'Previous pharmacy didn\'t respond in time. Finding another pharmacy for you...',
      timeout: 5000
    })
    
    console.log('✅ State transitioned back to SEARCHING after timeout')
    
  } catch (e) {
    console.error('❌ Failed to handle acknowledgment timeout:', e)
  }
})

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
  submitAllRequests()
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
  
  // Snap to positions using height constants
  if (bottomSheetHeight.value < 300) {
    bottomSheetHeight.value = HEIGHTS.LOWEST // Collapsed
    isExpanded.value = false
  } else if (bottomSheetHeight.value > 500) {
    bottomSheetHeight.value = HEIGHTS.HIGHEST // Expanded
    isExpanded.value = true
  } else {
    // Snap to middle height
    bottomSheetHeight.value = HEIGHTS.MIDDLE
    isExpanded.value = false
  }
  
  // Remove global event listeners
  document.removeEventListener('mousemove', handleDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', handleDrag)
  document.removeEventListener('touchend', endDrag)
}

// Medicine autocomplete functions
const onMedicineNameInput = async () => {
  const query = medicineRequest.value.name.trim()
  
  if (query.length < 2) {
    autocompleteSuggestions.value = []
    return
  }
  
  // Clear previous timeout
  if (autocompleteTimeout.value) {
    clearTimeout(autocompleteTimeout.value)
  }
  
  // Debounce the API call
  autocompleteTimeout.value = setTimeout(async () => {
    try {
      const response = await apiService.getMedicineAutocomplete(query)
      autocompleteSuggestions.value = response.data.suggestions || []
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error)
      autocompleteSuggestions.value = []
    }
  }, 300)
}

const selectSuggestion = (suggestion) => {
  medicineRequest.value.name = suggestion
  showAutocomplete.value = false
  autocompleteSuggestions.value = []
}

const hideAutocomplete = () => {
  // Delay hiding to allow click events to fire
  setTimeout(() => {
    showAutocomplete.value = false
  }, 200)
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
      medicine_request: selectedOffer.value.medicine_request,
      pharmacy_offer: selectedOffer.value.id,
      pickup_latitude: userLocation.value?.lat || 6.13,
      pickup_longitude: userLocation.value?.lng || 1.22,
      pickup_address: 'User Location', // TODO: Get actual address
      delivery_type: 'delivery',
      items_data: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form,
        unit_price: selectedOffer.value.price_per_item || 0
      }))
    }
    
    // Submit order to backend
    const response = await apiService.createPharmacyOrder(orderData)
    
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

// View offer details
const viewOfferDetails = (seller) => {
  console.log('📋 Viewing offer details for:', seller)
  
  if (seller.offer) {
    selectedOffer.value = seller.offer
    showOffersModal.value = true
  } else {
    notification.addNotification({
      type: 'warning',
      title: 'No Offer Details',
      message: 'Offer details are not available at this time.',
      timeout: 3000
    })
  }
}

// Select pickup option
const selectPickupOption = async (seller) => {
  try {
    console.log('🚶 Selecting pickup option for:', seller)
    
    if (!seller.offer) {
      throw new Error('No offer available')
    }
    
    // Create order with pickup option (pharmacy-flow.txt lines 239-242)
    const orderData = {
      medicine_request: seller.requestId || seller.offer.medicine_request,
      pharmacy_offer: seller.offer.id,
      pickup_latitude: userLocation.value?.lat || 6.13,
      pickup_longitude: userLocation.value?.lng || 1.22,
      pickup_address: seller.business_address || 'Pharmacy Location',
      delivery_type: 'pickup',
      items_data: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form,
        unit_price: seller.offer.price_per_item || 0
      }))
    }
    
    // Submit order to backend
    const response = await apiService.createPharmacyOrder(orderData)
    
    // Get pickup code from response
    const pickupCode = response.data.pickup_code || `PU${Date.now().toString().slice(-6)}`
    
    notification.addNotification({
      type: 'success',
      title: '✅ Pickup Order Confirmed!',
      message: `Your pickup code is ${pickupCode}. Show this at ${seller.seller_name || 'the pharmacy'}.`,
      timeout: 10000,
      persistent: true
    })
    
    // ✅ END SESSION - Pickup selected
    endSession()
    console.log('✅ Session ended after pickup selection')
    
    // Reset UI
    resetPharmacySearch()
    
  } catch (error) {
    console.error('❌ Error creating pickup order:', error)
    notification.addNotification({
      type: 'error',
      title: 'Order Failed',
      message: error.response?.data?.message || 'Could not create your pickup order. Please try again.',
      timeout: 5000
    })
  }
}

// Select delivery option
const selectDeliveryOption = async (seller) => {
  try {
    console.log('🚚 Selecting delivery option for:', seller)
    
    if (!seller.offer) {
      throw new Error('No offer available')
    }
    
    // Create order with delivery option (pharmacy-flow.txt lines 230-236)
    const orderData = {
      medicine_request: seller.requestId || seller.offer.medicine_request,
      pharmacy_offer: seller.offer.id,
      pickup_latitude: userLocation.value?.lat || 6.13,
      pickup_longitude: userLocation.value?.lng || 1.22,
      pickup_address: 'User Location',
      delivery_type: 'delivery',
      items_data: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form,
        unit_price: seller.offer.price_per_item || 0
      }))
    }
    
    // Submit order to backend
    const response = await apiService.createPharmacyOrder(orderData)
    
    notification.addNotification({
      type: 'success',
      title: '✅ Delivery Order Confirmed!',
      message: 'Your order has been submitted. An AfriQExpress driver will deliver your medicine shortly.',
      timeout: 10000,
      persistent: true
    })
    
    // ✅ END SESSION - Delivery selected
    endSession()
    console.log('✅ Session ended after delivery selection')
    
    // Reset UI
    resetPharmacySearch()
    
  } catch (error) {
    console.error('❌ Error creating delivery order:', error)
    notification.addNotification({
      type: 'error',
      title: 'Order Failed',
      message: error.response?.data?.message || 'Could not create your delivery order. Please try again.',
      timeout: 5000
    })
  }
}

const choosePickup = async () => {
  try {
    console.log('Choosing pickup for offer:', selectedOffer.value)
    
    // Create order with pickup option (pharmacy-flow.txt lines 239-242)
    const orderData = {
      medicine_request: selectedOffer.value.medicine_request,
      pharmacy_offer: selectedOffer.value.id,
      pickup_latitude: userLocation.value?.lat || 6.13,
      pickup_longitude: userLocation.value?.lng || 1.22,
      pickup_address: 'User Location', // TODO: Get actual address
      delivery_type: 'pickup',
      items_data: submittedMedicines.value.map(medicine => ({
        medicine_name: medicine.name,
        quantity: medicine.quantity,
        form: medicine.form,
        unit_price: selectedOffer.value.price_per_item || 0
      }))
    }
    
    // Submit order to backend
    const response = await apiService.createPharmacyOrder(orderData)
    
    // Get pickup code from response
    const pickupCode = response.data.pickup_code || `PU${Date.now().toString().slice(-6)}`
    
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
    
    // Clear existing markers
    pharmacyMarkers.value.forEach(marker => {
      map.value.removeLayer(marker)
    })
    pharmacyMarkers.value = []
    
    // Create proper green pharmacy marker icon
    const createPharmacyIcon = (name) => {
      return L.divIcon({
        className: 'pharmacy-marker',
        html: `<div class="pharmacy-marker-container">
                 <!-- Gradient Marker Pin -->
                 <div class="pharmacy-pin">
                   <svg class="pharmacy-pin-svg" viewBox="0 0 24 24" fill="none">
                     <defs>
                       <linearGradient id="pharmacyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                         <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                         <stop offset="100%" style="stop-color:#4f46e5;stop-opacity:1" />
                       </linearGradient>
                     </defs>
                     <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="url(#pharmacyGradient)"/>
                     <path d="M12 6c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="white"/>
                   </svg>
                 </div>
                 <!-- Pharmacy Name Label -->
                 <div class="pharmacy-name-label" style="font-weight: bold;color: blue;">${name}</div>
               </div>`,
        iconSize: [50, 50],
        iconAnchor: [40, 45],
        popupAnchor: [-15,-15]
      })
    }
    
    // Store pharmacy coordinates for bounds calculation
    const pharmacyCoords = []
    
    // Add marker for each pharmacy seller
    pharmacySellers.forEach(seller => {
      // Check if seller has valid coordinates
      if (seller.latitude && seller.longitude) {
        const pharmacyName = seller.business_name || seller.seller_name || 'Pharmacy'
        
        // Add pharmacy marker with green pin
        const marker = L.marker([seller.latitude, seller.longitude], {
          icon: createPharmacyIcon(pharmacyName),
          title: pharmacyName
        }).addTo(map.value)
        
        // Store marker for later cleanup
        pharmacyMarkers.value.push(marker)
        
        // Store coordinates for bounds calculation
        pharmacyCoords.push([seller.latitude, seller.longitude])
        
        // Create detailed popup with pharmacy info
        const popupContent = `
          <div class="pharmacy-popup-content">
            <div class="pharmacy-popup-header">
              <div class="pharmacy-popup-icon">🏥</div>
              <div class="pharmacy-popup-title">${pharmacyName}</div>
            </div>
            <div class="pharmacy-popup-body">
              <div class="pharmacy-popup-address">${seller.address || 'Pharmacy location'}</div>
              ${seller.phone ? `<div class="pharmacy-popup-phone">📞 ${seller.phone}</div>` : ''}
              <div class="pharmacy-popup-status">✅ Available for medicine requests</div>
            </div>
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
    
    // Update pharmacy count display
    const pharmacyCount = pharmacySellers.length
    console.log('🗺️ Added', pharmacyCount, 'pharmacy markers to map')
    
    // Zoom to show all pharmacies instead of user location
    if (pharmacyCoords.length > 0) {
      const group = new L.featureGroup(pharmacyMarkers.value)
      map.value.fitBounds(group.getBounds().pad(0.1)) // Add 10% padding
      
      // If only one pharmacy, zoom to a reasonable level
      if (pharmacyCoords.length === 1) {
        map.value.setView(pharmacyCoords[0], 15)
      }
    }
    
    // Update pharmacy count in the UI
    updatePharmacyCount(pharmacyCount)
    
  } catch (error) {
    console.error('❌ Error loading pharmacy markers:', error)
  }
}

// Update pharmacy count display
const updatePharmacyCount = (count) => {
  // Find and update pharmacy count element
  const countElement = document.querySelector('.pharmacy-count')
  if (countElement) {
    countElement.textContent = count
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
  height: calc(100vh - 96px); /* Account for bottom navigation (96px) */
  overflow: hidden;
}

.pharmacy-map-container .absolute.top-0 {
  background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent);
  /* padding-top: env(safe-area-inset-top, 0); */
}

.pharmacy-map-height {
  height: 100%;
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

.pharmacy-marker-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.pharmacy-pin {
  position: relative;
  z-index: 2;
}

.pharmacy-pin-svg {
  width: 24px;
  height: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.pharmacy-name-label {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 600;
  color: #3b82f6;
  margin-top: 2px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pharmacy-marker:hover .pharmacy-name-label {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(59, 130, 246, 0.5);
  transform: scale(1.05);
}

.pharmacy-marker:hover .pharmacy-pin-svg {
  transform: scale(1.1);
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

/* Pharmacy count inline styles */
.pharmacy-count-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 4px 8px;
  margin-left: 8px;
}

.pharmacy-count-icon-inline {
  width: 14px;
  height: 14px;
  color: #3b82f6;
  flex-shrink: 0;
}

.pharmacy-count-number {
  font-size: 12px;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

/* Pharmacy popup styles */
.pharmacy-popup {
  min-width: 200px;
  font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.pharmacy-popup-content {
  padding: 16px;
}

.pharmacy-popup-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.pharmacy-popup-icon {
  font-size: 20px;
}

.pharmacy-popup-title {
  font-size: 16px;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.pharmacy-popup-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.pharmacy-popup-address {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.pharmacy-popup-phone {
  font-size: 13px;
  color: #2563eb;
  font-weight: 500;
}

.pharmacy-popup-status {
  font-size: 12px;
  color: #059669;
  font-weight: 600;
  margin-top: 4px;
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