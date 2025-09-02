<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        custom-title="Skin Profile"
      />

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-16">
        <div class="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Loader2 class="w-10 h-10 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-xl font-semibold text-slate-800 mb-2">Loading Your Skin Profile</h3>
        <p class="text-slate-600">Please wait while we fetch your skin preferences</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-6">
        <!-- Current Profile Summary -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
          <div class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles class="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 class="text-lg font-bold text-slate-900">Your Skin Type Profile</h2>
              <p class="text-sm text-slate-600">Personalized recommendations based on your skin</p>
            </div>
          </div>

          <div v-if="!hasProfileData" class="text-center py-8">
            <div class="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <User class="w-8 h-8 text-slate-400" />
            </div>
            <p class="text-slate-600 mb-2">No skin profile data found</p>
            <p class="text-xs text-slate-500">Complete the sections below to build your profile</p>
          </div>

          <div v-else class="space-y-4">
            <!-- Skin Type -->
            <div class="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-700">Skin Type</p>
                  <p class="text-xs text-slate-500">{{ currentProfile.skin_type_detail?.name || 'Not set' }}</p>
                </div>
              </div>
            </div>

            <!-- Age Group -->
            <div v-if="currentProfile.age_group" class="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                  <Calendar class="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-700">Age Group</p>
                  <p class="text-xs text-slate-500">{{ getAgeGroupLabel(currentProfile.age_group) }}</p>
                </div>
              </div>
            </div>

            <!-- Skin Concerns -->
            <div class="p-3 bg-slate-50/50 rounded-2xl">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center">
                  <Heart class="w-4 h-4 text-red-600" />
                </div>
                <p class="text-sm font-medium text-slate-700">Skin Concerns</p>
              </div>
              <div v-if="currentProfile.skin_concerns && currentProfile.skin_concerns.length > 0" class="flex flex-wrap gap-2">
                <span 
                  v-for="concern in currentProfile.skin_concerns_detail" 
                  :key="concern.id"
                  class="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                >
                  {{ concern.name }}
                </span>
              </div>
              <p v-else class="text-xs text-slate-500">None selected</p>
            </div>

            <!-- Product Types -->
            <div class="p-3 bg-slate-50/50 rounded-2xl">
              <div class="flex items-center space-x-3 mb-2">
                <div class="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Package class="w-4 h-4 text-purple-600" />
                </div>
                <p class="text-sm font-medium text-slate-700">Product Types</p>
              </div>
              <div v-if="currentProfile.product_types && currentProfile.product_types.length > 0" class="flex flex-wrap gap-2">
                <span 
                  v-for="productType in currentProfile.product_types_detail" 
                  :key="productType.id"
                  class="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                >
                  {{ productType.name }}
                </span>
              </div>
              <p v-else class="text-xs text-slate-500">None selected</p>
            </div>
          </div>
        </div>

        <!-- Edit Sections -->
        <div class="space-y-4">
          <!-- Skin Type Section -->
          <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <User class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Skin Type</h3>
                  <p class="text-sm text-slate-600">Select your primary skin type</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'skinType' ? null : 'skinType'"
                class="px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold text-sm bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all duration-200"
              >
                {{ selectedSkinType ? 'Change' : 'Select' }}
              </button>
            </div>

            <div v-if="editSection === 'skinType'" class="space-y-4">
              <!-- Loading state for skin types -->
              <div v-if="availableSkinTypes.length === 0" class="text-center py-8">
                <Loader2 class="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p class="text-sm text-slate-600">Loading skin types...</p>
              </div>
              
              <!-- Available skin types -->
              <div v-else class="space-y-3">
                <p class="text-sm text-slate-600 mb-3">Choose your primary skin type:</p>
                <label 
                  v-for="skinType in availableSkinTypes" 
                  :key="skinType.id"
                  class="flex items-start space-x-3 p-3 border border-slate-200 rounded-2xl hover:border-blue-300 transition-colors cursor-pointer"
                  :class="{ 'border-blue-500 bg-blue-50 shadow-md': selectedSkinType === skinType.id }"
                >
                  <input 
                    type="radio" 
                    :value="skinType.id" 
                    v-model="selectedSkinType"
                    class="mt-1 w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-slate-900">{{ skinType.name }}</p>
                    <p class="text-sm text-slate-600 mt-1">{{ skinType.description }}</p>
                  </div>
                  <div v-if="selectedSkinType === skinType.id" class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check class="w-4 h-4 text-white" />
                  </div>
                </label>
              </div>
              <div class="flex space-x-3 pt-4 border-t border-slate-200">
                <button 
                  @click="saveSection('skinType')"
                  :disabled="saving"
                  class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  style="background: linear-gradient(to right, #2563eb, #4f46e5);"
                  onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
                  onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
                >
                  <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                  <Check v-else class="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Age Group Section -->
          <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Calendar class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Age Group</h3>
                  <p class="text-sm text-slate-600">Select your age range for targeted care</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'ageGroup' ? null : 'ageGroup'"
                class="px-4 py-2 text-green-600 hover:text-green-700 font-semibold text-sm bg-green-50 hover:bg-green-100 rounded-2xl transition-all duration-200"
              >
                {{ selectedAgeGroup ? 'Change' : 'Select' }}
              </button>
            </div>

            <div v-if="editSection === 'ageGroup'" class="space-y-4">
              <div class="space-y-3">
                <p class="text-sm text-slate-600 mb-3">Choose your age range for targeted care:</p>
                <label 
                  v-for="ageGroup in ageGroups" 
                  :key="ageGroup.value"
                  class="flex items-start space-x-3 p-3 border border-slate-200 rounded-2xl hover:border-green-300 transition-colors cursor-pointer"
                  :class="{ 'border-green-500 bg-green-50 shadow-md': selectedAgeGroup === ageGroup.value }"
                >
                  <input 
                    type="radio" 
                    :value="ageGroup.value" 
                    v-model="selectedAgeGroup"
                    class="mt-1 w-4 h-4 text-green-600 border-slate-300 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <p class="font-medium text-slate-900">{{ ageGroup.label }}</p>
                    <p class="text-sm text-slate-600 mt-1">{{ ageGroup.description }}</p>
                  </div>
                  <div v-if="selectedAgeGroup === ageGroup.value" class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check class="w-4 h-4 text-white" />
                  </div>
                </label>
              </div>
              <div class="flex space-x-3 pt-4 border-t border-slate-200">
                <button 
                  @click="saveSection('ageGroup')"
                  :disabled="saving"
                  class="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  style="background: linear-gradient(to right, #16a34a, #059669);"
                  onmouseover="this.style.background='linear-gradient(to right, #15803d, #047857)'"
                  onmouseout="this.style.background='linear-gradient(to right, #16a34a, #059669)'"
                >
                  <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                  <Check v-else class="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Skin Concerns Section -->
          <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center">
                  <Heart class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Skin Concerns</h3>
                  <p class="text-sm text-slate-600">Select all that apply to your skin</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'skinConcerns' ? null : 'skinConcerns'"
                class="px-4 py-2 text-red-600 hover:text-red-700 font-semibold text-sm bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-200"
              >
                {{ selectedSkinConcerns.length > 0 ? 'Edit' : 'Select' }}
              </button>
            </div>

            <div v-if="editSection === 'skinConcerns'" class="space-y-4">
              <!-- Loading state for skin concerns -->
              <div v-if="availableSkinConcerns.length === 0" class="text-center py-8">
                <Loader2 class="w-8 h-8 text-red-600 animate-spin mx-auto mb-3" />
                <p class="text-sm text-slate-600">Loading skin concerns...</p>
              </div>
              
              <!-- Available skin concerns -->
              <div v-else>
                <p class="text-sm text-slate-600 mb-3">Select all skin concerns that apply to you:</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="concern in availableSkinConcerns" 
                    :key="concern.id"
                    @click="toggleSkinConcern(concern.id)"
                    :class="[
                      'px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                      selectedSkinConcerns.includes(concern.id)
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    ]"
                  >
                    <span>{{ concern.name }}</span>
                    <Check v-if="selectedSkinConcerns.includes(concern.id)" class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-xs text-slate-500 mt-3">
                  Selected: {{ selectedSkinConcerns.length }} concern{{ selectedSkinConcerns.length !== 1 ? 's' : '' }}
                </p>
              </div>
              <div class="flex space-x-3 pt-4 border-t border-slate-200">
                <button 
                  @click="saveSection('skinConcerns')"
                  :disabled="saving"
                  class="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  style="background: linear-gradient(to right, #dc2626, #db2777);"
                  onmouseover="this.style.background='linear-gradient(to right, #b91c1c, #be185d)'"
                  onmouseout="this.style.background='linear-gradient(to right, #dc2626, #db2777)'"
                >
                  <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                  <Check v-else class="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <!-- Product Types Section -->
          <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Package class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-slate-900">Product Types</h3>
                  <p class="text-sm text-slate-600">Select products you currently use</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'productTypes' ? null : 'productTypes'"
                class="px-4 py-2 text-purple-600 hover:text-purple-700 font-semibold text-sm bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all duration-200"
              >
                {{ selectedProductTypes.length > 0 ? 'Edit' : 'Select' }}
              </button>
            </div>

            <div v-if="editSection === 'productTypes'" class="space-y-4">
              <!-- Loading state for product types -->
              <div v-if="availableProductTypes.length === 0" class="text-center py-8">
                <Loader2 class="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
                <p class="text-sm text-slate-600">Loading product types...</p>
              </div>
              
              <!-- Available product types -->
              <div v-else>
                <p class="text-sm text-slate-600 mb-3">Select products you currently use:</p>
                <div class="flex flex-wrap gap-2">
                  <button 
                    v-for="productType in availableProductTypes" 
                    :key="productType.id"
                    @click="toggleProductType(productType.id)"
                    :class="[
                      'px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center space-x-2',
                      selectedProductTypes.includes(productType.id)
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    ]"
                  >
                    <span>{{ productType.name }}</span>
                    <Check v-if="selectedProductTypes.includes(productType.id)" class="w-4 h-4" />
                  </button>
                </div>
                <p class="text-xs text-slate-500 mt-3">
                  Selected: {{ selectedProductTypes.length }} product type{{ selectedProductTypes.length !== 1 ? 's' : '' }}
                </p>
              </div>
              <div class="flex space-x-3 pt-4 border-t border-slate-200">
                <button 
                  @click="saveSection('productTypes')"
                  :disabled="saving"
                  class="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                  style="background: linear-gradient(to right, #9333ea, #4f46e5);"
                  onmouseover="this.style.background='linear-gradient(to right, #7c3aed, #4338ca)'"
                  onmouseout="this.style.background='linear-gradient(to right, #9333ea, #4f46e5)'"
                >
                  <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                  <Check v-else class="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import AppHeader from '@/components/AppHeader.vue'
import { 
  Sparkles, User, Calendar, Heart, Package, Loader2, Check, X, 
  CheckCircle, AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const editSection = ref(null)

// Current profile data
const currentProfile = ref({})

// Available options
const availableSkinTypes = ref([])
const availableSkinConcerns = ref([])
const availableProductTypes = ref([])

// Selected values (for editing)
const selectedSkinType = ref(null)
const selectedAgeGroup = ref(null)
const selectedSkinConcerns = ref([])
const selectedProductTypes = ref([])

// Original values (to track changes)
const originalSkinType = ref(null)
const originalAgeGroup = ref(null)
const originalSkinConcerns = ref([])
const originalProductTypes = ref([])

// Messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Age groups (same as in ShopperGoals)
const ageGroups = ref([
  {
    value: 'under_18',
    label: 'Under 18',
    description: 'Young skin with natural glow'
  },
  {
    value: '18_25',
    label: '18-25',
    description: 'Prevention and maintenance'
  },
  {
    value: '26_35',
    label: '26-35',
    description: 'Early anti-aging care'
  },
  {
    value: '36_45',
    label: '36-45',
    description: 'Targeted anti-aging'
  },
  {
    value: '46_plus',
    label: '46+',
    description: 'Mature skin care'
  }
])

// Computed properties
const hasProfileData = computed(() => {
  return currentProfile.value.skin_type ||
    (currentProfile.value.skin_concerns && currentProfile.value.skin_concerns.length > 0) ||
    (currentProfile.value.product_types && currentProfile.value.product_types.length > 0) ||
    currentProfile.value.age_group
})

const hasChanges = computed(() => {
  return selectedSkinType.value !== originalSkinType.value ||
    selectedAgeGroup.value !== originalAgeGroup.value ||
    !arraysEqual(selectedSkinConcerns.value, originalSkinConcerns.value) ||
    !arraysEqual(selectedProductTypes.value, originalProductTypes.value)
})

// Helper functions
const getAgeGroupLabel = (value) => {
  const ageGroup = ageGroups.value.find(ag => ag.value === value)
  return ageGroup ? ageGroup.label : value
}

const arraysEqual = (a, b) => {
  if (a.length !== b.length) return false
  return a.every(val => b.includes(val)) && b.every(val => a.includes(val))
}

// Toggle functions
const toggleSkinConcern = (id) => {
  const index = selectedSkinConcerns.value.indexOf(id)
  if (index > -1) {
    selectedSkinConcerns.value.splice(index, 1)
  } else {
    selectedSkinConcerns.value.push(id)
  }
}

const toggleProductType = (id) => {
  const index = selectedProductTypes.value.indexOf(id)
  if (index > -1) {
    selectedProductTypes.value.splice(index, 1)
  } else {
    selectedProductTypes.value.push(id)
  }
}

// Data fetching
const fetchProfileData = async () => {
  try {
    const response = await apiService.getProfile()
    currentProfile.value = response.data

    // Debug: Log the profile data structure
    console.log('Profile data received:', currentProfile.value)

    // Set current selections - ensure arrays are properly initialized
    selectedSkinType.value = currentProfile.value.skin_type?.id || null
    selectedAgeGroup.value = currentProfile.value.age_group || null
    selectedSkinConcerns.value = (currentProfile.value.skin_concerns || []).map(c => c?.id).filter(id => id != null)
    selectedProductTypes.value = (currentProfile.value.product_types || []).map(p => p?.id).filter(id => id != null)

    // Debug: Log the selected values
    console.log('Selected values:', {
      skinType: selectedSkinType.value,
      ageGroup: selectedAgeGroup.value,
      skinConcerns: selectedSkinConcerns.value,
      productTypes: selectedProductTypes.value
    })

    // Store original values
    originalSkinType.value = selectedSkinType.value
    originalAgeGroup.value = selectedAgeGroup.value
    originalSkinConcerns.value = [...selectedSkinConcerns.value]
    originalProductTypes.value = [...selectedProductTypes.value]
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
    showError('Failed to load profile data')
  }
}

const fetchOptions = async () => {
  try {
    console.log('Fetching skin profile options...')
    
    // Debug: Check authentication state
    console.log('Auth state:', {
      isAuthenticated: auth.isAuthenticated,
      hasAccessToken: !!auth.accessToken,
      user: auth.user
    })
    
    // Debug: Check localStorage tokens
    const accessToken = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')
    console.log('LocalStorage tokens:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      accessTokenLength: accessToken?.length
    })
    
    // Note: API endpoints for skin types, concerns, product types no longer exist
    const [skinTypesRes, skinConcernsRes, productTypesRes] = await Promise.all([
      Promise.resolve({ data: [] }),
      Promise.resolve({ data: [] }),
      Promise.resolve({ data: [] })
    ])

    console.log('Skin types response:', skinTypesRes)
    console.log('Skin concerns response:', skinConcernsRes)
    console.log('Product types response:', productTypesRes)

    availableSkinTypes.value = skinTypesRes.data.results || skinTypesRes.data || []
    availableSkinConcerns.value = skinConcernsRes.data.results || skinConcernsRes.data || []
    availableProductTypes.value = productTypesRes.data.results || productTypesRes.data || []

    console.log('Available options loaded:', {
      skinTypes: availableSkinTypes.value.length,
      skinConcerns: availableSkinConcerns.value.length,
      productTypes: availableProductTypes.value.length
    })
  } catch (error) {
    console.error('Failed to fetch options:', error)
    showError('Failed to load options')
  }
}

// Save functions
const saveSection = async (section) => {
  saving.value = true
  try {
    let updateData = {}

    switch (section) {
      case 'skinType':
        updateData.skin_type = selectedSkinType.value
        break
      case 'ageGroup':
        updateData.age_group = selectedAgeGroup.value
        break
      case 'skinConcerns':
        // Filter out null/undefined values and ensure we have valid IDs
        updateData.skin_concerns = selectedSkinConcerns.value.filter(id => id != null && id !== undefined)
        break
      case 'productTypes':
        // Filter out null/undefined values and ensure we have valid IDs
        updateData.product_types = selectedProductTypes.value.filter(id => id != null && id !== undefined)
        break
    }

    // Debug: Log the data being sent to API
    console.log('Sending update data:', updateData)

    await apiService.updateProfile(updateData)

    // Refresh profile data
    await fetchProfileData()

    // Refresh auth store
    await auth.fetchUserData()

    editSection.value = null
    showSuccess(`${section === 'skinType' ? 'Skin type' :
      section === 'ageGroup' ? 'Age group' :
        section === 'skinConcerns' ? 'Skin concerns' :
          'Product types'} updated successfully`)
  } catch (error) {
    console.error('Failed to save section:', error)
    showError('Failed to save changes')
  } finally {
    saving.value = false
  }
}

const saveAllChanges = async () => {
  saving.value = true
  try {
    const updateData = {
      skin_type: selectedSkinType.value,
      age_group: selectedAgeGroup.value,
      skin_concerns: selectedSkinConcerns.value.filter(id => id != null && id !== undefined),
      product_types: selectedProductTypes.value.filter(id => id != null && id !== undefined)
    }

    await apiService.updateProfile(updateData)

    // Refresh profile data
    await fetchProfileData()

    // Refresh auth store
    await auth.fetchUserData()

    editSection.value = null
    showSuccess('Skin profile updated successfully')
  } catch (error) {
    console.error('Failed to save all changes:', error)
    showError('Failed to save changes')
  } finally {
    saving.value = false
  }
}

// Message functions
const showSuccess = (message) => {
  successMessage.value = message
  showSuccessMessage.value = true
  setTimeout(() => {
    showSuccessMessage.value = false
  }, 3000)
}

const showError = (message) => {
  errorMessage.value = message
  showErrorMessage.value = true
  setTimeout(() => {
    showErrorMessage.value = false
  }, 5000)
}

// Initialize
onMounted(async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchProfileData(),
      fetchOptions()
    ])
  } catch (error) {
    console.error('Failed to initialize skin profile page:', error)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* Additional styles if needed */
</style>