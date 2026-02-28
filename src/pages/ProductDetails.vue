<template>
  <div class="page-container pb-24">
    <!-- Loading skeleton -->
    <div v-if="loading" class="pt-20 px-5">
      <div class="animate-pulse space-y-5">
        <div class="bg-grey-100 rounded-3xl h-80"></div>
        <div class="space-y-3">
          <div class="h-5 bg-grey-100 rounded-2xl w-3/4"></div>
          <div class="h-4 bg-grey-100 rounded-2xl w-1/2"></div>
          <div class="h-6 bg-grey-100 rounded-2xl w-28"></div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="error" class="pt-20 px-5 mb-4">
      <div class="alert alert-error">
        <div class="flex items-center gap-2">
          <AlertCircle class="w-5 h-5" />
          <span class="text-sm font-medium">{{ error }}</span>
        </div>
      </div>
    </div>

    <!-- Product details -->
    <div v-if="product">
      <!-- Immobilier: real estate detail layout -->
      <template v-if="isImmobilier">
        <div class="bg-white pb-32">
          <!-- Image 40% height, no bottom radius; thumbnails at bottom center on image -->
          <div class="relative h-[40vh] min-h-[220px] max-h-[360px] bg-navy-800 overflow-hidden">
            <template v-for="(slide, index) in getSlides()" :key="index">
              <img
                v-if="slide.type === 'image'"
                :src="slide.src"
                :alt="product.name"
                class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                :class="currentImageIndex === index ? 'opacity-100' : 'opacity-0'"
              />
              <video
                v-else-if="slide.type === 'video'"
                :src="slide.src"
                controls
                playsinline
                class="absolute inset-0 w-full h-full object-contain bg-navy-800 transition-opacity duration-300"
                :class="currentImageIndex === index ? 'opacity-100' : 'opacity-0'"
              />
            </template>
            <img
              v-if="getSlides().length === 0 && product.main_image"
              :src="product.main_image"
              :alt="product.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <div v-else-if="getSlides().length === 0" class="absolute inset-0 flex items-center justify-center text-grey-400">
              <span class="text-sm">{{ $t('product.no_image') }}</span>
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
              <button
                @click="$router.go(-1)"
                class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center"
              >
                <ArrowLeft class="w-5 h-5 text-navy" />
              </button>
              <div class="flex items-center gap-2">
                <button
                  @click="toggleLike"
                  class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center"
                  :class="isLiked ? 'bg-red-50' : ''"
                >
                  <Heart class="w-5 h-5" :class="isLiked ? 'text-red-500 fill-red-500' : 'text-navy'" />
                </button>
                <button
                  @click="shareProduct"
                  class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center"
                >
                  <Share2 class="w-5 h-5 text-navy" />
                </button>
              </div>
            </div>
            <!-- Additional images at bottom center on main image -->
            <div v-if="getSlides().length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto scrollbar-hide max-w-[calc(100%-2rem)]">
              <template v-for="(slide, index) in getSlides()" :key="'thumb-'+index">
                <button
                  v-if="slide.type === 'image'"
                  type="button"
                  @click.stop="currentImageIndex = index"
                  :class="[
                    'flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 bg-gray-800 transition-all',
                    currentImageIndex === index ? 'border-white shadow-lg ring-2 ring-white/50' : 'border-white/40'
                  ]"
                >
                  <img :src="slide.src" :alt="product.name" class="w-full h-full object-cover" />
                </button>
              </template>
            </div>
          </div>

          <div class="px-5 pt-5 bg-white -mt-2 relative z-10">
            <!-- Seller store name + stock status -->
            <div class="flex justify-between items-center mb-2">
              <span class="text-sm text-grey-400 font-medium">{{ product.seller_name || product.store?.name || '—' }}</span>
              <span v-if="currentStock > 0" class="rounded-lg px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium">{{ currentStock }} {{ $t('product.in_stock') }}</span>
              <span v-else class="rounded-lg px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium">{{ $t('product.out_of_stock') }}</span>
            </div>
            <!-- Price with par nuit / par mois from DB (seller's booking_type) -->
            <p class="text-2xl font-bold text-red-500 tracking-tight" :class="(depositCautionAmount != null && depositCautionAmount > 0) ? 'mb-1' : 'mb-4'">
              {{ formatApiPrice({ price: currentPrice }) }}
              <span v-if="immobilierPriceSuffix?.literal" class="text-base font-medium text-grey-500">/ {{ immobilierPriceSuffix.literal }}</span>
              <span v-else-if="immobilierPriceSuffix" class="text-base font-medium text-grey-500">/ {{ $t(immobilierPriceSuffix) }}</span>
            </p>
            <p v-if="depositCautionAmount != null && depositCautionAmount > 0" class="text-sm text-primary-600 font-medium mb-4">{{ $t('product.deposit_amount_caption') }}: {{ formatApiPrice({ price: depositCautionAmount }) }}</p>
            <!-- Product name under price -->
            <h1 class="text-lg font-bold text-navy capitalize leading-tight mb-4">{{ product.name }}</h1>

            <!-- Reviews: star style if any -->
            <div v-if="(product.review_stats?.count ?? 0) > 0" class="flex items-center gap-2 mb-4">
              <div class="flex items-center">
                <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(product.review_stats?.avg_rating ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-grey-200'" />
              </div>
              <span class="text-sm text-grey-500">({{ product.review_stats?.count ?? 0 }} {{ $t('product.reviews') }})</span>
            </div>

            <!-- Variants: hidden for immobilier -->
            <div v-if="!isImmobilier && product.variants && product.variants.length > 0" class="mb-3">
              <h3 class="text-xs font-semibold text-navy mb-1.5">{{ $t('product.variants') }}</h3>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  type="button"
                  @click="selectVariant(variant)"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                    selectedVariant?.id === variant.id ? 'bg-navy text-white' : 'bg-navy-50 text-navy border border-navy-200 hover:bg-navy-100'
                  ]"
                >
                  {{ variant.name }}
                </button>
              </div>
            </div>

            <!-- Shopper choice attributes (navy, compact): seller's options for this product, shopper picks one per attribute -->
            <div v-if="shopperChoiceAttributes.length > 0" class="mb-4 space-y-2">
              <div v-for="attr in shopperChoiceAttributes" :key="attr.id" class="space-y-1" :data-attr-id="attr.id">
                <label class="text-xs font-semibold text-navy block">
                  {{ attr.label }}
                  <span class="text-error-500">*</span>
                </label>
                <div v-if="shopperChoiceErrors[attr.id]" class="text-[10px] text-error-600">{{ shopperChoiceErrors[attr.id] }}</div>
                <div class="flex flex-wrap gap-1.5">
                  <template v-if="attr.field_type === 'select' || attr.field_type === 'multiselect'">
                    <button
                      v-for="choice in getAttributeChoices(attr)"
                      :key="`${attr.id}-${choice}`"
                      type="button"
                      @click="shopperChoices[attr.id] = choice; shopperChoiceErrors[attr.id] = null"
                      :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] === choice ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                    >
                      {{ choice }}
                    </button>
                  </template>
                  <button
                    v-else-if="attr.field_type === 'boolean'"
                    type="button"
                    @click="shopperChoices[attr.id] = !shopperChoices[attr.id]; shopperChoiceErrors[attr.id] = null"
                    :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                  >
                    {{ shopperChoices[attr.id] ? ($t('common.yes') || 'Yes') : ($t('common.no') || 'No') }}
                  </button>
                  <div v-else class="relative inline-block">
                    <button
                      type="button"
                      @click="activeTextInput = activeTextInput === attr.id ? null : attr.id"
                      @blur="clearShopperChoiceError(attr.id)"
                      :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                    >
                      {{ shopperChoices[attr.id] || ($t('product.enter_value') || 'Tap to enter') }}
                    </button>
                    <div v-if="activeTextInput === attr.id" class="absolute top-full left-0 mt-1.5 z-10 bg-white rounded-xl shadow-card-hover p-2.5 min-w-[180px]">
                      <input
                        v-model="shopperChoices[attr.id]"
                        :type="attr.field_type === 'number' || attr.field_type === 'decimal' ? 'number' : 'text'"
                        :placeholder="$t('product.enter_value') || 'Enter value'"
                        @blur="activeTextInput = null; clearShopperChoiceError(attr.id)"
                        @keyup.enter="activeTextInput = null; clearShopperChoiceError(attr.id)"
                        class="input text-xs py-2"
                        autofocus
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-4">
              <h2 class="text-base font-bold text-navy mb-2">{{ $t('product.description') }}</h2>
              <p class="text-sm text-grey-500 leading-relaxed" :class="!immobilierDescExpanded ? 'line-clamp-3' : ''">{{ product.description || $t('product.no_description') }}</p>
              <button
                v-if="(product.description || '').length > 120"
                @click="immobilierDescExpanded = !immobilierDescExpanded"
                class="text-sm font-semibold text-navy mt-2"
              >
                {{ immobilierDescExpanded ? $t('product.show_less') : $t('product.read_more') }}
              </button>
            </div>

            <!-- Property Details: 2x3 grid, left-aligned, compact, small icons -->
            <div class="mb-4">
              <h2 class="text-base font-bold text-navy mb-3">{{ $t('product.property_details') }}</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="item in immobilierPropertyDetails"
                  :key="item.key"
                  class="flex items-start gap-2 text-left"
                >
                  <component :is="item.icon" class="w-4 h-4 text-grey-500 mt-0.5 flex-shrink-0" />
                  <div class="min-w-0">
                    <span class="text-sm font-bold text-navy block">{{ item.value }}</span>
                    <span class="text-xs text-grey-500">{{ $t(item.labelKey) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Public Facilities: left-aligned, compact, small icons -->
            <div v-if="publicFacilitiesList.length > 0" class="mb-4">
              <h2 class="text-base font-bold text-navy mb-3">{{ $t('product.public_facilities') }}</h2>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div
                  v-for="(facility, idx) in publicFacilitiesList"
                  :key="`fac-${idx}-${facility.label}`"
                  class="flex items-center gap-2 text-left"
                >
                  <component :is="facility.icon" class="w-4 h-4 text-grey-500 flex-shrink-0" />
                  <span class="text-xs text-grey-500">{{ facility.label }}</span>
                </div>
              </div>
            </div>

            <!-- Specifications with arrow: after description, opens full-height dialog with all selected attributes -->
            <button
              type="button"
              @click="showSpecsDialog = true"
              class="w-full flex items-center justify-between py-3 px-0 mb-6 text-left rounded-none hover:bg-grey-50 active:bg-grey-100 transition-colors border-t border-b border-grey-200 bg-white"
            >
              <span class="text-sm font-semibold text-navy">{{ $t('product.specifications') }}</span>
              <ChevronRight class="w-5 h-5 text-blue-600 flex-shrink-0" />
            </button>

            <!-- Location + map: only when product store category is immobilier -->
            <div v-if="isImmobilierStoreCategory" class="mb-8">
              <h2 class="text-base font-bold text-navy mb-3">{{ $t('product.location') }}</h2>
              <p class="text-sm text-grey-600 mb-3 flex items-start gap-2">
                <MapPin class="w-4 h-4 text-grey-500 flex-shrink-0 mt-0.5" />
                <span>{{ propertyAddress }}</span>
              </p>
              <div class="h-48 rounded-2xl overflow-hidden bg-grey-200 relative">
                <div ref="propertyMapEl" class="absolute inset-0 w-full h-full" />
                <a
                  v-if="propertyAddress && !propertyMapReady"
                  :href="googleMapsLink"
                  target="_blank"
                  rel="noopener"
                  class="absolute inset-0 flex items-center justify-center text-navy font-medium text-sm hover:bg-black/5 transition-colors"
                >
                  {{ $t('product.view_on_map') }}
                </a>
              </div>
            </div>

            <!-- Similar products: 2x2 grid -->
            <div v-if="similarProducts.length > 0" class="mb-3">
              <h2 class="text-base font-bold text-navy mb-4">{{ $t('product.similar_products') }}</h2>
              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="p in similarProducts.slice(0, 4)"
                  :key="p.id"
                  class="cursor-pointer"
                  @click="navigateToDetails(p.id, p.item_type || 'store_product')"
                >
                  <div class="relative rounded-2xl overflow-hidden aspect-square group">
                    <img :src="p.main_image || packagingImage" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div class="absolute bottom-0 left-0 right-0 p-2.5">
                      <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize drop-shadow">{{ p.name }}</p>
                    </div>
                  </div>
                  <div class="mt-2 px-0.5">
                    <span class="font-bold text-sm text-navy">{{ formatApiPrice(p) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Related products (immobilier: same seller products, titled "Related products") -->
            <div v-if="sellerProducts.length > 0" class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-base font-bold text-navy">{{ $t('product.related_products') }}</h2>
                <button @click="viewAllSellerProducts" class="text-sm font-medium text-navy">{{ $t('product.view_all') }}</button>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div
                  v-for="p in sellerProducts.slice(0, 4)"
                  :key="p.id"
                  class="cursor-pointer"
                  @click="navigateToDetails(p.id, p.item_type || 'store_product')"
                >
                  <div class="relative rounded-2xl overflow-hidden aspect-square group">
                    <img :src="p.main_image || packagingImage" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div class="absolute bottom-0 left-0 right-0 p-2.5">
                      <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize drop-shadow">{{ p.name }}</p>
                    </div>
                  </div>
                  <div class="mt-2 px-0.5">
                    <span class="font-bold text-sm text-navy">{{ formatApiPrice(p) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================== AUTOMOBILE LAYOUT ==================== -->
      <template v-else-if="isAutomobile">
        <div class="pb-32">
          <!-- Image 40% height, no bottom radius; thumbnails at bottom center on image -->
          <div class="relative h-[40vh] min-h-[220px] max-h-[360px] bg-navy-800 overflow-hidden">
            <img
              v-if="productImages.length === 0"
              :src="product.main_image || packagingImage"
              :alt="product.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <template v-else>
              <img :src="currentImage" :alt="product.name" class="absolute inset-0 w-full h-full object-cover" />
            </template>
            <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
              <button @click="$router.go(-1)" class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center">
                <ArrowLeft class="w-5 h-5 text-navy" />
              </button>
              <div class="flex items-center gap-2">
                <button @click="toggleLike" class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center" :class="isLiked ? 'bg-red-50' : ''">
                  <Heart class="w-5 h-5" :class="isLiked ? 'text-red-500 fill-red-500' : 'text-navy'" />
                </button>
                <button @click="shareProduct" class="w-10 h-10 bg-white/90 backdrop-blur-md rounded-2xl shadow-card flex items-center justify-center">
                  <Share2 class="w-5 h-5 text-navy" />
                </button>
              </div>
            </div>
            <!-- Additional images at bottom center on main image -->
            <div v-if="productImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto scrollbar-hide max-w-[calc(100%-2rem)]">
              <button
                v-for="(image, index) in productImages"
                :key="'thumb-'+index"
                type="button"
                @click.stop="currentImageIndex = index"
                :class="[
                  'flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 bg-gray-800 transition-all',
                  currentImageIndex === index ? 'border-white shadow-lg ring-2 ring-white/50' : 'border-white/40'
                ]"
              >
                <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <div class="px-5 pt-4 space-y-4">
            <!-- Seller shop + stock -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-grey-400 font-medium">{{ product.seller_name || product.store?.name || '—' }}</span>
              <span v-if="currentStock > 0" class="chip chip-success">{{ currentStock }} {{ $t('product.in_stock') }}</span>
              <span v-else class="chip chip-error">{{ $t('product.out_of_stock') }}</span>
            </div>
            <!-- Vehicle name -->
            <h1 class="text-xl font-bold text-navy capitalize leading-tight">{{ product.name }}</h1>
            <!-- Price -->
            <p class="text-2xl font-bold text-navy tracking-tight">{{ formatApiPrice({ price: currentPrice }) }}</p>

            <!-- Key vehicle specs (quick glance chips) -->
            <div v-if="vehicleSpecs.length > 0" class="flex flex-wrap gap-2">
              <div v-for="spec in vehicleSpecs.slice(0, 4)" :key="spec.id" class="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-grey-50">
                <component :is="spec.icon" class="w-4 h-4 text-navy" />
                <span class="text-xs text-navy font-medium">{{ spec.value }}</span>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h2 class="text-base font-bold text-navy mb-2">{{ $t('product.description') }}</h2>
              <p class="text-sm text-grey-500 leading-relaxed" :class="!autoDescExpanded ? 'line-clamp-3' : ''">{{ product.description || $t('product.no_description') }}</p>
              <button v-if="(product.description || '').length > 120" @click="autoDescExpanded = !autoDescExpanded" class="text-sm font-semibold text-navy mt-2">
                {{ autoDescExpanded ? $t('product.show_less') : $t('product.read_more') }}
              </button>
            </div>

            <!-- Vehicle specifications (full list) -->
            <div v-if="vehicleSpecs.length > 0" class="rounded-2xl bg-grey-50 p-4">
              <h2 class="text-base font-bold text-navy mb-4">{{ $t('product.vehicle_specs') }}</h2>
              <div class="space-y-3">
                <div v-for="spec in vehicleSpecs" :key="spec.id" class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <component :is="spec.icon" class="w-4 h-4 text-grey-400" />
                    <span class="text-sm text-grey-500">{{ spec.label }}</span>
                  </div>
                  <span class="text-sm font-medium text-navy">{{ spec.value }}</span>
                </div>
              </div>
            </div>

            <!-- Seller info card -->
            <div class="rounded-2xl bg-grey-50 p-4 flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0">
                <Users class="w-6 h-6 text-navy" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-bold text-navy truncate">{{ product.seller_name || product.store?.name || '—' }}</p>
                <p class="text-xs text-grey-400">{{ $t('product.seller_agent') }}</p>
              </div>
              <div class="flex gap-2 flex-shrink-0">
                <a v-if="product.store?.phone" :href="`tel:${product.store.phone}`" class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-navy hover:bg-grey-100 transition-colors">
                  <Phone class="w-5 h-5" />
                </a>
                <a v-if="whatsappLink !== '#'" :href="whatsappLink" target="_blank" rel="noopener" class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-navy hover:bg-grey-100 transition-colors">
                  <MessageCircle class="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <!-- Similar products: 2x2 grid -->
          <div v-if="similarProducts.length > 0" class="px-5 pt-6 pb-3">
            <h2 class="text-base font-bold text-navy mb-4">{{ $t('product.similar_products') }}</h2>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="p in similarProducts.slice(0, 4)" :key="p.id" class="cursor-pointer" @click="navigateToDetails(p.id, p.item_type || 'store_product')">
                <div class="relative rounded-2xl overflow-hidden aspect-square group">
                  <img :src="p.main_image || packagingImage" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div class="absolute bottom-0 left-0 right-0 p-2.5">
                    <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize drop-shadow">{{ p.name }}</p>
                  </div>
                </div>
                <div class="mt-2 px-0.5">
                  <span class="font-bold text-sm text-navy">{{ formatApiPrice(p) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- More from same seller (under similar products) -->
          <div v-if="sellerProducts.length > 0" class="px-5 pb-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-base font-bold text-navy">{{ $t('product.more_from') }} {{ product?.seller_name || $t('product.seller') }}</h2>
              <button @click="viewAllSellerProducts" class="text-sm font-medium text-navy">{{ $t('product.view_all') }}</button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div v-for="p in sellerProducts.slice(0, 4)" :key="p.id" class="cursor-pointer" @click="navigateToDetails(p.id, p.item_type || 'store_product')">
                <div class="relative rounded-2xl overflow-hidden aspect-square group">
                  <img :src="p.main_image || packagingImage" :alt="p.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div class="absolute bottom-0 left-0 right-0 p-2.5">
                    <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize drop-shadow">{{ p.name }}</p>
                  </div>
                </div>
                <div class="mt-2 px-0.5">
                  <span class="font-bold text-sm text-navy">{{ formatApiPrice(p) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- ==================== STANDARD LAYOUT — exact match to reference image ==================== -->
      <template v-else>
        <div class="pb-28 bg-white min-h-screen">
          <!-- 1. Hero: main image 40% height, no bottom radius; thumbnails at bottom center on image -->
          <div class="relative w-full h-[40vh] min-h-[220px] max-h-[360px] bg-gray-100 overflow-hidden">
            <img
              v-if="productImages.length === 0"
              :src="product.main_image || packagingImage"
              :alt="product.name"
              class="absolute inset-0 w-full h-full object-cover"
            />
            <template v-else>
              <img :src="currentImage" :alt="product.name" class="absolute inset-0 w-full h-full object-cover" />
            </template>
            <div class="absolute top-0 left-0 right-0 flex items-center justify-between p-3 z-10">
              <button type="button" @click="$router.go(-1)" class="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center">
                <ArrowLeft class="w-5 h-5 text-white" />
              </button>
              <div class="flex items-center gap-2">
                <button type="button" @click="toggleLike" class="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center" :class="isLiked ? '!bg-red-500/90' : ''">
                  <Heart class="w-5 h-5 text-white" :class="isLiked ? 'fill-white' : ''" />
                </button>
                <button type="button" @click="shareProduct" class="w-10 h-10 rounded-full bg-black/25 flex items-center justify-center">
                  <Share2 class="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <!-- Additional images at bottom center on main image -->
            <div v-if="productImages.length > 1" class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-2 overflow-x-auto scrollbar-hide max-w-[calc(100%-2rem)]">
              <button
                v-for="(image, index) in productImages"
                :key="'thumb-'+index"
                type="button"
                @click.stop="currentImageIndex = index"
                :class="[
                  'flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 bg-gray-100 transition-all',
                  currentImageIndex === index ? 'border-white shadow-lg ring-2 ring-blue-400' : 'border-white/60'
                ]"
              >
                <img :src="image" :alt="`${product.name} ${index + 1}`" class="w-full h-full object-cover" />
              </button>
            </div>
          </div>

          <!-- 3. Product details: store, stock, title, price, variantes, tailles -->
          <div class="px-4 pt-2 space-y-4">
            <!-- Store name (left) + stock badge (right) -->
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ product.seller_name || 'AfriQExpress Seller' }}</span>
              <span v-if="currentStock > 0" class="rounded-lg px-3 py-1.5 bg-green-100 text-green-800 text-sm font-medium">{{ currentStock }} {{ $t('product.in_stock') }}</span>
              <span v-else class="rounded-lg px-3 py-1.5 bg-red-100 text-red-700 text-sm font-medium">{{ $t('product.out_of_stock') }}</span>
            </div>
            <!-- Product title -->
            <h1 class="text-xl font-bold text-gray-900 capitalize">{{ product.name }}</h1>
            <!-- Price -->
            <p class="text-lg font-bold text-[#1e3a5f]">{{ formatApiPrice({ price: currentPrice }) }}</p>

            <!-- Variants (navy, compact) -->
            <div v-if="product.variants && product.variants.length > 0" class="space-y-1.5">
              <h3 class="text-xs font-semibold text-navy">{{ $t('product.variants') }}</h3>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="variant in product.variants"
                  :key="variant.id"
                  type="button"
                  @click="selectVariant(variant)"
                  :class="[
                    'px-3 py-1.5 rounded-xl text-xs font-medium transition-all',
                    selectedVariant?.id === variant.id ? 'bg-navy text-white' : 'bg-navy-50 text-navy border border-navy-200 hover:bg-navy-100'
                  ]"
                >
                  {{ variant.name }}
                </button>
              </div>
            </div>

            <!-- Seller choice attributes (navy, compact): seller's options for this product, shopper picks one per attribute -->
            <div v-if="shopperChoiceAttributes.length > 0" class="space-y-2">
              <div v-for="attr in shopperChoiceAttributes" :key="attr.id" class="space-y-1" :data-attr-id="attr.id">
                <label class="text-xs font-semibold text-navy block">
                  {{ attr.label }}
                  <span class="text-red-500">*</span>
                </label>
                <div v-if="shopperChoiceErrors[attr.id]" class="text-[10px] text-red-600">{{ shopperChoiceErrors[attr.id] }}</div>
                <div class="flex flex-wrap gap-1.5">
                  <template v-if="attr.field_type === 'select' || attr.field_type === 'multiselect'">
                    <button
                      v-for="choice in getAttributeChoices(attr)"
                      :key="`${attr.id}-${choice}`"
                      type="button"
                      @click="shopperChoices[attr.id] = choice; shopperChoiceErrors[attr.id] = null"
                      :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] === choice ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                    >
                      {{ choice }}
                    </button>
                  </template>
                  <button
                    v-else-if="attr.field_type === 'boolean'"
                    type="button"
                    @click="shopperChoices[attr.id] = !shopperChoices[attr.id]; shopperChoiceErrors[attr.id] = null"
                    :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                  >
                    {{ shopperChoices[attr.id] ? ($t('common.yes') || 'Yes') : ($t('common.no') || 'No') }}
                  </button>
                  <div v-else class="relative inline-block">
                    <button
                      type="button"
                      @click="activeTextInput = activeTextInput === attr.id ? null : attr.id"
                      @blur="clearShopperChoiceError(attr.id)"
                      :class="['px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all', shopperChoices[attr.id] ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-navy-200 hover:border-navy']"
                    >
                      {{ shopperChoices[attr.id] || 'Tap to enter' }}
                    </button>
                    <div v-if="activeTextInput === attr.id" class="absolute top-full left-0 mt-1.5 z-10 bg-white rounded-xl shadow-card-hover p-2.5 min-w-[180px]">
                      <input
                        v-model="shopperChoices[attr.id]"
                        :type="attr.field_type === 'number' || attr.field_type === 'decimal' ? 'number' : 'text'"
                        :placeholder="$t('product.enter_value') || 'Enter value'"
                        @blur="activeTextInput = null; clearShopperChoiceError(attr.id)"
                        @keyup.enter="activeTextInput = null; clearShopperChoiceError(attr.id)"
                        class="input text-xs py-2"
                        autofocus
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 4. Tabs: Description | Avis — then description snippet, then Specifications with arrow (opens full-height dialog) -->
          <div class="px-4 pt-4">
            <div class="flex border-b border-gray-200">
              <button
                type="button"
                @click="activeTab = 'description'"
                :class="['flex-1 pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors', activeTab === 'description' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent']"
              >
                {{ $t('product.description') }}
              </button>
              <button
                type="button"
                @click="activeTab = 'reviews'"
                :class="['flex-1 pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors', activeTab === 'reviews' ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent']"
              >
                {{ $t('product.reviews') }} ({{ product.review_stats?.count ?? 0 }})
              </button>
            </div>
            <!-- Description snippet (one line below tabs) -->
            <p class="text-gray-600 text-sm leading-relaxed pt-3 line-clamp-1">{{ product.description || $t('product.no_description') }}</p>
            <!-- Specifications with arrow: after description, opens full-height dialog with all selected attributes -->
            <button
              type="button"
              @click="showSpecsDialog = true"
              class="w-full flex items-center justify-between py-3 mt-2 text-left rounded-none hover:bg-gray-50 active:bg-gray-100 transition-colors border-t border-b border-gray-200"
            >
              <span class="text-sm font-semibold text-gray-900">{{ $t('product.specifications') }}</span>
              <ChevronRight class="w-5 h-5 text-blue-600 flex-shrink-0" />
            </button>
            <!-- Tab content: Description or Reviews -->
            <div class="space-y-4 pt-4">
            <div v-if="activeTab === 'description'" class="space-y-4">
              <p class="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{{ product.description || $t('product.no_description') }}</p>

              <div v-if="product.suitable_for && product.suitable_for.length > 0" class="space-y-2">
                <h6 class="text-sm font-bold text-navy">{{ $t('product.suitable_for_skin_types') }}</h6>
                <div class="flex flex-wrap gap-2">
                  <span v-for="skinType in product.suitable_for" :key="skinType.id"
                    class="chip bg-primary-50 text-primary-700">{{ skinType.name }}</span>
                </div>
              </div>

              <div v-if="product.skin_concerns && product.skin_concerns.length > 0" class="space-y-2">
                <h6 class="text-sm font-bold text-navy">{{ $t('product.addresses_skin_concerns') }}</h6>
                <div class="flex flex-wrap gap-2">
                  <span v-for="concern in product.skin_concerns" :key="concern.id"
                    class="chip bg-success-50 text-success-700">{{ concern.name }}</span>
                </div>
              </div>

              <div v-if="product.product_types && product.product_types.length > 0" class="space-y-2">
                <h6 class="text-sm font-bold text-navy">{{ $t('product.product_types') }}</h6>
                <div class="flex flex-wrap gap-2">
                  <span v-for="type in product.product_types" :key="type.id"
                    class="chip bg-navy-50 text-navy-600">{{ type.name }}</span>
                </div>
              </div>
            </div>

            <!-- Reviews tab -->
            <div v-if="activeTab === 'reviews'" class="space-y-4">
              <div class="flex items-center gap-2 mb-4">
                <div class="flex items-center">
                  <Star v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(product.review_stats?.avg_rating ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-grey-200'" />
                </div>
                <span class="text-grey-500 font-medium text-sm">({{ product.review_stats?.count ?? 0 }} {{ $t('product.reviews') }})</span>
              </div>

              <div v-if="(product.review_stats?.count ?? 0) > 0" class="space-y-3">
                <div 
                  v-for="review in productStore.productReviews" 
                  :key="review.id"
                  class="card-flat p-4 rounded-2xl"
                >
                  <div class="flex justify-between items-start mb-2">
                    <span class="font-bold text-navy text-sm">{{ review.user_name }}</span>
                    <span class="text-xs text-grey-400">{{ review.created_at }}</span>
                  </div>
                  <div class="flex items-center mb-2 gap-0.5">
                    <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-grey-200'" />
                  </div>
                  <p class="text-sm text-grey-500 leading-relaxed">{{ review.comment }}</p>
                </div>
              </div>
              <div v-else class="text-center py-12">
                <div class="w-14 h-14 rounded-3xl bg-grey-50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle class="w-6 h-6 text-grey-300" />
                </div>
                <p class="text-grey-400 font-medium text-sm">{{ $t('product.no_reviews_yet') }}</p>
              </div>
            </div>
            </div>
          </div>
        </div>

        <!-- Similar Products: 2x2 grid -->
        <div v-if="similarProducts.length > 0" class="px-4 pt-6 pb-3">
          <div class="section-header">
            <h2 class="section-title">{{ $t('product.similar_products') }}</h2>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="product in similarProducts.slice(0, 4)"
              :key="product.id"
              class="cursor-pointer"
              @click="navigateToDetails(product.id, product.item_type || 'store_product')"
            >
              <div class="relative rounded-2xl overflow-hidden aspect-square group">
                <img :src="product.main_image || packagingImage" :alt="product.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div class="hero-overlay"></div>
                <button
                  v-if="product.item_type === 'store_product' && product.seller_account_status === 'APPROVED'"
                  @click.stop="showVerificationDialog = true; selectedProduct = product"
                  class="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm z-10"
                >
                  <BadgeCheck class="w-3.5 h-3.5 text-primary-600" />
                </button>
                <div class="absolute bottom-0 left-0 right-0 p-2.5">
                  <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize">{{ product.name }}</p>
                </div>
              </div>
              <div class="mt-2 px-0.5">
                <span class="font-bold text-sm text-navy">{{ formatApiPrice(product) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Products from Same Seller (under similar products) -->
        <div v-if="sellerProducts.length > 0" class="px-4 py-6">
          <div class="section-header">
            <h2 class="section-title">{{ $t('product.more_from') }} {{ product?.seller_name || product?.store_name || $t('product.seller') }}</h2>
            <button @click="viewAllSellerProducts" class="section-link">{{ $t('product.view_all') }}</button>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="product in sellerProducts.slice(0, 4)"
              :key="product.id"
              class="cursor-pointer"
              @click="navigateToDetails(product.id, product.item_type || 'store_product')"
            >
              <div class="relative rounded-2xl overflow-hidden aspect-square group">
                <img :src="product.main_image || packagingImage" :alt="product.name" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div class="hero-overlay"></div>
                <button
                  v-if="product.item_type === 'store_product' && product.seller_account_status === 'APPROVED'"
                  @click.stop="showVerificationDialog = true; selectedProduct = product"
                  class="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm rounded-full shadow-sm z-10"
                >
                  <BadgeCheck class="w-3.5 h-3.5 text-primary-600" />
                </button>
                <div class="absolute bottom-0 left-0 right-0 p-2.5">
                  <p class="text-white font-bold text-xs leading-tight line-clamp-2 capitalize">{{ product.name }}</p>
                </div>
              </div>
              <div class="mt-2 px-0.5">
                <span class="font-bold text-sm text-navy">{{ formatApiPrice(product) }}</span>
              </div>
            </div>
          </div>
        </div>
    </template>
    <!-- end default product layout -->
    </div>

    <!-- Bottom Action Bar -->
    <div v-if="product" class="action-bar">
        <!-- Out of stock (standard products only) -->
        <button 
          v-if="currentStock <= 0 && !isImmobilier && !isAutomobile" 
          @click="requestRestockNotification"
          :disabled="notificationStatus === 'loading'"
          class="btn-cta disabled:opacity-50"
        >
          <span v-if="notificationStatus === 'loading'" class="flex items-center justify-center">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            {{ $t('product.registering') }}
          </span>
          <span v-else>{{ $t('product.keep_me_updated') }}</span>
        </button>

        <!-- Immobilier: CTA = booking | viewing | both (styled like Book now: dark pill, light text, soft shadow) -->
        <template v-else-if="isImmobilier">
          <template v-if="immobilierCta === 'booking'">
            <button
              @click="goToBookPage"
              class="immobilier-cta-btn w-full py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90"
            >
              <Calendar class="w-5 h-5" />
              {{ $t('product.book_now') }}
            </button>
          </template>
          <template v-else-if="immobilierCta === 'viewing'">
            <button
              @click="openViewingDialog"
              :disabled="backendHasActiveViewingRequest"
              class="immobilier-cta-btn w-full py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90 disabled:opacity-50"
            >
              <Calendar class="w-5 h-5" />
              {{ backendHasActiveViewingRequest ? $t('product.request_pending') : $t('product.demande_une_visite') }}
            </button>
          </template>
          <template v-else-if="immobilierCta === 'both'">
            <div class="flex gap-3 w-full">
              <button
                @click="goToBookPage"
                class="immobilier-cta-btn flex-1 py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90"
              >
                <Calendar class="w-5 h-5" />
                {{ $t('product.book_now') }}
              </button>
              <button
                @click="openViewingDialog"
                :disabled="backendHasActiveViewingRequest"
                class="immobilier-cta-btn flex-1 py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90 disabled:opacity-50"
              >
                <Calendar class="w-5 h-5" />
                {{ backendHasActiveViewingRequest ? $t('product.request_pending') : $t('product.demande_une_visite') }}
              </button>
            </div>
          </template>
          <!-- Fallback when no cta: show both options like before -->
          <template v-else>
            <div class="flex gap-3 w-full">
              <button
                v-if="isShortTermRental"
                @click="goToBookPage"
                class="immobilier-cta-btn flex-1 py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90"
              >
                <Calendar class="w-5 h-5" />
                {{ $t('product.book_now') }}
              </button>
              <button
                @click="openViewingDialog"
                :disabled="backendHasActiveViewingRequest"
                class="immobilier-cta-btn flex-1 py-4 px-6 text-white font-medium flex items-center justify-center gap-2 rounded-full bg-[#262A2E] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:opacity-90 transition-opacity active:opacity-90 disabled:opacity-50"
              >
                <Calendar class="w-5 h-5" />
                {{ backendHasActiveViewingRequest ? $t('product.request_pending') : $t('product.demande_une_visite') }}
              </button>
            </div>
          </template>
        </template>

        <!-- Automobile: contact seller + schedule test drive -->
        <div v-else-if="isAutomobile" class="flex items-center gap-3 w-full">
          <a
            v-if="product.store?.phone"
            :href="`tel:${product.store.phone}`"
            class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-grey-100 transition-colors flex-shrink-0"
          >
            <Phone class="w-5 h-5 text-navy" />
          </a>
          <button
            @click="showViewingForm = true"
            :disabled="backendHasActiveViewingRequest"
            class="flex-1 py-4 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 transition-all active:opacity-90"
          >
            <Calendar class="w-5 h-5" />
            {{ backendHasActiveViewingRequest ? $t('product.request_pending') : $t('product.schedule_test_drive') }}
          </button>
          <a
            v-if="whatsappLink !== '#'"
            :href="whatsappLink"
            target="_blank"
            rel="noopener"
            class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center hover:bg-grey-100 transition-colors flex-shrink-0"
          >
            <MessageCircle class="w-5 h-5 text-navy" />
          </a>
        </div>

        <!-- Standard product actions: quantity (gray rounded), gradient Add button, cart icon -->
        <div v-else class="flex items-center gap-3">
          <div class="flex items-center bg-gray-100 rounded-2xl border border-gray-200 shadow-sm" v-if="!usesCRMFlow">
            <button @click="decreaseQuantity" class="w-10 h-10 flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-200 rounded-l-2xl transition-colors">
              <Minus class="w-4 h-4" />
            </button>
            <div class="w-8 text-center font-bold text-gray-900 text-sm">{{ quantity }}</div>
            <button @click="increaseQuantity(currentStock)" class="w-10 h-10 flex items-center justify-center text-gray-700 font-bold text-lg hover:bg-gray-200 rounded-r-2xl transition-colors">
              <Plus class="w-4 h-4" />
            </button>
          </div>

          <button
            v-if="isBookableProperty"
            @click="showBookingFlow = true"
            class="flex-1 py-4 bg-success-600 text-white font-semibold rounded-2xl shadow-card flex items-center justify-center hover:bg-success-700 transition-all active:scale-[0.98]"
          >
            <Calendar class="w-5 h-5 mr-2" />
            {{ $t('product.book_now') }}
          </button>

          <button 
            v-if="usesCRMFlow"
            @click="showViewingForm = true"
            :disabled="backendHasActiveViewingRequest"
            class="transition-all flex items-center justify-center disabled:opacity-50"
            :class="isBookableProperty
              ? 'w-12 h-12 bg-grey-50 rounded-2xl hover:bg-grey-100'
              : 'flex-1 btn-cta'"
          >
            <Calendar class="w-5 h-5" :class="isBookableProperty ? 'text-navy' : 'mr-2'" />
            <span v-if="!isBookableProperty">
              {{ backendHasActiveViewingRequest ? $t('product.request_pending') : $t('product.request_viewing') }}
            </span>
          </button>

          <button 
            v-if="usesCRMFlow"
            @click="goToCart"
            class="w-12 h-12 bg-grey-50 rounded-2xl flex items-center justify-center hover:bg-grey-100 transition-colors relative"
          >
            <Calendar class="w-5 h-5 text-navy" />
            <span v-if="pendingViewingRequests > 0" class="badge-count">{{ pendingViewingRequests > 99 ? '99+' : pendingViewingRequests }}</span>
          </button>

          <button 
            v-else
            @click="addToCart"
            class="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.98] shadow-md"
          >
            <ShoppingBag class="w-5 h-5" />
            {{ $t('product.add_to_cart') }}
          </button>

          <button 
            v-if="!usesCRMFlow"
            @click="goToCart"
            class="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors relative border border-gray-200"
          >
            <ShoppingCart class="w-5 h-5 text-gray-700" />
            <span v-if="cartItemsCount > 0" class="badge-count">{{ cartItemsCount > 99 ? '99+' : cartItemsCount }}</span>
          </button>
        </div>
    </div>

    <!-- Property Booking Flow Modal -->
    <div
      v-if="showBookingFlow"
      class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center"
      @click="showBookingFlow = false"
    >
      <div
        class="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[85vh] overflow-y-auto shadow-float"
        @click.stop
      >
        <div class="p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-navy">{{ $t('product.booking_title') }}</h3>
            <button @click="showBookingFlow = false" class="w-8 h-8 rounded-xl bg-grey-50 flex items-center justify-center text-grey-400 hover:bg-grey-100 transition-colors">
              <X class="w-4 h-4" />
            </button>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.check_in') }}</label>
              <input v-model="bookingCheckIn" type="date" :min="todayStr" class="input text-sm" @change="calculateBookingPrice" />
            </div>
            <div>
              <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.check_out') }}</label>
              <input v-model="bookingCheckOut" type="date" :min="bookingCheckIn || todayStr" class="input text-sm" @change="calculateBookingPrice" />
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.num_guests') }}</label>
            <div class="flex items-center bg-grey-50 rounded-2xl p-1">
              <button @click="bookingGuests = Math.max(1, bookingGuests - 1)" class="w-10 h-10 flex items-center justify-center text-navy font-bold">-</button>
              <span class="flex-1 text-center font-bold text-navy">{{ bookingGuests }}</span>
              <button @click="bookingGuests++" class="w-10 h-10 flex items-center justify-center text-navy font-bold">+</button>
            </div>
          </div>

          <div v-if="bookingPrice" class="card-flat p-4 rounded-2xl mb-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-grey-500">
                <span>{{ bookingPrice.nights }} {{ $t('product.nights') }} x {{ formatCurrency(bookingPrice.price_per_night) }}</span>
                <span>{{ formatCurrency(bookingPrice.subtotal) }}</span>
              </div>
              <div v-if="bookingPrice.deposit_amount > 0" class="flex justify-between text-grey-500">
                <span>{{ $t('product.deposit') }}</span>
                <span>{{ formatCurrency(bookingPrice.deposit_amount) }}</span>
              </div>
              <div class="flex justify-between text-grey-500">
                <span>{{ $t('product.platform_fee') }}</span>
                <span>{{ formatCurrency(bookingPrice.platform_fee) }}</span>
              </div>
              <div class="border-t border-grey-200 pt-2 flex justify-between font-bold text-navy">
                <span>{{ $t('product.total') }}</span>
                <span>{{ formatCurrency(bookingPrice.total) }} {{ bookingPrice.currency }}</span>
              </div>
            </div>
          </div>

          <div v-if="bookingCalculating" class="flex items-center justify-center py-4">
            <div class="animate-spin h-5 w-5 border-2 border-navy border-t-transparent rounded-full"></div>
          </div>

          <div class="mb-5">
            <label class="block text-xs font-bold text-navy mb-1.5">{{ $t('product.special_requests') }}</label>
            <textarea v-model="bookingSpecialRequests" rows="2" class="textarea text-sm" :placeholder="$t('product.special_requests_placeholder')"></textarea>
          </div>

          <button
            @click="createBooking"
            :disabled="!bookingPrice || bookingSubmitting"
            class="btn-cta bg-success-600 hover:bg-success-700 disabled:opacity-50"
          >
            <span v-if="bookingSubmitting">{{ $t('product.processing') }}...</span>
            <span v-else>{{ $t('product.book_now') }} - {{ bookingPrice ? formatCurrency(bookingPrice.total) : '' }} {{ bookingPrice?.currency || 'XOF' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Snackbar -->
    <Transition name="dialog">
      <div 
        v-if="showSnackbar" 
        class="fixed top-4 left-4 right-4 z-50 p-4 rounded-2xl shadow-card-hover transition-all duration-300"
        :class="snackbarColor === 'success' ? 'bg-success-50 border border-success-100' : 'bg-error-50 border border-error-100'"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <CheckCircle v-if="snackbarColor === 'success'" class="w-5 h-5 text-success-600" />
            <AlertCircle v-else class="w-5 h-5 text-error-600" />
            <span :class="snackbarColor === 'success' ? 'text-success-700' : 'text-error-700'" class="font-medium text-sm">
              {{ snackbarText }}
            </span>
          </div>
          <button @click="showSnackbar = false" class="text-grey-400 hover:text-grey-600">
            <X class="w-4 h-4" />
          </button>
        </div>
      </div>
    </Transition>

    <!-- Immobilier: Demande une visite dialog (send message + request viewing) -->
    <div
      v-if="showViewingDialog"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      @click.self="showViewingDialog = false"
    >
      <div class="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="sticky top-0 bg-white rounded-t-3xl border-b border-grey-100 px-6 py-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-grey-900">{{ $t('product.demande_une_visite') }}</h2>
          <button
            type="button"
            @click="showViewingDialog = false"
            class="w-8 h-8 rounded-full bg-grey-100 flex items-center justify-center hover:bg-grey-200"
          >
            <X class="w-5 h-5 text-grey-500" />
          </button>
        </div>
        <div class="p-6 space-y-6">
          <p class="text-sm text-grey-600">{{ $t('product.viewing_dialog_intro') }}</p>
          <!-- Selected channel buttons: WhatsApp and/or Email -->
          <div v-if="viewingContactChannels.length" class="flex flex-wrap gap-3">
            <a
              v-for="ch in viewingContactChannels"
              :key="ch.type"
              :href="ch.url"
              :target="ch.type === 'whatsapp' ? '_blank' : undefined"
              :rel="ch.type === 'whatsapp' ? 'noopener' : undefined"
              class="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors"
              :class="ch.type === 'whatsapp'
                ? 'bg-[#25D366] text-white hover:bg-[#20BD5A]'
                : 'bg-grey-100 text-grey-800 hover:bg-grey-200'"
            >
              <MessageCircle v-if="ch.type === 'whatsapp'" class="w-5 h-5" />
              <span v-else class="text-lg">✉</span>
              {{ $t(ch.labelKey) }}
            </a>
          </div>
          <div class="border-t border-grey-200 pt-4">
            <p class="text-sm font-medium text-grey-700 mb-2">{{ $t('product.or_request_viewing') }}</p>
            <button
              type="button"
              :disabled="backendHasActiveViewingRequest"
              @click="openRequestViewingForm"
              class="w-full py-3 border-2 border-navy text-navy font-semibold rounded-xl hover:bg-navy/5 disabled:opacity-50"
            >
              {{ $t('product.request_viewing') }}
            </button>
          </div>
        </div>
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
      <div v-if="showVerificationDialog" class="fixed inset-0 z-50 flex items-center justify-center p-5">
        <div class="absolute inset-0 bg-black/30 backdrop-blur-sm" @click="showVerificationDialog = false"></div>
        <div class="relative bg-white rounded-3xl shadow-float w-full max-w-sm">
          <div class="p-6 text-center">
            <div class="w-16 h-16 bg-primary-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <BadgeCheck class="w-8 h-8 text-primary-600" />
            </div>
            <h3 class="text-lg font-bold text-navy mb-2">Verified by AfriQExpress</h3>
            <p class="text-sm text-grey-400 leading-relaxed mb-6">
              This product and seller have been verified by AfriQExpress. You can shop with confidence knowing that this seller has been authenticated and approved.
            </p>
            <button @click="showVerificationDialog = false" class="btn-cta">
              Got it
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Full-height specifications dialog: all selected attributes for the product -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showSpecsDialog"
          class="fixed inset-0 z-[9999] flex flex-col bg-white min-h-screen"
          role="dialog"
          aria-modal="true"
          :aria-label="$t('product.specifications')"
        >
          <div class="flex items-center justify-between flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
            <h2 class="text-lg font-bold text-gray-900">{{ $t('product.specifications') }}</h2>
            <button
              type="button"
              @click="showSpecsDialog = false"
              class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
              :aria-label="$t('common.close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto px-4 py-4">
            <div v-if="loadingAttributes" class="flex flex-col items-center justify-center py-12">
              <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p class="text-sm text-gray-600">{{ $t('product.loading_details') }}</p>
            </div>
            <!-- Immobilier: grouped by category with icons -->
            <div v-else-if="isImmobilier && groupedSpecs.length > 0" class="space-y-6">
              <p class="text-sm text-gray-600 pb-2">{{ $t('product.technical_details') }}</p>
              <div v-for="group in groupedSpecs" :key="group.key" class="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50/50">
                <div class="flex items-center gap-2 px-4 py-3 bg-white border-b border-gray-200">
                  <component :is="specGroupIcons[group.key]" class="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 class="font-semibold text-gray-900 text-sm">{{ group.label }}</h3>
                </div>
                <div class="p-4 space-y-3">
                  <div
                    v-for="(attr, index) in group.attrs"
                    :key="`${attr.id}-${index}`"
                    class="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <component :is="specFieldIcons[attr.field_type] || FileText" class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium text-gray-500 mb-0.5">{{ attr.label }}</p>
                      <p v-if="['text', 'number', 'decimal', 'select', 'date'].includes(attr.field_type)" class="text-sm text-gray-900 font-medium">
                        {{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}
                      </p>
                      <div v-else-if="attr.field_type === 'multiselect'" class="flex flex-wrap gap-1.5">
                        <template v-if="attr.attribute_value?.selected_choices?.length">
                          <span v-for="choice in attr.attribute_value.selected_choices" :key="choice" class="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">
                            {{ choice }}
                          </span>
                        </template>
                        <p v-else class="text-sm text-gray-500 italic">{{ $t('product.not_specified') }}</p>
                      </div>
                      <div v-else-if="attr.field_type === 'boolean'" class="flex items-center gap-2">
                        <span class="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" :class="attr.attribute_value?.boolean_value ? 'bg-green-500' : 'bg-gray-400'">
                          <svg v-if="attr.attribute_value?.boolean_value" class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                          <svg v-else class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                        </span>
                        <span class="text-sm text-gray-900 font-medium">{{ attr.attribute_value?.boolean_value ? $t('common.yes') : $t('common.no') }}</span>
                      </div>
                      <div v-else-if="attr.field_type === 'file'" class="text-sm text-gray-700">
                        {{ getFormattedAttributeValue(attr) ? $t('product.file_attached') : $t('product.no_file') }}
                      </div>
                      <p v-else class="text-sm text-gray-900 font-medium">
                        {{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Non-immobilier: flat list, no grouping -->
            <div v-else-if="productAttributes.length > 0" class="space-y-6">
              <div class="pb-4 border-b border-gray-100">
                <p class="text-sm text-gray-600">{{ $t('product.technical_details') }}</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div v-for="(attr, index) in productAttributes" :key="`${attr.id}-${index}`" class="space-y-2">
                  <h4 class="font-semibold text-gray-900 text-sm leading-5">{{ attr.label }}</h4>
                  <div class="ml-0">
                    <p v-if="['text', 'number', 'decimal'].includes(attr.field_type)" class="text-gray-700 text-sm leading-relaxed">{{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}</p>
                    <p v-else-if="attr.field_type === 'select'" class="text-gray-700 text-sm leading-relaxed">{{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}</p>
                    <div v-else-if="attr.field_type === 'multiselect'">
                      <div v-if="attr.attribute_value?.selected_choices?.length" class="flex flex-wrap gap-2">
                        <span v-for="choice in attr.attribute_value.selected_choices" :key="choice" class="inline-block px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">{{ choice }}</span>
                      </div>
                      <p v-else class="text-sm text-gray-500 italic">{{ $t('product.not_specified') }}</p>
                    </div>
                    <div v-else-if="attr.field_type === 'boolean'" class="flex items-center gap-2">
                      <span class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" :class="attr.attribute_value?.boolean_value ? 'bg-green-500' : 'bg-gray-400'">
                        <svg v-if="attr.attribute_value?.boolean_value" class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                        <svg v-else class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
                      </span>
                      <span class="text-sm text-gray-700 font-medium">{{ attr.attribute_value?.boolean_value ? $t('common.yes') : $t('common.no') }}</span>
                    </div>
                    <p v-else-if="attr.field_type === 'date'" class="text-gray-700 text-sm leading-relaxed">{{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}</p>
                    <div v-else-if="attr.field_type === 'file'" class="flex items-center gap-2">
                      <span class="text-sm text-gray-700">{{ getFormattedAttributeValue(attr) ? $t('product.file_attached') : $t('product.no_file') }}</span>
                    </div>
                    <p v-else class="text-gray-700 text-sm leading-relaxed">{{ getFormattedAttributeValue(attr) || $t('product.not_specified') }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-12">
              <p class="text-gray-500 text-sm">{{ $t('product.no_additional_details') }}</p>
              <p class="text-gray-400 text-xs mt-1">{{ $t('product.no_additional_details_message') }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import L from 'leaflet'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { useCRMStore } from '@/stores/crm'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'
import packagingImage from '@/assets/packaging_10471395.png'
import ViewingRequestForm from '@/components/ViewingRequestForm.vue'

const { t } = useI18n()
import { 
  ArrowLeft, Heart, Share2, AlertCircle, Star, MessageCircle, 
  Minus, Plus, ShoppingBag, ShoppingCart, CheckCircle, X, Calendar, Info,
  Hash, Calculator, List, CheckSquare, ToggleLeft, FileText, Type, BadgeCheck, Users,
  MapPin, Phone, Building2, Landmark, Train, Utensils, GraduationCap, Bus, Hospital,
  Car, Fuel, Gauge, Settings2, Palette, CircleDot, ChevronRight, BedDouble, Bath, Ruler, Sofa
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const quantity = ref(1)
const activeTab = ref('description')
const showSpecsDialog = ref(false)
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

// Booking flow variables
const showBookingFlow = ref(false)
const isBookableProperty = ref(false)
const bookingCheckIn = ref('')
const bookingCheckOut = ref('')
const bookingGuests = ref(1)
const bookingPrice = ref(null)
const bookingCalculating = ref(false)
const bookingSubmitting = ref(false)
const bookingSpecialRequests = ref('')
const todayStr = new Date().toISOString().slice(0, 10)

// CRM flow variables
const usesCRMFlow = ref(false)
const crmFlowInfo = ref(null)
const showViewingForm = ref(false)
const showViewingDialog = ref(false)
const checkingCRMFlow = ref(false)
const hasPendingViewingRequest = ref(false)
const checkingPendingRequest = ref(false)

// Product attributes variables
const productAttributes = ref([])
const loadingAttributes = ref(false)
const lastProcessedProductId = ref(null) // Track last processed product ID to prevent infinite loops
const loadingProductId = ref(null) // Prevent concurrent loadProductData for same id

// Similar products and seller products
const similarProducts = ref([])
const sellerProducts = ref([])
const showVerificationDialog = ref(false)
const selectedProduct = ref(null)

// Like functionality
const isLiked = ref(false)
const togglingLike = ref(false)

// Immobilier layout state
const immobilierDescExpanded = ref(false)
const propertyMapEl = ref(null)
const propertyMapReady = ref(false)
const categoryFacilityTemplates = ref([])
let propertyMapInstance = null

// Automobile layout state
const autoDescExpanded = ref(false)
const autoSpecsFromAttributes = ref([])

const loading = computed(() => productStore.loading)
const error = computed(() => productStore.error)
const product = computed(() => productStore.currentProduct)
const backendHasActiveViewingRequest = computed(() => !!product.value?.has_active_viewing_request)

// Store category slug helper
const storeCategorySlug = computed(() => {
  const cat = product.value?.store?.store_category
  return (cat?.slug || cat?.name || '').toLowerCase()
})

// Automobile layout
const isAutomobile = computed(() => {
  return storeCategorySlug.value === 'automobile' || storeCategorySlug.value === 'auto'
})

// Map/location only when store category is immobilier
const isImmobilierStoreCategory = computed(() => storeCategorySlug.value === 'immobilier')

// Immobilier layout: only when product's store category is immobilier (exclude automobile)
const isImmobilier = computed(() => {
  const p = product.value
  if (!p) return false
  if (isAutomobile.value) return false
  return storeCategorySlug.value === 'immobilier'
})
const isShortTermRental = computed(() => {
  const bt = product.value?.property_meta?.booking_type
  return bt === 'short_term' || bt === 'both'
})
const isLongTermOnlyRental = computed(() => {
  return product.value?.property_meta?.booking_type === 'long_term'
})

// Montant de la caution (deposit) from property_meta or product attributes – for caption under price
const depositCautionAmount = computed(() => {
  const p = product.value
  const meta = p?.property_meta || {}
  const amount = meta.deposit ?? meta.caution ?? meta.deposit_amount ?? meta.caution_amount ?? p.deposit ?? p.caution
  if (amount != null && amount !== '' && !Number.isNaN(Number(amount))) return Number(amount)
  const attrs = productAttributes.value || []
  const attr = attrs.find(a => {
    const n = (a.label || a.name || a.attribute_template?.name || '').toLowerCase()
    return /caution|deposit|dépôt|montant.*caution/.test(n)
  })
  if (!attr) return null
  const raw = getFormattedAttributeValue(attr)
  const num = typeof raw === 'number' ? raw : (typeof raw === 'string' ? parseFloat(raw) : null)
  return num != null && !Number.isNaN(num) ? num : null
})

// Immobilier price suffix: from DB field next to price (price_unit), not booking_type
const immobilierPriceSuffix = computed(() => {
  const meta = product.value?.property_meta
  // 1) Use the field next to price: price_unit ('night' | 'month') – what seller selected in step 3
  const priceUnit = meta?.price_unit
  if (priceUnit === 'month') return 'product.per_month'
  if (priceUnit === 'night') return 'product.per_night'
  // 2) Fallback: literal label from backend
  const label = meta?.price_period_label ?? meta?.rental_period_label
  if (label && typeof label === 'string' && label.trim()) return { literal: label.trim() }
  // 3) Fallback: product attribute
  const attrs = productAttributes.value || []
  const periodAttr = attrs.find(a => {
    const n = (a.label || a.name || a.attribute_template?.name || '').toLowerCase()
    return /période|period|tarif|price_period|par mois|par nuit/.test(n)
  })
  if (periodAttr) {
    const val = getFormattedAttributeValue(periodAttr)
    const str = (val != null && typeof val === 'object' && !Array.isArray(val)) ? (val.label ?? val.value) : val
    const s = str != null ? String(str).toLowerCase().trim() : ''
    if (s.includes('mois') || s === 'month' || s.includes('long')) return 'product.per_month'
    if (s.includes('nuit') || s === 'night' || s.includes('short')) return 'product.per_night'
  }
  return null
})

// Immobilier: amenities as array (from property_meta.amenities string or array)
const amenitiesList = computed(() => {
  const raw = product.value?.property_meta?.amenities
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'string') return raw.split(/[,;]/).map(s => s.trim()).filter(Boolean)
  return []
})

// Address under Emplacement: combination of adresse + quartier + ville only
const propertyAddress = computed(() => {
  const p = product.value
  if (!p) return ''
  const meta = p.property_meta || {}
  const attrs = productAttributes.value || []
  const getAttr = (keywords) => {
    const a = attrs.find(x => {
      const n = (x.label || x.name || x.attribute_template?.name || '').toLowerCase()
      return keywords.some(k => n.includes(k))
    })
    if (!a) return null
    const val = getFormattedAttributeValue(a)
    if (val != null && typeof val === 'object' && !Array.isArray(val)) return val.label ?? val.value ?? null
    return val != null ? String(val) : null
  }
  // Build from: adresse (address), quartier (neighborhood), ville (city)
  const adresse = meta.address ?? p.address ?? meta.street ?? p.street ?? getAttr(['adresse', 'address', 'rue', 'street'])
  const quartier = meta.quartier ?? meta.neighborhood ?? p.neighborhood ?? getAttr(['quartier', 'neighborhood'])
  const ville = meta.ville ?? meta.city ?? p.city ?? getAttr(['ville', 'city'])
  const parts = [adresse, quartier, ville].filter(Boolean)
  return parts.join(', ') || '—'
})

const googleMapsLink = computed(() => {
  const addr = propertyAddress.value
  if (!addr || addr === '—') return 'https://www.google.com/maps'
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
})

// Vehicle specs computed from product attributes (for automobile)
const vehicleSpecs = computed(() => {
  if (!isAutomobile.value || !productAttributes.value.length) return []
  return productAttributes.value
    .filter(attr => !attr.shopper_choice)
    .map(attr => ({
      id: attr.id,
      label: attr.label || attr.name || '',
      value: getFormattedAttributeValue?.(attr) || '—',
      icon: getAutoSpecIcon(attr.label || attr.name || '')
    }))
})

function getAutoSpecIcon(label) {
  const l = (label || '').toLowerCase()
  if (l.includes('fuel') || l.includes('carburant')) return Fuel
  if (l.includes('mileage') || l.includes('kilom')) return Gauge
  if (l.includes('transmission') || l.includes('boîte')) return Settings2
  if (l.includes('color') || l.includes('couleur')) return Palette
  if (l.includes('engine') || l.includes('moteur') || l.includes('cylinder')) return CircleDot
  if (l.includes('year') || l.includes('année')) return Calendar
  if (l.includes('brand') || l.includes('marque') || l.includes('make')) return Car
  return Info
}

// Map facility label to icon component
function getFacilityIcon(label) {
  const l = (label || '').toLowerCase()
  if (l.includes('temple') || l.includes('landmark')) return Landmark
  if (l.includes('train') || l.includes('railway')) return Train
  if (l.includes('restaurant') || l.includes('food') || l.includes('utensils')) return Utensils
  if (l.includes('school') || l.includes('education')) return GraduationCap
  if (l.includes('bus') || l.includes('transport')) return Bus
  if (l.includes('hospital') || l.includes('medical')) return Hospital
  return Building2
}

// Facilities from store category attributes (templates whose name/label suggest "facility")
const facilitiesFromCategory = computed(() => {
  return categoryFacilityTemplates.value.map(t => {
    const label = t.label || t.name || ''
    return { id: t.id, label, icon: getFacilityIcon(label) }
  })
})

// Normalize attribute value for display (select can return { label, value })
function normalizeDetailValue(val) {
  if (val == null || val === '') return null
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) return val.label ?? val.value ?? null
  if (Array.isArray(val) && val.length) return normalizeDetailValue(val[0])
  return val
}

// Property details for immobilier: 6 items (bedrooms, bathrooms, area, number of rooms, built year, type de bien)
// Values from property_meta first, then from productAttributes by label match
const immobilierPropertyDetails = computed(() => {
  const p = product.value
  const meta = p?.property_meta || {}
  const attrs = productAttributes.value || []
  const getFromAttr = (keywords) => {
    const a = attrs.find(attr => {
      const n = (attr.label || attr.name || attr.attribute_template?.name || '').toLowerCase()
      return keywords.some(k => n.includes(k))
    })
    if (!a) return null
    const raw = getFormattedAttributeValue(a)
    return normalizeDetailValue(raw)
  }
  const raw = [
    { key: 'bedrooms', value: meta.bedrooms ?? getFromAttr(['bedroom', 'chambre']), icon: BedDouble, labelKey: 'product.bedrooms' },
    { key: 'bathrooms', value: meta.bathrooms ?? getFromAttr(['bathroom', 'bathrooms', 'salle de bain', 'salles de bain', 'sdb', 'bain']), icon: Bath, labelKey: 'product.bathrooms' },
    { key: 'area', value: meta.surface_sqm ?? meta.area ?? getFromAttr(['surface', 'area', 'sqm', 'm²']), icon: Ruler, labelKey: 'product.size_sqm' },
    { key: 'number_of_rooms', value: meta.room_count ?? meta.number_of_rooms ?? getFromAttr(['nombre de pièce', 'nombre de pièces', 'pièce', 'pièces', 'room count', 'rooms']), icon: Sofa, labelKey: 'product.number_of_rooms' },
    { key: 'built_year', value: meta.year_built ?? meta.construction_year ?? meta.built_year ?? getFromAttr(['built', 'year', 'construction', 'année']), icon: Calendar, labelKey: 'product.built_in_year' },
    { key: 'property_type', value: meta.property_type ?? getFromAttr(['type de bien', 'property type', 'type', 'type de propriété']), icon: Building2, labelKey: 'product.property_type' }
  ]
  return raw.map(({ key, value, icon, labelKey }) => ({
    key,
    value: (value != null && value !== '' ? String(value) : null) ?? '—',
    icon,
    labelKey
  }))
})

// Public facilities: selected "équipement et commodité" and "à proximité" from product attributes (multiselect/select)
// Fallback: show facilitiesFromCategory with same styling when no product selection
const publicFacilitiesList = computed(() => {
  const attrs = productAttributes.value || []
  const isFacilityAttr = (attr) => {
    const n = (attr.label || attr.name || attr.attribute_template?.name || '').toLowerCase()
    return /amenity|facility|equipment|equipement|commodité|proximité|proximite|à proximité/.test(n)
  }
  const selected = []
  attrs.filter(isFacilityAttr).forEach(attr => {
    const val = getAttributeValue(attr)
    const list = Array.isArray(val) ? val : (val != null ? [val] : [])
    const labels = list.map(v => (typeof v === 'object' && v !== null ? (v.label ?? v.value ?? String(v)) : String(v))).filter(Boolean)
    labels.forEach(l => selected.push({ label: l, icon: getFacilityIcon(l) }))
  })
  if (selected.length > 0) return selected
  return facilitiesFromCategory.value.map(f => ({ label: f.label, icon: f.icon }))
})

// WhatsApp link for immobilier contact
const whatsappLink = computed(() => {
  const phone = product.value?.store?.phone || product.value?.seller_phone || ''
  const num = String(phone).replace(/\D/g, '')
  const text = encodeURIComponent(`Hi, I'm interested in: ${product.value?.name || 'this property'}`)
  return num ? `https://wa.me/${num}?text=${text}` : '#'
})

// Immobilier CTA from property_meta: 'booking' | 'viewing' | 'both'
const immobilierCta = computed(() => {
  const cta = product.value?.property_meta?.cta
  if (cta === 'booking' || cta === 'viewing' || cta === 'both') return cta
  return null
})

// Normalize contact_channels (API may return "Email" or "email")
const viewingContactChannels = computed(() => {
  const p = product.value
  const raw = p?.property_meta?.contact_channels
  if (!Array.isArray(raw) || !raw.length) return []
  const channels = raw.map(c => String(c).toLowerCase())
  const out = []
  if (channels.includes('whatsapp')) {
    const phone = p?.store?.phone || p?.seller_contact_phone || p?.seller_phone || ''
    const num = String(phone).replace(/\D/g, '')
    if (num) {
      const text = encodeURIComponent(`Hi, I'm interested in: ${p?.name || 'this property'}`)
      out.push({ type: 'whatsapp', url: `https://wa.me/${num}?text=${text}`, labelKey: 'product.contact_whatsapp' })
    }
  }
  if (channels.includes('email')) {
    const email = (p?.store?.email || p?.seller_contact_email || p?.seller_email || '').trim()
    if (email) {
      const subject = encodeURIComponent(`Viewing request: ${p?.name || 'Property'}`)
      const body = encodeURIComponent(`I'm interested in this property.`)
      out.push({
        type: 'email',
        url: `mailto:${email}?subject=${subject}&body=${body}`,
        labelKey: 'product.contact_email'
      })
    }
  }
  return out
})

// Show "Book stay" for immobilier short-term (or both) or when product is bookable via attributes
const showBookStayPrimary = computed(() => {
  if (isImmobilier.value && isShortTermRental.value) return true
  return isBookableProperty.value && !isImmobilier.value
})
// Show "Demander une visite" as primary only for immobilier long-term; as secondary for immobilier short-term when usesCRMFlow
const showRequestVisitPrimary = computed(() => {
  return isImmobilier.value && isLongTermOnlyRental.value && usesCRMFlow.value
})
const showRequestVisitSecondary = computed(() => {
  return isImmobilier.value && isShortTermRental.value && usesCRMFlow.value
})

// Computed property for product images
const productImages = computed(() => {
  if (!product.value) return []
  return [product.value.main_image, product.value.image_1, product.value.image_2, product.value.image_3].filter(Boolean)
})

// Slides for immobilier: images + video (each { type: 'image'|'video', src })
const getSlides = () => {
  const images = productImages.value
  const slides = images.map(src => ({ type: 'image', src }))
  const v = product.value?.video
  const videoUrl = v ? (typeof v === 'string' ? v : v?.url) : null
  if (videoUrl) slides.push({ type: 'video', src: videoUrl })
  return slides
}
const hasSlides = () => getSlides().length > 0

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

// Clear error for a specific attribute when value is entered
const clearShopperChoiceError = (attrId) => {
  if (shopperChoices.value[attrId]) {
    shopperChoiceErrors.value[attrId] = null
  }
}

// Validate shopper choices before adding to cart
const validateShopperChoices = () => {
  shopperChoiceErrors.value = {}
  let isValid = true
  
  // Check each shopper choice attribute (shopper picks one option per attribute)
  shopperChoiceAttributes.value.forEach(attr => {
    const value = shopperChoices.value[attr.id]
    const hasValue = value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && value.length === 0)
    if (!hasValue) {
      shopperChoiceErrors.value[attr.id] = `${t('product.select_one')} ${attr.label}`
      isValid = false
    }
  })
  
  return isValid
}

const addToCart = async () => {
  if (product.value && currentStock.value > 0) {
    // Validate shopper choices first
    if (!validateShopperChoices()) {
      // Show error snackbar
      snackbarText.value = t('product.please_select_all_required_options')
      snackbarColor.value = 'error'
      showSnackbar.value = true
      
      // Scroll to first error
      const firstErrorId = Object.keys(shopperChoiceErrors.value)[0]
      if (firstErrorId) {
        const errorElement = document.querySelector(`[data-attr-id="${firstErrorId}"]`)
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
      return
    }
    
    try {
      // Prepare shopper choices (only include non-empty values)
      const choicesToSend = {}
      Object.keys(shopperChoices.value).forEach(attrId => {
        const value = shopperChoices.value[attrId]
        if (value !== null && value !== undefined && value !== '' && 
            !(Array.isArray(value) && value.length === 0)) {
          choicesToSend[attrId] = value
        }
      })
      
      // Only send the necessary data to create a new cart
      await cart.createNewCart(
        selectedVariant.value,
        quantity.value,
        product.value.id,
        Object.keys(choicesToSend).length > 0 ? choicesToSend : null
      );

      // Reset quantity to 1 after successful addition
      quantity.value = 1;
      // Reset shopper choices after successful addition
      shopperChoices.value = {}

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

// Check if product supports booking (has price_per_night attribute)
const checkBookableProperty = () => {
  if (!productAttributes.value || productAttributes.value.length === 0) {
    isBookableProperty.value = false
    return
  }
  // Check if any attribute has a price_per_night, price_per_week, or price_per_month value
  const bookingAttrs = productAttributes.value.filter(
    a => ['price_per_night', 'price_per_week', 'price_per_month'].includes(a.attribute_name || a.name)
  )
  isBookableProperty.value = bookingAttrs.some(a => {
    const val = a.value || a.number_value || a.text_value
    return val && parseFloat(val) > 0
  })
}

// Calculate booking price
const calculateBookingPrice = async () => {
  if (!bookingCheckIn.value || !bookingCheckOut.value || !product.value?.id) return
  bookingCalculating.value = true
  bookingPrice.value = null
  try {
    const response = await apiService.calculateBookingPrice({
      product_id: product.value.id,
      check_in: bookingCheckIn.value,
      check_out: bookingCheckOut.value,
      num_guests: bookingGuests.value,
    })
    bookingPrice.value = response.data
  } catch (error) {
    console.error('Error calculating booking price:', error)
    const msg = error.response?.data?.detail || 'Could not calculate price'
    showSnackbar.value = true
    snackbarText.value = msg
    snackbarColor.value = 'error'
  } finally {
    bookingCalculating.value = false
  }
}

// Navigate to property booking page (immobilier court durée)
const goToBookPage = () => {
  if (product.value?.id) router.push({ name: 'PropertyBook', params: { id: product.value.id } })
}

// Create a booking
const createBooking = async () => {
  if (!bookingPrice.value || !product.value?.id) return
  bookingSubmitting.value = true
  try {
    const response = await apiService.createBooking({
      product_id: product.value.id,
      check_in: bookingCheckIn.value,
      check_out: bookingCheckOut.value,
      num_guests: bookingGuests.value,
      special_requests: bookingSpecialRequests.value,
    })
    showBookingFlow.value = false
    showSnackbar.value = true
    snackbarText.value = t('product.booking_created')
    snackbarColor.value = 'success'
    // Navigate to booking confirmation
    const bookingData = response.data
    if (bookingData?.id) {
      router.push({ name: 'BookingConfirmation', params: { id: bookingData.id } })
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    showSnackbar.value = true
    snackbarText.value = error.response?.data?.detail || 'Booking failed'
    snackbarColor.value = 'error'
  } finally {
    bookingSubmitting.value = false
  }
}

// Format currency helper
const formatCurrency = (amount) => {
  if (!amount) return '0'
  return new Intl.NumberFormat('fr-FR').format(amount)
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

const openViewingDialog = () => {
  showViewingDialog.value = true
}

const openRequestViewingForm = () => {
  showViewingDialog.value = false
  showViewingForm.value = true
}

const onViewingRequestSuccess = (data) => {
  snackbarText.value = data.message
  snackbarColor.value = 'success'
  showSnackbar.value = true
  showViewingForm.value = false

  // Refresh the page so product and "Demande en attente" state are up to date
  setTimeout(() => {
    window.location.reload()
  }, 800)
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
    const attributesFromProduct = []
    
    // Step 1: Get attributes that already have values on the product
    if (product.value?.attribute_values && product.value.attribute_values.length > 0) {
      const attributesWithValues = product.value.attribute_values.map(attrValue => {
        const template = attrValue.attribute_template
        
        // Debug logging for each attribute
        console.log('🔍 Processing attribute:', {
          label: attrValue.attribute_label,
          template_id: template?.id,
          template_shopper_choice: template?.shopper_choice,
          template_full: template
        })
        
        // Extract shopper_choice - check multiple paths with explicit boolean check
        const shopperChoice = 
          template?.shopper_choice === true ||
          attrValue.attribute_template?.shopper_choice === true ||
          false
        
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
          // Include shopper_choice flag from template - use explicit boolean
          shopper_choice: shopperChoice,
          // Also store the full template for reference
          attribute_template: template,
          // Mark that this has a value
          has_value: true
        }
      })
      
      attributesFromProduct.push(...attributesWithValues)
    }
    
    // Step 2: Fetch attribute templates with shopper_choice=true from store category
    // This ensures we show ALL shopper_choice attributes, even if product doesn't have values yet
    let storeCategoryId = null
    
    // Try multiple sources for store category ID
    if (product.value?.store?.store_category?.id) {
      storeCategoryId = product.value.store.store_category.id
    } else if (product.value?.store?.store_category_id) {
      storeCategoryId = product.value.store.store_category_id
    } else if (product.value?.store_category_id) {
      storeCategoryId = product.value.store_category_id
    } else {
      // Fallback to session storage
      const defaultStore = sessionStorage.getItem('defaultStore')
      if (defaultStore) {
        storeCategoryId = defaultStore
      }
    }
    
    if (storeCategoryId) {
      try {
        console.log('📋 Fetching shopper_choice attributes for store category:', storeCategoryId)
        const response = await apiService.getStoreAttributesByStoreCategory({ 
          store_category_id: storeCategoryId 
        })
        
        const templates = response.data?.templates || []
        console.log('📋 Found attribute templates:', templates.length)
        
        // Filter for shopper_choice=true and is_active=true
        const shopperChoiceTemplates = templates.filter(t => 
          t.shopper_choice === true && t.is_active === true
        )
        
        console.log('📋 Shopper choice templates:', shopperChoiceTemplates.map(t => ({
          id: t.id,
          name: t.name,
          label: t.label,
          field_type: t.field_type
        })))
        
        // Enrich product attributes and add store-category shopper_choice templates; link to product attribute_value when present so choices use product's selected_choices (e.g. genre cible: femme, homme)
        const productAttrValues = product.value?.attribute_values || []
        shopperChoiceTemplates.forEach(template => {
          const existingIndex = attributesFromProduct.findIndex(attr =>
            attr.id === template.id || attr.label === template.label
          )
          const productVal = productAttrValues.find(av =>
            (av.attribute_template?.id === template.id || av.attribute_template?.label === template.label) ||
            (av.attribute_template && av.attribute_template === template.id)
          )
          if (existingIndex !== -1) {
            attributesFromProduct[existingIndex].shopper_choice = true
            attributesFromProduct[existingIndex].attribute_template = template
          } else {
            attributesFromProduct.push({
              id: template.id,
              label: template.label,
              field_type: template.field_type,
              attribute_value: productVal || null,
              display_value: productVal?.display_value ?? null,
              display_order: template.display_order || 0,
              shopper_choice: true,
              attribute_template: template,
              has_value: !!productVal
            })
          }
        })
      } catch (error) {
        console.warn('⚠️ ProductDetails: Failed to fetch store attribute templates:', error)
        // Continue with just product attributes
      }
    }
    
    // Step 3: Remove duplicates and prioritize attributes with values
    const uniqueAttributes = attributesFromProduct.reduce((acc, current) => {
      const existingIndex = acc.findIndex(attr => 
        attr.id === current.id || (attr.label === current.label && attr.field_type === current.field_type)
      )
      
      if (existingIndex === -1) {
        acc.push(current)
      } else {
        // If duplicate found, prioritize:
        // 1. Attributes with values (has_value = true)
        // 2. Attributes with shopper_choice = true
        // 3. Higher display_order
        const existing = acc[existingIndex]
        
        if (current.has_value && !existing.has_value) {
          acc[existingIndex] = current
        } else if (!current.has_value && existing.has_value) {
          // Keep existing (has value)
        } else if (current.shopper_choice && !existing.shopper_choice) {
          acc[existingIndex] = current
        } else if (current.display_order > existing.display_order) {
          acc[existingIndex] = current
        }
      }
      
      return acc
    }, [])
    
    // Sort by display order
    productAttributes.value = uniqueAttributes
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    
    console.log('✅ Final product attributes:', productAttributes.value.map(a => ({
      id: a.id,
      label: a.label,
      shopper_choice: a.shopper_choice,
      has_value: a.has_value
    })))
    
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
      return rawValue ? t('product.file_attached') : null
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
        return attributeValue.file_value ? t('product.file_attached') : null
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
    snackbarText.value = response.data.liked ? t('product.product_liked') : t('product.product_unliked')
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error) {
    console.error('Failed to toggle like:', error)
    snackbarText.value = t('product.failed_to_update_like')
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

// Fetch facility attributes from store category (for immobilier)
const fetchCategoryFacilities = async () => {
  const p = product.value
  const storeCategoryId = p?.store?.store_category?.id || p?.store?.store_category_id
  if (!storeCategoryId) {
    categoryFacilityTemplates.value = []
    return
  }
  try {
    const response = await apiService.getStoreAttributesByStoreCategory({ store_category_id: storeCategoryId })
    const templates = response.data?.templates || []
    const filtered = templates.filter(t => {
      const name = (t.name || '').toLowerCase()
      const label = (t.label || '').toLowerCase()
      return name.includes('facility') || label.includes('facility') || name.includes('amenity') || label.includes('amenity')
    })
    categoryFacilityTemplates.value = filtered
  } catch (e) {
    console.warn('Failed to fetch category facilities:', e)
    categoryFacilityTemplates.value = []
  }
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
    // Show notification for unavailable product (don't redirect - avoids refresh/redirect loops)
    snackbarText.value = "This product is not available"
    snackbarColor.value = "error"
    showSnackbar.value = true
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

// Shopper choices for attributes
const shopperChoices = ref({})
const activeTextInput = ref(null) // Track which text input is active
const shopperChoiceErrors = ref({}) // Track validation errors for shopper choices

// Show all shopper_choice attributes: from product (has_value) or from store category (so e.g. genre cible shows)
// Choices per attribute still use product's selected_choices when present (femme, homme only)
const shopperChoiceAttributes = computed(() => {
  if (!productAttributes.value.length) {
    return []
  }
  return productAttributes.value.filter(attr => attr.shopper_choice === true)
})

// Choices = only the options the seller selected for this product (attribute_value.selected_choices), e.g. genre cible: [femme, homme] — not full template (no unisexe)
const getAttributeChoices = (attr) => {
  const normalize = (list) => (Array.isArray(list) ? list : []).map(ch =>
    (typeof ch === 'object' && ch !== null) ? (ch.label ?? ch.value ?? String(ch)) : String(ch)
  )
  const fromProduct = attr.attribute_value?.selected_choices
  if (fromProduct && Array.isArray(fromProduct) && fromProduct.length > 0) {
    return normalize(fromProduct)
  }
  const choices =
    attr.attribute_template?.choices ||
    attr.attribute_value?.attribute_template?.choices ||
    attr.choices ||
    []
  if (typeof choices === 'string') {
    return choices.split(',').map(c => c.trim()).filter(c => c.length > 0)
  }
  if (Array.isArray(choices)) {
    return normalize(choices)
  }
  return []
}

// Group product attributes for specs dialog (by category/type)
const SPEC_GROUP_KEYS = { price: 'price', property: 'property', facilities: 'facilities', other: 'other' }
function getSpecGroupKey(attr) {
  const name = (attr.attribute_template?.name || attr.label || '').toLowerCase()
  if (/price|tarif|deposit|prix/.test(name)) return SPEC_GROUP_KEYS.price
  if (/surface|bedroom|bathroom|room|land|property|type|parking|floor|area/.test(name)) return SPEC_GROUP_KEYS.property
  if (/amenity|facility|equipment|equipement/.test(name)) return SPEC_GROUP_KEYS.facilities
  return SPEC_GROUP_KEYS.other
}
const groupedSpecs = computed(() => {
  const attrs = productAttributes.value || []
  const groups = {}
  attrs.forEach(attr => {
    const key = getSpecGroupKey(attr)
    if (!groups[key]) groups[key] = []
    groups[key].push(attr)
  })
  const order = [SPEC_GROUP_KEYS.price, SPEC_GROUP_KEYS.property, SPEC_GROUP_KEYS.facilities, SPEC_GROUP_KEYS.other]
  return order.filter(k => groups[k]?.length).map(key => ({ key, label: t(`product.spec_group_${key}`), attrs: groups[key] }))
})

// Icons for specs dialog: group headers and field types
const specGroupIcons = { price: Calculator, property: Building2, facilities: List, other: Info }
const specFieldIcons = { number: Hash, decimal: Hash, text: FileText, select: List, boolean: CheckSquare, date: Calendar, file: FileText, multiselect: List, textarea: FileText }

// Helper to toggle multiselect choice
const toggleMultiselectChoice = (attrId, choice) => {
  if (!shopperChoices.value[attrId]) {
    shopperChoices.value[attrId] = []
  }
  
  const choices = shopperChoices.value[attrId]
  const index = choices.indexOf(choice)
  
  if (index > -1) {
    choices.splice(index, 1)
  } else {
    choices.push(choice)
  }
}

// Helper to check if a choice is selected in multiselect
const isChoiceSelected = (attrId, choice) => {
  return shopperChoices.value[attrId]?.includes(choice) || false
}

// Update selectVariant to always set quantity to 1
const selectVariant = (variant) => {
  selectedVariant.value = variant;
  selectedSize.value = variant.name;

  // Always set quantity to 1 when selecting a variant
  quantity.value = 1;
  
  // Reset shopper choices when variant changes
  shopperChoices.value = {}
}

const cartItemsCount = computed(() => cart.cartItemCount)
const pendingViewingRequests = computed(() => crmStore.pendingViewingRequests ?? 0)

// Property map (immobilier): init and destroy
function destroyPropertyMap() {
  if (propertyMapInstance) {
    try {
      propertyMapInstance.remove()
    } catch (e) {
      // ignore
    }
    propertyMapInstance = null
  }
  propertyMapReady.value = false
}

async function initPropertyMap() {
  const el = propertyMapEl.value
  const p = product.value
  if (!el || !p || !isImmobilierStoreCategory.value) return
  destroyPropertyMap()
  const lat = p.property_meta?.latitude ?? p.latitude
  const lng = p.property_meta?.longitude ?? p.longitude
  let center = null
  if (lat != null && lng != null && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))) {
    center = [Number(lat), Number(lng)]
  }
  if (!center && propertyAddress.value && propertyAddress.value !== '—') {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(propertyAddress.value)}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data && data[0]) {
        center = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
      }
    } catch (e) {
      console.warn('Geocode failed:', e)
    }
  }
  if (!center) center = [6.13, 1.22]
  try {
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
    })
    propertyMapInstance = L.map(el, { center, zoom: 14, zoomControl: true })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(propertyMapInstance)
    L.marker(center).addTo(propertyMapInstance)
    propertyMapReady.value = true
  } catch (e) {
    console.warn('Map init failed:', e)
  }
}

// Function to load product data
const loadProductData = async (productId) => {
  const id = productId != null ? String(productId) : null
  if (!id) return
  // Prevent re-entry and duplicate load when route + onMounted fire close together
  if (loadingProductId.value === id) return
  loadingProductId.value = id
  try {
    // Reset state
    destroyPropertyMap()
    categoryFacilityTemplates.value = []
    autoDescExpanded.value = false
    autoSpecsFromAttributes.value = []
    currentImageIndex.value = 0
    activeTab.value = 'description'
    selectedVariant.value = null
    selectedSize.value = null
    quantity.value = 1
    similarProducts.value = []
    sellerProducts.value = []
    isLiked.value = false
    lastProcessedProductId.value = null // Reset last processed ID
    
    // Fetch product data
    await productStore.fetchProductById(id)
    
    // Check if product is liked
    await checkLikeStatus(id)

    // Fetch related data
    await Promise.all([
      productStore.fetchRelatedProducts(id),
      productStore.fetchProductReviews(id)
    ])

    // Check CRM flow after product is loaded
    await checkCRMFlow()

    // Check for existing viewing requests if using CRM flow
    if (usesCRMFlow.value) {
      await checkExistingViewingRequest()
    }

    // Fetch product attributes based on store category
    await fetchProductAttributes()
    checkBookableProperty()
    if (isImmobilier.value || isAutomobile.value) {
      await fetchCategoryFacilities()
    }
    
    // Fetch similar products and seller products
    await Promise.all([
      fetchSimilarProducts(),
      fetchSellerProducts()
    ])
    
    lastProcessedProductId.value = product.value?.id ?? null
  } catch (error) {
    // Handle error and redirect to home page
    console.error('Error fetching product:', error)
    snackbarText.value = "Product not found"
    snackbarColor.value = "error"
    showSnackbar.value = true

    // Redirect to home page
    router.push({ name: 'Home' })
  } finally {
    loadingProductId.value = null
  }
}

function maybeOpenRequestViewingFromHash() {
  if (typeof window === 'undefined') return
  if (window.location.hash !== '#request-viewing') return
  if (!product.value || !isImmobilier.value) return
  const cta = product.value?.property_meta?.cta
  if (cta !== 'viewing' && cta !== 'both') return
  openViewingDialog()
}

onMounted(async () => {
  const id = route.params.id
  if (id != null) await loadProductData(id)
  nextTick(maybeOpenRequestViewingFromHash)
})

// Watch for route changes to reload product when navigating to different product
watch(() => route.params.id, async (newProductId, oldProductId) => {
  const newId = newProductId != null ? String(newProductId) : null
  const oldId = oldProductId != null ? String(oldProductId) : null
  if (newId && newId !== oldId) {
    await loadProductData(newId)
    nextTick(maybeOpenRequestViewingFromHash)
  }
})

watch(() => route.fullPath, () => {
  nextTick(maybeOpenRequestViewingFromHash)
}, { immediate: false })

// When product has store category immobilier, init map after ref is mounted
watch([product, () => propertyMapEl.value], () => {
  if (!isImmobilierStoreCategory.value || !product.value) {
    if (!product.value) destroyPropertyMap()
    return
  }
  nextTick(() => {
    if (propertyMapEl.value) initPropertyMap()
  })
}, { flush: 'post' })
</script>

<style scoped>
/* Additional styles if needed */
</style>