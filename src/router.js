import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  { path: '/', name: 'Home', component: () => import('@/pages/Home.vue'), meta: { requiresAuth: true } },
  { path: '/orders', name: 'Orders', component: () => import('@/pages/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/explore', name: 'Explore', component: () => import('@/pages/Explore.vue'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart.vue'), meta: { requiresAuth: true } },
 
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('@/pages/ForgotPassword.vue') },
  { path: '/reset-password/:code', name: 'ResetPassword', component: () => import('@/pages/ResetPassword.vue') },
  { path: '/product/:id', name: 'ProductDetails', component: () => import('@/pages/ProductDetails.vue'), meta: { requiresAuth: true } },
  { path: '/order-status/:id', name: 'OrderStatus', component: () => import('@/pages/OrderStatus.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/edit', name: 'EditProfile', component: () => import('@/pages/EditProfile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/addresses', name: 'Addresses', component: () => import('@/pages/Addresses.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/payment-success', name: 'PaymentSuccess', component: () => import('@/pages/PaymentSuccess.vue'), meta: { requiresAuth: true } },
  { path: '/payment-failed', name: 'PaymentFailed', component: () => import('@/pages/PaymentFailed.vue'), meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notification', component: () => import('@/pages/Notification.vue'), meta: { requiresAuth: true } },
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

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()
  
  // If route requires auth
  if (to.meta.requiresAuth) {
    // First check if we have a token in localStorage
    if (!auth.isAuthenticated) {
      // If no token, redirect to login
      return next({ 
        name: 'Login', 
        query: { redirect: to.fullPath } 
      })
    }
    
    // If we have a token but haven't verified it yet
    if (!auth.user) {
      try {
        // Try to verify the token and fetch user data
        const isValid = await auth.checkAuth()
        if (!isValid) {
          // If token is invalid, redirect to login
          return next({ 
            name: 'Login', 
            query: { redirect: to.fullPath } 
          })
        }
      } catch (error) {
        console.error('Authentication error:', error)
        // On any error, redirect to login
        return next({ 
          name: 'Login', 
          query: { redirect: to.fullPath } 
        })
      }
    }
  }
  
  // If user is authenticated and trying to access login/register pages
  if (auth.isAuthenticated && ['Login', 'Register', 'ForgotPassword', 'ResetPassword'].includes(to.name)) {
    // Redirect to home or to the redirect query parameter if it exists
    return next(to.query.redirect || { name: 'Home' })
  }
  
  // For all other routes, proceed normally
  next()
})

export default router 