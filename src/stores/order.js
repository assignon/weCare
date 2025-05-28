import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref([])
  const currentOrder = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0
  })

  // Getters
  const orderCount = computed(() => orders.value.length)
  const hasOrders = computed(() => orders.value.length > 0)
  const activeOrders = computed(() => 
    orders.value.filter(order => 
      ['pending', 'processing', 'ready_for_pickup', 'picked_up'].includes(order.status)
    )
  )
  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'delivered')
  )

  // Actions
  async function fetchOrders(params = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getOrders({
        page: pagination.value.page,
        page_size: pagination.value.pageSize,
        ...params
      })
      
      if (response.data.results) {
        orders.value = response.data.results
        pagination.value.total = response.data.count
      } else {
        orders.value = response.data
        pagination.value.total = response.data.length
      }
      
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderDetails(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getOrderDetails(orderId)
      currentOrder.value = response.data
      return response.data
    } catch (err) {
      error.value = 'Failed to fetch order details'
      console.error('Error fetching order details:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function searchOrders(searchParams) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.searchOrders(searchParams)
      
      if (response.data.results) {
        orders.value = response.data.results
        pagination.value.total = response.data.count
      } else {
        orders.value = response.data
        pagination.value.total = response.data.length
      }
      
      return response.data
    } catch (err) {
      error.value = 'Failed to search orders'
      console.error('Error searching orders:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createOrderFromCart(orderData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.createOrderFromCart(orderData)
      
      // Refresh orders list after creating new order
      await fetchOrders()
      
      return response.data
    } catch (err) {
      error.value = 'Failed to create order'
      console.error('Error creating order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelOrder(orderId, reason = '') {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.cancelOrder(orderId, { reason })
      
      // Update the order in the list
      const orderIndex = orders.value.findIndex(order => order.id === orderId)
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = 'cancelled'
      }
      
      // Update current order if it's the same
      if (currentOrder.value && currentOrder.value.id === orderId) {
        currentOrder.value.status = 'cancelled'
      }
      
      return response.data
    } catch (err) {
      error.value = 'Failed to cancel order'
      console.error('Error cancelling order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function reorderItems(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const order = currentOrder.value || orders.value.find(o => o.id === orderId)
      if (!order) {
        throw new Error('Order not found')
      }
      
      const items = order.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity
      }))
      
      const response = await apiService.createCart(items)
      return response.data
    } catch (err) {
      error.value = 'Failed to reorder items'
      console.error('Error reordering items:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function downloadInvoice(orderId) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.downloadOrderInvoice(orderId)
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-order-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return response.data
    } catch (err) {
      error.value = 'Failed to download invoice'
      console.error('Error downloading invoice:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setPage(page) {
    pagination.value.page = page
  }

  function setPageSize(pageSize) {
    pagination.value.pageSize = pageSize
  }

  function clearOrders() {
    orders.value = []
    currentOrder.value = null
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0
    }
  }

  // Utility functions
  function getOrderById(orderId) {
    return orders.value.find(order => order.id === orderId)
  }

  function getOrderStatusColor(status) {
    const colors = {
      pending: 'orange',
      processing: 'blue',
      ready_for_pickup: 'purple',
      picked_up: 'indigo',
      delivered: 'success',
      cancelled: 'error'
    }
    return colors[status] || 'grey'
  }

  function getOrderStatusIcon(status) {
    const icons = {
      pending: 'mdi-clock-outline',
      processing: 'mdi-package-variant',
      ready_for_pickup: 'mdi-package-check',
      picked_up: 'mdi-truck',
      delivered: 'mdi-check-circle',
      cancelled: 'mdi-close-circle'
    }
    return icons[status] || 'mdi-package-variant-closed'
  }

  function formatOrderStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    pagination,
    
    // Getters
    orderCount,
    hasOrders,
    activeOrders,
    completedOrders,
    
    // Actions
    fetchOrders,
    fetchOrderDetails,
    searchOrders,
    createOrderFromCart,
    cancelOrder,
    reorderItems,
    downloadInvoice,
    clearError,
    setPage,
    setPageSize,
    clearOrders,
    
    // Utilities
    getOrderById,
    getOrderStatusColor,
    getOrderStatusIcon,
    formatOrderStatus
  }
}) 