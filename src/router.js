import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCRMStore } from '@/stores/crm'
import apiService from '@/services/api'

// Helper function to handle dynamic imports with error recovery
const loadComponent = (importFn, componentName) => {
  return async () => {
    try {
      return await importFn()
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error)
      
      // If it's a module loading error (404, network error, etc.), try to reload the page
      if (error.message && (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Loading') ||
        error.message.includes('dynamically imported module') ||
        error.code === 'ERR_MODULE_NOT_FOUND'
      )) {
        console.warn('Module loading error detected, clearing cache and reloading...')
        
        // Clear service worker and caches
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations()
            for (const registration of registrations) {
              if (!registration.scope.includes('firebase')) {
                await registration.unregister()
              }
            }
          } catch (e) {
            console.warn('Error unregistering service workers:', e)
          }
        }
        
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys()
            for (const cacheName of cacheNames) {
              if (!cacheName.includes('firebase') && !cacheName.includes('google-fonts')) {
                await caches.delete(cacheName)
              }
            }
          } catch (e) {
            console.warn('Error clearing caches:', e)
          }
        }
        
        // Reload the page after a short delay
        setTimeout(() => {
          window.location.reload()
        }, 1000)
        
        // Return a loading component while reloading
        return { default: { template: '<div>Loading...</div>' } }
      }
      
      // For other errors, throw to let Vue Router handle it
      throw error
    }
  }
}

const routes = [
  { path: '/splash', name: 'SplashScreen', component: loadComponent(() => import('@/pages/SplashScreen.vue'), 'SplashScreen') },
  { path: '/login', name: 'Login', component: loadComponent(() => import('@/pages/Login.vue'), 'Login') },
  { path: '/', name: 'Home', component: loadComponent(() => import('@/pages/Home.vue'), 'Home'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: loadComponent(() => import('@/pages/Orders.vue'), 'Orders'), meta: { requiresAuth: true } },
  { path: '/explore', name: 'Explore', component: loadComponent(() => import('@/pages/Explore.vue'), 'Explore'), meta: { requiresAuth: true } },
  // { path: '/explore', name: 'Explore', component: loadComponent(() => import('@/pages/EnhancedExplore.vue'), 'EnhancedExplore'), meta: { requiresAuth: true } },
  { path: '/store-category', name: 'StoreCategory', component: loadComponent(() => import('@/pages/StoreCategory.vue'), 'StoreCategory'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: loadComponent(() => import('@/pages/Cart.vue'), 'Cart'), meta: { requiresAuth: true } },
  { path: '/rendezvous', name: 'Rendezvous', component: loadComponent(() => import('@/pages/Rendezvous.vue'), 'Rendezvous'), meta: { requiresAuth: true } },
  { path: '/rendezvous/:id', name: 'ViewingRequestDetail', component: loadComponent(() => import('@/pages/ViewingRequestDetail.vue'), 'ViewingRequestDetail'), meta: { requiresAuth: true } },
 
  { path: '/register', name: 'Register', component: loadComponent(() => import('@/pages/Register.vue'), 'Register') },
  // { path: '/shopper-goals', name: 'ShopperGoals', component: loadComponent(() => import('@/pages/ShopperGoals.vue'), 'ShopperGoals'), meta: { requiresAuth: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: loadComponent(() => import('@/pages/ForgotPassword.vue'), 'ForgotPassword') },
  { path: '/reset-password/:code', name: 'ResetPassword', component: loadComponent(() => import('@/pages/ResetPassword.vue'), 'ResetPassword') },
  { path: '/product/:id', name: 'ProductDetails', component: loadComponent(() => import('@/pages/ProductDetails.vue'), 'ProductDetails'), meta: { requiresAuth: true } },
  // { path: '/stores', name: 'StoreDirectory', component: loadComponent(() => import('@/pages/StoreDirectory.vue'), 'StoreDirectory'), meta: { requiresAuth: true } },
  // { path: '/store/:id', name: 'StoreDetails', component: loadComponent(() => import('@/pages/StoreDetails.vue'), 'StoreDetails'), meta: { requiresAuth: true } },
  { path: '/order-status/:id', name: 'OrderStatus', component: loadComponent(() => import('@/pages/OrderStatus.vue'), 'OrderStatus'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: loadComponent(() => import('@/pages/Profile.vue'), 'Profile'), meta: { requiresAuth: true } },
  { path: '/profile/edit', name: 'EditProfile', component: loadComponent(() => import('@/pages/EditProfile.vue'), 'EditProfile'), meta: { requiresAuth: true } },
  { path: '/profile/skin-profile', name: 'SkinProfile', component: loadComponent(() => import('@/pages/SkinProfile.vue'), 'SkinProfile'), meta: { requiresAuth: true } },
  { path: '/profile/addresses', name: 'Addresses', component: loadComponent(() => import('@/pages/Addresses.vue'), 'Addresses'), meta: { requiresAuth: true } },
  { path: '/profile/customer-support', name: 'CustomerSupport', component: loadComponent(() => import('@/pages/CustomerSupport.vue'), 'CustomerSupport'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: loadComponent(() => import('@/pages/Checkout.vue'), 'Checkout'), meta: { requiresAuth: true } },
  { path: '/checkout-test', name: 'CheckoutTest', component: loadComponent(() => import('@/pages/CheckoutTest.vue'), 'CheckoutTest'), meta: { requiresAuth: true } },
  { path: '/delivery-cost-demo', name: 'DeliveryCostDemo', component: loadComponent(() => import('@/pages/DeliveryCostDemo.vue'), 'DeliveryCostDemo'), meta: { requiresAuth: true } },
  { path: '/debug-delivery', name: 'DebugDeliveryCost', component: loadComponent(() => import('@/pages/DebugDeliveryCost.vue'), 'DebugDeliveryCost'), meta: { requiresAuth: true } },
  { path: '/payment-success', name: 'PaymentSuccess', component: loadComponent(() => import('@/pages/PaymentSuccess.vue'), 'PaymentSuccess'), meta: { requiresAuth: true } },
  { path: '/payment-failed', name: 'PaymentFailed', component: loadComponent(() => import('@/pages/PaymentFailed.vue'), 'PaymentFailed'), meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notification', component: loadComponent(() => import('@/pages/Notification.vue'), 'Notification'), meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'Wishlist', component: loadComponent(() => import('@/pages/Wishlist.vue'), 'Wishlist'), meta: { requiresAuth: true } },
  { path: '/fcm-test', name: 'FCMTest', component: loadComponent(() => import('@/pages/FCMTest.vue'), 'FCMTest'), meta: { requiresAuth: true } },
  
  // Listing routes (Classified Ads)
  { path: '/browse-listings', name: 'BrowseListings', component: loadComponent(() => import('@/pages/BrowseListings.vue'), 'BrowseListings'), meta: { requiresAuth: true } },
  { path: '/my-listings', name: 'MyListings', component: loadComponent(() => import('@/pages/MyListings.vue'), 'MyListings'), meta: { requiresAuth: true } },
  { path: '/create-listing', name: 'CreateListing', component: loadComponent(() => import('@/pages/CreateListing.vue'), 'CreateListing'), meta: { requiresAuth: true } },
  { path: '/edit-listing/:id', name: 'EditListing', component: loadComponent(() => import('@/pages/EditListing.vue'), 'EditListing'), meta: { requiresAuth: true } },
  { path: '/listing/:id', name: 'ListingDetails', component: loadComponent(() => import('@/pages/ListingDetails.vue'), 'ListingDetails'), meta: { requiresAuth: true } },
  { path: '/shopper-product/:id', name: 'ShopperProduct', component: loadComponent(() => import('@/pages/ShopperProduct.vue'), 'ShopperProduct'), meta: { requiresAuth: true } },
  { path: '/listing-inquiries', name: 'ListingInquiries', component: loadComponent(() => import('@/pages/ListingInquiries.vue'), 'ListingInquiries'), meta: { requiresAuth: true } },
  { path: '/messages', name: 'Messages', component: loadComponent(() => import('@/pages/Messages.vue'), 'Messages'), meta: { requiresAuth: true } },
  { path: '/liked-products', name: 'LikedProducts', component: loadComponent(() => import('@/pages/LikedProducts.vue'), 'LikedProducts'), meta: { requiresAuth: true } },
  { path: '/listing-chat/:inquiryId', name: 'ListingChat', component: loadComponent(() => import('@/pages/ListingChat.vue'), 'ListingChat'), meta: { requiresAuth: true } },
  
  // Parcel delivery routes
  { path: '/send-parcel', name: 'SendParcel', component: loadComponent(() => import('@/pages/SendParcel.vue'), 'SendParcel'), meta: { requiresAuth: true } },
  { path: '/parcels', name: 'ParcelsList', component: loadComponent(() => import('@/pages/ParcelsList.vue'), 'ParcelsList'), meta: { requiresAuth: true } },
  { path: '/parcel/:id', name: 'ParcelTracking', component: loadComponent(() => import('@/pages/ParcelTracking.vue'), 'ParcelTracking'), meta: { requiresAuth: true } },
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