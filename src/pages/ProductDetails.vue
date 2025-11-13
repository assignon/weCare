<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 pb-24">
    <!-- Top navigation bar -->
    <div class="fixed top-0 left-0 right-0 z-50 px-4 py-3">
      <div class="flex items-center justify-between">
        <button 
          @click="$router.go(-1)" 
          class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
        >
          <ArrowLeft class="w-5 h-5 text-gray-600" />
        </button>
        <div class="flex items-center space-x-2">
          <button 
            @click="toggleLike"
            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
            :class="isLiked ? 'bg-red-50 border-red-200' : ''"
          >
            <Heart 
              class="w-5 h-5 transition-all duration-200" 
              :class="isLiked ? 'text-red-600 fill-red-600' : 'text-gray-600'"
            />
          </button>
          <button 
            @click="shareProduct"
            class="w-10 h-10 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-white/20 flex items-center justify-center"
          >
            <Share2 class="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="pt-20 px-4">
      <div class="animate-pulse space-y-4">
        <!-- Image skeleton -->
        <div class="bg-gray-200 rounded-2xl h-80 mb-6"></div>
        
        <!-- Content skeleton -->
        <div class="space-y-4">
          <!-- Brand and stock -->
          <div class="flex justify-between items-center">
            <div class="h-3 bg-gray-200 rounded-full w-20"></div>
            <div class="h-5 bg-gray-200 rounded-full w-16"></div>
          </div>
          
          <!-- Title -->
          <div class="space-y-2">
            <div class="h-6 bg-gray-200 rounded-lg w-3/4"></div>
            <div class="h-4 bg-gray-200 rounded-lg w-1/2"></div>
          </div>
          
          <!-- Price -->
          <div class="h-6 bg-gray-200 rounded-lg w-24"></div>
          
          <!-- Variants -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded w-16"></div>
            <div class="flex space-x-2">
              <div class="h-10 bg-gray-200 rounded-xl w-16"></div>
              <div class="h-10 bg-gray-200 rounded-xl w-16"></div>
              <div class="h-10 bg-gray-200 rounded-xl w-16"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error alert -->
    <div v-if="error" class="pt-20 px-4 mb-4">
      <div class="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl">
        <div class="flex items-center">
          <AlertCircle class="w-5 h-5 text-red-500 mr-3" />
          <span class="text-red-700 font-medium text-sm">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Product details -->
    <div v-if="product" class="pt-16">
      <!-- Product image carousel -->
      <div class="relative mb-6">
        <!-- Main image -->
        <div class="aspect-square overflow-hidden bg-gray-100 relative">
          <img 
            v-if="product.image_1 == null && product.image_2 == null"
            :src="product.main_image || packagingImage" 
            :alt="product.name"
            class="w-full h-full object-cover"
          />
          <div v-else class="relative">
            <img 
              :src="currentImage" 
              :alt="product.name"
              class="w-full h-full object-cover"
            />
          </div>
          
          <!-- Thumbnail images overlay -->
          <div v-if="productImages.length > 1" class="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-black/20 backdrop-blur-sm rounded-lg px-2 py-1">
            <button 
              v-for="(image, index) in productImages" 
              :key="index"
              @click="currentImageIndex = index"
              :class="[
                'w-10 h-10 rounded-md overflow-hidden border-2 transition-all duration-200',
                currentImageIndex === index 
                  ? 'border-white shadow-lg' 
                  : 'border-white/50 hover:border-white/75'
              ]"
            >
              <img 
                :src="image" 
                :alt="`${product.name} - Image ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- Product info -->
      <div class="px-4 space-y-4 mb-8">
        <!-- Brand and stock status -->
        <div class="flex justify-between items-center">
          <div class="text-sm text-gray-500 font-medium">{{ product.seller_name || 'weCare' }}</div>
          <div 
            v-if="currentStock > 0" 
            class="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full"
          >
            {{ currentStock }} In Stock
          </div>
          <div 
            v-else 
            class="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full"
          >
            Out of Stock
          </div>
        </div>

        <!-- Product title -->
        <h1 class="text-xl font-bold text-gray-900 capitalize leading-tight">{{ product.name }}</h1>

        <!-- Price -->
        <div class="flex items-center justify-between">
          <div class="text-lg font-bold text-blue-600">
            {{ formatApiPrice({ price: currentPrice }) }}
          </div>
        </div>

        <!-- Size and Quantity - Only show if in stock -->
        <div v-if="product.variants && product.variants.length > 0" class="space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="text-sm font-semibold text-gray-900">Variants</h3>
          </div>

          <!-- Size options -->
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="variant in product.variants" 
              :key="variant.id"
              @click="selectVariant(variant)"
              :class="[
                'px-3 py-2 rounded-xl font-medium text-sm transition-all duration-200',
                selectedVariant?.id === variant.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              {{ variant.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Tab section -->
      <div class="px-4">
          <!-- Tab headers -->
          <div class="flex space-x-1 mb-4 bg-gray-100/50 rounded-xl p-1">
            <button 
              @click="activeTab = 'description'"
              :class="[
                'flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200',
                activeTab === 'description' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Description
            </button>
            <button 
              @click="activeTab = 'reviews'"
              :class="[
                'flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200',
                activeTab === 'reviews' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Reviews ({{ product.review_stats.count }})
            </button>
            <button 
              @click="activeTab = 'attributes'"
              :class="[
                'flex-1 py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200',
                activeTab === 'attributes' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              ]"
            >
              Details
            </button>
          </div>

          <!-- Tab content -->
          <div class="space-y-4">
            <!-- Description tab -->
            <div v-if="activeTab === 'description'" class="space-y-4">
              <p class="text-gray-700 leading-relaxed text-sm">{{ product.description || "No description available." }}</p>


              <!-- Skin Types Section -->
              <div v-if="product.suitable_for && product.suitable_for.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Suitable for Skin Types</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="skinType in product.suitable_for" 
                    :key="skinType.id"
                    class="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                  >
                    {{ skinType.name }}
                  </span>
                </div>
              </div>

              <!-- Skin Concerns Section -->
              <div v-if="product.skin_concerns && product.skin_concerns.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Addresses Skin Concerns</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="concern in product.skin_concerns" 
                    :key="concern.id"
                    class="px-3 py-2 bg-teal-50 text-teal-700 text-sm font-medium rounded-full border border-teal-200"
                  >
                    {{ concern.name }}
                  </span>
                </div>
              </div>

              <!-- Product Types Section -->
              <div v-if="product.product_types && product.product_types.length > 0" class="space-y-3">
                <h6 class="text-lg font-semibold text-gray-900">Product Types</h6>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="type in product.product_types" 
                    :key="type.id"
                    class="px-3 py-2 bg-purple-50 text-purple-700 text-sm font-medium rounded-full border border-purple-200"
                  >
                    {{ type.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Reviews tab -->
            <div v-if="activeTab === 'reviews'" class="space-y-4">
              <div class="flex items-center space-x-2 mb-4">
                <div class="flex items-center">
                  <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(product.review_stats.avg_rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'" />
                </div>
                <span class="text-gray-600 font-medium">({{ product.review_stats.count }} reviews)</span>
              </div>

              <!-- Sample reviews -->
              <div v-if="product.review_stats.count > 0" class="space-y-4">
                <div 
                  v-for="review in productStore.productReviews" 
                  :key="review.id"
                  class="p-4 bg-gray-50/50 rounded-2xl border border-gray-200/50"
                >
                  <div class="flex justify-between items-start mb-2">
                    <div class="font-semibold text-gray-900">{{ review.user_name }}</div>
                    <div class="text-xs text-gray-500">{{ review.created_at }}</div>
                  </div>
                  <div class="flex items-center mb-2">
                    <Star v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'" />
                  </div>
                  <p class="text-sm text-gray-700">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="text-center py-8">
                <MessageCircle class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p class="text-gray-600 font-medium">No reviews yet. Be the first to review this product.</p>
              </div>
            </div>



            <!-- Product Attributes tab -->
            <div v-if="activeTab === 'attributes'" class="space-y-4">
              <!-- Loading state for attributes -->
              <div v-if="loadingAttributes" class="flex flex-col items-center justify-center py-8">
                <div class="relative mb-4">
                  <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-200" style="border-color: #dbeafe;"></div>
                  <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent absolute top-0 left-0" style="border-color: #2563eb;"></div>
                </div>
                <p class="text-sm text-gray-600 font-medium">Loading product details...</p>
              </div>

              <!-- Attributes loaded successfully -->
              <div v-else-if="productAttributes.length > 0" class="space-y-6">
                <!-- Document-style specifications -->
                <div>
                  <!-- Header -->
                  <div class="pb-4 border-b border-gray-100">
                    <h3 class="text-xl font-bold text-gray-900">Product Specifications</h3>
                    <p class="text-sm text-gray-600 mt-1">Technical details and specifications</p>
                  </div>
                  
                  <!-- Specifications list -->
                  <div class="pt-6 grid grid-cols-2 gap-4">
                    <div 
                      v-for="(attr, index) in productAttributes" 
                      :key="`${attr.id}-${index}`" 
                      class="space-y-2"
                    >
                      <!-- Specification Label -->
                      <h4 class="font-semibold text-gray-900 text-sm leading-5">{{ attr.label }}</h4>
                      
                      <!-- Specification Value -->
                      <div class="ml-0">
                        <!-- Text, Number, Decimal values -->
                        <p v-if="['text', 'number', 'decimal'].includes(attr.field_type)" 
                           class="text-gray-700 text-sm leading-relaxed">
                          {{ getFormattedAttributeValue(attr) || 'Not specified' }}
                        </p>

                        <!-- Select value -->
                        <p v-else-if="attr.field_type === 'select'" 
                           class="text-gray-700 text-sm leading-relaxed">
                          {{ getFormattedAttributeValue(attr) || 'Not specified' }}
                        </p>

                        <!-- Multiselect values -->
                        <div v-else-if="attr.field_type === 'multiselect'">
                          <div v-if="attr.attribute_value && attr.attribute_value.selected_choices && attr.attribute_value.selected_choices.length > 0" class="flex flex-wrap gap-3">
                            <span 
                              v-for="choice in attr.attribute_value.selected_choices" 
                              :key="choice"
                              class="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200"
                            >
                              {{ choice }}
                            </span>
                          </div>
                          <p v-else class="text-sm text-gray-500 italic">Not specified</p>
                        </div>

                        <!-- Boolean value -->
                        <div v-else-if="attr.field_type === 'boolean'" class="flex items-center space-x-3">
                          <div class="w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
                               :class="attr.attribute_value && attr.attribute_value.boolean_value ? 'bg-green-500' : 'bg-gray-400'">
                            <svg v-if="attr.attribute_value && attr.attribute_value.boolean_value" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <svg v-else class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                          </div>
                          <span class="text-sm text-gray-700 font-medium">
                            {{ attr.attribute_value && attr.attribute_value.boolean_value ? 'Yes' : 'No' }}
                          </span>
                        </div>

                        <!-- Date value -->
                        <p v-else-if="attr.field_type === 'date'" 
                           class="text-gray-700 text-sm leading-relaxed">
                          {{ getFormattedAttributeValue(attr) || 'Not specified' }}
                        </p>

                        <!-- File value -->
                        <div v-else-if="attr.field_type === 'file'" class="flex items-center space-x-2">
                          <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                          </svg>
                          <span class="text-sm text-gray-700">
                            {{ getFormattedAttributeValue(attr) ? 'File attached' : 'No file' }}
                          </span>
                        </div>

                        <!-- Default fallback -->
                        <p v-else class="text-gray-700 text-sm leading-relaxed">
                          {{ getFormattedAttributeValue(attr) || 'Not specified' }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No attributes available -->
              <div v-else class="text-center py-8">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                </div>
                <h3 class="text-sm font-semibold text-gray-900 mb-2">No Additional Details</h3>
                <p class="text-gray-600 text-xs max-w-sm mx-auto">This product doesn't have additional details available at the moment.</p>
              </div>
            </div>
          </div>
        </div>
    </div>

    <!-- Separator -->
    <div class="px-4 py-6">
      <div class="border-t border-gray-200"></div>
    </div>

    <!-- Similar Products Section (Same Store Category) -->
    <div v-if="similarProducts.length > 0" class="px-4 py-6">
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900 mb-1">Similar Products</h2>
        <p class="text-sm text-gray-600">Products from the same category</p>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="product in similarProducts" 
          :key="product.id" 
          class="flex flex-col cursor-pointer"
          @click="navigateToDetails(product.id, product.item_type || 'store_product')"
        >
          <!-- Product Card - Only contains image -->
          <div class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square relative">
            <img 
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
              class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight hover:text-blue-600 transition-colors capitalize"
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

    <!-- Products from Same Seller Section -->
    <div v-if="sellerProducts.length > 0" class="px-4 py-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-bold text-gray-900 mb-1">More from {{ product?.seller_name || product?.store_name || 'Seller' }}</h2>
          <p class="text-sm text-gray-600">Other products from this seller</p>
        </div>
        <button 
          @click="viewAllSellerProducts"
          class="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All
        </button>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div 
          v-for="product in sellerProducts" 
          :key="product.id" 
          class="flex flex-col cursor-pointer"
          @click="navigateToDetails(product.id, product.item_type || 'store_product')"
        >
          <!-- Product Card - Only contains image -->
          <div class="group bg-gray-100 rounded-lg border border-gray-200/50 transition-all duration-200 overflow-hidden mb-2 aspect-square relative">
            <img 
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
              class="font-bold text-xs text-gray-900 mb-1 line-clamp-2 leading-tight hover:text-blue-600 transition-colors capitalize"
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

    <!-- Bottom fixed action buttons -->
    <div v-if="product" class="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-t border-gray-200/50">
      <div class="p-4">
        <!-- Out of stock notification button -->
        <button 
          v-if="currentStock <= 0" 
          @click="requestRestockNotification"
          :disabled="notificationStatus === 'loading'"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          style="background: linear-gradient(to right, #2563eb, #9333ea);"
        >
          <span v-if="notificationStatus === 'loading'" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Registering...
          </span>
          <span v-else>Keep Me Updated</span>
        </button>

        <!-- In stock action buttons -->
        <div v-else class="flex items-center space-x-3">
          <div class="flex items-center bg-gray-100 rounded-2xl p-1"  v-if="!usesCRMFlow">
            <button 
              @click="decreaseQuantity"
              class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Minus class="w-5 h-5" />
            </button>
            <div class="w-12 text-center font-bold text-gray-900">{{ quantity }}</div>
            <button 
              @click="increaseQuantity(currentStock)"
              class="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-gray-900 transition-colors"
            >
              <Plus class="w-5 h-5" />
            </button>
          </div>

          <!-- CRM Flow: Request Viewing Button -->
          <button 
            v-if="usesCRMFlow"
            @click="showViewingForm = true"
            :disabled="backendHasActiveViewingRequest"
            class="flex-1 py-4 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <Calendar class="w-5 h-5 mr-2" />
            {{ backendHasActiveViewingRequest ? 'Request Pending' : 'Request Viewing' }}
          </button>

          <button 
            v-if="usesCRMFlow"
            @click="goToCart"
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors relative"
          >
            <Calendar class="w-6 h-6 text-gray-700" />
            <span 
              v-if="pendingViewingRequests > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {{ pendingViewingRequests > 99 ? '99+' : pendingViewingRequests }}
            </span>
          </button>

          <!-- Regular Flow: Add to Cart Button -->
          <button 
            v-else
            @click="addToCart"
            class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <ShoppingBag class="w-5 h-5 mr-2" />
            Add to Cart
          </button>

          <button 
            v-if="!usesCRMFlow"
            @click="goToCart"
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors relative"
          >
            <ShoppingCart class="w-6 h-6 text-gray-700" />
            <span 
              v-if="cartItemsCount > 0"
              class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              {{ cartItemsCount > 99 ? '99+' : cartItemsCount }}
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar for notifications -->
    <div 
      v-if="showSnackbar" 
      class="fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-lg transition-all duration-300"
      :class="snackbarColor === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <CheckCircle v-if="snackbarColor === 'success'" class="w-5 h-5 text-green-500 mr-3" />
          <AlertCircle v-else class="w-5 h-5 text-red-500 mr-3" />
          <span :class="snackbarColor === 'success' ? 'text-green-700' : 'text-red-700'" class="font-medium text-sm">
            {{ snackbarText }}
          </span>
        </div>
        <button @click="showSnackbar = false" class="text-gray-400 hover:text-gray-600">
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Viewing Request Form Modal -->
    <ViewingRequestForm
      :show-form="showViewingForm"
      :product="product"
      :product-type="getProductTypeFromCRM()"
      @close="showViewingForm = false"
      @success="onViewingRequestSuccess"
      @error="onViewingRequestError"
    />

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
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useCRMStore } from '@/stores/crm'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import packagingImage from '@/assets/packaging_10471395.png'
import ViewingRequestForm from '@/components/ViewingRequestForm.vue'
import { 
  ArrowLeft, Heart, Share2, AlertCircle, Star, MessageCircle, 
  Minus, Plus, ShoppingBag, ShoppingCart, CheckCircle, X, Calendar, Info,
  Hash, Calculator, List, CheckSquare, ToggleLeft, FileText, Type, BadgeCheck
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const activeTab = ref('description')
const selectedVariant = ref(null)
const selectedSize = ref(null)
const cart = useCartStore()
const productStore = useProductStore()
const crmStore = useCRMStore()
const { formatApiPrice } = useCurrency()
const notificationStatus = ref('')
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')
const currentImageIndex = ref(0)

// CRM flow variables
const usesCRMFlow = ref(false)
const crmFlowInfo = ref(null)
const showViewingForm = ref(false)
const checkingCRMFlow = ref(false)
const hasPendingViewingRequest = ref(false)
const checkingPendingRequest = ref(false)

// Product attributes variables
const productAttributes = ref([])
const loadingAttributes = ref(false)

// Similar products and seller products
const similarProducts = ref([])
const sellerProducts = ref([])
const showVerificationDialog = ref(false)
const selectedProduct = ref(null)

// Like functionality
const isLiked = ref(false)
const togglingLike = ref(false)

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)
const backendHasActiveViewingRequest = computed(() => !!product.value?.has_active_viewing_request)

// Computed property for product images
const productImages = computed(() => {
  if (!product.value) return []
  return [product.value.main_image, product.value.image_1, product.value.image_2, product.value.image_3].filter(Boolean)
})

// Computed property for current image
const currentImage = computed(() => {
  return productImages.value[currentImageIndex.value] || packagingImage
})

const increaseQuantity = (productStock) => {
  if (quantity.value < productStock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const addToCart = async () => {
  if (product.value && currentStock.value > 0) {
    try {
      // Only send the necessary data to create a new cart
      await cart.createNewCart(
        selectedVariant.value,
        quantity.value,
        product.value.id
      );

      // Reset quantity to 1 after successful addition
      quantity.value = 1;

      // Show success snackbar
      snackbarText.value = 'Product added to cart';
      snackbarColor.value = 'success';
      showSnackbar.value = true;
    } catch (error) {
      console.error('Failed to add product to cart:', error);

      // Show error snackbar
      snackbarText.value = 'Failed to add product to cart';
      snackbarColor.value = 'error';
      showSnackbar.value = true;
    }
  }
}

const checkCRMFlow = async () => {
  if (!product.value?.id) return

  try {
    checkingCRMFlow.value = true
    const response = await apiService.checkProductCRMFlow(product.value.id)
    
    usesCRMFlow.value = response.data.uses_crm
    crmFlowInfo.value = response.data.flow_info
    
    // Update global CRM state if this product uses CRM
    if (response.data.uses_crm && product.value.store?.store_category) {
      await crmStore.checkCategoryFlow(product.value.store.store_category.id)
    }
    
  } catch (error) {
    console.error('Failed to check CRM flow:', error)
    usesCRMFlow.value = false
  } finally {
    checkingCRMFlow.value = false
  }
}

// Check if shopper has existing pending viewing request for this product
const checkExistingViewingRequest = async () => {
  if (!product.value?.id) return

  try {
    checkingPendingRequest.value = true
    const response = await apiService.getViewingRequests({
      product_id: product.value.id,
      status: 'SCHEDULED,ACCEPTED,NEW'
    })

    // Disable if at least one matching active request exists
    const res = response?.data
    const results = Array.isArray(res?.results) ? res.results : []
    hasPendingViewingRequest.value = results.length > 0 || !!product.value?.has_active_viewing_request

  } catch (error) {
    console.error('Failed to check existing viewing requests:', error)
    hasPendingViewingRequest.value = false
  } finally {
    checkingPendingRequest.value = false
  }
}

const onViewingRequestSuccess = (data) => {
  snackbarText.value = data.message
  snackbarColor.value = 'success'
  showSnackbar.value = true
  showViewingForm.value = false
  
  // Refresh the pending request check
  checkExistingViewingRequest()
}

const onViewingRequestError = (errorMessage) => {
  snackbarText.value = errorMessage
  snackbarColor.value = 'error'
  showSnackbar.value = true
}

const getProductTypeFromCRM = () => {
  if (crmFlowInfo.value?.flow_key === 'crm' || usesCRMFlow.value) {
    // Try to determine product type based on store category or product info
    if (product.value?.store_name?.toLowerCase().includes('auto') || 
        product.value?.name?.toLowerCase().includes('car') ||
        product.value?.name?.toLowerCase().includes('vehicle')) {
      return 'vehicle'
    } else if (product.value?.store_name?.toLowerCase().includes('real') ||
               product.value?.name?.toLowerCase().includes('house') ||
               product.value?.name?.toLowerCase().includes('property')) {
      return 'property'
    }
  }
  return 'item'
}

// Fetch product attributes from existing product data
const fetchProductAttributes = async () => {
  
  loadingAttributes.value = true
  
  try {
    // Use the attribute values that are already included in the product data
    if (product.value?.attribute_values && product.value.attribute_values.length > 0) {
      
      // Map the attribute values to include label and human display value only
      const attributesWithValues = product.value.attribute_values.map(attrValue => {
        const template = attrValue.attribute_template
        
        return {
          id: template?.id || attrValue.attribute_template, // fallback to id
          label: attrValue.attribute_label,
          field_type: attrValue.field_type,
          // Keep original value object for special cases (boolean, multiselect chips)
          attribute_value: attrValue,
          // Human-friendly value from backend
          display_value: attrValue.display_value,
          // Optional ordering when available
          display_order: template?.display_order || 0,
        }
      })
      
      // Remove duplicates based on attribute label and field type
      const uniqueAttributes = attributesWithValues.reduce((acc, current) => {
        const existingIndex = acc.findIndex(attr => 
          attr.label === current.label && attr.field_type === current.field_type
        )
        
        if (existingIndex === -1) {
          acc.push(current)
        } else {
          // If duplicate found, keep the one with better data (has display_value or higher display_order)
          const existing = acc[existingIndex]
          if (current.display_value || current.display_order > existing.display_order) {
            acc[existingIndex] = current
          }
        }
        
        return acc
      }, [])
      
      // Sort by display order; do not filter out anything for shopper view
      productAttributes.value = uniqueAttributes
        .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      
    } else {
      productAttributes.value = []
    }
    
  } catch (error) {
    console.error('❌ ProductDetails: Error processing product attributes:', error)
    productAttributes.value = []
  } finally {
    loadingAttributes.value = false
  }
}

// Get formatted attribute value for user-friendly display
const getFormattedAttributeValue = (attr) => {
  // First try to use the display_value that's already formatted by the backend
  if (attr.display_value !== undefined && attr.display_value !== null && attr.display_value !== '') {
    return attr.display_value
  }
  
  // Fallback to getting raw value and formatting it
  const rawValue = getAttributeValue(attr)
  
  if (rawValue === null || rawValue === undefined) {
    return null
  }
  
  // Format based on field type for better user experience
  switch (attr.field_type) {
    case 'number':
      return rawValue.toLocaleString() // Add commas for large numbers
    case 'decimal':
      return parseFloat(rawValue).toFixed(2) // Show 2 decimal places
    case 'date':
      return formatDate(rawValue) // Format date nicely
    case 'boolean':
      return rawValue // Already handled in template
    case 'multiselect':
      return Array.isArray(rawValue) ? rawValue : [] // Ensure it's an array
    case 'file':
      return rawValue ? 'File attached' : null
    default:
      return rawValue // Return as-is for text, select, etc.
  }
}

// Get attribute value for display from product data
const getAttributeValue = (attr) => {
  
  // First check if we have the attribute_value stored in the processed attribute
  if (attr.attribute_value) {
    
    const attributeValue = attr.attribute_value
    
    // Return the appropriate value based on field type
    switch (attr.field_type) {
      case 'text':
      case 'textarea':
      case 'url':
      case 'email':
        return attributeValue.text_value || null
      case 'number':
        return attributeValue.number_value || null
      case 'decimal':
        return attributeValue.decimal_value || null
      case 'boolean':
        return attributeValue.boolean_value
      case 'date':
        return attributeValue.date_value || null
      case 'file':
      case 'image':
        return attributeValue.file_value ? 'File attached' : null
      case 'select':
        // For select, return the first choice or the choice itself
        const selectChoices = attributeValue.selected_choices || []
        return selectChoices.length > 0 ? selectChoices[0] : null
      case 'multiselect':
        // For multiselect, return the array of choices
        return attributeValue.selected_choices || []
      default:
        return attributeValue.text_value || null
    }
  }
  
  // Fallback: check product's attribute_values directly
  
  if (!product.value || !product.value.attribute_values) {
    
    return null
  }
  
  
  
  // Find the attribute value for this template
  const attributeValue = product.value.attribute_values.find(
    av => av.attribute_template && av.attribute_template.id === attr.id
  )
  
  
  
  if (!attributeValue) {
    
    return null
  }
  
  // Return the appropriate value based on field type
  switch (attr.field_type) {
    case 'text':
    case 'textarea':
    case 'url':
    case 'email':
      return attributeValue.text_value || null
    case 'number':
      return attributeValue.number_value || null
    case 'decimal':
      return attributeValue.decimal_value || null
    case 'boolean':
      return attributeValue.boolean_value
    case 'date':
      return attributeValue.date_value || null
    case 'file':
    case 'image':
      return attributeValue.file_value ? 'File attached' : null
    case 'select':
      // For select, return the first choice or the choice itself
      const selectChoices = attributeValue.selected_choices || []
      return selectChoices.length > 0 ? selectChoices[0] : null
    case 'multiselect':
      // For multiselect, return the array of choices
      return attributeValue.selected_choices || []
    default:
      return attributeValue.text_value || null
  }
}

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return null
  try {
    return new Date(dateString).toLocaleDateString()
  } catch {
    return dateString
  }
}

// Get field type icon component
const getFieldTypeIcon = (fieldType) => {
  const icons = {
    text: Type,
    number: Hash,
    decimal: Calculator,
    select: List,
    multiselect: CheckSquare,
    boolean: ToggleLeft,
    date: Calendar,
    file: FileText
  }
  return icons[fieldType] || Type
}

// Get field type color classes
const getFieldTypeColor = (fieldType) => {
  const colors = {
    text: 'bg-gray-500',
    number: 'bg-blue-500',
    decimal: 'bg-blue-600',
    select: 'bg-green-500',
    multiselect: 'bg-purple-500',
    boolean: 'bg-orange-500',
    date: 'bg-yellow-500',
    file: 'bg-indigo-500'
  }
  return colors[fieldType] || 'bg-gray-500'
}

// Test API call manually
const testAPICall = async () => {
  
  
  // Try to get store category ID from multiple sources
  const sources = [
    { name: 'Product Store Category', value: product.value?.store?.store_category?.id },
    { name: 'Session Storage Default Store', value: sessionStorage.getItem('defaultStore') },
    { name: 'Product Category', value: product.value?.category?.id }
  ]
  
  
  
  for (const source of sources) {
    if (source.value) {
      
      
      try {
        const response = await apiService.getStoreAttributesByStoreCategory({ 
          store_category_id: source.value 
        })
        
        
        if (response.data?.templates?.length > 0) {
          
          // Update the attributes with this successful response
          productAttributes.value = response.data.templates.filter(t => t.is_active)
          return
        } else {
          console.log(`🧪 ProductDetails: No templates found with ${source.name}`)
        }
      } catch (error) {
        console.error(`🧪 ProductDetails: FAILED with ${source.name}:`, error)
      }
    }
  }
  
}

const goToCart = () => {
  router.push({ name: 'Cart' })
}

// Like functionality
const checkLikeStatus = async (productId) => {
  if (!productId) return
  try {
    const response = await apiService.checkProductLike(productId)
    isLiked.value = response.data.liked || false
  } catch (error) {
    console.error('Failed to check like status:', error)
    isLiked.value = false
  }
}

const toggleLike = async () => {
  if (!product.value || togglingLike.value) return
  
  togglingLike.value = true
  try {
    const response = await apiService.toggleProductLike(product.value.id)
    isLiked.value = response.data.liked || false
    
    // Show feedback
    snackbarText.value = response.data.liked ? 'Product liked' : 'Product unliked'
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error) {
    console.error('Failed to toggle like:', error)
    snackbarText.value = 'Failed to update like status'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    togglingLike.value = false
  }
}

// Share product via WhatsApp
const shareProduct = () => {
  if (!product.value) return
  
  const productUrl = `${window.location.origin}/product/${product.value.id}`
  const productName = product.value.name || 'Check out this product'
  const shareText = `${productName}\n\n${productUrl}`
  
  // Encode the message for WhatsApp
  const encodedText = encodeURIComponent(shareText)
  const whatsappUrl = `https://wa.me/?text=${encodedText}`
  
  // Open WhatsApp in a new window/tab
  window.open(whatsappUrl, '_blank')
}

// Navigate to product details
const navigateToDetails = (productId, itemType = 'store_product') => {
  if (itemType === 'shopper_listing') {
    router.push({ name: 'ShopperProduct', params: { id: productId } })
  } else {
    router.push({ name: 'ProductDetails', params: { id: productId } })
  }
}

// View all products from seller
const viewAllSellerProducts = () => {
  if (!product.value) return
  
  // Store seller ID in sessionStorage for Explore page to filter
  const sellerId = product.value.seller || product.value.seller_id || product.value.store?.seller?.id || product.value.store?.seller_id
  if (sellerId) {
    sessionStorage.setItem('filterBySeller', sellerId.toString())
  }
  
  router.push({ name: 'Explore' })
}

// Fetch similar products (same store category)
const fetchSimilarProducts = async () => {
  if (!product.value) return
  
  try {
    const storeCategoryId = product.value.store?.store_category?.id
    if (!storeCategoryId) return
    
    const response = await apiService.getProducts({
      store_category: storeCategoryId,
      page_size: 7, // Get 7 to exclude current product
      page: 1
    })
    
    const products = response.data.results || response.data
    // Filter out current product and limit to 6
    similarProducts.value = products
      .filter(p => p.id !== product.value.id)
      .slice(0, 6)
      .map(p => ({ ...p, item_type: 'store_product' }))
  } catch (error) {
    console.error('Failed to fetch similar products:', error)
    similarProducts.value = []
  }
}

// Fetch products from same seller
const fetchSellerProducts = async () => {
  if (!product.value) return
  
  try {
    // Get seller ID from product - check multiple possible locations
    let sellerId = null
    
    // Try direct seller field (could be ID or object)
    if (product.value.seller) {
      sellerId = typeof product.value.seller === 'object' ? product.value.seller.id : product.value.seller
    }
    
    // Try seller_id field
    if (!sellerId && product.value.seller_id) {
      sellerId = product.value.seller_id
    }
    
    // Try store.seller
    if (!sellerId && product.value.store?.seller) {
      sellerId = typeof product.value.store.seller === 'object' ? product.value.store.seller.id : product.value.store.seller
    }
    
    // Try store.seller_id
    if (!sellerId && product.value.store?.seller_id) {
      sellerId = product.value.store.seller_id
    }
    
    console.log('🔍 Fetching seller products - Product data:', {
      seller: product.value.seller,
      seller_id: product.value.seller_id,
      store: product.value.store,
      extracted_seller_id: sellerId
    })
    
    if (!sellerId) {
      console.warn('⚠️ No seller ID found in product data')
      sellerProducts.value = []
      return
    }
    
    const response = await apiService.getProducts({
      seller: sellerId,
      page_size: 7, // Get 7 to exclude current product
      page: 1
    })
    
    const products = response.data.results || response.data
    console.log('🔍 Seller products response:', products)
    
    // Helper function to extract seller ID from a product
    const getProductSellerId = (p) => {
      if (p.seller) {
        return typeof p.seller === 'object' ? p.seller.id : p.seller
      }
      if (p.seller_id) return p.seller_id
      if (p.store?.seller) {
        return typeof p.store.seller === 'object' ? p.store.seller.id : p.store.seller
      }
      if (p.store?.seller_id) return p.store.seller_id
      return null
    }
    
    // Filter out current product and ensure all products are from the same seller
    sellerProducts.value = products
      .filter(p => {
        const pSellerId = getProductSellerId(p)
        return p.id !== product.value.id && pSellerId === sellerId
      })
      .slice(0, 6)
      .map(p => ({ ...p, item_type: 'store_product' }))
    
    console.log('🔍 Filtered seller products:', sellerProducts.value)
  } catch (error) {
    console.error('Failed to fetch seller products:', error)
    sellerProducts.value = []
  }
}

const requestRestockNotification = async () => {
  if (!product.value) return

  try {
    notificationStatus.value = 'loading'
    await apiService.requestRestockNotification(product.value.id)
    notificationStatus.value = 'success'

    // Show success snackbar
    snackbarText.value = "We'll notify you when this product is back in stock"
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error) {
    console.error('Failed to request restock notification:', error)
    notificationStatus.value = 'error'

    // Show error snackbar
    snackbarText.value = "Couldn't register for notification. Please try again."
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Fix cart.items.find is not a function error
const cartItemQuantity = computed(() => {
  if (!product.value || !selectedVariant.value || !cart.items || !cart.items.items) return 0

  // Find the product in the cart items
  const cartProduct = cart.items.items.find(item => item.product_id === product.value.id);
  if (!cartProduct) return 0;

  // Find the variant in the product's variants
  const cartVariant = cartProduct.variants.find(v => v.id === selectedVariant.value.id);
  return cartVariant ? cartVariant.quantity : 0;
})

// Update watch for product to set initial quantity
watch(product, (newProduct) => {
  if (!newProduct) return

  // Check various conditions that would make product unavailable
  const isUnavailable = !newProduct.published

  if (isUnavailable) {
    // Show notification for unavailable product
    snackbarText.value = "This product is not available"
    snackbarColor.value = "error"
    showSnackbar.value = true

    // Redirect to home page
    router.push({ name: 'Home' })
  } else if (newProduct.variants && newProduct.variants.length > 0) {
    // Find the default variant or use the first one
    const defaultVariant = newProduct.variants.find(v => v.is_default) || newProduct.variants[0]
    selectedVariant.value = defaultVariant
    selectedSize.value = defaultVariant.name

    // Always set quantity to 1 when product loads
    quantity.value = 1
  }
}, { immediate: true })

// Computed properties for current variant's price and stock
const currentPrice = computed(() => {
  return selectedVariant.value ? selectedVariant.value.price : product.value?.price
})

const currentStock = computed(() => {
  return selectedVariant.value ? selectedVariant.value.stock : product.value?.stock
})

// Update selectVariant to always set quantity to 1
const selectVariant = (variant) => {
  selectedVariant.value = variant;
  selectedSize.value = variant.name;

  // Always set quantity to 1 when selecting a variant
  quantity.value = 1;
}

const cartItemsCount = computed(() => cart.cartItemCount)

// Function to load product data
const loadProductData = async (productId) => {
  try {
    // Reset state
    currentImageIndex.value = 0
    activeTab.value = 'description'
    selectedVariant.value = null
    selectedSize.value = null
    quantity.value = 1
    similarProducts.value = []
    sellerProducts.value = []
    isLiked.value = false
    
    // Fetch product data
    await productStore.fetchProductById(productId)
    
    // Check if product is liked
    await checkLikeStatus(productId)

    // Fetch related data
    await Promise.all([
      productStore.fetchRelatedProducts(productId),
      productStore.fetchProductReviews(productId)
    ])

    // Check CRM flow after product is loaded
    await checkCRMFlow()

    // Check for existing viewing requests if using CRM flow
    if (usesCRMFlow.value) {
      await checkExistingViewingRequest()
    }

    // Fetch product attributes based on store category
    await fetchProductAttributes()
    
    // Fetch similar products and seller products
    await Promise.all([
      fetchSimilarProducts(),
      fetchSellerProducts()
    ])
    
  } catch (error) {
    // Handle error and redirect to home page
    console.error('Error fetching product:', error)
    snackbarText.value = "Product not found"
    snackbarColor.value = "error"
    showSnackbar.value = true

    // Redirect to home page
    router.push({ name: 'Home' })
  }
}

onMounted(async () => {
  await loadProductData(route.params.id)
})

// Watch for route changes to reload product when navigating to different product
watch(() => route.params.id, async (newProductId, oldProductId) => {
  if (newProductId && newProductId !== oldProductId) {
    await loadProductData(newProductId)
  }
})

// Watch for product changes to recheck CRM flow
watch(product, async (newProduct) => {
  if (newProduct?.id) {
    await checkCRMFlow()
    
    // Check for existing viewing requests if using CRM flow
    if (usesCRMFlow.value) {
      await checkExistingViewingRequest()
    }
    
    await fetchProductAttributes()
    
    // Fetch similar products and seller products
    await Promise.all([
      fetchSimilarProducts(),
      fetchSellerProducts()
    ])
  }
}, { immediate: false })
</script>

<style scoped>
/* Additional styles if needed */
</style>