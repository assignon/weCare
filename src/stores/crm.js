import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useCRMStore = defineStore('crm', () => {
  // State
  const currentCategoryUsesCRM = ref(false)
  const currentCategoryId = ref(null)
  const currentCategoryName = ref('')
  const crmFlowInfo = ref(null)
  const pendingViewingRequests = ref(0)
  const activeViewingRequests = ref(0)
  const checkingCRMFlow = ref(false)
  
  // Getters
  const shouldShowRendezvous = computed(() => currentCategoryUsesCRM.value)
  const shouldRestrictCart = computed(() => currentCategoryUsesCRM.value)
  
  // Actions
  const checkCategoryFlow = async (categoryId) => {
    console.log('🔍 CRM Store: checkCategoryFlow called with categoryId:', categoryId)
    
    if (!categoryId) {
      console.log('❌ CRM Store: No categoryId provided')
      return
    }
    
    if (currentCategoryId.value === categoryId) {
      console.log('✅ CRM Store: Category already checked, current state:', {
        categoryId,
        usesCRM: currentCategoryUsesCRM.value
      })
      return // Already checked this category
    }
    
    try {
      checkingCRMFlow.value = true
      currentCategoryId.value = categoryId
      
      console.log('🌐 CRM Store: Making API call to check category flow...')
      const response = await apiService.checkStoreCategoryCRMFlow(categoryId)
      const data = response.data
      
      console.log('📡 CRM Store: API response:', data)
      
      currentCategoryUsesCRM.value = data.default_to_crm || false
      currentCategoryName.value = data.category_name || ''
      crmFlowInfo.value = data
      
      console.log('🎯 CRM Flow Check Result:', {
        categoryId,
        categoryName: currentCategoryName.value,
        usesCRM: currentCategoryUsesCRM.value,
        shouldShowRendezvous: currentCategoryUsesCRM.value,
        flowInfo: crmFlowInfo.value
      })
      
      // If this category uses CRM, fetch pending viewing requests
      if (currentCategoryUsesCRM.value) {
        console.log('📊 CRM Store: Fetching pending viewing requests...')
        await fetchPendingViewingRequests()
      } else {
        console.log('🛒 CRM Store: Regular category, no viewing requests needed')
        pendingViewingRequests.value = 0
      }
      
    } catch (error) {
      console.error('❌ CRM Store: Failed to check category CRM flow:', error)
      currentCategoryUsesCRM.value = false
      crmFlowInfo.value = null
      pendingViewingRequests.value = 0
    } finally {
      checkingCRMFlow.value = false
    }
  }
  
  const fetchPendingViewingRequests = async () => {
    try {
      const response = await apiService.getViewingRequestStats()
      const data = response.data || {}
      pendingViewingRequests.value = data.pending_requests ?? 0
      activeViewingRequests.value = data.active_requests ?? (data.pending_requests ?? 0) + (data.scheduled_viewings ?? 0)
    } catch (error) {
      console.error('Failed to fetch viewing request stats:', error)
      pendingViewingRequests.value = 0
      activeViewingRequests.value = 0
    }
  }
  
  const refreshPendingRequests = () => {
    if (currentCategoryUsesCRM.value) {
      fetchPendingViewingRequests()
    }
  }

  const fetchViewingRequestStatsForBadge = async () => {
    try {
      const response = await apiService.getViewingRequestStats()
      const data = response.data || {}
      pendingViewingRequests.value = data.pending_requests ?? 0
      activeViewingRequests.value = data.active_requests ?? (data.pending_requests ?? 0) + (data.scheduled_viewings ?? 0)
    } catch (error) {
      pendingViewingRequests.value = 0
      activeViewingRequests.value = 0
    }
  }
  
  const resetCRMState = () => {
    currentCategoryUsesCRM.value = false
    currentCategoryId.value = null
    currentCategoryName.value = ''
    crmFlowInfo.value = null
    pendingViewingRequests.value = 0
  }
  
  // Initialize from session storage if available
  const initializeFromSession = async () => {
    try {
      const defaultStoreId = sessionStorage.getItem('defaultStore')
      console.log('🔧 CRM Store: initializeFromSession called, defaultStoreId:', defaultStoreId)
      
      if (defaultStoreId) {
        console.log('🔧 CRM Store: Calling checkCategoryFlow with defaultStoreId:', defaultStoreId)
        await checkCategoryFlow(parseInt(defaultStoreId))
      } else {
        console.log('🔧 CRM Store: No defaultStore in sessionStorage')
      }
    } catch (error) {
      console.error('❌ CRM Store: Failed to initialize CRM state from session:', error)
    }
  }
  
  return {
    // State
    currentCategoryUsesCRM,
    currentCategoryId,
    currentCategoryName,
    crmFlowInfo,
    pendingViewingRequests,
    activeViewingRequests,
    checkingCRMFlow,
    
    // Getters
    shouldShowRendezvous,
    shouldRestrictCart,
    
    // Actions
    checkCategoryFlow,
    fetchPendingViewingRequests,
    refreshPendingRequests,
    fetchViewingRequestStatsForBadge,
    resetCRMState,
    initializeFromSession
  }
})
