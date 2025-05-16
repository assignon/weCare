import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useProductStore = defineStore('product', () => {
  // State
  const products = ref([])
  const categories = ref([])
  const featuredProducts = ref([])
  const popularProducts = ref([])
  const newArrivals = ref([])
  const currentProduct = ref(null)
  const productReviews = ref([])
  const relatedProducts = ref([])
  const searchQuery = ref('')
  const selectedCategory = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const totalProducts = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  
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
  const fetchProducts = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      if (searchQuery.value) {
        params.search = searchQuery.value
      }
      
      if (selectedCategory.value) {
        params.category = selectedCategory.value
      }
      
      // params.page = currentPage.value
      // params.page_size = pageSize.value
      
      const response = await apiService.getProducts(params)
      
      products.value = response.data.results || response.data
      
      // If paginated response
      if (response.data.count !== undefined) {
        totalProducts.value = response.data.count
      }
      
      return products.value
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
  
  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = null
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
    featuredProducts,
    popularProducts,
    newArrivals,
    currentProduct,
    productReviews,
    relatedProducts,
    searchQuery,
    selectedCategory,
    loading,
    error,
    totalProducts,
    currentPage,
    pageSize,
    
    // Getters
    filteredProducts,
    
    // Actions
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchFeaturedProducts,
    fetchPopularProducts,
    fetchNewArrivals,
    fetchRelatedProducts,
    searchProducts,
    filterByCategory,
    clearFilters,
    goToPage,
    fetchProductReviews
  }
}) 