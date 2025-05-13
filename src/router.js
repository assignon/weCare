import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('@/pages/Home.vue') },
  { path: '/orders', name: 'Orders', component: () => import('@/pages/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/wishlist', name: 'Wishlist', component: () => import('@/pages/Wishlist.vue'), meta: { requiresAuth: true } },
  { path: '/cart', name: 'Cart', component: () => import('@/pages/Cart.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
  { path: '/password-forgot', name: 'PasswordForgot', component: () => import('@/pages/PasswordForgot.vue') },
  { path: '/product/:id', name: 'ProductDetails', component: () => import('@/pages/ProductDetails.vue') },
  { path: '/order-status/:id', name: 'OrderStatus', component: () => import('@/pages/OrderStatus.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'Profile', component: () => import('@/pages/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/checkout', name: 'Checkout', component: () => import('@/pages/Checkout.vue'), meta: { requiresAuth: true } },
  { path: '/notifications', name: 'Notification', component: () => import('@/pages/Notification.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router 