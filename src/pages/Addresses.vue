<template>
  <div class="addresses-page">
    <v-container>
      <!-- Header with back button and title -->
      <div class="d-flex align-center justify-space-between mb-5">
        <v-btn icon variant="text" @click="$router.go(-1)">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        
        <h1 class="text-h5 font-weight-bold text-center">My Addresses</h1>
        
        <div style="width: 40px"></div> <!-- Spacer to maintain layout -->
      </div>
      
      <!-- Address list -->
      <div v-if="addresses.length > 0">
        <v-card
          v-for="(address, index) in addresses"
          :key="index"
          class="mb-4 rounded-lg"
          elevation="1"
        >
          <v-card-text class="pa-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <div class="d-flex align-center">
                <v-icon 
                  color="primary" 
                  class="mr-2"
                  icon="mdi-map-marker"
                ></v-icon>
                <span class="text-subtitle-1 font-weight-medium">{{ address.address_label || 'Address' }}</span>
              </div>
              
              <v-chip 
                v-if="address.is_default" 
                color="primary" 
                size="small"
                variant="flat"
              >
                Default
              </v-chip>
            </div>
            
            <div class="address-details text-body-2 text-grey-darken-1 mb-3">
              {{ address.address_line1 }}<br>
              <span v-if="address.address_line2">{{ address.address_line2 }}<br></span>
              {{ address.city }}, {{ address.state }} {{ address.postal_code }}<br>
              {{ address.country }}
            </div>
            
            <div class="d-flex justify-space-between align-center">
              <div>
                <v-btn 
                  v-if="!address.is_default" 
                  variant="text" 
                  color="primary" 
                  size="small"
                  class="text-none"
                  @click="setAsDefault(address.id)"
                  :loading="loading"
                >
                  Set as Default
                </v-btn>
              </div>
              
              <div class="d-flex">
                <v-btn 
                  icon 
                  variant="text" 
                  color="primary"
                  size="small"
                  @click="editAddress(index)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                
                <v-btn 
                  icon 
                  variant="text" 
                  color="error"
                  size="small"
                  @click="confirmDeleteAddress(index)"
                  :disabled="address.is_default"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>
      
      <!-- Empty state -->
      <v-card v-else class="empty-addresses pa-6 text-center mb-6" flat>
        <v-icon size="x-large" color="grey-lighten-1" class="mb-4">mdi-map-marker-off</v-icon>
        <h3 class="text-h5 mb-2">No Addresses Yet</h3>
        <p class="text-body-1 text-grey mb-6">Add your delivery address to make your checkout process faster.</p>
      </v-card>
      
      <!-- Add new address button -->
      <v-btn 
        color="primary" 
        block 
        size="large"
        prepend-icon="mdi-plus"
        rounded
        @click="addNewAddress"
        class="text-none mb-4"
      >
        Add New Address
      </v-btn>
      
      <!-- Address dialog (for add/edit) -->
      <v-dialog v-model="showAddressDialog" max-width="500" scrollable>
        <v-card>
          <v-card-title class="text-h6 pa-4">
            {{ editIndex !== null ? 'Edit Address' : 'Add New Address' }}
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-form ref="formRef" v-model="formValid">
              <v-text-field
                v-model="addressForm.address_label"
                label="Address Label*"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
                hint="E.g. Home, Office, Parent's House"
                persistent-hint
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.address_line1"
                label="Street Address*"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.address_line2"
                label="Address Line 2 (Optional)"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                hint="Apartment, suite, unit, building, floor, etc."
                persistent-hint
              ></v-text-field>
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.city"
                    label="City*"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.state"
                    label="State/Province"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.postal_code"
                    label="ZIP/Postal Code"
                    variant="outlined"
                    density="comfortable"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.country"
                    label="Country*"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-checkbox
                v-model="addressForm.is_default"
                label="Set as default address"
                class="mt-2"
              ></v-checkbox>
            </v-form>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-btn 
              variant="text" 
              @click="showAddressDialog = false"
            >
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              @click="saveAddress"
              :loading="loading"
              :disabled="!formValid"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Delete confirmation dialog -->
      <v-dialog v-model="showDeleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h6">Delete Address</v-card-title>
          <v-card-text>
            Are you sure you want to delete this address?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="showDeleteDialog = false">
              Cancel
            </v-btn>
            <v-btn color="error" @click="deleteAddress">
              Delete
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Snackbar for notifications -->
      <v-snackbar
        v-model="showSnackbar"
        :color="snackbarColor"
        timeout="3000"
        location="top"
      >
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn
            variant="text"
            @click="showSnackbar = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'

const router = useRouter()

// Reactive data
const addresses = ref([])
const addressForm = ref({
  address_label: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Togo', // Default country
  is_default: false
})
const formRef = ref(null)
const formValid = ref(false)
const loading = ref(false)
const editIndex = ref(null)
const editingAddressId = ref(null)
const deleteIndex = ref(null)
const showAddressDialog = ref(false)
const showDeleteDialog = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Validation rules
const required = v => !!v || 'This field is required'
const phoneRule = v => /^\+?[0-9\s-]{10,15}$/.test(v) || 'Please enter a valid phone number'

// Fetch addresses on mount
onMounted(async () => {
  await fetchAddresses()
})

// Fetch addresses from API
const fetchAddresses = async () => {
  loading.value = true
  try {
    const response = await apiService.getAddresses()
    addresses.value = response.data.results || []
  } catch (error) {
    console.error('Failed to fetch addresses:', error)
    showError('Failed to load addresses')
  } finally {
    loading.value = false
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
  if (!formValid.value) return
  
  loading.value = true
  
  try {
    const addressData = { ...addressForm.value }
    
    if (editingAddressId.value) {
      // Update existing address
      await apiService.updateAddress(editingAddressId.value, addressData)
      snackbarText.value = 'Address updated successfully'
    } else {
      // Create new address
      await apiService.createAddress(addressData)
      snackbarText.value = 'Address added successfully'
    }
    
    // If setting as default, make API call to set default
    if (addressData.is_default && editingAddressId.value) {
      await apiService.setDefaultAddress(editingAddressId.value)
    }
    
    // Refresh addresses list
    await fetchAddresses()
    
    // Show success message
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Close dialog
    showAddressDialog.value = false
  } catch (error) {
    console.error('Failed to save address:', error)
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        Object.values(error.response?.data || {}).flat().join(', ') ||
                        'Failed to save address'
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
    snackbarColor.value = 'success'
    snackbarText.value = 'Address deleted successfully'
    showSnackbar.value = true
    
    // Refresh addresses list
    await fetchAddresses()
    
    // Close dialog
    showDeleteDialog.value = false
  } catch (error) {
    console.error('Failed to delete address:', error)
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        'Failed to delete address'
    showError(errorMessage)
  } finally {
    loading.value = false
    deleteIndex.value = null
  }
}

// Set address as default
const setAsDefault = async (id) => {
  // const address = addresses.value[index]
  loading.value = true
  
  try {
    await apiService.setDefaultAddress(id)
    
    // Show success message
    snackbarColor.value = 'success'
    snackbarText.value = 'Default address updated successfully'
    showSnackbar.value = true
    
    // Refresh addresses list to get updated data
    await fetchAddresses()
  } catch (error) {
    console.error('Failed to set default address:', error)
    showError('Failed to update default address')
  } finally {
    loading.value = false
  }
}

// Show error in snackbar
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}
</script>

<style scoped>
.addresses-page {
  padding-bottom: 64px;
}

.empty-addresses {
  margin: 30px auto;
  max-width: 500px;
}
</style> 