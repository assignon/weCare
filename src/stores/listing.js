import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiService from '@/services/api'

export const useListingStore = defineStore('listing', () => {
  // State
  const listings = ref([])
  const myListings = ref([])
  const allListings = ref([])
  const currentListing = ref(null)
  const inquiries = ref([])
  const myInquiries = ref([])
  const messages = ref([])
  const listingStats = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const activeListingsCount = computed(() => {
    return myListings.value.filter(l => l.status === 'active').length
  })

  const soldListingsCount = computed(() => {
    return myListings.value.filter(l => l.status === 'sold').length
  })

  const unreadInquiriesCount = computed(() => {
    return inquiries.value.reduce((total, inquiry) => {
      return total + (inquiry.unread_count || 0)
    }, 0)
  })

  // Actions

  /**
   * Fetch all active listings for browsing
   */
  async function fetchAllListings(params = {}) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getShopperListings(params)
      allListings.value = response.data.results || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch listings'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch current user's listings
   */
  async function fetchMyListings() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getMyListings()
      myListings.value = response.data.results || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch your listings'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch a single listing by ID
   */
  async function fetchListing(id) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getShopperListing(id)
      currentListing.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch listing'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Create a new listing
   */
  async function createListing(listingData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.createShopperListing(listingData)
      myListings.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create listing'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing listing
   */
  async function updateListing(id, listingData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.updateShopperListing(id, listingData)
      const index = myListings.value.findIndex(l => l.id === id)
      if (index !== -1) {
        myListings.value[index] = response.data
      }
      if (currentListing.value?.id === id) {
        currentListing.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update listing'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete a listing
   */
  async function deleteListing(id) {
    loading.value = true
    error.value = null
    try {
      await apiService.deleteShopperListing(id)
      myListings.value = myListings.value.filter(l => l.id !== id)
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete listing'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark listing as sold
   */
  async function markAsSold(id) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.markListingAsSold(id)
      const index = myListings.value.findIndex(l => l.id === id)
      if (index !== -1) {
        myListings.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to mark as sold'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Reactivate a listing
   */
  async function reactivateListing(id) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.reactivateListing(id)
      const index = myListings.value.findIndex(l => l.id === id)
      if (index !== -1) {
        myListings.value[index] = response.data
      }
      if (currentListing.value?.id === id) {
        currentListing.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to reactivate listing'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update listing status (active/inactive)
   */
  async function updateListingStatus(id, newStatus) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.updateListingStatus(id, newStatus)
      const index = myListings.value.findIndex(l => l.id === id)
      if (index !== -1) {
        myListings.value[index] = response.data
      }
      if (currentListing.value?.id === id) {
        currentListing.value = response.data
      }
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || err.response?.data?.message || 'Failed to update status'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get listing statistics
   */
  async function fetchListingStats() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getListingStats()
      listingStats.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Inquiry Actions

  /**
   * Create an inquiry for a listing
   */
  async function createInquiry(inquiryData) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.createInquiry(inquiryData)
      myInquiries.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create inquiry'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch inquiries for seller's listings
   */
  async function fetchSellerInquiries() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getSellerInquiries()
      inquiries.value = response.data.results || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch inquiries'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch buyer's inquiries
   */
  async function fetchMyInquiries() {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getMyInquiries()
      myInquiries.value = response.data.results || response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch your inquiries'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Message Actions

  /**
   * Send a message in an inquiry
   */
  async function sendMessage(inquiryId, content) {
    loading.value = true
    error.value = null
    try {
      const response = await apiService.sendListingMessage({ inquiry: inquiryId, content })
      messages.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to send message'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch messages for an inquiry
   */
  async function fetchMessages(inquiryId) {
    if (!inquiryId) {
      const error = 'Inquiry ID is required to fetch messages'
      error.value = error
      throw new Error(error)
    }
    loading.value = true
    error.value = null
    try {
      const response = await apiService.getInquiryMessages(inquiryId)
      messages.value = response.data
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || err.response?.data?.error || 'Failed to fetch messages'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Mark messages as read
   */
  async function markMessagesAsRead(inquiryId) {
    try {
      await apiService.markMessagesAsRead(inquiryId)
    } catch (err) {
      console.error('Failed to mark messages as read:', err)
    }
  }

  // Reset state
  function $reset() {
    listings.value = []
    myListings.value = []
    allListings.value = []
    currentListing.value = null
    inquiries.value = []
    myInquiries.value = []
    messages.value = []
    listingStats.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    listings,
    myListings,
    allListings,
    currentListing,
    inquiries,
    myInquiries,
    messages,
    listingStats,
    loading,
    error,
    
    // Computed
    activeListingsCount,
    soldListingsCount,
    unreadInquiriesCount,
    
    // Actions
    fetchAllListings,
    fetchMyListings,
    fetchListing,
    createListing,
    updateListing,
    deleteListing,
    markAsSold,
    reactivateListing,
    updateListingStatus,
    fetchListingStats,
    createInquiry,
    fetchSellerInquiries,
    fetchMyInquiries,
    sendMessage,
    fetchMessages,
    markMessagesAsRead,
    $reset
  }
})

