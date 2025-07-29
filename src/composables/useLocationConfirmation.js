import { ref } from 'vue'

export function useLocationConfirmation() {
  const showLocationDialog = ref(false)
  const currentAddress = ref({})
  const pendingCallback = ref(null)
  
  /**
   * Check if an address needs GPS coordinates and show confirmation dialog
   * @param {Object} address - The address to check
   * @param {Function} onConfirmed - Callback when location is confirmed
   * @param {Function} onSkipped - Callback when location is skipped
   * @returns {Boolean} - True if dialog was shown, false if not needed
   */
  const checkAddressLocation = (address, onConfirmed, onSkipped) => {
    // Check if address has GPS coordinates
    const hasGPS = address && address.latitude && address.longitude
    
    if (!hasGPS) {
      // Show location confirmation dialog
      currentAddress.value = { ...address }
      pendingCallback.value = { onConfirmed, onSkipped }
      showLocationDialog.value = true
      return true
    }
    
    return false
  }
  
  /**
   * Handle location confirmation from dialog
   * @param {Object} coordinates - GPS coordinates {latitude, longitude}
   */
  const handleLocationConfirmed = (coordinates) => {
    if (pendingCallback.value?.onConfirmed) {
      pendingCallback.value.onConfirmed(coordinates)
    }
    resetDialog()
  }
  
  /**
   * Handle location confirmation being skipped
   */
  const handleLocationSkipped = () => {
    if (pendingCallback.value?.onSkipped) {
      pendingCallback.value.onSkipped()
    }
    resetDialog()
  }
  
  /**
   * Reset dialog state
   */
  const resetDialog = () => {
    showLocationDialog.value = false
    currentAddress.value = {}
    pendingCallback.value = null
  }
  
  /**
   * Check if address has valid GPS coordinates
   * @param {Object} address - The address to check
   * @returns {Boolean} - True if address has valid GPS coordinates
   */
  const hasGPSCoordinates = (address) => {
    return address && 
           address.latitude && 
           address.longitude && 
           !isNaN(parseFloat(address.latitude)) && 
           !isNaN(parseFloat(address.longitude))
  }
  
  return {
    // Reactive data
    showLocationDialog,
    currentAddress,
    
    // Methods
    checkAddressLocation,
    handleLocationConfirmed,
    handleLocationSkipped,
    hasGPSCoordinates,
    resetDialog
  }
}