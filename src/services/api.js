import axios from 'axios'
import { setupAuthInterceptors } from './authInterceptor'

// Determine API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:8000/api'

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false
})

// Setup auth interceptors for automatic token handling and refreshing
setupAuthInterceptors(api)

// Helper function to create axios instance for public endpoints (no auth)
const createPublicApi = () => {
  const publicApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    withCredentials: false
  })

  // Add debug interceptors to public API instances
  publicApi.interceptors.request.use(
    config => {
      return config
    },
    error => {
      console.error('🔍 [PUBLIC API REQUEST ERROR]', error)
      return Promise.reject(error)
    }
  )

  publicApi.interceptors.response.use(
    response => {
      return response
    },
    error => {
      console.error('🔍 [PUBLIC API RESPONSE ERROR]', {
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message
      })
      return Promise.reject(error)
    }
  )

  return publicApi
}

export const apiService = {
  // Authentication
  login(credentials) {
    return api.post('/auth/token/', credentials)
  },
  
  register(userData) {
    // Use public API instance to ensure no interceptors or default headers are applied
    const registerApi = createPublicApi()
    
    // Add shopper role to registration data
    const registerData = {
      ...userData,
      role: 'SHOPPER'  // Ensure role is set to SHOPPER
    }
    
    // Remove any fields that aren't expected by the API
    // delete registerData.confirmPassword
    
    // Make direct request to registration endpoint
    return registerApi.post('/accounts/register/', registerData)
  },
  
  logout(refreshToken) {
    return api.post('/accounts/logout/', refreshToken)
  },
  
  refreshToken(refreshToken) {
    return api.post('/auth/token/refresh/', { refresh: refreshToken })
  },
  
  verifyToken(token) {
    return api.post('/auth/token/verify/', { token })
      .then(response => response.data)
  },
  
  getUserData() {
    return api.get('/accounts/me/')
      .then(response => {
        return response
      })
      .catch(error => {
        console.error('API Service: User data fetch error:', error)
        throw error
      })
  },
  
  // Products
  getProducts(params = {}) {
    // Shopper list endpoint
    return api.get('/products/shopper/products/', { params })
  },

  getPopularProducts(params = {}) {
    return api.get('/products/shopper/products/popular/', { params })
  },

  getNewArrivals(params = {}) {
    return api.get('/products/shopper/products/new_arrivals/', { params })
  },

  // Products by store
  getProductsByStore(storeId, params = {}) {
    if (!storeId) throw new Error('storeId is required')
    return api.get('/products/products/by_store/', { params: { store_id: storeId, ...params } })
  },

  getRecommendedProducts() {
    return api.get('/products/shopper/products/recommended_products/')
  },
  
  getProductDetails(id) {
    return api.get(`/products/products/${id}/`)
  },

  getProductReviews(id) {
    return api.get(`/products/products/${id}/reviews/`)
  },
  
  requestRestockNotification(productId) {
    return api.post(`/products/products/${productId}/request_restock_notification/`)
  },
  
  // Categories
  getCategories(params = {}) {
    return api.get('/products/categories/', { params })
  },
  
  // Note: Skin types, concerns, and product types APIs have been removed
  // Use CategoryAttributeTemplate system instead for dynamic product attributes
  
  // Skin Types (DEPRECATED - returns empty array)
  getSkinTypes() {
    return Promise.resolve({ data: [] })
  },

  // Skin Concerns (DEPRECATED - returns empty array)
  getSkinConcerns() {
    return Promise.resolve({ data: [] })
  },

  // Product Types (DEPRECATED - returns empty array)
  getProductTypes() {
    return Promise.resolve({ data: [] })
  },

  // Countries
  getCountries() {
    return api.get('/accounts/countries/')
  },
  
  // Orders
  getOrders(params = {}) {
    return api.get('/orders/orders/', { params })
  },
  
  getOrderDetails(id) {
    return api.get(`/orders/orders/${id}/`)
  },
  
  createOrder(orderData) {
    return api.post('/orders/orders/', orderData)
  },
  
  createOrderFromCart(orderData) {
    return api.post('/orders/orders/create_from_cart/', orderData)
  },

  calculateDeliveryFee(distanceKm, deliveryOption) {
    return api.post('/orders/orders/calculate_delivery_fee/', {
      distance_km: distanceKm,
      delivery_option: deliveryOption
    })
  },
  
  searchOrders(params = {}) {
    return api.get('/orders/orders/search/', { params })
  },
  
  getOrdersByStatus(status) {
    return api.get('/orders/orders/by_status/', { params: { status } })
  },
  
  getRecentOrders() {
    return api.get('/orders/orders/recent/')
  },
  
  cancelOrder(orderId, data) {
    return api.post(`/orders/orders/${orderId}/update_status/`, {
      status: 'cancelled',
      notes: data.reason || 'Order cancelled by customer'
    })
  },
  
  updateOrderStatus(orderId, data) {
    return api.post(`/orders/orders/${orderId}/update_status/`, data)
  },
  
  downloadOrderInvoice(orderId) {
    return api.get(`/orders/orders/${orderId}/invoice/`, { responseType: 'blob' })
  },
  
  // Wishlist
  getWishlist() {
    return api.get('/products/wishlists/')
  },
  
  createWishlist() {
    return api.post('/products/wishlists/', {})
  },
  
  addToWishlist(productId) {
    return api.post(`/products/wishlists/${productId}/add_product/`, { product_id: productId })
  },
  
  removeFromWishlist(productId) {
    return api.post(`/products/wishlists/${productId}/remove_product/`, { product_id: productId })
  },
  
  // User profile
  getProfile() {
    return api.get('/accounts/profile/details/')
  },
  
  updateProfile(profileData, hasFile = false) {
    console.log('Profile update request:', { profileData, hasFile });
    
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData()
      for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          // Handle arrays (like skin_concerns, product_types)
          if (Array.isArray(profileData[key])) {
            profileData[key].forEach(item => {
              formData.append(key, item)
            })
          } else {
            formData.append(key, profileData[key])
          }
        }
      }
      
      // Log FormData entries
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + (pair[1] instanceof File ? `File (${pair[1].name})` : pair[1]));
      }
      
      return api.put('/accounts/profile/details/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(response => {
        console.log('Profile update success (with file):', response.data);
        return response;
      })
      .catch(error => {
        console.error('Profile update error (with file):', error.response?.data || error.message);
        throw error;
      });
    } else {
      // Regular JSON request for profile update without files
      return api.put('/accounts/profile/details/', profileData)
      .then(response => {
        console.log('Profile update success:', response.data);
        return response;
      })
      .catch(error => {
        console.error('Profile update error:', error.response?.data || error.message);
        throw error;
      });
    }
  },

  updateLanguage(languageId) {
    return api.post('/accounts/languages/set-default/', { language_id: languageId })
  },
  
  // Addresses
  getAddresses() {
    return api.get('/accounts/shipping-addresses/')
  },
  
  addAddress(addressData) {
    return api.post('/accounts/shipping-addresses/', addressData)
  },
  
  updateAddress(addressId, addressData) {
    return api.put(`/accounts/shipping-addresses/${addressId}/`, addressData)
  },
  
  deleteAddress(addressId) {
    return api.delete(`/accounts/shipping-addresses/${addressId}/`)
  },
  
  setDefaultAddress(addressId) {
    return api.post(`/accounts/shipping-addresses/${addressId}/set-default/`)
  },
  
  // Notifications
  getNotifications(params = {}) {
    return api.get('/notifications/notifications/', { params })
  },
  
  markNotificationAsRead(id) {
    return api.post(`/notifications/notifications/${id}/mark_read/`)
  },
  
  markAllNotificationsAsRead() {
    return api.post('/notifications/notifications/mark_all_read/')
  },
  
  getUnreadNotificationsCount() {
    return api.get('/notifications/notifications/unread_count/')
  },

  // Cart endpoints
  getCart() {
    return api.get('/orders/cart/view_cart/')
  },
  createCart(items) {
    console.log(items)
    return api.post('/orders/cart/add_item/', {items: items})
  },

  updateCartItem(item) {
    return api.patch(`/orders/cart/${item.id}/update_item/`, {
      id: item.id,
      // product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      stock: item.stock
    })
  },

  removeCartItem(cartItemId) {
    return api.delete(`/orders/cart/${cartItemId}/remove_item/`)
  },
  clearCart() {
    return api.post('/orders/cart/clear/')
  },

  // Password Reset
  requestPasswordReset(email, hostUrl) {
    // Use public API instance to avoid auth issues
    const resetApi = createPublicApi()
    return resetApi.post('/accounts/password/reset_password/', { email, hostUrl })
  },

  validateResetCode(code) {
    // Use public API instance to avoid auth issues
    const resetApi = createPublicApi()
    return resetApi.get(`/accounts/validate-reset-code/${code}/`)
  },

  confirmPasswordReset(code, password) {
    // Use public API instance to avoid auth issues
    const resetApi = createPublicApi()
    console.log('🔍 [API] confirmPasswordReset called with:', { code, password })
    console.log('🔍 [API] Making request to:', '/accounts/password/reset_password_confirm/')
    return resetApi.post('/accounts/password/reset_password_confirm/', { code, password })
      .then(response => {
        console.log('🔍 [API] confirmPasswordReset success:', response)
        return response
      })
      .catch(error => {
        console.error('🔍 [API] confirmPasswordReset error:', error)
        throw error
      })
  },

  // Profile Management
  changePassword(passwordData) {
    return api.put('/accounts/password/change_password/', passwordData)
  },

  // Email Verification
  requestEmailChange(newEmail) {
    return api.post('/accounts/send-verification-email/', { new_email: newEmail })
  },

  verifyEmailChange(code) {
    return api.post('/accounts/verify-email-code/', { code })
  },

  getEmailVerificationStatus() {
    return api.get('/accounts/email-verification-status/')
  },

  invalidateExpiredEmailVerification() {
    return api.post('/accounts/invalidate-expired-verification/')
  },

  cancelEmailVerification() {
    return api.post('/accounts/cancel-email-verification/')
  },

  // Address Management  
  createAddress(addressData) {
    return api.post('/accounts/shipping-addresses/', addressData)
  },

  updateAddress(addressId, addressData) {
    return api.put(`/accounts/shipping-addresses/${addressId}/`, addressData)
  },

  deleteAddress(addressId) {
    return api.delete(`/accounts/shipping-addresses/${addressId}/`)
  },

  setDefaultAddress(addressId) {
    return api.post(`/accounts/shipping-addresses/${addressId}/set-default/`)
  },

  // Language Management
  getLanguages() {
    return api.get('/accounts/languages/')
  },

  // Store Management (exposed under products namespace)
  getStores(params = {}) {
    return api.get('/products/stores/', { params })
  },

  getStore(id) {
    return api.get(`/products/stores/${id}/`)
  },

  getStoreCategories(params = {}) {
    return api.get('/products/store-categories/', { params })
  },

  followStore(storeId) {
    return api.post(`/stores/stores/${storeId}/follow/`)
  },

  unfollowStore(storeId) {
    return api.post(`/stores/stores/${storeId}/unfollow/`)
  },

  // Product Categories (for multistore filtering)
  getProductCategories(params = {}) {
    return api.get('/products/product-categories/', { params })
  },

  // Store Attribute Templates (dynamic filters per store category)
  getStoreAttributesByStoreCategory(params = {}) {
    // expects: { store_category_id }
    return api.get('/products/store-attributes/by_store_category/', { params })
  },

  // Enhanced Search & Discovery
  getSearchSuggestions(query) {
    return api.get('/products/search/suggestions/', { 
      params: { q: query } 
    })
  },

  searchProducts(params = {}) {
    return api.get('/products/search/', { params })
  },

  getProductsByCategory(categoryId, params = {}) {
    return api.get(`/products/categories/${categoryId}/products/`, { params })
  },

  getTrendingProducts(params = {}) {
    return api.get('/products/trending/', { params })
  },

  getFeaturedProducts(params = {}) {
    return api.get('/products/featured/', { params })
  },

  getPersonalizedRecommendations(params = {}) {
    return api.get('/products/recommendations/personalized/', { params })
  },

  getSimilarProducts(productId, params = {}) {
    return api.get(`/products/products/${productId}/similar/`, { params })
  },

  getAlsoBoughtProducts(productId, params = {}) {
    return api.get(`/products/products/${productId}/also-bought/`, { params })
  },

  getRecentlyViewedProducts(params = {}) {
    return api.get('/products/recently-viewed/', { params })
  },

  recordProductView(productId) {
    return api.post(`/products/products/${productId}/view/`)
  },

  // Advanced Filtering
  getFilterOptions(params = {}) {
    return api.get('/products/filters/', { params })
  },

  getBrandsList(params = {}) {
    return api.get('/products/brands/', { params })
  },

  getTopSellingProducts(params = {}) {
    return api.get('/products/top-selling/', { params })
  },

  getProductsByPriceRange(minPrice, maxPrice, params = {}) {
    return api.get('/products/search/', { 
      params: { 
        price_min: minPrice, 
        price_max: maxPrice,
        ...params 
      } 
    })
  },

  getProductsByRating(minRating, params = {}) {
    return api.get('/products/search/', { 
      params: { 
        min_rating: minRating,
        ...params 
      } 
    })
  },

  // AI Recommendations & Insights
  getRecommendationInsights(params = {}) {
    return api.get('/products/recommendations/insights/', { params })
  },

  trackRecommendationConversion(data) {
    return api.post('/products/recommendations/track/', data)
  },

  submitRecommendationFeedback(data) {
    return api.post('/products/recommendations/feedback/', data)
  },

  submitAIInsightsFeedback(data) {
    return api.post('/products/recommendations/insights-feedback/', data)
  },

  updateUserPreferences(preferences) {
    return api.put('/accounts/preferences/', preferences)
  },

  getUserRecommendationProfile() {
    return api.get('/accounts/recommendation-profile/')
  },

  // Smart Search & Filters
  getSmartFilters(params = {}) {
    return api.get('/products/smart-filters/', { params })
  },

  getAutoCompleteSearch(query) {
    return api.get('/products/search/autocomplete/', {
      params: { q: query }
    })
  },

  getVisualSearch(imageData) {
    const formData = new FormData()
    formData.append('image', imageData)
    return api.post('/products/search/visual/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  getVoiceSearch(audioData) {
    const formData = new FormData()
    formData.append('audio', audioData)
    return api.post('/products/search/voice/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // Enhanced Cart & Checkout
  applyPromoCode(data) {
    return api.post('/orders/cart/apply-promo/', data)
  },

  removePromoCode() {
    return api.delete('/orders/cart/remove-promo/')
  },

  getShippingOptions(addressData) {
    return api.post('/orders/shipping/calculate/', addressData)
  },

  validateAddress(addressData) {
    return api.post('/accounts/addresses/validate/', addressData)
  },

  saveForLater(cartItemId) {
    return api.post(`/orders/cart/${cartItemId}/save-for-later/`)
  },

  moveBackToCart(savedItemId) {
    return api.post(`/orders/saved-items/${savedItemId}/move-to-cart/`)
  },

  getSavedItems() {
    return api.get('/orders/saved-items/')
  },

  removeSavedItem(savedItemId) {
    return api.delete(`/orders/saved-items/${savedItemId}/`)
  },

  estimateDeliveryTime(data) {
    return api.post('/orders/delivery/estimate/', data)
  },

  getPaymentMethods() {
    return api.get('/payments/methods/')
  },

  savePaymentMethod(paymentData) {
    return api.post('/payments/methods/', paymentData)
  },

  processPayment(paymentData) {
    return api.post('/payments/process/', paymentData)
  },

  verifyPayment(paymentId) {
    return api.get(`/payments/${paymentId}/verify/`)
  },

  // Order Management
  getOrderTracking(orderId) {
    return api.get(`/orders/orders/${orderId}/tracking/`)
  },

  requestOrderCancellation(orderId, reason) {
    return api.post(`/orders/orders/${orderId}/cancel/`, { reason })
  },

  requestRefund(orderId, data) {
    return api.post(`/orders/orders/${orderId}/refund/`, data)
  },

  rateOrder(orderId, rating, review) {
    return api.post(`/orders/orders/${orderId}/rate/`, { rating, review })
  },

  // Review Management
  submitProductReview(formData) {
    return api.post('/products/reviews/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  markReviewHelpful(reviewId) {
    return api.post(`/products/reviews/${reviewId}/helpful/`)
  },

  removeReviewHelpful(reviewId) {
    return api.delete(`/products/reviews/${reviewId}/helpful/`)
  },

  reportReview(reviewId, reason) {
    return api.post(`/products/reviews/${reviewId}/report/`, { reason })
  },

  updateReview(reviewId, reviewData) {
    return api.put(`/products/reviews/${reviewId}/`, reviewData)
  },

  deleteReview(reviewId) {
    return api.delete(`/products/reviews/${reviewId}/`)
  },

  getReviewsByUser(userId, params = {}) {
    return api.get(`/products/reviews/user/${userId}/`, { params })
  },

  getReviewsByStore(storeId, params = {}) {
    return api.get(`/products/reviews/store/${storeId}/`, { params })
  },

  // Social Features
  shareProduct(productId, platform, data = {}) {
    return api.post(`/products/products/${productId}/share/`, {
      platform,
      ...data
    })
  },

  shareReview(reviewId, platform, data = {}) {
    return api.post(`/products/reviews/${reviewId}/share/`, {
      platform,
      ...data
    })
  },

  shareStore(storeId, platform, data = {}) {
    return api.post(`/stores/stores/${storeId}/share/`, {
      platform,
      ...data
    })
  },

  // User Social Interactions
  getUserActivityFeed(params = {}) {
    return api.get('/accounts/activity-feed/', { params })
  },

  getUserSocialStats(userId = null) {
    const endpoint = userId ? `/accounts/users/${userId}/social-stats/` : '/accounts/social-stats/'
    return api.get(endpoint)
  },

  getFollowedStoresActivity(params = {}) {
    return api.get('/stores/followed/activity/', { params })
  },

  // Review Analytics (for stores)
  getReviewAnalytics(storeId, params = {}) {
    return api.get(`/stores/stores/${storeId}/review-analytics/`, { params })
  },

  // Moderation (for stores to respond to reviews)
  respondToReview(reviewId, response) {
    return api.post(`/products/reviews/${reviewId}/respond/`, { response })
  },

  updateReviewResponse(reviewId, response) {
    return api.put(`/products/reviews/${reviewId}/response/`, { response })
  },

  deleteReviewResponse(reviewId) {
    return api.delete(`/products/reviews/${reviewId}/response/`)
  },

  // CRM Viewing Requests
  checkProductCRMFlow(productId) {
    return api.get('/products/crm/check/check_product/', { 
      params: { product_id: productId } 
    })
  },

  checkStoreCategoryCRMFlow(categoryId) {
    return api.get('/products/crm/check/check_store_category/', { 
      params: { category_id: categoryId } 
    })
  },

  createViewingRequest(requestData) {
    return api.post('/products/crm/viewing-requests/', requestData)
  },

  getViewingRequests(params = {}) {
    return api.get('/products/crm/viewing-requests/', { params })
  },

  getViewingRequest(id) {
    return api.get(`/products/crm/viewing-requests/${id}/`)
  },

  updateViewingRequest(id, data) {
    return api.patch(`/products/crm/viewing-requests/${id}/`, data)
  },

  getViewingRequestHistory(id) {
    return api.get(`/products/crm/viewing-requests/${id}/history/`)
  },

  getViewingRequestStats() {
    return api.get('/products/crm/viewing-requests/stats/')
  },

  // Chat Messages
  getChatMessages(params = {}) {
    return api.get('/products/crm/chat/', { params })
  },

  sendChatMessage(data) {
    return api.post('/products/crm/chat/', data)
  },

  markMessageAsRead(messageId) {
    return api.post(`/products/crm/chat/${messageId}/mark_as_read/`)
  },

  markAllMessagesAsRead(viewingRequestId) {
    return api.post('/products/crm/chat/mark_all_as_read/', {
      viewing_request_id: viewingRequestId
    })
  }
}

// Export both the axios instance and apiService for flexibility
export { api }
export default apiService 