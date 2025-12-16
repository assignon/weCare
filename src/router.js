import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCRMStore } from '@/stores/crm'
import apiService from '@/services/api'

const routes = [
  { path: '/splash', name: 'SplashScreen', component: () => import('@/pages/SplashScreen.vue') },
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  { path: '/', name: 'Home', component: () => import('@/pages/Home.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: () => import('@/pages/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/explore', name: 'Explore', component: () => import('@/pages/Explore.vue'), meta: { requiresAuth: true } },
  // { path: '/explore', name: 'Explore', component: () => import('@/pages/EnhancedExplore.vue'), meta: { requiresAuth: true } },
  { path: '/store-category', name: 'StoreCategory', component: () => import('@/pages/StoreCategory.vue'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart.vue'), meta: { requiresAuth: true } },
  { path: '/rendezvous', name: 'Rendezvous', component: () => import('@/pages/Rendezvous.vue'), meta: { requiresAuth: true } },
  { path: '/rendezvous/:id', name: 'ViewingRequestDetail', component: () => import('@/pages/ViewingRequestDetail.vue'), meta: { requiresAuth: true } },
 
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
  { path: '/shopper-goals', name: 'ShopperGoals', component: () => import('@/pages/ShopperGoals.vue'), meta: { requiresAuth: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/pages/ForgotPassword.vue') },
  { path: '/reset-password/:code', name: 'ResetPassword', component: () => import('@/pages/ResetPassword.vue') },
  { path: '/product/:id', name: 'ProductDetails', component: () => import('@/pages/ProductDetails.vue'), meta: { requiresAuth: true } },
  // { path: '/stores', name: 'StoreDirectory', component: () => import('@/pages/StoreDirectory.vue'), meta: { requiresAuth: true } },
  // { path: '/store/:id', name: 'StoreDetails', component: () => import('@/pages/StoreDetails.vue'), meta: { requiresAuth: true } },
  { path: '/order-status/:id', name: 'OrderStatus', component: () => import('@/pages/OrderStatus.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/edit', name: 'EditProfile', component: () => import('@/pages/EditProfile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/skin-profile', name: 'SkinProfile', component: () => import('@/pages/SkinProfile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/addresses', name: 'Addresses', component: () => import('@/pages/Addresses.vue'), meta: { requiresAuth: true } },
  { path: '/profile/customer-support', name: 'CustomerSupport', component: () => import('@/pages/CustomerSupport.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/checkout-test', name: 'CheckoutTest', component: () => import('@/pages/CheckoutTest.vue'), meta: { requiresAuth: true } },
  { path: '/delivery-cost-demo', name: 'DeliveryCostDemo', component: () => import('@/pages/DeliveryCostDemo.vue'), meta: { requiresAuth: true } },
  { path: '/debug-delivery', name: 'DebugDeliveryCost', component: () => import('@/pages/DebugDeliveryCost.vue'), meta: { requiresAuth: true } },
  { path: '/payment-success', name: 'PaymentSuccess', component: () => import('@/pages/PaymentSuccess.vue'), meta: { requiresAuth: true } },
  { path: '/payment-failed', name: 'PaymentFailed', component: () => import('@/pages/PaymentFailed.vue'), meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notification', component: () => import('@/pages/Notification.vue'), meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist.vue'), meta: { requiresAuth: true } },
  { path: '/fcm-test', name: 'FCMTest', component: () => import('@/pages/FCMTest.vue'), meta: { requiresAuth: true } },
  
  // Listing routes (Classified Ads)
  { path: '/browse-listings', name: 'BrowseListings', component: () => import('@/pages/BrowseListings.vue'), meta: { requiresAuth: true } },
  { path: '/my-listings', name: 'MyListings', component: () => import('@/pages/MyListings.vue'), meta: { requiresAuth: true } },
  { path: '/create-listing', name: 'CreateListing', component: () => import('@/pages/CreateListing.vue'), meta: { requiresAuth: true } },
  { path: '/edit-listing/:id', name: 'EditListing', component: () => import('@/pages/EditListing.vue'), meta: { requiresAuth: true } },
  { path: '/listing/:id', name: 'ListingDetails', component: () => import('@/pages/ListingDetails.vue'), meta: { requiresAuth: true } },
  { path: '/shopper-product/:id', name: 'ShopperProduct', component: () => import('@/pages/ShopperProduct.vue'), meta: { requiresAuth: true } },
  { path: '/listing-inquiries', name: 'ListingInquiries', component: () => import('@/pages/ListingInquiries.vue'), meta: { requiresAuth: true } },
  { path: '/messages', name: 'Messages', component: () => import('@/pages/Messages.vue'), meta: { requiresAuth: true } },
  { path: '/liked-products', name: 'LikedProducts', component: () => import('@/pages/LikedProducts.vue'), meta: { requiresAuth: true } },
  { path: '/listing-chat/:inquiryId', name: 'ListingChat', component: () => import('@/pages/ListingChat.vue'), meta: { requiresAuth: true } },
  
  // Parcel delivery routes
  { path: '/send-parcel', name: 'SendParcel', component: () => import('@/pages/SendParcel.vue'), meta: { requiresAuth: true } },
  { path: '/parcels', name: 'ParcelsList', component: () => import('@/pages/ParcelsList.vue'), meta: { requiresAuth: true } },
  { path: '/parcel/:id', name: 'ParcelTracking', component: () => import('@/pages/ParcelTracking.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // If there's a saved position (back/forward navigation), use it
    if (savedPosition) {
      return savedPosition
    }
    // Otherwise, scroll to top
    return { top: 0 }
  }
})

// Prevent infinite redirect loops
let redirectCount = 0
const MAX_REDIRECTS = 5
const redirectHistory = new Set()

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  const crmStore = useCRMStore()
  
  // Prevent infinite redirect loops
  const redirectKey = `${from.name || 'null'}->${to.name}`
  if (redirectHistory.has(redirectKey)) {
    redirectCount++
    if (redirectCount > MAX_REDIRECTS) {
      console.error('Infinite redirect loop detected, stopping navigation')
      redirectCount = 0
      redirectHistory.clear()
      // Force navigation to login to break the loop
      if (to.name !== 'Login') {
        return next({ name: 'Login', replace: true })
      }
      return next(false) // Cancel navigation
    }
  } else {
    redirectCount = 0
    redirectHistory.clear()
  }
  redirectHistory.add(redirectKey)
  
  // Check for cart access restriction for CRM categories
  if (to.name === 'Cart' && crmStore.shouldRestrictCart) {
    console.log('Cart access restricted for CRM category, redirecting to Rendezvous')
    return next({ name: 'Rendezvous' })
  }
  
  // Skip auth checks for splash screen
  if (to.name === 'SplashScreen') {
    redirectHistory.clear()
    redirectCount = 0
    return next()
  }
  
  // Check if this is a fresh app load (no previous route)
  const isFreshLoad = !from.name && to.name !== 'SplashScreen'
  
  // Show splash screen for fresh loads (including PWA launches) - but only once
  if (isFreshLoad && !sessionStorage.getItem('splashShown')) {
    // Check if we're in PWA mode or it's a fresh browser visit
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  window.navigator.standalone === true ||
                  document.referrer.includes('android-app://')
    
    // Always show splash for PWA or if going to login/home without auth
    if (isPWA || to.name === 'Login' || to.name === 'Home') {
      sessionStorage.setItem('splashShown', 'true')
      return next({ name: 'SplashScreen' })
    }
  }
  
  // If route requires auth
  if (to.meta.requiresAuth) {
    // Check if we have a token in localStorage
    const token = localStorage.getItem('access_token')
    if (!token) {
      redirectHistory.clear()
      redirectCount = 0
      return next({ 
        name: 'Login', 
        query: { redirect: to.fullPath },
        replace: true
      })
    }
    
    // If we have a token but haven't verified it yet, verify it
    if (!auth.user) {
      try {
        const isValid = await auth.checkAuth()
        if (!isValid) {
          redirectHistory.clear()
          redirectCount = 0
          return next({ 
            name: 'Login', 
            query: { redirect: to.fullPath },
            replace: true
          })
        }
      } catch (error) {
        console.error('Authentication error:', error)
        redirectHistory.clear()
        redirectCount = 0
        return next({ 
          name: 'Login', 
          query: { redirect: to.fullPath },
          replace: true
        })
      }
    }
    try {
      // Fetch active store categories
      const resp = await apiService.getStoreCategories({ is_active: true })
      const categories = resp.data?.results || resp.data || []
      const defaultStore = sessionStorage.getItem('defaultStore')
      // if (!defaultStore) {
      //   // Temporarily pick the first as default; UI dialog can be added in Home.vue
      //   if (categories.length > 0) {
      //     sessionStorage.setItem('defaultStore', categories[0].id)
      //   }
      // }
    } catch (e) {
      console.warn('Could not fetch store categories for shopper:', e)
    }
  }
  
  // If user is authenticated and trying to access login/register pages
  if (auth.isAuthenticated && ['Login', 'Register', 'ForgotPassword', 'ResetPassword'].includes(to.name)) {
    // Always redirect authenticated users to home or requested page
    redirectHistory.clear()
    redirectCount = 0
    return next(to.query.redirect || { name: 'Home', replace: true })
  }
  
  // Clear redirect tracking on successful navigation
  if (to.name && from.name) {
    redirectHistory.clear()
    redirectCount = 0
  }
  
  next()
})

export default router 