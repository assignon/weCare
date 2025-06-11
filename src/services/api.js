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

export const apiService = {
  // Authentication
  login(credentials) {
    return api.post('/auth/token/', credentials)
  },
  
  register(userData) {
    // Create a new axios instance specifically for registration
    // This ensures no interceptors or default headers are applied
    const registerApi = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: false
    })
    
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
    return api.get('/products/shopper/products/all/', { params })
  },

  getPopularProducts() {
    return api.get('/products/shopper/products/popular/')
  },

  getNewArrivals() {
    return api.get('/products/shopper/products/new_arrivals/')
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
  getCategories() {
    return api.get('/products/categories/')
  },
  
  // Skin Types
  getSkinTypes() {
    return api.get('/products/skin-types/')
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
    return api.post(`/orders/orders/${orderId}/cancel/`, data)
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
    return api.get('/accounts/profile/')
  },
  
  updateProfile(profileData, hasFile = false) {
    if (hasFile) {
      // Use FormData for file uploads
      const formData = new FormData()
      for (const key in profileData) {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key])
        }
      }
      return api.put('/accounts/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } else {
      return api.put('/accounts/profile/', profileData)
    }
  },

  updateLanguage(languageId) {
    return api.post('/accounts/languages/set-default/', { language_id: languageId })
  },
  
  // Addresses
  getAddresses() {
    return api.get('/accounts/addresses/')
  },
  
  addAddress(addressData) {
    return api.post('/accounts/addresses/', addressData)
  },
  
  updateAddress(addressId, addressData) {
    return api.put(`/accounts/addresses/${addressId}/`, addressData)
  },
  
  deleteAddress(addressId) {
    return api.delete(`/accounts/addresses/${addressId}/`)
  },
  
  setDefaultAddress(addressId) {
    return api.post(`/accounts/addresses/${addressId}/set_default/`)
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
  requestPasswordReset(email) {
    return api.post('/accounts/password/reset_password/', { email })
  },

  validateResetCode(code) {
    return api.get(`/accounts/password/reset/validate/${code}/`)
  },

  confirmPasswordReset(code, password) {
    return api.post('/accounts/password/reset/confirm/', { code, password })
  },

  // Profile Management
  changePassword(passwordData) {
    return api.put('/accounts/password/change/', passwordData)
  },

  // Address Management  
  createAddress(addressData) {
    return api.post('/accounts/addresses/', addressData)
  },

  updateAddress(addressId, addressData) {
    return api.put(`/accounts/addresses/${addressId}/`, addressData)
  },

  deleteAddress(addressId) {
    return api.delete(`/accounts/addresses/${addressId}/`)
  },

  setDefaultAddress(addressId) {
    return api.post(`/accounts/addresses/${addressId}/set_default/`)
  },

  // Language Management
  getLanguages() {
    return api.get('/accounts/languages/')
  }
}

// Export both the axios instance and apiService for flexibility
export { api }
export default apiService 