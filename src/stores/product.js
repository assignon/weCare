import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const categories = ref([])
  // Note: skinTypes, skinConcerns, productTypes removed - API endpoints no longer exist
  const featuredProducts = ref([])
  const popularProducts = ref([])
  const newArrivals = ref([])
  const recommendedProducts = ref([])
  const currentProduct = ref(null)
  const productReviews = ref([])
  const relatedProducts = ref([])
  const searchQuery = ref('')
  const selectedCategory = ref(null)
  const selectedSkinTypes = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0
  })
  
  // Getters
  const filteredProducts = computed(() => {
    if (!searchQuery.value && !selectedCategory.value) return products.value
    
    return products.value.filter(product => {
      const matchesSearch = !searchQuery.value || 
        product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.value.toLowerCase()))
      
      const matchesCategory = !selectedCategory.value || 
        product.category === selectedCategory.value
      
      return matchesSearch && matchesCategory
    })
  })
  
  // Actions
  const fetchProducts = async (params = {}, append = false, skipStoreCategory = false) => {
    loading.value = true
    error.value = null
    
    try {
      const defaultStore = sessionStorage.getItem('defaultStore')

      // Build params to send - preserve all incoming params including custom attribute filters
      console.log('🔍 ProductStore fetchProducts called with params:', params)
      const baseParams = { ...(params || {}) }
      console.log('🔧 Base params after spread:', baseParams)
      if (searchQuery.value && !baseParams.search) {
        baseParams.search = searchQuery.value
      }
      
      // Map category filter depending on endpoint
      const categoryId = selectedCategory.value
      
      if (!baseParams.page) {
        baseParams.page = append ? pagination.value.page + 1 : 1
      }
      if (!baseParams.page_size) {
        baseParams.page_size = pagination.value.pageSize
      }
      
      if (selectedSkinTypes.value && selectedSkinTypes.value.length > 0 && !baseParams.suitable_for) {
        baseParams.suitable_for = selectedSkinTypes.value[0]
      }
      
      // Always use shopper 'all' endpoint; pass store_id when available
      const allParams = { ...baseParams }
      if (categoryId && !allParams.categories) {
        // Backend expects 'categories' filter for M2M
        allParams.categories = categoryId
      }
      // Only apply store category filter if skipStoreCategory is false
      if (defaultStore && !allParams.store_category && !skipStoreCategory) {
        allParams.store_category = defaultStore
      }
      console.log('🚀 Making API call with final params:', allParams)
      const response = await apiService.getProducts(allParams)
      
      const newProducts = response.data.results || response.data
      
      if (append) {
        products.value = [...products.value, ...newProducts]
        pagination.value.page = params.page
      } else {
        products.value = newProducts
        pagination.value.page = 1
      }
      
      // If paginated response
      if (response.data.count !== undefined) {
        totalProducts.value = response.data.count
        pagination.value.total = response.data.count
      }
      
      // Return whether there are more products to load
      let hasMore = false
      if (response.data.count !== undefined) {
        // If we have pagination info, check if current products length is less than total
        hasMore = products.value.length < response.data.count
      } else {
        // If no pagination info, check if we got a full page of results
        hasMore = newProducts.length === pagination.value.pageSize
      }
      
      return hasMore
    } catch (err) {
      console.error('Failed to fetch products:', err)
      error.value = 'Failed to load products. Please try again later.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchProductById = async (productId) => {
    loading.value = true
    error.value = null
    currentProduct.value = null
    
    try {
      const response = await apiService.getProductDetails(productId)
      currentProduct.value = response.data
      return currentProduct.value
    } catch (err) {
      console.error(`Failed to fetch product ${productId}:`, err)
      error.value = 'Failed to load product details. Please try again later.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const fetchCategories = async () => {
    try {
      // Get default store from session storage to filter categories
      const defaultStore = sessionStorage.getItem('defaultStore')
      const params = {}
      
      if (defaultStore) {
        params.store_id = defaultStore
      }
      
      const response = await apiService.getCategories(params)
      categories.value = response.data.results || response.data
      return categories.value
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Don't set error.value here as categories are not critical
      return []
    }
  }
  
  // Note: fetchSkinTypes, fetchSkinConcerns, fetchProductTypes removed - API endpoints no longer exist
  
  const fetchFeaturedProducts = async () => {
    try {
      // Assuming the API has a way to fetch featured products, e.g. with a parameter
      const response = await apiService.getProducts({ featured: true })
      featuredProducts.value = response.data.results || response.data
      return featuredProducts.value
    } catch (err) {
      console.error('Failed to fetch featured products:', err)
      return []
    }
  }
  
  const fetchPopularProducts = async (params = {}) => {
    try {
      // Forward optional params (e.g., store_id)
      const response = await apiService.getPopularProducts(params)
      popularProducts.value = response.data.results || response.data
      return popularProducts.value
    } catch (err) {
      console.error('Failed to fetch popular products:', err)
      return []
    }
  }
  
  const fetchNewArrivals = async (params = {}) => {
    try {
      // Forward optional params (e.g., store_id)
      const response = await apiService.getNewArrivals(params)
      newArrivals.value = response.data.results || response.data
      return newArrivals.value
    } catch (err) {
      console.error('Failed to fetch new arrivals:', err)
      return []
    }
  }

  const fetchRecommendedProducts = async () => {
    try {
      const response = await apiService.getRecommendedProducts()
      recommendedProducts.value = response.data.results || response.data
      return recommendedProducts.value
    } catch (err) {
      console.error('Failed to fetch recommended products:', err)
      return []
    }
  }
  
  const fetchRelatedProducts = async (productId) => {
    try {
      // Assuming the API has a way to fetch related products
      const response = await apiService.getProducts({ related_to: productId })
      relatedProducts.value = response.data.results || response.data
      return relatedProducts.value
    } catch (err) {
      console.error(`Failed to fetch related products for ${productId}:`, err)
      return []
    }
  }
  
  const searchProducts = async (query, skipStoreCategory = false) => {
    searchQuery.value = query
    currentPage.value = 1
    return await fetchProducts({}, false, skipStoreCategory)
  }
  
  const filterByCategory = async (categoryId) => {
    selectedCategory.value = categoryId
    currentPage.value = 1
    return await fetchProducts()
  }
  
  const filterBySkinTypes = async (skinTypeIds) => {
    selectedSkinTypes.value = skinTypeIds
    currentPage.value = 1
    return await fetchProducts()
  }
  
  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = null
    selectedSkinTypes.value = []
    pagination.value.page = 1
  }
  
  const goToPage = async (page) => {
    currentPage.value = page
    return await fetchProducts()
  }

  const fetchProductReviews = async (productId) => {
    try {
      const response = await apiService.getProductReviews(productId)
      productReviews.value = response.data || []
      
      return productReviews.value
    } catch (err) {
      console.error(`Failed to fetch reviews for product ${productId}:`, err)
    }
  }
  
  const refreshCategoriesForStore = async () => {
    try {
      await fetchCategories()
    } catch (err) {
      console.error('Failed to refresh categories for store:', err)
    }
  }
  
  return {
    // State
    products,
    categories,
    // Note: skinTypes, skinConcerns, productTypes removed
    featuredProducts,
    popularProducts,
    newArrivals,
    recommendedProducts,
    currentProduct,
    productReviews,
    relatedProducts,
    searchQuery,
    selectedCategory,
    selectedSkinTypes,
    loading,
    error,
    totalProducts,
    currentPage,
    pageSize,
    pagination,
    
    // Getters
    filteredProducts,
    
    // Actions
    fetchProducts,
    fetchProductById,
    fetchCategories,
    // Note: fetchSkinTypes, fetchSkinConcerns, fetchProductTypes removed
    fetchFeaturedProducts,
    fetchPopularProducts,
    fetchNewArrivals,
    fetchRecommendedProducts,
    fetchRelatedProducts,
    searchProducts,
    filterByCategory,
    filterBySkinTypes,
    clearFilters,
    goToPage,
    fetchProductReviews,
    refreshCategoriesForStore
  }
}) 