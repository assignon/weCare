<template>
  <div 
    v-if="show" 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
    :class="{ 'animate-in': animateDialog }"
  >
    <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Initial Question Step -->
      <div v-if="currentStep === 'question'" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4" style="background: linear-gradient(to right, #2563eb, #9333ea);">
            <MapPin class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Location Confirmation</h3>
        </div>
        
        <div class="text-center mb-6">
          <p class="text-gray-700 mb-4">
            Are you currently at this address right now?
          </p>
          <div class="p-4 bg-gray-50 rounded-2xl border-l-4 border-blue-500">
            <div class="flex items-center text-gray-700">
              <MapPin class="w-4 h-4 mr-2 text-blue-600" />
              <span class="text-sm">{{ addressSummary }}</span>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            This helps us provide better delivery services
          </p>
        </div>
        
        <div class="space-y-3">
          <button 
              @click="handleNo"
              :disabled="loading"
            class="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              No, I'm not there
          </button>
          <button 
              @click="handleYes"
              :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
              Yes, I'm here now
          </button>
          </div>
      </div>
      
      <!-- Location Permission Step -->
      <div v-else-if="currentStep === 'permission'" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crosshair class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Location Access</h3>
        </div>
        
        <div class="text-center mb-6">
          <p class="text-gray-700 mb-4">
            We need access to your location to save precise GPS coordinates for this address.
          </p>
          <div class="text-left mb-4 max-w-xs mx-auto">
            <div class="flex items-center mb-2">
              <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
              <span class="text-sm text-gray-700">Faster delivery location</span>
            </div>
            <div class="flex items-center mb-2">
              <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
              <span class="text-sm text-gray-700">More accurate address</span>
            </div>
            <div class="flex items-center">
              <CheckCircle class="w-4 h-4 text-green-600 mr-2" />
              <span class="text-sm text-gray-700">Better driver navigation</span>
            </div>
          </div>
          <p class="text-xs text-gray-500">
            Your location data is only used for delivery purposes
          </p>
        </div>
        
        <div class="space-y-3">
          <button 
              @click="handleSkipLocation"
              :disabled="loading"
            class="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Skip for now
          </button>
          <button 
              @click="requestLocation"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
            >
            <Crosshair class="w-4 h-4 mr-2" />
            <span v-if="loading">Getting Location...</span>
            <span v-else>Grant Location Access</span>
          </button>
          <p class="text-xs text-gray-500 text-center">
              👆 Clicking this button will prompt your browser to request location permission
            </p>
          </div>
      </div>
      
      <!-- Loading Step -->
      <div v-else-if="currentStep === 'loading'" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin" style="background: linear-gradient(to right, #2563eb, #9333ea);">
            <Crosshair class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Getting Your Location</h3>
        </div>
        
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-700 mb-2">
            Please wait while we get your GPS coordinates...
          </p>
          <p class="text-xs text-gray-500">
            Make sure location services are enabled
          </p>
        </div>
      </div>
      
      <!-- Success Step -->
      <div v-else-if="currentStep === 'success'" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Location Saved</h3>
        </div>
        
        <div class="text-center mb-6">
          <p class="text-gray-700 mb-4">
            Great! Your GPS coordinates have been saved.
          </p>
          <div class="p-4 bg-green-50 rounded-2xl border-l-4 border-green-500">
            <div class="text-sm text-gray-700 mb-1">
              <strong>Latitude:</strong> {{ coordinates.latitude?.toFixed(6) }}
            </div>
            <div class="text-sm text-gray-700">
              <strong>Longitude:</strong> {{ coordinates.longitude?.toFixed(6) }}
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            This will help our drivers find you more easily
          </p>
        </div>
        
        <button 
            @click="close"
          class="w-full py-4 bg-green-500 text-white font-semibold rounded-2xl hover:bg-green-600 transition-all duration-200"
          >
            Continue
        </button>
      </div>
      
      <!-- Error Step -->
      <div v-else-if="currentStep === 'error'" class="p-6">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle class="w-8 h-8 text-white" />
          </div>
          <h3 class="text-xl font-bold text-gray-900">Location Error</h3>
        </div>
        
        <div class="text-center mb-6">
          <p class="text-sm text-gray-700 mb-4 text-left whitespace-pre-line">
            {{ errorMessage }}
          </p>
        </div>
        
        <div class="space-y-3">
          <button 
            @click="handleSkipLocation"
            class="w-full py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
          >
            Skip for now
          </button>
          <button 
            @click="requestLocation"
            :disabled="loading"
            class="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            style="background: linear-gradient(to right, #2563eb, #9333ea);"
          >
            <span v-if="loading">Getting Location...</span>
            <span v-else>Try Again</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { 
  MapPin, Crosshair, CheckCircle, AlertCircle 
} from 'lucide-vue-next'

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
.animate-in {
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