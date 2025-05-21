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
                  :icon="address.type === 'home' ? 'mdi-home' : 'mdi-office-building'"
                ></v-icon>
                <span class="text-subtitle-1 font-weight-medium">{{ address.label }}</span>
              </div>
              
              <v-chip 
                v-if="address.default" 
                color="primary" 
                size="small"
                variant="flat"
              >
                Default
              </v-chip>
            </div>
            
            <div class="address-details text-body-2 text-grey-darken-1 mb-3">
              {{ address.name }}<br>
              {{ address.street }}<br>
              {{ address.city }}, {{ address.state }} {{ address.zipcode }}<br>
              {{ address.country }}<br>
              Phone: {{ address.phone }}
            </div>
            
            <div class="d-flex justify-space-between align-center">
              <div>
                <v-btn 
                  v-if="!address.default" 
                  variant="text" 
                  color="primary" 
                  size="small"
                  class="text-none"
                  @click="setAsDefault(index)"
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
                  :disabled="address.default"
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
        @click="addNewAddress"
        class="text-none rounded-lg mb-4"
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
                v-model="addressForm.label"
                label="Address Label"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
                hint="E.g. Home, Office, Parent's House"
                persistent-hint
              ></v-text-field>
              
              <v-radio-group
                v-model="addressForm.type"
                class="mb-3"
                inline
              >
                <v-radio value="home" label="Home"></v-radio>
                <v-radio value="office" label="Office"></v-radio>
              </v-radio-group>
              
              <v-text-field
                v-model="addressForm.name"
                label="Full Name"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.phone"
                label="Phone Number"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required, phoneRule]"
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.street"
                label="Street Address"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
              ></v-text-field>
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.city"
                    label="City"
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
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.zipcode"
                    label="ZIP/Postal Code"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="6">
                  <v-text-field
                    v-model="addressForm.country"
                    label="Country"
                    variant="outlined"
                    density="comfortable"
                    :rules="[required]"
                  ></v-text-field>
                </v-col>
              </v-row>
              
              <v-checkbox
                v-model="addressForm.default"
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
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

// Sample addresses data (in a real app, this would come from an API)
const addresses = ref([])

// Form and UI state
const addressForm = ref({
  label: '',
  type: 'home',
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  default: false
})
const formRef = ref(null)
const formValid = ref(false)
const loading = ref(false)
const editIndex = ref(null)
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
  loading.value = true
  
  try {
    // In a real app, you would fetch from API:
    // const response = await apiService.getAddresses()
    // addresses.value = response.data
    
    // For demo, add sample addresses
    addresses.value = [
      {
        label: 'Home',
        type: 'home',
        name: 'John Doe',
        phone: '+1 234-567-8900',
        street: '123 Main Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        zipcode: '10001',
        country: 'United States',
        default: true
      },
      {
        label: 'Office',
        type: 'office',
        name: 'John Doe',
        phone: '+1 234-567-8901',
        street: '456 Business Ave, Floor 8',
        city: 'New York',
        state: 'NY',
        zipcode: '10002',
        country: 'United States',
        default: false
      }
    ]
  } catch (error) {
    showError('Failed to load addresses')
  } finally {
    loading.value = false
  }
})

// Add new address
const addNewAddress = () => {
  // Reset form
  addressForm.value = {
    label: '',
    type: 'home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
    default: addresses.value.length === 0 // Set as default if it's the first address
  }
  
  editIndex.value = null
  showAddressDialog.value = true
}

// Edit address
const editAddress = (index) => {
  editIndex.value = index
  addressForm.value = { ...addresses.value[index] }
  showAddressDialog.value = true
}

// Save address (add or update)
const saveAddress = async () => {
  if (!formValid.value) return
  
  loading.value = true
  
  try {
    // Create a copy of the form data
    const addressData = { ...addressForm.value }
    
    // If setting as default, update other addresses
    if (addressData.default) {
      addresses.value.forEach(addr => {
        addr.default = false
      })
    }
    
    // For a real app, you would call API:
    // if (editIndex.value !== null) {
    //   await apiService.updateAddress(addresses.value[editIndex.value].id, addressData)
    // } else {
    //   const response = await apiService.addAddress(addressData)
    //   addressData.id = response.data.id
    // }
    
    // In-memory update
    if (editIndex.value !== null) {
      addresses.value[editIndex.value] = addressData
      snackbarText.value = 'Address updated successfully'
    } else {
      addresses.value.push(addressData)
      snackbarText.value = 'Address added successfully'
    }
    
    // If no default address exists, make this one default
    if (addresses.value.filter(a => a.default).length === 0) {
      addresses.value[0].default = true
    }
    
    // Show success message
    snackbarColor.value = 'success'
    showSnackbar.value = true
    
    // Close dialog
    showAddressDialog.value = false
  } catch (error) {
    showError('Failed to save address')
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
  
  loading.value = true
  
  try {
    // For a real app, you would call API:
    // await apiService.deleteAddress(addresses.value[deleteIndex.value].id)
    
    // Remove from local array
    addresses.value.splice(deleteIndex.value, 1)
    
    // If we deleted all addresses, close dialog
    if (addresses.value.length === 0) {
      showDeleteDialog.value = false
      return
    }
    
    // If we deleted the default address, set a new default
    if (!addresses.value.some(a => a.default)) {
      addresses.value[0].default = true
    }
    
    // Show success message
    snackbarColor.value = 'success'
    snackbarText.value = 'Address deleted successfully'
    showSnackbar.value = true
    
    // Close dialog
    showDeleteDialog.value = false
  } catch (error) {
    showError('Failed to delete address')
  } finally {
    loading.value = false
    deleteIndex.value = null
  }
}

// Set address as default
const setAsDefault = async (index) => {
  loading.value = true
  
  try {
    // Update local state
    addresses.value.forEach((addr, i) => {
      addr.default = i === index
    })
    
    // For a real app, you would call API:
    // await apiService.setDefaultAddress(addresses.value[index].id)
    
    // Show success message
    snackbarColor.value = 'success'
    snackbarText.value = 'Default address updated'
    showSnackbar.value = true
  } catch (error) {
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