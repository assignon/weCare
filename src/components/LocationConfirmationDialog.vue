<template>
  <div 
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    :class="{ 'location-dialog-animate': animateDialog }"
  >
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
      <!-- Initial Question Step -->
      <div v-if="currentStep === 'question'">
        <div class="text-center p-6">
          <MapPin class="w-12 h-12 text-primary mx-auto mb-3" />
          <h2 class="text-xl font-semibold mb-6">Location Confirmation</h2>
          
          <p class="text-base mb-4">
            Are you currently at this address right now?
          </p>
          <div class="bg-gray-100 p-3 rounded-lg border-l-4 border-primary mb-4">
            <div class="flex items-center">
              <MapPin class="w-4 h-4 mr-2 text-gray-600" />
              <span class="text-sm">{{ addressSummary }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">
            This helps us provide better delivery services
          </p>
          
          <div class="space-y-3">
            <button 
              class="btn-outline w-full py-3 text-base"
              @click="handleNo"
              :disabled="loading"
            >
              No, I'm not there
            </button>
            <button 
              class="btn-primary w-full py-3 text-base"
              @click="handleYes"
              :disabled="loading"
            >
              Yes, I'm here now
            </button>
          </div>
        </div>
      </div>
      
      <!-- Location Permission Step -->
      <div v-else-if="currentStep === 'permission'">
        <div class="text-center p-6">
          <Crosshair class="w-12 h-12 text-orange-500 mx-auto mb-3" />
          <h2 class="text-xl font-semibold mb-6">Location Access</h2>
          
          <p class="text-base mb-4">
            We need access to your location to save precise GPS coordinates for this address.
          </p>
          <div class="max-w-xs mx-auto text-left mb-4 space-y-2">
            <div class="flex items-center">
              <CheckCircle class="w-4 h-4 text-success mr-2 flex-shrink-0" />
              <span class="text-sm">Faster delivery location</span>
            </div>
            <div class="flex items-center">
              <CheckCircle class="w-4 h-4 text-success mr-2 flex-shrink-0" />
              <span class="text-sm">More accurate address</span>
            </div>
            <div class="flex items-center">
              <CheckCircle class="w-4 h-4 text-success mr-2 flex-shrink-0" />
              <span class="text-sm">Better driver navigation</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">
            Your location data is only used for delivery purposes
          </p>
          
          <div class="space-y-3">
            <button 
              class="btn-outline w-full py-3 text-base"
              @click="handleSkipLocation"
              :disabled="loading"
            >
              Skip for now
            </button>
            <button 
              class="btn-primary w-full py-3 text-base flex items-center justify-center"
              @click="requestLocation"
              :disabled="loading"
            >
              <Crosshair v-if="!loading" class="w-4 h-4 mr-2" />
              <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ loading ? 'Getting Location...' : 'Grant Location Access' }}
            </button>
            <p class="text-xs text-gray-500 text-center">
              👆 Clicking this button will prompt your browser to request location permission
            </p>
          </div>
        </div>
      </div>
      
      <!-- Loading Step -->
      <div v-else-if="currentStep === 'loading'">
        <div class="text-center p-6">
          <div class="relative">
            <Crosshair class="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
          </div>
          <h2 class="text-xl font-semibold mb-6">Getting Your Location</h2>
          
          <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-sm mb-2">
            Please wait while we get your GPS coordinates...
          </p>
          <p class="text-xs text-gray-500">
            Make sure location services are enabled
          </p>
        </div>
      </div>
      
      <!-- Success Step -->
      <div v-else-if="currentStep === 'success'">
        <div class="text-center p-6">
          <CheckCircle class="w-12 h-12 text-success mx-auto mb-3" />
          <h2 class="text-xl font-semibold mb-6">Location Saved</h2>
          
          <p class="text-base mb-4">
            Great! Your GPS coordinates have been saved.
          </p>
          <div class="bg-green-50 p-3 rounded-lg border-l-4 border-success mb-4">
            <div class="text-sm mb-1">
              <strong>Latitude:</strong> {{ coordinates.latitude ? coordinates.latitude.toFixed(6) : 'N/A' }}
            </div>
            <div class="text-sm">
              <strong>Longitude:</strong> {{ coordinates.longitude ? coordinates.longitude.toFixed(6) : 'N/A' }}
            </div>
          </div>
          <p class="text-xs text-gray-500 mb-6">
            This will help our drivers find you more easily
          </p>
          
          <button 
            class="btn-success w-full py-3 text-base"
            @click="close"
          >
            Continue
          </button>
        </div>
      </div>
      
      <!-- Error Step -->
      <div v-else-if="currentStep === 'error'">
        <div class="text-center p-6">
          <AlertCircle class="w-12 h-12 text-error mx-auto mb-3" />
          <h2 class="text-xl font-semibold mb-6">Location Error</h2>
          
          <div class="text-sm mb-4 text-left whitespace-pre-line bg-red-50 p-3 rounded-lg border-l-4 border-error">
            {{ errorMessage }}
          </div>
          
          <div class="space-y-3">
            <button 
              class="btn-outline w-full py-3 text-base"
              @click="handleSkipLocation"
            >
              Skip for now
            </button>
            <button 
              class="btn-primary w-full py-3 text-base flex items-center justify-center"
              @click="requestLocation"
              :disabled="loading"
            >
              <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { MapPin, Crosshair, CheckCircle, AlertCircle } from 'lucide-vue-next'

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
  if (!props.address || typeof props.address !== 'object') return ''
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

.whitespace-pre-line {
  white-space: pre-line;
}
</style>