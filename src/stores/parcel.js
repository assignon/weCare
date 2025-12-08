import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiService } from '@/services/api'

export const useParcelStore = defineStore('parcel', () => {
  // State
  const parcels = ref([])
  const currentParcel = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const costLoading = ref(false)
  const costError = ref(null)

  // Getters
  const parcelCount = computed(() => parcels.value.length)
  const activeParcels = computed(() => 
    parcels.value.filter(parcel => parcel.is_active)
  )
  const completedParcels = computed(() => 
    parcels.value.filter(parcel => parcel.status === 'delivered')
  )
  const cancelledParcels = computed(() => 
    parcels.value.filter(parcel => parcel.status === 'cancelled')
  )

  // Actions
  async function createParcelDelivery(parcelData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.createParcelDelivery(parcelData)
      
      // Add to parcels list
      parcels.value.unshift(response.data)
      currentParcel.value = response.data
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create parcel delivery'
      console.error('Error creating parcel delivery:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchParcels(params = {}) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getParcelDeliveries(params)
      parcels.value = response.data.results || response.data || []
      
      return parcels.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch parcels'
      console.error('Error fetching parcels:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchParcelDetails(id) {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.getParcelDetails(id)
      currentParcel.value = response.data
      
      // Update in parcels list if exists
      const index = parcels.value.findIndex(p => p.id === id)
      if (index !== -1) {
        parcels.value[index] = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch parcel details'
      console.error('Error fetching parcel details:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelParcel(id, reason = '') {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiService.cancelParcel(id, { reason })
      
      // Update parcel in list
      const index = parcels.value.findIndex(p => p.id === id)
      if (index !== -1) {
        parcels.value[index] = response.data
      }
      
      // Update current parcel if it's the same
      if (currentParcel.value && currentParcel.value.id === id) {
        currentParcel.value = response.data
      }
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to cancel parcel'
      console.error('Error cancelling parcel:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function calculateDeliveryCost(pickupCoords, dropoffCoords, packageSize = 'small', deliveryType = 'same_day') {
    costLoading.value = true
    costError.value = null
    
    try {
      // Ensure coordinates are properly formatted as numbers with max 6 decimal places
      const requestData = {
        pickup_latitude: parseFloat(Number(pickupCoords.lat).toFixed(6)),
        pickup_longitude: parseFloat(Number(pickupCoords.lng).toFixed(6)),
        dropoff_latitude: parseFloat(Number(dropoffCoords.lat).toFixed(6)),
        dropoff_longitude: parseFloat(Number(dropoffCoords.lng).toFixed(6)),
        package_size: packageSize,
        delivery_type: deliveryType
      }
      
      const response = await apiService.calculateParcelCost(requestData)
      
      return response.data
    } catch (err) {
      costError.value = err.response?.data?.message || 'Failed to calculate cost'
      console.error('Error calculating delivery cost:', err)
      console.error('Request data:', {
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        dropoff_latitude: dropoffCoords.lat,
        dropoff_longitude: dropoffCoords.lng
      })
      throw err
    } finally {
      costLoading.value = false
    }
  }

  function clearError() {
    error.value = null
    costError.value = null
  }

  function setCurrentParcel(parcel) {
    currentParcel.value = parcel
  }

  function clearCurrentParcel() {
    currentParcel.value = null
  }

  function clearParcels() {
    parcels.value = []
    currentParcel.value = null
  }

  // Utility functions
  function getParcelById(id) {
    return parcels.value.find(parcel => parcel.id === id)
  }

  function getParcelStatusColor(status) {
    const colors = {
      pending: 'orange',
      driver_assigned: 'blue',
      picked_up: 'purple',
      in_transit: 'indigo',
      delivered: 'success',
      cancelled: 'error',
      failed: 'error'
    }
    return colors[status] || 'grey'
  }

  function getParcelStatusIcon(status) {
    const icons = {
      pending: 'Clock',
      driver_assigned: 'User',
      picked_up: 'PackageCheck',
      in_transit: 'Truck',
      delivered: 'CheckCircle',
      cancelled: 'XCircle',
      failed: 'AlertCircle'
    }
    return icons[status] || 'Package'
  }

  function formatParcelStatus(status) {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return {
    // State
    parcels,
    currentParcel,
    loading,
    error,
    costLoading,
    costError,
    
    // Getters
    parcelCount,
    activeParcels,
    completedParcels,
    cancelledParcels,
    
    // Actions
    createParcelDelivery,
    fetchParcels,
    fetchParcelDetails,
    cancelParcel,
    calculateDeliveryCost,
    clearError,
    setCurrentParcel,
    clearCurrentParcel,
    clearParcels,
    
    // Utilities
    getParcelById,
    getParcelStatusColor,
    getParcelStatusIcon,
    formatParcelStatus
  }
})

