<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader :title="$t('profile.addresses_page.title')" />
    <div class="p-3 pt-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('profile.addresses_page.loading') }}</h3>
        <p class="text-xs text-gray-600">{{ $t('profile.addresses_page.loading_subtitle') }}</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-2">
        <!-- Address List -->
        <div v-if="addresses.length > 0" class="space-y-2">
          <div 
            v-for="(address, index) in addresses" 
            :key="index"
            class="bg-white rounded-lg shadow-sm border border-gray-200 p-3"
          >
            <!-- Address Header -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin class="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ address.address_label || $t('profile.addresses_page.address') }}</h3>
                  <p class="text-xs text-gray-600">{{ $t('profile.addresses_page.delivery_location') }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-1.5">
                <span 
                  v-if="address.latitude && address.longitude" 
                  class="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center space-x-0.5"
                >
                  <Navigation class="w-2.5 h-2.5" />
                  <span>{{ $t('profile.addresses_page.gps') }}</span>
                </span>
                <span 
                  v-if="address.is_default" 
                  class="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {{ $t('profile.addresses_page.default') }}
                </span>
              </div>
            </div>
            
            <!-- Address Details -->
            <div class="bg-gray-50 rounded-lg p-2.5 mb-2">
              <div class="text-xs text-gray-700 space-y-0.5">
                <p class="font-medium">{{ address.address_line1 }}</p>
                <p v-if="address.address_line2" class="text-gray-600">{{ address.address_line2 }}</p>
                <p class="text-gray-600">
                  {{ address.city }}{{ address.state ? `, ${address.state}` : '' }} {{ address.postal_code }}
                </p>
                <p class="text-gray-600">{{ address.country }}</p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-between">
              <div>
                <button 
                  v-if="!address.is_default" 
                  @click="setAsDefault(address.id)"
                  :disabled="loading"
                  class="px-2.5 py-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                >
                  <Loader2 v-if="loading" class="w-3 h-3 animate-spin" />
                  <Star v-else class="w-3 h-3" />
                  <span>{{ $t('profile.addresses_page.set_as_default') }}</span>
                </button>
              </div>
              
              <div class="flex items-center space-x-1.5">
                <button 
                  @click="editAddress(index)"
                  class="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <Edit3 class="w-3.5 h-3.5 text-gray-600" />
                </button>
                
                <button 
                  @click="confirmDeleteAddress(index)"
                  :disabled="address.is_default"
                  class="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 class="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinOff class="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ $t('profile.addresses_page.no_addresses') }}</h3>
          <p class="text-sm text-gray-600 mb-4">{{ $t('profile.addresses_page.no_addresses_message') }}</p>
        </div>
        
        <!-- Add New Address Button -->
        <button 
          @click="addNewAddress"
          class="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5"
        >
          <Plus class="w-4 h-4" />
          <span>{{ $t('profile.addresses_page.add_new_address') }}</span>
        </button>
      </div>
    </div>

    <!-- Address Dialog (for add/edit) -->
    <div 
      v-if="showAddressDialog" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-4 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MapPin class="w-3 h-3 text-blue-600" />
            </div>
            <h2 class="text-sm font-bold text-gray-900">
              {{ editIndex !== null ? $t('profile.addresses_page.edit_address') : $t('profile.addresses_page.add_new_address_title') }}
            </h2>
          </div>
          <button 
            @click="showAddressDialog = false"
            class="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-all duration-200"
          >
            <X class="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveAddress" class="space-y-2.5">
          <!-- Address Label -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ $t('profile.addresses_page.address_label') }} <span class="text-red-500">{{ $t('profile.addresses_page.address_label_required') }}</span>
            </label>
            <input 
              v-model="addressForm.address_label"
              type="text"
              required
              :placeholder="$t('profile.addresses_page.address_label_placeholder')"
              class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <!-- Street Address -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ $t('profile.addresses_page.street_address') }} <span class="text-red-500">{{ $t('profile.addresses_page.street_address_required') }}</span>
            </label>
            <input 
              v-model="addressForm.address_line1"
              type="text"
              required
              :placeholder="$t('profile.addresses_page.street_address_placeholder')"
              class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <!-- Address Line 2 -->
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">
              {{ $t('profile.addresses_page.address_line2') }}
            </label>
            <input 
              v-model="addressForm.address_line2"
              type="text"
              :placeholder="$t('profile.addresses_page.address_line2_placeholder')"
              class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          <!-- City and State Row -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ $t('profile.addresses_page.city') }} <span class="text-red-500">{{ $t('profile.addresses_page.city_required') }}</span>
              </label>
              <input 
                v-model="addressForm.city"
                type="text"
                required
                :placeholder="$t('profile.addresses_page.city_placeholder')"
                class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ $t('profile.addresses_page.state_province') }}
              </label>
              <input 
                v-model="addressForm.state"
                type="text"
                :placeholder="$t('profile.addresses_page.state_placeholder')"
                class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          <!-- Postal Code and Country Row -->
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ $t('profile.addresses_page.zip_postal_code') }}
              </label>
              <input 
                v-model="addressForm.postal_code"
                type="text"
                :placeholder="$t('profile.addresses_page.postal_code_placeholder')"
                class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                {{ $t('profile.addresses_page.country') }} <span class="text-red-500">{{ $t('profile.addresses_page.country_required') }}</span>
              </label>
              <select 
                v-model="addressForm.country"
                required
                :disabled="loadingCountries"
                class="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="" disabled>{{ $t('profile.addresses_page.select_country') }}</option>
                <option 
                  v-for="country in countries" 
                  :key="country.name" 
                  :value="country.name"
                >
                  {{ country.name }}
                </option>
              </select>
            </div>
          </div>

          <!-- Default Address Checkbox -->
          <div class="flex items-center space-x-2 pt-1.5">
            <input 
              v-model="addressForm.is_default"
              type="checkbox"
              id="default-address"
              class="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="default-address" class="text-xs text-gray-700">
              {{ $t('profile.addresses_page.set_as_default_address') }}
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-2 pt-4 border-t border-gray-200">
            <button 
              type="button"
              @click="showAddressDialog = false"
              class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="loading || !isFormValid"
              class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
              <Save v-else class="w-3.5 h-3.5" />
              <span>{{ $t('profile.save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div 
      v-if="showDeleteDialog" 
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl">
        <div class="flex items-center space-x-2 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <h2 class="text-base font-bold text-gray-900">{{ $t('profile.addresses_page.delete_address') }}</h2>
        </div>
        
        <p class="text-sm text-gray-600 mb-4">
          {{ $t('profile.addresses_page.delete_address_message') }}
        </p>
        
        <div class="flex space-x-2">
          <button 
            @click="showDeleteDialog = false"
            class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            {{ $t('profile.cancel') }}
          </button>
          <button 
            @click="deleteAddress"
            :disabled="loading"
            class="flex-1 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
          >
            <Loader2 v-if="loading" class="w-3.5 h-3.5 animate-spin" />
            <Trash2 v-else class="w-3.5 h-3.5" />
            <span>{{ $t('profile.addresses_page.delete') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Location Confirmation Dialog -->
    <LocationConfirmationDialog
      v-model="showLocationDialog"
      :address="currentAddress"
      @locationConfirmed="handleLocationConfirmed"
      @locationSkipped="handleLocationSkipped"
    />

    <!-- Success Toast -->
    <div 
      v-if="showSuccessMessage" 
      class="fixed bottom-4 left-4 right-4 z-50 bg-green-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <CheckCircle class="w-4 h-4 flex-shrink-0" />
      <span class="flex-1 text-xs">{{ successMessage }}</span>
      <button @click="showSuccessMessage = false" class="text-white/80 hover:text-white">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Error Toast -->
    <div 
      v-if="showErrorMessage" 
      class="fixed bottom-4 left-4 right-4 z-50 bg-red-500 text-white p-3 rounded-lg shadow-lg flex items-center space-x-2"
    >
      <AlertCircle class="w-4 h-4 flex-shrink-0" />
      <span class="flex-1 text-xs">{{ errorMessage }}</span>
      <button @click="showErrorMessage = false" class="text-white/80 hover:text-white">
        <X class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import BackButtonHeader from '@/components/BackButtonHeader.vue'
import LocationConfirmationDialog from '@/components/LocationConfirmationDialog.vue'
import { 
  MapPin, MapPinOff, Plus, Edit3, Trash2, Star, Save, X, Loader2, 
  CheckCircle, AlertCircle, AlertTriangle, Navigation
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const auth = useAuthStore()

// State
const loading = ref(false)
const addresses = ref([])
const countries = ref([])
const loadingCountries = ref(false)
const isFetchingAddresses = ref(false) // Prevent multiple simultaneous fetches
const addressForm = ref({
  address_label: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Togo',
  is_default: false
})
const editIndex = ref(null)
const editingAddressId = ref(null)
const deleteIndex = ref(null)
const showAddressDialog = ref(false)
const showDeleteDialog = ref(false)

// Location confirmation dialog
const showLocationDialog = ref(false)
const currentAddress = ref({})
const pendingAddressData = ref(null)
const pendingAddressId = ref(null)
const pendingAction = ref(null) // 'create', 'update', 'set_default'

// Messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Computed properties
const isFormValid = computed(() => {
  return addressForm.value.address_label && 
         addressForm.value.address_line1 && 
         addressForm.value.city && 
         addressForm.value.country
})

// Fetch addresses on mount
onMounted(async () => {
  await Promise.all([
    fetchAddresses(),
    fetchCountries()
  ])
})

// Fetch addresses from API
const fetchAddresses = async () => {
  // Prevent multiple simultaneous fetches
  if (isFetchingAddresses.value) {
    console.log('fetchAddresses already in progress, skipping...')
    return
  }
  
  isFetchingAddresses.value = true
  loading.value = true
  try {
    const response = await apiService.getAddresses()
    addresses.value = response.data.results || []
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    showError(t('profile.addresses_page.failed_to_load'))
  } finally {
    loading.value = false
    isFetchingAddresses.value = false
  }
}

// Fetch countries from API
const fetchCountries = async () => {
  loadingCountries.value = true
  try {
    const response = await apiService.getCountries()
    countries.value = response.data.results || response.data || []
  } catch (error) {
    console.error('Failed to fetch countries:', error)
    showError(t('profile.addresses_page.failed_to_load_countries'))
  } finally {
    loadingCountries.value = false
  }
}

// Add new address
const addNewAddress = () => {
  // Reset form
  addressForm.value = {
    address_label: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Togo',
    is_default: addresses.value.length === 0 // Set as default if it's the first address
  }
  
  editIndex.value = null
  editingAddressId.value = null
  showAddressDialog.value = true
}

// Edit address
const editAddress = (index) => {
  const address = addresses.value[index]
  editIndex.value = index
  editingAddressId.value = address.id
  addressForm.value = { 
    address_label: address.address_label || '',
    address_line1: address.address_line1 || '',
    address_line2: address.address_line2 || '',
    city: address.city || '',
    state: address.state || '',
    postal_code: address.postal_code || '',
    country: address.country || 'Togo',
    is_default: address.is_default || false
  }
  showAddressDialog.value = true
}

// Save address (add or update)
const saveAddress = async () => {
  if (!isFormValid.value) return
  
  // Prevent multiple simultaneous saves
  if (loading.value) return
  
  const addressData = { ...addressForm.value }
  
  // Check if we need to ask for location confirmation
  const needsLocationConfirmation = !editingAddressId.value || // New address
    (editingAddressId.value && addressData.is_default && !hasGpsCoordinates(addressData)) // Existing address being set as default without GPS
  
  if (needsLocationConfirmation) {
    // Store the address data and show location confirmation dialog
    pendingAddressData.value = addressData
    pendingAddressId.value = editingAddressId.value
    pendingAction.value = editingAddressId.value ? 'update' : 'create'
    currentAddress.value = { ...addressData }
    // Close address dialog first to avoid conflicts
    showAddressDialog.value = false
    // Small delay to ensure dialog closes before opening location dialog
    setTimeout(() => {
      showLocationDialog.value = true
    }, 100)
    return
  }
  
  // Save address without location confirmation
  await performAddressSave(addressData)
}

// Check if address has GPS coordinates
const hasGpsCoordinates = (address) => {
  if (editingAddressId.value) {
    // For existing addresses, check the current address in the list
    const existingAddress = addresses.value.find(addr => addr.id === editingAddressId.value)
    return existingAddress && existingAddress.latitude && existingAddress.longitude
  }
  return false
}

// Perform the actual address save operation
const performAddressSave = async (addressData, coordinates = null) => {
  loading.value = true
  
  try {
    // Add GPS coordinates if provided (ensure proper precision for database)
    if (coordinates) {
      // Round to 6 decimal places to match database constraints (max_digits=9, decimal_places=6)
      addressData.latitude = parseFloat(coordinates.latitude.toFixed(6))
      addressData.longitude = parseFloat(coordinates.longitude.toFixed(6))
      console.log('Adding GPS coordinates to address:', {
        latitude: addressData.latitude,
        longitude: addressData.longitude
      })
    }
    
    let savedAddress
    if (editingAddressId.value) {
      // Update existing address
      savedAddress = await apiService.updateAddress(editingAddressId.value, addressData)
      successMessage.value = t('profile.addresses_page.address_updated')
    } else {
      // Create new address
      savedAddress = await apiService.createAddress(addressData)
      successMessage.value = t('profile.addresses_page.address_added')
    }
    
    // If setting as default, make API call to set default
    if (addressData.is_default) {
      const addressId = editingAddressId.value || savedAddress.data.id
      if (addressId) {
        await apiService.setDefaultAddress(addressId)
      }
    }
    
    // Refresh addresses list
    await fetchAddresses()
    
    // Show success message
    showSuccessMessage.value = true
    
    // Close dialog
    showAddressDialog.value = false
  } catch (error) {
    console.error('Failed to save address:', error)
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        Object.values(error.response?.data || {}).flat().join(', ') ||
                        t('profile.addresses_page.failed_to_save')
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

// Confirm delete address
const confirmDeleteAddress = (index) => {
  deleteIndex.value = index
  showDeleteDialog.value = true
}

// Delete address
const deleteAddress = async () => {
  if (deleteIndex.value === null) return
  
  const address = addresses.value[deleteIndex.value]
  loading.value = true
  
  try {
    await apiService.deleteAddress(address.id)
    
    // Show success message
    successMessage.value = t('profile.addresses_page.address_deleted')
    showSuccessMessage.value = true
    
    // Refresh addresses list
    await fetchAddresses()
    
    // Close dialog
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Failed to delete address:', error)
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        t('profile.addresses_page.failed_to_delete')
    showError(errorMessage)
  } finally {
    loading.value = false
    deleteIndex.value = null
  }
}

// Set address as default
const setAsDefault = async (id) => {
  // Prevent multiple simultaneous operations
  if (loading.value) return
  
  const address = addresses.value.find(addr => addr.id === id)
  if (!address) return
  
  // Check if address has GPS coordinates
  if (!address.latitude || !address.longitude) {
    // Ask for location confirmation first
    pendingAddressData.value = { ...address, is_default: true }
    pendingAddressId.value = id
    pendingAction.value = 'set_default'
    currentAddress.value = { ...address }
    // Small delay to ensure proper state
    setTimeout(() => {
      showLocationDialog.value = true
    }, 100)
    return
  }
  
  // Address has GPS coordinates, proceed with setting as default
  await performSetAsDefault(id)
}

// Perform the actual set as default operation
const performSetAsDefault = async (id, coordinates = null) => {
  if (!id) {
    console.error('performSetAsDefault: No address ID provided')
    showError(t('profile.addresses_page.address_id_missing'))
    return
  }
  
  loading.value = true
  console.log('performSetAsDefault called with ID:', id, 'coordinates:', coordinates)
  
  try {
    // If coordinates are provided, update the address first
    if (coordinates) {
      const addressData = addresses.value.find(addr => addr.id === id)
      if (addressData) {
        console.log('Updating address with GPS coordinates first')
        await apiService.updateAddress(id, {
          ...addressData,
          latitude: parseFloat(coordinates.latitude.toFixed(6)),
          longitude: parseFloat(coordinates.longitude.toFixed(6))
        })
      }
    }
    
    console.log('Setting address as default:', id)
    const response = await apiService.setDefaultAddress(id)
    console.log('Set default response:', response)
    
    // Show success message
    successMessage.value = t('profile.addresses_page.default_address_updated')
    showSuccessMessage.value = true
    
    // Refresh addresses list to get updated data
    await fetchAddresses()
  } catch (error) {
    console.error('Failed to set default address:', error)
    console.error('Error details:', error.response?.data || error.message)
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        t('profile.addresses_page.failed_to_update_default')
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

// Location confirmation dialog handlers
const handleLocationConfirmed = async (coordinates) => {
  if (!pendingAddressData.value) {
    clearPendingData()
    return
  }
  
  // Prevent multiple simultaneous operations
  if (loading.value) {
    clearPendingData()
    return
  }
  
  try {
    if (pendingAction.value === 'set_default') {
      // Setting existing address as default with GPS coordinates
      await performSetAsDefault(pendingAddressId.value, coordinates)
    } else {
      // Saving new address or updating existing address with GPS coordinates
      await performAddressSave(pendingAddressData.value, coordinates)
    }
  } catch (error) {
    console.error('Error in handleLocationConfirmed:', error)
    showError(t('profile.addresses_page.failed_to_save_location'))
  } finally {
    // Always clear pending data to prevent loops
    clearPendingData()
  }
}

const handleLocationSkipped = async () => {
  if (!pendingAddressData.value) {
    clearPendingData()
    return
  }
  
  // Prevent multiple simultaneous operations
  if (loading.value) {
    clearPendingData()
    return
  }
  
  try {
    if (pendingAction.value === 'set_default') {
      // Setting existing address as default without GPS coordinates
      await performSetAsDefault(pendingAddressId.value)
    } else {
      // Saving address without GPS coordinates
      await performAddressSave(pendingAddressData.value)
    }
  } catch (error) {
    console.error('Error in handleLocationSkipped:', error)
    showError('Failed to save address')
  } finally {
    // Always clear pending data to prevent loops
    clearPendingData()
  }
}

// Clear all pending data
const clearPendingData = () => {
  // Use nextTick to ensure proper cleanup order
  setTimeout(() => {
    pendingAddressData.value = null
    pendingAddressId.value = null
    pendingAction.value = null
    currentAddress.value = {}
    showLocationDialog.value = false
  }, 0)
}

// Show error in toast
const showError = (message) => {
  errorMessage.value = message
  showErrorMessage.value = true
  setTimeout(() => {
    showErrorMessage.value = false
  }, 5000)
}
</script>

<style scoped>
/* Additional styles if needed */
</style> 