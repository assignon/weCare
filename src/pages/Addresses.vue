<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        :custom-title="$t('profile.addresses_page.title')"
      />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ $t('profile.addresses_page.loading') }}</h3>
        <p class="text-slate-600">{{ $t('profile.addresses_page.loading_subtitle') }}</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Address List -->
        <div v-if="addresses.length > 0" class="space-y-4">
          <div 
            v-for="(address, index) in addresses" 
            :key="index"
            class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6"
          >
            <!-- Address Header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <MapPin class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">{{ address.address_label || $t('profile.addresses_page.address') }}</h3>
                  <p class="text-sm text-slate-600">{{ $t('profile.addresses_page.delivery_location') }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-2">
                <span 
                  v-if="address.latitude && address.longitude" 
                  class="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex items-center space-x-1"
                >
                  <Navigation class="w-3 h-3" />
                  <span>{{ $t('profile.addresses_page.gps') }}</span>
                </span>
                <span 
                  v-if="address.is_default" 
                  class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full"
                >
                  {{ $t('profile.addresses_page.default') }}
                </span>
              </div>
            </div>
            
            <!-- Address Details -->
            <div class="bg-slate-50/50 rounded-2xl p-4 mb-4">
              <div class="text-sm text-slate-700 space-y-1">
                <p class="font-medium">{{ address.address_line1 }}</p>
                <p v-if="address.address_line2" class="text-slate-600">{{ address.address_line2 }}</p>
                <p class="text-slate-600">
                  {{ address.city }}{{ address.state ? `, ${address.state}` : '' }} {{ address.postal_code }}
                </p>
                <p class="text-slate-600">{{ address.country }}</p>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="flex items-center justify-between">
              <div>
                <button 
                  v-if="!address.is_default" 
                  @click="setAsDefault(address.id)"
                  :disabled="loading"
                  class="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
                  <Star v-else class="w-4 h-4" />
                  <span>{{ $t('profile.addresses_page.set_as_default') }}</span>
                </button>
              </div>
              
              <div class="flex items-center space-x-2">
                <button 
                  @click="editAddress(index)"
                  class="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-2xl flex items-center justify-center transition-all duration-200"
                >
                  <Edit3 class="w-4 h-4 text-slate-600" />
                </button>
                
                <button 
                  @click="confirmDeleteAddress(index)"
                  :disabled="address.is_default"
                  class="w-10 h-10 bg-red-100 hover:bg-red-200 rounded-2xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 class="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-else class="text-center py-16">
          <div class="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPinOff class="w-10 h-10 text-slate-400" />
          </div>
          <h3 class="text-xl font-semibold text-slate-800 mb-2">{{ $t('profile.addresses_page.no_addresses') }}</h3>
          <p class="text-slate-600 mb-6">{{ $t('profile.addresses_page.no_addresses_message') }}</p>
        </div>
        
        <!-- Add New Address Button -->
        <button 
          @click="addNewAddress"
          class="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-3xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg"
          style="background: linear-gradient(to right, #2563eb, #4f46e5);"
          onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
          onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
        >
          <Plus class="w-5 h-5" />
          <span>{{ $t('profile.addresses_page.add_new_address') }}</span>
        </button>
      </div>
    </div>

    <!-- Address Dialog (for add/edit) -->
    <div 
      v-if="showAddressDialog" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <!-- Dialog Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
              <MapPin class="w-5 h-5 text-blue-600" />
            </div>
            <h2 class="text-xl font-bold text-slate-900">
              {{ editIndex !== null ? $t('profile.addresses_page.edit_address') : $t('profile.addresses_page.add_new_address_title') }}
            </h2>
          </div>
          <button 
            @click="showAddressDialog = false"
            class="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all duration-200"
          >
            <X class="w-4 h-4 text-slate-600" />
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="saveAddress" class="space-y-4">
          <!-- Address Label -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ $t('profile.addresses_page.address_label') }} {{ $t('profile.addresses_page.address_label_required') }}
            </label>
            <input 
              v-model="addressForm.address_label"
              type="text"
              required
              :placeholder="$t('profile.addresses_page.address_label_placeholder')"
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- Street Address -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ $t('profile.addresses_page.street_address') }} {{ $t('profile.addresses_page.street_address_required') }}
            </label>
            <input 
              v-model="addressForm.address_line1"
              type="text"
              required
              :placeholder="$t('profile.addresses_page.street_address_placeholder')"
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- Address Line 2 -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-2">
              {{ $t('profile.addresses_page.address_line2') }}
            </label>
            <input 
              v-model="addressForm.address_line2"
              type="text"
              :placeholder="$t('profile.addresses_page.address_line2_placeholder')"
              class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- City and State Row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.addresses_page.city') }} {{ $t('profile.addresses_page.city_required') }}
              </label>
              <input 
                v-model="addressForm.city"
                type="text"
                required
                :placeholder="$t('profile.addresses_page.city_placeholder')"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.addresses_page.state_province') }}
              </label>
              <input 
                v-model="addressForm.state"
                type="text"
                :placeholder="$t('profile.addresses_page.state_placeholder')"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <!-- Postal Code and Country Row -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.addresses_page.zip_postal_code') }}
              </label>
              <input 
                v-model="addressForm.postal_code"
                type="text"
                :placeholder="$t('profile.addresses_page.postal_code_placeholder')"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">
                {{ $t('profile.addresses_page.country') }} {{ $t('profile.addresses_page.country_required') }}
              </label>
              <select 
                v-model="addressForm.country"
                required
                :disabled="loadingCountries"
                class="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
          <div class="flex items-center space-x-3 pt-2">
            <input 
              v-model="addressForm.is_default"
              type="checkbox"
              id="default-address"
              class="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <label for="default-address" class="text-sm text-slate-700">
              {{ $t('profile.addresses_page.set_as_default_address') }}
            </label>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3 pt-6 border-t border-slate-200">
            <button 
              type="button"
              @click="showAddressDialog = false"
              class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              type="submit"
              :disabled="loading || !isFormValid"
              class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              style="background: linear-gradient(to right, #2563eb, #4f46e5);"
              onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
              onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
            >
              <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
              <Save v-else class="w-4 h-4" />
              <span>{{ $t('profile.save') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <div 
      v-if="showDeleteDialog" 
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl">
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <h2 class="text-xl font-bold text-slate-900">{{ $t('profile.addresses_page.delete_address') }}</h2>
        </div>
        
        <p class="text-slate-600 mb-6">
          {{ $t('profile.addresses_page.delete_address_message') }}
        </p>
        
        <div class="flex space-x-3">
          <button 
            @click="showDeleteDialog = false"
            class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
          >
            Cancel
          </button>
          <button 
            @click="deleteAddress"
            :disabled="loading"
            class="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            style="background: linear-gradient(to right, #dc2626, #db2777);"
            onmouseover="this.style.background='linear-gradient(to right, #b91c1c, #be185d)'"
            onmouseout="this.style.background='linear-gradient(to right, #dc2626, #db2777)'"
          >
            <Loader2 v-if="loading" class="w-4 h-4 animate-spin" />
            <Trash2 v-else class="w-4 h-4" />
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
      class="fixed bottom-4 left-4 right-4 z-50 bg-green-500 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3"
    >
      <CheckCircle class="w-5 h-5 flex-shrink-0" />
      <span class="flex-1">{{ successMessage }}</span>
      <button @click="showSuccessMessage = false" class="text-white/80 hover:text-white">
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Error Toast -->
    <div 
      v-if="showErrorMessage" 
      class="fixed bottom-4 left-4 right-4 z-50 bg-red-500 text-white p-4 rounded-2xl shadow-lg flex items-center space-x-3"
    >
      <AlertCircle class="w-5 h-5 flex-shrink-0" />
      <span class="flex-1">{{ errorMessage }}</span>
      <button @click="showErrorMessage = false" class="text-white/80 hover:text-white">
        <X class="w-4 h-4" />
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
import AppHeader from '@/components/AppHeader.vue'
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
  loading.value = true
  try {
    const response = await apiService.getAddresses()
    addresses.value = response.data.results || []
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    showError(t('profile.addresses_page.failed_to_load'))
  } finally {
    loading.value = false
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
    showLocationDialog.value = true
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
  const address = addresses.value.find(addr => addr.id === id)
  
  // Check if address has GPS coordinates
  if (!address.latitude || !address.longitude) {
    // Ask for location confirmation first
    pendingAddressData.value = { ...address, is_default: true }
    pendingAddressId.value = id
    pendingAction.value = 'set_default'
    currentAddress.value = { ...address }
    showLocationDialog.value = true
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
  if (!pendingAddressData.value) return
  
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
  }
  
  // Clear pending data
  clearPendingData()
}

const handleLocationSkipped = async () => {
  if (!pendingAddressData.value) return
  
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
  }
  
  // Clear pending data
  clearPendingData()
}

// Clear all pending data
const clearPendingData = () => {
  pendingAddressData.value = null
  pendingAddressId.value = null
  pendingAction.value = null
  showLocationDialog.value = false
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