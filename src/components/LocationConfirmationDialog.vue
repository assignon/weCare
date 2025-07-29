<template>
  <v-dialog 
    v-model="show" 
    max-width="400" 
    persistent
    :class="{ 'location-dialog-animate': animateDialog }"
  >
    <v-card>
      <!-- Initial Question Step -->
      <div v-if="currentStep === 'question'">
        <v-card-title class="text-h6 text-center pa-4">
          <v-icon size="large" color="primary" class="mb-2">mdi-map-marker-question</v-icon>
          <div>Location Confirmation</div>
        </v-card-title>
        
        <v-card-text class="text-center pa-4">
          <p class="text-body-1 mb-4">
            Are you currently at this address right now?
          </p>
          <div class="address-preview pa-3 rounded bg-grey-lighten-4">
            <v-icon small class="mr-2">mdi-map-marker</v-icon>
            <span class="text-body-2">{{ addressSummary }}</span>
          </div>
          <p class="text-caption text-grey mt-3">
            This helps us provide better delivery services
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <div class="w-100">
            <v-btn 
              variant="outlined" 
              @click="handleNo"
              :disabled="loading"
              block
              class="mb-3"
              size="large"
            >
              No, I'm not there
            </v-btn>
            <v-btn 
              color="primary" 
              @click="handleYes"
              :disabled="loading"
              block
              size="large"
            >
              Yes, I'm here now
            </v-btn>
          </div>
        </v-card-actions>
      </div>
      
      <!-- Location Permission Step -->
      <div v-else-if="currentStep === 'permission'">
        <v-card-title class="text-h6 text-center pa-4">
          <v-icon size="large" color="orange" class="mb-2">mdi-crosshairs-gps</v-icon>
          <div>Location Access</div>
        </v-card-title>
        
        <v-card-text class="text-center pa-4">
          <p class="text-body-1 mb-4">
            We need access to your location to save precise GPS coordinates for this address.
          </p>
          <div class="benefits-list text-left mb-4">
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">Faster delivery location</span>
            </div>
            <div class="d-flex align-center mb-2">
              <v-icon size="small" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">More accurate address</span>
            </div>
            <div class="d-flex align-center">
              <v-icon size="small" color="success" class="mr-2">mdi-check-circle</v-icon>
              <span class="text-body-2">Better driver navigation</span>
            </div>
          </div>
          <p class="text-caption text-grey">
            Your location data is only used for delivery purposes
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <div class="w-100">
            <v-btn 
              variant="outlined" 
              @click="handleSkipLocation"
              :disabled="loading"
              block
              class="mb-3"
              size="large"
            >
              Skip for now
            </v-btn>
            <v-btn 
              color="primary" 
              @click="requestLocation"
              :loading="loading"
              block
              size="large"
              prepend-icon="mdi-crosshairs-gps"
            >
              <template v-if="loading">
                Getting Location...
              </template>
              <template v-else>
                Grant Location Access
              </template>
            </v-btn>
            <p class="text-caption text-grey mt-3 text-center">
              👆 Clicking this button will prompt your browser to request location permission
            </p>
          </div>
        </v-card-actions>
      </div>
      
      <!-- Loading Step -->
      <div v-else-if="currentStep === 'loading'">
        <v-card-title class="text-h6 text-center pa-4">
          <v-icon size="large" color="primary" class="mb-2 rotate-icon">mdi-crosshairs-gps</v-icon>
          <div>Getting Your Location</div>
        </v-card-title>
        
        <v-card-text class="text-center pa-4">
          <v-progress-circular 
            indeterminate 
            color="primary" 
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <p class="text-body-2">
            Please wait while we get your GPS coordinates...
          </p>
          <p class="text-caption text-grey mt-2">
            Make sure location services are enabled
          </p>
        </v-card-text>
      </div>
      
      <!-- Success Step -->
      <div v-else-if="currentStep === 'success'">
        <v-card-title class="text-h6 text-center pa-4">
          <v-icon size="large" color="success" class="mb-2">mdi-check-circle</v-icon>
          <div>Location Saved</div>
        </v-card-title>
        
        <v-card-text class="text-center pa-4">
          <p class="text-body-1 mb-4">
            Great! Your GPS coordinates have been saved.
          </p>
          <div class="coordinates-info pa-3 rounded bg-success-lighten-5">
            <div class="text-body-2 mb-1">
              <strong>Latitude:</strong> {{ coordinates.latitude?.toFixed(6) }}
            </div>
            <div class="text-body-2">
              <strong>Longitude:</strong> {{ coordinates.longitude?.toFixed(6) }}
            </div>
          </div>
          <p class="text-caption text-grey mt-3">
            This will help our drivers find you more easily
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-btn 
            color="success" 
            @click="close"
            block
          >
            Continue
          </v-btn>
        </v-card-actions>
      </div>
      
      <!-- Error Step -->
      <div v-else-if="currentStep === 'error'">
        <v-card-title class="text-h6 text-center pa-4">
          <v-icon size="large" color="error" class="mb-2">mdi-alert-circle</v-icon>
          <div>Location Error</div>
        </v-card-title>
        
        <v-card-text class="text-center pa-4">
          <p class="text-body-2 mb-4 text-left whitespace-pre-line">
            {{ errorMessage }}
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-btn 
            variant="outlined" 
            @click="handleSkipLocation"
            block
            class="mb-2"
          >
            Skip for now
          </v-btn>
          <v-btn 
            color="primary" 
            @click="requestLocation"
            :loading="loading"
            block
          >
            Try Again
          </v-btn>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  address: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'locationConfirmed', 'locationSkipped'])

// Reactive data
const show = ref(props.modelValue)
const currentStep = ref('question') // question, permission, loading, success, error
const loading = ref(false)
const coordinates = ref({ latitude: null, longitude: null })
const errorMessage = ref('')
const animateDialog = ref(false)

// Computed
const addressSummary = computed(() => {
  if (!props.address) return ''
  const parts = []
  if (props.address.address_line1) parts.push(props.address.address_line1)
  if (props.address.city) parts.push(props.address.city)
  if (props.address.country) parts.push(props.address.country)
  return parts.join(', ')
})

// Watch for model value changes
watch(() => props.modelValue, (newVal) => {
  show.value = newVal
  if (newVal) {
    resetDialog()
  }
})

watch(show, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    resetDialog()
  }
})

// Methods
const resetDialog = () => {
  currentStep.value = 'question'
  loading.value = false
  coordinates.value = { latitude: null, longitude: null }
  errorMessage.value = ''
  animateDialog.value = false
}

const handleNo = () => {
  console.log('LocationConfirmationDialog: handleNo clicked')
  emit('locationSkipped')
  close()
}

const handleYes = () => {
  console.log('LocationConfirmationDialog: handleYes clicked')
  currentStep.value = 'permission'
  animateDialog.value = true
}

const handleSkipLocation = () => {
  emit('locationSkipped')
  close()
}

const requestLocation = async () => {
  console.log('LocationConfirmationDialog: requestLocation clicked')
  
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by this browser')
    return
  }


  // First, check permission status if available
  if (navigator.permissions) {
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      console.log('Current permission state:', permission.state)
      
      if (permission.state === 'denied') {
        showError('Location access was previously denied. Please enable it in your browser settings and refresh the page.')
        return
      }
    } catch (error) {
      console.log('Permission API not supported, proceeding with geolocation request')
    }
  }

  currentStep.value = 'loading'
  loading.value = true

  const options = {
    enableHighAccuracy: true,
    timeout: 20000, // Increased to 20 seconds
    maximumAge: 0 // Force fresh location data
  }

  console.log('Requesting geolocation with options:', options)

  // Use Promise-based approach for better error handling
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options)
    })

    console.log('Location obtained successfully:', position.coords)
    
    // Round coordinates to match database constraints (max_digits=9, decimal_places=6)
    // This means max 3 digits before decimal, 6 digits after decimal
    const roundedLatitude = parseFloat(position.coords.latitude.toFixed(6))
    const roundedLongitude = parseFloat(position.coords.longitude.toFixed(6))
    
    console.log('Original coordinates:', {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    })
    console.log('Rounded coordinates:', {
      lat: roundedLatitude,
      lng: roundedLongitude
    })
    
    coordinates.value = {
      latitude: roundedLatitude,
      longitude: roundedLongitude,
      accuracy: position.coords.accuracy
    }
    loading.value = false
    currentStep.value = 'success'
    
    // Emit the coordinates to parent component
    emit('locationConfirmed', coordinates.value)
  } catch (error) {
    console.error('Geolocation error:', error)
    loading.value = false
    handleGeolocationError(error)
  }
}

const handleGeolocationError = (error) => {
  let message = 'Unable to get your location. '
  
  switch (error.code) {
    case error.PERMISSION_DENIED:
      message = 'Location access was denied. Please:\n\n1. Click the location icon in your browser\'s address bar\n2. Select "Allow" for location access\n3. Refresh the page and try again\n\nOr check your browser settings to enable location for this site.'
      break
    case error.POSITION_UNAVAILABLE:
      message += 'Location information is unavailable. Please check if:\n\n• Location services are enabled on your device\n• You have a stable internet connection\n• GPS is turned on (for mobile devices)'
      break
    case error.TIMEOUT:
      message += 'Location request timed out. This might be due to:\n\n• Weak GPS signal\n• Location services being disabled\n• Network connectivity issues\n\nPlease try again or move to an area with better signal.'
      break
    default:
      message += 'An unknown error occurred. Please try again or contact support if the problem persists.'
      break
  }
  
  showError(message)
}

const showError = (message) => {
  errorMessage.value = message
  currentStep.value = 'error'
}

const close = () => {
  show.value = false
}

// Expose methods if needed
defineExpose({
  resetDialog,
  close
})
</script>

<style scoped>
.location-dialog-animate {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.rotate-icon {
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.address-preview {
  border-left: 4px solid rgb(var(--v-theme-primary));
}

.benefits-list {
  max-width: 250px;
  margin: 0 auto;
}

.coordinates-info {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.error-help {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.error-help ul {
  margin: 0;
  padding-left: 20px;
}

.whitespace-pre-line {
  white-space: pre-line;
}
</style>