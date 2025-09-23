import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'

// Fixed dynamic pharmacy detection

export const usePharmacyStore = defineStore('pharmacy', () => {
  // State
  const currentCategoryIsPharmacy = ref(false)
  const currentCategoryId = ref(null)
  const currentCategoryName = ref('')
  
  // Getters
  const shouldShowPharmacyInterface = computed(() => currentCategoryIsPharmacy.value)
  const shouldHideExploreAndCart = computed(() => currentCategoryIsPharmacy.value)
  
  // Actions
  const checkCategoryForPharmacy = (categoryId, categoryName) => {
    console.log('🔍 Pharmacy Store: checkCategoryForPharmacy called with:', { categoryId, categoryName })
    
    currentCategoryId.value = categoryId
    currentCategoryName.value = categoryName || ''
    
    // Check if this is a pharmacy category
    const isPharmacy = categoryName && categoryName.toLowerCase().includes('pharmacy')
    currentCategoryIsPharmacy.value = isPharmacy
    
    console.log('🎯 Pharmacy Flow Check Result:', {
      categoryId,
      categoryName,
      isPharmacy,
      shouldShowPharmacyInterface: currentCategoryIsPharmacy.value,
      shouldHideExploreAndCart: currentCategoryIsPharmacy.value
    })
  }
  
  const resetPharmacyState = () => {
    currentCategoryIsPharmacy.value = false
    currentCategoryId.value = null
    currentCategoryName.value = ''
  }
  
  // Initialize from session storage if available
  const initializeFromSession = async () => {
    try {
      const defaultStoreId = sessionStorage.getItem('defaultStore')
      console.log('🔧 Pharmacy Store: initializeFromSession called, defaultStoreId:', defaultStoreId)
      
      if (defaultStoreId) {
        try {
          // Fetch store categories to get the actual category name
          const resp = await apiService.getStoreCategories({ is_active: true })
          const categories = resp.data?.results || resp.data || []
          
          // Find the category that matches the defaultStoreId
          const selectedCategory = categories.find(cat => String(cat.id) === String(defaultStoreId))
          
          if (selectedCategory) {
            console.log('🔧 Pharmacy Store: Found category:', selectedCategory.name, 'for ID:', defaultStoreId)
            checkCategoryForPharmacy(parseInt(defaultStoreId), selectedCategory.name)
          } else {
            console.log('🔧 Pharmacy Store: Category not found for ID:', defaultStoreId)
            resetPharmacyState()
          }
        } catch (apiError) {
          console.error('❌ Pharmacy Store: Failed to fetch categories:', apiError)
          resetPharmacyState()
        }
      } else {
        console.log('🔧 Pharmacy Store: No defaultStore in sessionStorage')
        resetPharmacyState()
      }
    } catch (error) {
      console.error('❌ Pharmacy Store: Failed to initialize pharmacy state from session:', error)
      resetPharmacyState()
    }
  }
  
  return {
    // State
    currentCategoryIsPharmacy,
    currentCategoryId,
    currentCategoryName,
    
    // Getters
    shouldShowPharmacyInterface,
    shouldHideExploreAndCart,
    
    // Actions
    checkCategoryForPharmacy,
    resetPharmacyState,
    initializeFromSession
  }
})