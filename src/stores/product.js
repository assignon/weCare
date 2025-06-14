import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const categories = ref([])
  const skinTypes = ref([])
  const skinConcerns = ref([])
  const productTypes = ref([])
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
  const fetchProducts = async (params = {}, append = false) => {
    loading.value = true
    error.value = null
    
    try {
      if (searchQuery.value) {
        params.search = searchQuery.value
      }
      
      if (selectedCategory.value) {
        params.category = selectedCategory.value
      }
      
      if (selectedSkinTypes.value && selectedSkinTypes.value.length > 0) {
        // For now, send only the first skin type to the API
        // and filter the rest locally in the component
        params.suitable_for = selectedSkinTypes.value[0]
      }
      
      // Add pagination params
      if (!params.page) {
        params.page = append ? pagination.value.page + 1 : 1
      }
      params.page_size = pagination.value.pageSize
      
      const response = await apiService.getProducts(params)
      
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
      const response = await apiService.getCategories()
      categories.value = response.data.results || response.data
      return categories.value
    } catch (err) {
      console.error('Failed to fetch categories:', err)
      // Don't set error.value here as categories are not critical
      return []
    }
  }
  
  const fetchSkinTypes = async () => {
    try {
      const response = await apiService.getSkinTypes()
      skinTypes.value = response.data.results || response.data
      return skinTypes.value
    } catch (err) {
      console.error('Failed to fetch skin types:', err)
      // Don't set error.value here as skin types are not critical
      return []
    }
  }

  const fetchSkinConcerns = async () => {
    try {
      const response = await apiService.getSkinConcerns()
      skinConcerns.value = response.data.results || response.data
      return skinConcerns.value
    } catch (err) {
      console.error('Failed to fetch skin concerns:', err)
      return []
    }
  }

  const fetchProductTypes = async () => {
    try {
      const response = await apiService.getProductTypes()
      productTypes.value = response.data.results || response.data
      return productTypes.value
    } catch (err) {
      console.error('Failed to fetch product types:', err)
      return []
    }
  }
  
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
  
  const fetchPopularProducts = async () => {
    try {
      // Assuming the API has a way to fetch popular products
      const response = await apiService.getPopularProducts()
      popularProducts.value = response.data.results || response.data
      return popularProducts.value
    } catch (err) {
      console.error('Failed to fetch popular products:', err)
      return []
    }
  }
  
  const fetchNewArrivals = async () => {
    try {
      // Assuming the API has a way to fetch new arrivals
      const response = await apiService.getNewArrivals()
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
  
  const searchProducts = async (query) => {
    searchQuery.value = query
    currentPage.value = 1
    return await fetchProducts()
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
  
  return {
    // State
    products,
    categories,
    skinTypes,
    skinConcerns,
    productTypes,
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
    fetchSkinTypes,
    fetchSkinConcerns,
    fetchProductTypes,
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
    fetchProductReviews
  }
}) 