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
          <v-stepper-item :value="1" title="Address"></v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item :value="2" title="Delivery"></v-stepper-item>
          <v-divider></v-divider>
          <v-stepper-item :value="3" title="Payment"></v-stepper-item>
        </v-stepper-header>

        <v-stepper-window>
          <!-- Step 1: Address Selection -->
          <v-stepper-window-item :value="1">
            <div class="pa-2">
              <h2 class="text-h6 font-weight-bold mb-4">Delivery to</h2>

              <!-- Address list -->
              <div v-if="!loading">
                <div v-if="addresses.length > 0">
                  <v-card v-for="(address, index) in addresses" :key="index"
                    :class="['mb-4', 'rounded-lg', 'address-card', { 'selected-address': selectedAddressIndex === index }]"
                    elevation="1" @click="selectAddress(index)">
                    <v-card-text class="pa-4">
                      <div class="d-flex justify-space-between align-center">
                        <div class="d-flex align-center">
                          <v-avatar color="primary" class="mr-3" size="24">
                            <v-icon color="white" size="small">
                              {{ address.type === 'home' ? 'mdi-home' : 'mdi-office-building' }}
                            </v-icon>
                          </v-avatar>
                          <span class="text-subtitle-1 font-weight-medium">{{ address.address_label }}</span>
                        </div>

                        <v-btn icon variant="text" size="small" @click.stop="editAddress(index)">
                          <v-icon>mdi-pencil</v-icon>
                        </v-btn>
                      </div>

                      <div class="address-details text-body-2 text-grey-darken-1 mt-2">
                        {{ address.phone }}<br>
                        {{ address.address_line1 }}<br>
                        {{ address.city }}, {{ address.state }} {{ address.postal_code }}
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
                <v-btn color="primary" variant="outlined" block size="large" prepend-icon="mdi-plus"
                  @click="showAddressDialog = true" class="mb-4 text-none">
                  Add New Address
                </v-btn>
              </div>

              <!-- Loading skeleton -->
              <div v-else>
                <v-skeleton-loader v-for="i in 2" :key="i" type="card" class="mb-4"></v-skeleton-loader>
              </div>

              <!-- Continue button -->
              <v-btn color="primary" block size="large" :disabled="selectedAddressIndex === null" @click="nextStep"
                class="mt-4 text-none" rounded>
                Continue
              </v-btn>
            </div>
          </v-stepper-window-item>

          <!-- Step 2: Delivery Information -->
          <v-stepper-window-item :value="2">
            <div class="pa-2">
              <h2 class="text-h6 font-weight-bold mb-4">Delivery Information</h2>

              <!-- Delivery Estimate -->
              <!-- <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" class="mr-3">
                      <v-icon color="white">mdi-truck-delivery</v-icon>
                    </v-avatar>
                    <div>
                      <p class="text-subtitle-1 font-weight-bold mb-0">Delivery Estimate</p>
                      <p class="text-body-2 mb-0">{{ averageDeliveryTime }}</p>
                      <p class="text-caption text-primary-darken-1 mb-0">{{ getDeliveryDateRange() }}</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card> -->

              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-medium mb-1">Delivery Address</p>
                  <div v-if="selectedAddressIndex !== null" class="text-body-2">
                    <p class="mb-1">{{ selectedAddress.name }}</p>
                    <p class="mb-1">{{ selectedAddress.address_line1 }}</p>
                    <p class="mb-1">{{ selectedAddress.city }}, {{ selectedAddress.state }} {{
                      selectedAddress.postal_code }}</p>
                    <p class="mb-1">{{ selectedAddress.country }}</p>
                    <p class="mb-0">{{ selectedAddress.phone }}</p>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Order summary -->
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-bold mb-3">Order Summary</p>

                  <!-- Cart items list (up to 3) -->
                  <div v-if="groupedCartItems.length > 0" class="cart-items-summary mb-4">
                    <div v-for="(item, index) in displayedCartItems" :key="item.product_id"
                      class="cart-item-row d-flex align-center py-2">
                      <div class="cart-item-image-container mr-2">
                        <v-img :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'"
                          width="40" height="40" class="cart-item-image rounded" cover></v-img>
                      </div>
                      <div class="flex-grow-1 mr-3">
                        <p class="text-body-2 text-truncate mb-0">{{ item.product_name }}</p>
                        <p class="text-caption text-grey-darken-1 mb-0">
                          {{ item.variants.length }} variant(s) · {{ getTotalQuantity(item) }} items <br>
                          <span class="text-primary"><v-icon>mdi-truck-delivery</v-icon> {{
                            item.delivery_info.estimated_delivery_display }}</span>
                        </p>
                      </div>
                      <div class="text-right">
                        <p class="text-body-2 font-weight-medium mb-0">{{ formatApiPrice({
                          price: getItemTotal(item),
                          currency_info: cart.items.currency_info }) }}</p>
                      </div>
                    </div>

                    <!-- View all button when more than 3 items -->
                    <v-btn v-if="groupedCartItems.length > 3" variant="text" color="primary" block size="small"
                      class="mt-2 text-none" @click="showCartItemsDialog = true">
                      View all {{ groupedCartItems.length }} items
                    </v-btn>
                  </div>

                  <!-- Items detail -->
                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Sub total</span>
                    <span class="text-body-2">{{ formatApiPrice({
                      price: cart.items?.total_amount || 0, currency_info:
                        cart.items.currency_info }) }}</span>
                  </div>

                  <div class="d-flex justify-space-between mb-2">
                    <span class="text-body-2">Delivery Fee</span>
                    <span class="text-body-2">{{ formatApiPrice({
                      price: shippingFee, currency_info:
                        cart.items.currency_info }) }}</span>
                  </div>

                  <v-divider class="my-3"></v-divider>

                  <div class="d-flex justify-space-between">
                    <span class="text-subtitle-1 font-weight-bold">Total</span>
                    <span class="text-subtitle-1 font-weight-bold">{{ formatApiPrice({
                      price: totalAmount,
                      currency_info: cart.items.currency_info }) }}</span>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Navigation buttons -->
              <div class="d-flex">
                <v-btn variant="outlined" class="mr-2 text-none" rounded color="secondary" @click="prevStep">
                  Back
                </v-btn>
                <v-btn color="primary" class="text-none" rounded @click="nextStep">
                  Continue
                </v-btn>
              </div>
            </div>
          </v-stepper-window-item>

          <!-- Step 3: Payment -->
          <v-stepper-window-item :value="3">
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
                        {{ selectedAddress?.address_line1 }}, {{ selectedAddress?.city }}
                      </p>
                    </div>
                  </div>

                  <!-- <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-truck-delivery</v-icon>
                    <div>
                      <p class="text-subtitle-2 font-weight-medium mb-0">Delivery Information</p>
                      <p class="text-caption text-grey-darken-1 mb-0">Standard Delivery (3-5 business days)</p>
                    </div>
                  </div> -->
                </v-card-text>
              </v-card>

              <!-- Payment methods -->
              <v-card class="mb-4 rounded-lg" elevation="1">
                <v-card-text class="pa-4">
                  <p class="text-subtitle-1 font-weight-bold mb-3">Payment Method</p>

                  <v-radio-group v-model="paymentMethod">
                    <!-- Credit Card -->
                    <v-card class="mb-2 payment-option"
                      :class="{ 'selected-payment': paymentMethod === 'mobile_money' }" elevation="0"
                      @click="paymentMethod = 'mobile_money'">
                      <div class="d-flex align-center pa-3">
                        <v-avatar color="primary" size="32" class="mr-3">
                          <v-icon color="white" size="small">mdi-cellphone</v-icon>
                        </v-avatar>
                        <span class="text-subtitle-2">Mobile Money</span>
                        <v-spacer></v-spacer>
                        <v-radio value="mobile_money" hide-details color="primary"></v-radio>
                      </div>
                    </v-card>

                    <!-- PayPal -->
                    <!-- <v-card 
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
                    </v-card> -->

                    <!-- Google Pay -->
                    <!-- <v-card 
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
                    </v-card> -->
                  </v-radio-group>
                </v-card-text>
              </v-card>

              <!-- Navigation and payment button -->
              <div>
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-subtitle-1 font-weight-bold">Total</span>
                  <span class="text-h6 font-weight-bold">{{ formatApiPrice({
                    price: totalAmount, currency_info:
                      cart.items.currency_info }) }}</span>
                </div>

                <v-btn variant="outlined" @click="prevStep" class="mt-1 text-none" rounded color="secondary">
                  Back
                </v-btn>
                <v-btn color="primary" :loading="processing" @click="placeOrder" class="mt-1 ml-2 text-none" rounded>
                  Checkout
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
              <v-text-field v-model="addressForm.address_label" label="Address Label*" variant="outlined"
                density="comfortable" class="mb-3" :rules="[required]" persistent-hint></v-text-field>

              <!-- <v-radio-group
                v-model="addressForm.type"
                class="mb-3"
                inline
              >
                <v-radio value="home" label="Home" color="primary"></v-radio>
                <v-radio value="office" label="Office" color="primary"></v-radio>
              </v-radio-group> -->

              <v-text-field v-model="addressForm.address_line1" label="Address Line 1*" variant="outlined"
                density="comfortable" class="mb-3" :rules="[required]"></v-text-field>

              <v-text-field v-model="addressForm.address_line2" label="Address Line 2" variant="outlined"
                density="comfortable" class="mb-3"></v-text-field>

              <!-- <v-text-field
                v-model="addressForm.street"
                label="Street Address*"
                variant="outlined"
                density="comfortable"
                class="mb-3"
                :rules="[required]"
              ></v-text-field> -->

              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="addressForm.city" label="City*" variant="outlined" density="comfortable"
                    :rules="[required]"></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="addressForm.state" label="State/Province" variant="outlined"
                    density="comfortable"></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="6">
                  <v-text-field v-model="addressForm.postal_code" label="ZIP/Postal Code" variant="outlined"
                    density="comfortable"></v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field v-model="addressForm.country" label="Country*" variant="outlined" density="comfortable"
                    :rules="[required]"></v-text-field>
                </v-col>
              </v-row>

              <v-checkbox v-model="addressForm.default" label="Set as default address" class="mt-2"
                color="primary"></v-checkbox>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-btn variant="text" @click="showAddressDialog = false">
              Cancel
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="saveAddress" :loading="addressLoading" :disabled="!formValid">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Snackbar for notifications -->
      <v-snackbar v-model="showSnackbar" :color="snackbarColor" timeout="3000" location="top">
        {{ snackbarText }}
        <template v-slot:actions>
          <v-btn variant="text" @click="showSnackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>

      <!-- Cart items dialog -->
      <v-dialog v-model="showCartItemsDialog" max-width="500">
        <v-card>
          <v-card-title class="text-h6 pa-4">
            Cart Items
            <v-spacer></v-spacer>
            <v-btn icon @click="showCartItemsDialog = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>

          <v-divider></v-divider>

          <v-card-text class="pa-4">
            <div v-for="item in groupedCartItems" :key="item.product_id"
              class="cart-item-row d-flex align-items-start py-3 border-bottom">
              <div class="cart-item-image-container mr-3">
                <v-img :src="'http://localhost:8000' + item.main_image || 'https://via.placeholder.com/150'" width="60"
                  height="60" class="cart-item-image rounded" cover></v-img>
              </div>

              <div class="flex-grow-1">
                <p class="text-subtitle-2 font-weight-medium mb-1">{{ item.product_name }}</p>
                <p class="text-caption text-grey-darken-1 mb-2">{{ item.seller_name || 'Unknown Seller' }}</p>
                <p class="text-caption text-grey-darken-1 mb-2 text-primary">{{
                  item.delivery_info.estimated_delivery_display
                }}</p>

                <!-- Variants -->
                <div v-for="variant in item.variants" :key="variant.id"
                  class="variant-row d-flex justify-space-between align-center py-1">
                  <div>
                    <span class="text-caption font-weight-medium">{{ variant.name }} ML</span>
                    <span class="text-caption text-grey-darken-1 mx-2">×</span>
                    <span class="text-caption font-weight-medium">{{ variant.quantity }}</span>
                  </div>
                  <span class="text-caption">{{ formatApiPrice({
                    price: variant.price * variant.quantity, currency_info:
                      cart.items.currency_info }) }}</span>
                </div>
              </div>

              <div class="text-right ml-3">
                <p class="text-body-2 font-weight-medium mb-0">{{ formatApiPrice({
                  price: getItemTotal(item),
                  currency_info:
                  cart.items.currency_info }) }}</p>
              </div>
            </div>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn color="primary" variant="text" @click="showCartItemsDialog = false" class="text-none">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useCurrency } from '@/composables/useCurrency'

const router = useRouter()
const cart = useCartStore()
const { formatApiPrice } = useCurrency()

// Checkout state
const currentStep = ref(1)
const selectedAddressIndex = ref(null)
const paymentMethod = ref('mobile_money')
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
const showCartItemsDialog = ref(false)

// Snackbar state
const showSnackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Form data
const addressForm = ref({
  address_label: '',
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

// Computed properties for cart items
const groupedCartItems = computed(() => {
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    return [];
  }

  const grouped = {};

  // Group items by product_id
  cart.items.items.forEach(item => {
    if (!grouped[item.product_id]) {
      grouped[item.product_id] = {
        cart_item_id: item.id,
        product_id: item.product_id,
        product_name: item.product_name,
        seller_name: item.seller_name,
        main_image: item.main_image,
        delivery_info: item.delivery_info,
        variants: []
      };
    }

    // Add all variants from this product
    item.variants.forEach(variant => {
      grouped[item.product_id].variants.push({
        ...variant,
        cart_item_id: item.id,
        product_id: item.product_id
      });
    });
  });

  return Object.values(grouped);
});

const displayedCartItems = computed(() => {
  return groupedCartItems.value.slice(0, 3);
});

// Calculate average delivery time as a computed property
const averageDeliveryTime = computed(() => {
  if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
    return "Standard Delivery (3-5 business days)";
  }

  let totalDays = 0;
  let itemCount = 0;
  let farthestDays = 0; // Track the farthest delivery date

  // Extract delivery times from each item
  groupedCartItems.value.forEach(item => {
    if (item.delivery_info && item.delivery_info.estimated_delivery_display) {
      const deliveryText = item.delivery_info.estimated_delivery_display;

      // Try to extract delivery time range (e.g., "3-5" from "3-5 business days")
      const rangeMatch = deliveryText.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        // For ranges, use the maximum value for worst-case calculation
        const maxDays = parseInt(rangeMatch[2]);

        if (!isNaN(maxDays)) {
          totalDays += maxDays;
          itemCount++;
          // Update farthest delivery date if this is longer
          farthestDays = Math.max(farthestDays, maxDays);
        }
      } else {
        // Try to find a single number (e.g., "3 business days")
        const singleMatch = deliveryText.match(/(\d+)/);
        if (singleMatch) {
          const days = parseInt(singleMatch[1]);

          if (!isNaN(days)) {
            totalDays += days;
            itemCount++;
            // Update farthest delivery date if this is longer
            farthestDays = Math.max(farthestDays, days);
          }
        }
      }
    }
  });

  // If no delivery info could be parsed, return a default
  if (itemCount === 0) {
    return "Standard Delivery (3-5 business days)";
  }

  // Calculate average days (rounded to nearest whole number)
  const avgDays = Math.round(totalDays / itemCount);

  // If average equals farthest, show a single date estimate
  if (avgDays === farthestDays) {
    return `Product will be delivered in ${avgDays} business days`;
  } else {
    // Otherwise show the range between average and farthest
    return `Product will be delivered between ${avgDays} and ${farthestDays} business days`;
  }
});

// Methods for cart items
const getTotalQuantity = (item) => {
  return item.variants.reduce((total, variant) => total + variant.quantity, 0);
};

const getItemTotal = (item) => {
  return item.variants.reduce((total, variant) => total + (variant.price * variant.quantity), 0);
};

// Initialize component
onMounted(async () => {
  // Initialize cart first
  try {
    await cart.fetchCart()
  } catch (error) {
    console.error('Failed to load cart:', error)
    showError('Failed to load cart data')
  }

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
      console.log('Response:', response.data);

      addresses.value = Array.isArray(response.data.results) ? response.data.results : []
    } catch (apiError) {
      // Fallback to sample data if API fails      
      addresses.value = []
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
    address_label: '',
    type: 'home',
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postal_code: '',
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

  // Check if cart has items
  if (!cart.items || !cart.items.items || cart.items.items.length === 0) {
    showError('Your cart is empty. Please add items before checkout.')
    return
  }

  processing.value = true

  try {
    // Build order data according to API specification
    const orderData = {
      // Note: customer will be set automatically by the backend from authenticated user
      items: cart.items.items.flatMap(cartItem =>
        cartItem.variants.map(variant => ({
          product_id: cartItem.product_id,
          product_variant_id: variant.id,
          quantity: variant.quantity,
          price: variant.price,
          seller_id: cartItem.seller_id
        }))
      ),
      shipping_address: `${selectedAddress.value.address_line1}, ${selectedAddress.value.city}, ${selectedAddress.value.state} ${selectedAddress.value.postal_code}, ${selectedAddress.value.country}`,
      total_amount: totalAmount.value,
      notes: `Payment method: ${paymentMethod.value}`,
      // Include payment data for processing
      payment_data: {
        payment_method: paymentMethod.value,
        phone_number: selectedAddress.value.phone || '',
        currency: 'XOF'
      }
    }

    // Call order creation API
    const response = await apiService.createOrder(orderData)

    // Check if order was created successfully
    if (response.data) {
      const order = response.data

      // Check payment status if available
      if (order.status === 'failed') {
        // Payment failed - redirect to failed page
        router.push({
          name: 'PaymentFailed',
          query: {
            error: order.payment.error_message || 'Payment processing failed',
            message: 'Your payment could not be processed. Please try again.'
          }
        })
      } else {
        // Order created successfully - redirect to success page
        router.push({
          name: 'PaymentSuccess',
          query: {
            order_id: order.id,
            order_number: order.id, // Use order ID as order number if not provided
            total_amount: totalAmount.value.toFixed(2),
            payment_method: paymentMethod.value
          }
        })
      }
    } else {
      // Unexpected response
      showError('Unexpected response from server')
    }
  } catch (error) {
    console.error('Error creating order:', error)

    // Check if error response contains specific payment failure info
    if (error.response && error.response.data) {
      const errorData = error.response.data

      // Payment failed - redirect to failed page
      router.push({
        name: 'PaymentFailed',
        query: {
          error: errorData.payment?.error_message || errorData.error || 'Payment processing failed',
          message: 'Your payment could not be processed. Please try again.'
        }
      })

      // // Check if it's a payment-related error
      // if (errorData.payment_status === 'failed' || 
      //     (errorData.payment && errorData.payment.status === 'failed')) {
      //   // Payment failed - redirect to failed page
      //   router.push({
      //     name: 'PaymentFailed',
      //     query: {
      //       error: errorData.payment?.error_message || errorData.error || 'Payment processing failed',
      //       message: 'Your payment could not be processed. Please try again.'
      //     }
      //   })
      // } else {
      //   // Other API error
      //   showError(errorData.message || errorData.error || 'Failed to create order')
      // }
    } else {
      // Network or other error
      showError('Failed to create order. Please check your connection and try again.')
    }
  } finally {
    processing.value = false
  }
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

// Navigation functions
const goToStep = (step) => {
  console.log('Going to step:', step);
  currentStep.value = step;
}

const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
}

// Get formatted delivery date range
const getDeliveryDateRange = () => {
  if (!groupedCartItems.value || groupedCartItems.value.length === 0) {
    return "";
  }

  let totalDays = 0;
  let itemCount = 0;
  let farthestDays = 0;

  // Extract delivery times from each item
  groupedCartItems.value.forEach(item => {
    if (item.delivery_info && item.delivery_info.estimated_delivery_display) {
      const deliveryText = item.delivery_info.estimated_delivery_display;

      // Try to extract delivery time range (e.g., "3-5" from "3-5 business days")
      const rangeMatch = deliveryText.match(/(\d+)-(\d+)/);
      if (rangeMatch) {
        const maxDays = parseInt(rangeMatch[2]);

        if (!isNaN(maxDays)) {
          totalDays += maxDays;
          itemCount++;
          farthestDays = Math.max(farthestDays, maxDays);
        }
      } else {
        // Try to find a single number (e.g., "3 business days")
        const singleMatch = deliveryText.match(/(\d+)/);
        if (singleMatch) {
          const days = parseInt(singleMatch[1]);

          if (!isNaN(days)) {
            totalDays += days;
            itemCount++;
            farthestDays = Math.max(farthestDays, days);
          }
        }
      }
    }
  });

  if (itemCount === 0) {
    return "";
  }

  // Calculate average days
  const avgDays = Math.round(totalDays / itemCount);

  // Calculate actual calendar dates (accounting for business days)
  const avgDate = addBusinessDays(new Date(), avgDays);
  const farthestDate = addBusinessDays(new Date(), farthestDays);

  // Format dates
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const avgDateFormatted = avgDate.toLocaleDateString('en-US', options);
  const farthestDateFormatted = farthestDate.toLocaleDateString('en-US', options);

  if (avgDays === farthestDays) {
    return `By ${avgDateFormatted}`;
  } else {
    return `Between ${avgDateFormatted} and ${farthestDateFormatted}`;
  }
};

// Helper function to add business days to a date
const addBusinessDays = (date, days) => {
  const result = new Date(date);
  let addedDays = 0;

  while (addedDays < days) {
    // Add one day
    result.setDate(result.getDate() + 1);

    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      addedDays++;
    }
  }

  return result;
};
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

.cart-items-summary {
  max-height: 300px;
  overflow-y: auto;
}

.cart-item-row {
  border-bottom: 1px solid #f0f0f0;
}

.cart-item-row:last-child {
  border-bottom: none;
}

.cart-item-image {
  border: 1px solid #f0f0f0;
  object-fit: cover;
}

.border-bottom {
  border-bottom: 1px solid #f0f0f0;
}

.variant-row {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 0 8px;
  margin-bottom: 2px;
}
</style>