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
  
  // Orders
  getOrders(params = {}) {
    return api.get('/orders/orders/by_shopper/', { params })
  },
  
  getOrderDetails(id) {
    return api.get(`/orders/orders/${id}/`)
  },
  
  createOrder(orderData) {
    return api.post('/orders/orders/', orderData)
  },
  
  // Wishlist
  getWishlist(userId) {
    return api.get(`/products/wishlists/${userId}/`)
  },
  
  addToWishlist(productId, userId) {
    return api.post(`/products/wishlists/${userId}/add_product/`, { product_id: productId })
  },
  
  removeFromWishlist(itemId) {
    return api.delete(`/products/wishlists/${userId}/remove_product/${itemId}/`)
  },
  
  // User profile
  getProfile() {
    return api.get('/accounts/profile/')
  },
  
  updateProfile(profileData) {
    return api.put('/accounts/profile/', profileData)
  },
  
  // Notifications
  getNotifications() {
    return api.get('/notifications/notifications/')
  },
  
  markNotificationAsRead(id) {
    return api.post(`/notifications/notifications/${id}/mark_read/`)
  },
  
  getUnreadNotificationsCount() {
    return api.get('/notifications/notifications/unread_count/')
  },

  // Cart endpoints
  getCart() {
    return api.get('/orders/cart/view_cart/')
  },
  createCart(items) {
    return api.post('/orders/cart/add_item/', items)
  },

  updateCartItem(cartId, item) {
    return api.patch(`/orders/cart/${cartId}/update_item/`, {
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity
    })
  },

  removeCartItem(cartId, itemId) {
    return api.delete(`/orders/cart/${cartId}/remove_item/`)
  },
  clearCart() {
    return api.post('/orders/cart/clear/')
  },
} 