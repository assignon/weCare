<template>
  <div class="checkout-page">
    <v-container>
      <!-- Header with back button and title -->
      <div class="d-flex align-center justify-space-between mb-4">
        <v-btn icon variant="text" @click="$router.push({ name: 'Cart' })">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        
        <h1 class="text-h5 font-weight-bold text-center">Checkout</h1>
        
        <div style="width: 40px"></div> <!-- Spacer to maintain layout -->
      </div>
      
      <!-- Checkout stepper -->
      <v-stepper v-model="currentStep" class="mb-6 checkout-stepper">
        <v-stepper-header>
          <v-stepper-item value="1" title="Address"></v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item value="2" title="Delivery"></v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item value="3" title="Payment"></v-stepper-item>
        </v-stepper-header>

        <v-stepper-window>
          <!-- Step 1: Address Selection -->
          <v-stepper-window-item value="1">
            <div class="pa-2">
              <h2 class="text-h6 font-weight-bold mb-4">Delivery to</h2>
              
              <!-- Address list -->
              <div v-if="!loading">
                <div v-if="addresses.length > 0">
                  <v-card
                    v-for="(address, index) in addresses"
                    :key="index"
                    :class="['mb-4', 'rounded-lg', 'address-card', {'selected-address': selectedAddressIndex === index}]"
                    elevation="1"
                    @click="selectAddress(index)"
                  >
                    <v-card-text class="pa-4">
                      <div class="d-flex justify-space-between align-center">
                        <div class="d-flex align-center">
                          <v-avatar 
                            color="primary" 
                            class="mr-3"
                            size="24"
                          >
                            <v-icon color="white" size="small">
                              {{ address.type === 'home' ? 'mdi-home' : 'mdi-office-building' }}
                            </v-icon>
                          </v-avatar>
                          <span class="text-subtitle-1 font-weight-medium">{{ address.label }}</span>
                        </div>
                        
                        <v-btn 
                          icon 
                          variant="text" 
                          size="small"
                          @click.stop="editAddress(index)"
                        >
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>
                      
                      <div class="address-details text-body-2 text-grey-darken-1 mt-2">
                        {{ address.phone }}<br>
                        {{ address.street }}<br>
                        {{ address.city }}, {{ address.state }} {{ address.zipcode }}
                      </div>
                      
                      <!-- Selected indicator -->
                      <div v-if="selectedAddressIndex === index" class="selected-indicator">
                        <v-icon color="primary">mdi-check-circle</v-icon>
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
                
                <!-- No addresses state -->
                <v-card v-else class="mb-4 pa-4 text-center" flat>
                  <v-icon size="large" color="grey-lighten-1" class="mb-2">mdi-map-marker-off</v-icon>
                  <p class="mb-0">No delivery addresses found</p>
                </v-card>
                
                <!-- Add new address button -->
                <v-btn 
                  color="primary" 
                  variant="outlined"
                  block 
                  size="large"
                  prepend-icon="mdi-plus"
                  @click="showAddressDialog = true"
                  class="mb-4 text-none"
                >
                  Add New Address
                </v-btn>
              </div>
              
              <!-- Loading skeleton -->
              <div v-else>
                <v-skeleton-loader
                  v-for="i in 2"
                  :key="i"
                  type="card"
                  class="mb-4"
                ></v-skeleton-loader>
              </div>
              
              <!-- Continue button -->
              <v-btn 
                color="primary" 
                block 
                size="large"
                :disabled="selectedAddressIndex === null || !Array.isArray(addresses.value) || addresses.value.length === 0"
                @click="currentStep = 2"
                class="mt-4"
                rounded
              >
                Continue
              </v-btn>
            </div>
          </v-stepper-window-item>

          <!-- Step 2: Delivery Information -->
          <v-stepper-window-item value="2">
            <div class="pa-2">
              <h2 class="text-h6 font-weight-bold mb-4">Delivery Information</h2>
              
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-medium mb-1">Estimated Delivery</p>
                  <p class="text-body-2">Standard Delivery (3-5 business days)</p>
                  
                  <v-divider class="my-3"></v-divider>
                  
                  <p class="text-subtitle-1 font-weight-medium mb-1">Delivery Address</p>
                  <div v-if="selectedAddressIndex !== null" class="text-body-2">
                    <p class="mb-1">{{ selectedAddress.name }}</p>
                    <p class="mb-1">{{ selectedAddress.street }}</p>
                    <p class="mb-1">{{ selectedAddress.city }}, {{ selectedAddress.state }} {{ selectedAddress.zipcode }}</p>
                    <p class="mb-1">{{ selectedAddress.country }}</p>
                    <p class="mb-0">{{ selectedAddress.phone }}</p>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- Order summary -->
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-bold mb-3">Order Summary</p>
                  
                  <!-- Items detail -->
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Sub total</span>
                    <span class="text-body-2">${{ cart.items.total_amount ? cart.items.total_amount.toFixed(2) : '0.00' }}</span>
                  </div>
                  
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Delivery Fee</span>
                    <span class="text-body-2">${{ shippingFee.toFixed(2) }}</span>
                  </div>
                  
                  <v-divider class="my-3"></v-divider>
                  
                  <div class="d-flex justify-space-between">
                    <span class="text-subtitle-1 font-weight-bold">Total</span>
                    <span class="text-subtitle-1 font-weight-bold">${{ totalAmount.toFixed(2) }}</span>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- Navigation buttons -->
              <div class="d-flex">
                <v-btn 
                  variant="outlined" 
                  class="mr-2"
                  @click="currentStep = 1"
                >
                  Back
                </v-btn>
                <v-btn 
                  color="primary" 
                  block
                  rounded
                  @click="currentStep = 3"
                >
                  Continue to Payment
                </v-btn>
              </div>
            </div>
          </v-stepper-window-item>

          <!-- Step 3: Payment -->
          <v-stepper-window-item value="3">
            <div class="pa-2">
              <h2 class="text-h6 font-weight-bold mb-4">Payment Method</h2>
              
              <!-- Summary for this step -->
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center mb-3">
                    <v-icon color="primary" class="mr-2">mdi-map-marker</v-icon>
                    <div>
                      <p class="text-subtitle-2 font-weight-medium mb-0">Delivery Address</p>
                      <p class="text-caption text-grey-darken-1 mb-0">
                        {{ selectedAddress?.street }}, {{ selectedAddress?.city }}
                      </p>
                    </div>
                  </div>
                  
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-truck-delivery</v-icon>
                    <div>
                      <p class="text-subtitle-2 font-weight-medium mb-0">Delivery Information</p>
                      <p class="text-caption text-grey-darken-1 mb-0">Standard Delivery (3-5 business days)</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
              
              <!-- Payment methods -->
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-bold mb-3">Payment Method</p>
                  
                  <v-radio-group v-model="paymentMethod">
                    <!-- Credit Card -->
                    <v-card 
                      class="mb-2 payment-option" 
                      :class="{ 'selected-payment': paymentMethod === 'credit_card' }"
                      elevation="0"
                      @click="paymentMethod = 'credit_card'"
                    >
                      <div class="d-flex align-center pa-3">
                        <v-avatar color="primary" size="32" class="mr-3">
                          <v-icon color="white">mdi-credit-card</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2">Credit Card</span>
                        <v-spacer></v-spacer>
                        <v-radio value="credit_card" hide-details color="primary"></v-radio>
                      </div>
                    </v-card>
                    
                    <!-- PayPal -->
                    <v-card 
                      class="mb-2 payment-option" 
                      :class="{ 'selected-payment': paymentMethod === 'paypal' }"
                      elevation="0"
                      @click="paymentMethod = 'paypal'"
                    >
                      <div class="d-flex align-center pa-3">
                        <v-avatar color="blue" size="32" class="mr-3">
                          <v-icon color="white">mdi-paypal</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2">PayPal</span>
                        <v-spacer></v-spacer>
                        <v-radio value="paypal" hide-details color="primary"></v-radio>
                      </div>
                    </v-card>
                    
                    <!-- Google Pay -->
                    <v-card 
                      class="mb-2 payment-option" 
                      :class="{ 'selected-payment': paymentMethod === 'google_pay' }"
                      elevation="0"
                      @click="paymentMethod = 'google_pay'"
                    >
                      <div class="d-flex align-center pa-3">
                        <v-avatar color="green" size="32" class="mr-3">
                          <v-icon color="white">mdi-google</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2">Google Pay</span>
                        <v-spacer></v-spacer>
                        <v-radio value="google_pay" hide-details color="primary"></v-radio>
                      </div>
                    </v-card>
                  </v-radio-group>
                </v-card-text>
              </v-card>
              
              <!-- Navigation and payment button -->
              <div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-subtitle-1 font-weight-bold">Total</span>
                  <span class="text-h6 font-weight-bold">${{ totalAmount.toFixed(2) }}</span>
                </div>
                
                <v-btn 
                  color="primary" 
                  block
                  :loading="processing"
                  @click="placeOrder"
                  class="mt-4 mb-2"
                >
                  Payments
                </v-btn>
                
                <v-btn 
                  variant="outlined" 
                  block
                  @click="currentStep = 2"
                  class="mt-1"
                >
                  Back
                </v-btn>
              </div>
            </div>
          </v-stepper-window-item>
        </v-stepper-window>
      </v-stepper>
      
      <!-- Address dialog (for add/edit) -->
      <v-dialog v-model="showAddressDialog" max-width="500" scrollable>
        <v-card>
          <v-card-title class="text-h6 pa-4">
            {{ editAddressIndex !== null ? 'Edit Address' : 'Add New Address' }}
          </v-card-title>
          
          <v-divider></v-divider>
          
          <v-card-text class="pa-4">
            <v-form ref="formRef" v-model="formValid">
              <v-text-field
                v-model="addressForm.label"
                label="Address Label*"
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
                <v-radio value="home" label="Home" color="primary"></v-radio>
                <v-radio value="office" label="Office" color="primary"></v-radio>
              </v-radio-group>
              
              <v-text-field
                v-model="addressForm.address_line1"
                label="Address Line 1*"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.address_line2"
                label="Address Line 2"
                variant="outlined"
                density="comfortable"
                class="mb-3"
              ></v-text-field>
              
              <v-text-field
                v-model="addressForm.street"
                label="Street Address*"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
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
                v-model="addressForm.default"
                label="Set as default address"
                class="mt-2"
                color="primary"
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
              :loading="addressLoading"
              :disabled="!formValid"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      
      <!-- Order success dialog -->
      <v-dialog v-model="showSuccessDialog" max-width="400">
        <v-card class="text-center pa-4">
          <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
          <h3 class="text-h5 mb-2">Order Placed Successfully!</h3>
          <p class="text-body-1 mb-4">Your order has been placed and is being processed.</p>
          <v-btn 
            color="primary" 
            block
            @click="goToOrders"
          >
            View Orders
          </v-btn>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'

const router = useRouter()
const cart = useCartStore()

// Checkout state
const currentStep = ref('1')
const selectedAddressIndex = ref(null)
const paymentMethod = ref('credit_card')
const processing = ref(false)
const shippingFee = ref(0)

// Address state
const addresses = ref([])
const loading = ref(false)
const addressLoading = ref(false)
const editAddressIndex = ref(null)
const showAddressDialog = ref(false)
const formRef = ref(null)
const formValid = ref(false)

// Success state
const showSuccessDialog = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Form data
const addressForm = ref({
  label: '',
  type: 'home',
  address_line1: '',
  address_line2: '',
  street: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
  default: false
})

// Validation rules
const required = v => !!v || 'This field is required'
const phoneRule = v => /^\+?[0-9\s-]{10,15}$/.test(v) || 'Please enter a valid phone number'

// Computed
const totalAmount = computed(() => {
  const subtotal = cart.items.total_amount || 0
  return subtotal + shippingFee.value
})

const selectedAddress = computed(() => {
  if (selectedAddressIndex.value === null) return null
  return addresses.value[selectedAddressIndex.value]
})

// Initialize component
onMounted(async () => {
  await fetchAddresses()
  
  // Set default selected address
  if (Array.isArray(addresses.value) && addresses.value.length > 0) {
    // First look for default address
    const defaultIndex = addresses.value.findIndex(addr => addr.default)
    selectedAddressIndex.value = defaultIndex >= 0 ? defaultIndex : 0
  }
})

// Fetch addresses from API
const fetchAddresses = async () => {
  loading.value = true
  try {
    try {
      const response = await apiService.getAddresses()
      addresses.value = Array.isArray(response.data) ? response.data : []
    } catch (apiError) {
      console.error('API error fetching addresses:', apiError)
      // Fallback to sample data if API fails      
      addresses.value = [
        {
          id: 1, label: 'Home', type: 'home', name: 'John Doe', phone: '123-456-7890', street: '123 Hamilton Street Oakle',
          city: 'New York', state: 'NY', zipcode: '10001', country: 'United States', default: true
        }, {
          id: 2, label: 'Office', type: 'office', name: 'John Doe', phone: '987-654-3210', street: '456 Madison Ave Oakley',
          city: 'New York', state: 'NY', zipcode: '10002', country: 'United States', default: false
        }]
    }
  } catch (error) {
    showError('Failed to load addresses')
    console.error('Error fetching addresses:', error)
    addresses.value = [] // Ensure addresses is an empty array in case of error
  } finally { loading.value = false }
}

// Select address
const selectAddress = (index) => {
  console.log('Selected address index:', index);
  selectedAddressIndex.value = index;
  // Force reactivity update by accessing the selected address
  const selected = selectedAddress.value;
  console.log('Selected address:', selected);
}

// Edit address
const editAddress = (index) => {
  editAddressIndex.value = index;
  addressForm.value = { ...addresses.value[index] };
  showAddressDialog.value = true;
  
  // Give time for form to render with new values, then validate
  setTimeout(() => {
    if (formRef.value) {
      formRef.value.validate();
    }
  }, 100);
}

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
    default: !Array.isArray(addresses.value) || addresses.value.length === 0 // Set as default if it's the first address
  }
  
  editAddressIndex.value = null
  showAddressDialog.value = true
}

// Save address
const saveAddress = async () => {
  if (!formValid.value) {
    showError('Please fill all required fields');
    return;
  }
  
  addressLoading.value = true;
  try {
    const addressData = { ...addressForm.value }
    // If setting as default, update other addresses locally    
    if (addressData.default && Array.isArray(addresses.value)) {
      addresses.value.forEach(addr => { addr.default = false })
    } try {
      // Call the API to save the address      
      if (editAddressIndex.value !== null) {
        const addressId = addresses.value[editAddressIndex.value].id
        const response = await apiService.updateAddress(addressId, addressData)
        // Update local data        
        if (response.data) {
          addresses.value[editAddressIndex.value] = response.data
        } else { addresses.value[editAddressIndex.value] = addressData }
        // Update selected address if editing the currently selected one        
        if (selectedAddressIndex.value === editAddressIndex.value) {
          selectedAddressIndex.value = editAddressIndex.value
        } snackbarText.value = 'Address updated successfully'
      } else {
        // Create new address
        const response = await apiService.addAddress(addressData)
        // Add to local array with returned data or use local data        
        if (response.data) {
          addresses.value.push(response.data)
        } else {
          // Fallback if API doesn't return the created address          
          addressData.id = Date.now()
          addresses.value.push(addressData)
        }
        // Auto-select the new address
        selectedAddressIndex.value = addresses.value.length - 1
        snackbarText.value = 'Address added successfully'
      }
      // If address is set as default, call the API to set it as default
      if (addressData.default) {
        const addressId = addresses.value[selectedAddressIndex.value].id
        await apiService.setDefaultAddress(addressId)
      }
      // If no default address exists, make this one default
      if (Array.isArray(addresses.value) && addresses.value.length > 0 && 
          addresses.value.filter(a => a.default).length === 0) {
        addresses.value[0].default = true
        await apiService.setDefaultAddress(addresses.value[0].id)
      }
    } catch (apiError) {
      console.error('API error saving address:', apiError)
      // Fallback to local update if API fails      
      if (editAddressIndex.value !== null) {
        addresses.value[editAddressIndex.value] = addressData
        snackbarText.value = 'Address updated locally (API unavailable)'
      } else {
        addressData.id = Date.now()
        addresses.value.push(addressData)
        selectedAddressIndex.value = addresses.value.length - 1
        snackbarText.value = 'Address added locally (API unavailable)'
      }
    }
    // Show success message
    snackbarColor.value = 'success'
    showSnackbar.value = true
    // Close dialog    
    showAddressDialog.value = false
  } catch (error) {
    showError('Failed to save address')
    console.error('Error saving address:', error)
  } finally { addressLoading.value = false }
}

// Place order
const placeOrder = async () => {
  if (!selectedAddress.value || !paymentMethod.value) {
    showError('Please select an address and payment method')
    return
  }
  
  processing.value = true
  
  try {
    // Build order data
    const orderData = {
      address_id: selectedAddress.value.id,
      payment_method: paymentMethod.value,
      items: cart.items.items || []
    }
    
    // In a real implementation, call API
    // await apiService.createOrder(orderData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Clear cart
    await cart.clearCart()
    
    // Show success dialog
    showSuccessDialog.value = true
  } catch (error) {
    showError('Failed to place order')
    console.error('Error placing order:', error)
  } finally {
    processing.value = false
  }
}

// Go to orders page
const goToOrders = () => {
  router.push({ name: 'Orders' })
}

// Show error in snackbar
const showError = (message) => {
  snackbarColor.value = 'error'
  snackbarText.value = message
  showSnackbar.value = true
}

// Monitor form validation changes
watch(formValid, (newValue) => {
  console.log('Form validation changed:', newValue);
});

// Watch dialog visibility changes
watch(showAddressDialog, (isOpen) => {
  if (isOpen) {
    // When dialog opens, allow a moment for the DOM to update
    setTimeout(() => {
      if (formRef.value) {
        formRef.value.resetValidation();
      }
    }, 100);
  }
});
</script>

<style scoped>
.checkout-page {
  padding-bottom: 64px;
}

.checkout-stepper {
  border-radius: 8px;
  overflow: hidden;
}

.address-card {
  position: relative;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  transition: all 0.2s ease;
}

.address-card:hover {
  border-color: #7C3AED;
}

.selected-address {
  border: 2px solid #7C3AED;
  background-color: #FFFDE7;
}

.selected-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
}

.payment-option {
  cursor: pointer;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.payment-option:hover {
  border-color: #7C3AED;
}

.selected-payment {
  border: 2px solid #7C3AED;
  background-color: #FFFDE7;
}

@media (max-width: 600px) {
  .v-stepper-header {
    flex-wrap: nowrap;
    overflow-x: auto;
  }
}
</style> 