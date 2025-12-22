<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader :title="$t('profile.skin_profile_page.title')" />
    <div class="p-3 pt-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-sm font-semibold text-gray-800 mb-1">{{ $t('profile.skin_profile_page.loading') }}</h3>
        <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.loading_subtitle') }}</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-2">
        <!-- Current Profile Summary -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div class="flex items-center space-x-2 mb-3">
            <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Sparkles class="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h2 class="text-sm font-bold text-gray-900">{{ $t('profile.skin_profile_page.your_skin_type_profile') }}</h2>
              <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.personalized_recommendations') }}</p>
            </div>
          </div>

          <div v-if="!hasProfileData" class="text-center py-6">
            <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User class="w-6 h-6 text-gray-400" />
            </div>
            <p class="text-xs text-gray-600 mb-1">{{ $t('profile.skin_profile_page.no_profile_data') }}</p>
            <p class="text-xs text-gray-500">{{ $t('profile.skin_profile_page.complete_sections') }}</p>
          </div>

          <div v-else class="space-y-2">
            <!-- Skin Type -->
            <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User class="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-700">{{ $t('profile.skin_profile_page.skin_type') }}</p>
                  <p class="text-xs text-gray-500">{{ currentProfile.skin_type_detail?.name || $t('profile.skin_profile_page.not_set') }}</p>
                </div>
              </div>
            </div>

            <!-- Age Group -->
            <div v-if="currentProfile.age_group" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar class="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-700">{{ $t('profile.skin_profile_page.age_group') }}</p>
                  <p class="text-xs text-gray-500">{{ getAgeGroupLabel(currentProfile.age_group) }}</p>
                </div>
              </div>
            </div>

            <!-- Skin Concerns -->
            <div class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-1.5">
                <div class="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart class="w-3 h-3 text-red-600" />
                </div>
                <p class="text-xs font-medium text-gray-700">{{ $t('profile.skin_profile_page.skin_concerns') }}</p>
              </div>
              <div v-if="currentProfile.skin_concerns && currentProfile.skin_concerns.length > 0" class="flex flex-wrap gap-1.5">
                <span 
                  v-for="concern in currentProfile.skin_concerns_detail" 
                  :key="concern.id"
                  class="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full"
                >
                  {{ concern.name }}
                </span>
              </div>
              <p v-else class="text-xs text-gray-500">{{ $t('profile.skin_profile_page.none_selected') }}</p>
            </div>

            <!-- Product Types -->
            <div class="p-2 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-2 mb-1.5">
                <div class="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package class="w-3 h-3 text-purple-600" />
                </div>
                <p class="text-xs font-medium text-gray-700">{{ $t('profile.skin_profile_page.product_types') }}</p>
              </div>
              <div v-if="currentProfile.product_types && currentProfile.product_types.length > 0" class="flex flex-wrap gap-1.5">
                <span 
                  v-for="productType in currentProfile.product_types_detail" 
                  :key="productType.id"
                  class="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full"
                >
                  {{ productType.name }}
                </span>
              </div>
              <p v-else class="text-xs text-gray-500">{{ $t('profile.skin_profile_page.none_selected') }}</p>
            </div>
          </div>
        </div>

        <!-- Edit Sections -->
        <div class="space-y-2">
          <!-- Skin Type Section -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User class="w-3 h-3 text-blue-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ $t('profile.skin_profile_page.skin_type') }}</h3>
                  <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.select_primary_skin_type') }}</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'skinType' ? null : 'skinType'"
                class="px-2.5 py-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold bg-blue-50 hover:bg-blue-100 rounded-lg transition-all duration-200"
              >
                {{ selectedSkinType ? $t('profile.skin_profile_page.change') : $t('profile.skin_profile_page.select') }}
              </button>
            </div>

            <div v-if="editSection === 'skinType'" class="space-y-2.5">
              <!-- Loading state for skin types -->
              <div v-if="availableSkinTypes.length === 0" class="text-center py-6">
                <Loader2 class="w-6 h-6 text-blue-600 animate-spin mx-auto mb-2" />
                <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.loading_skin_types') }}</p>
              </div>
              
              <!-- Available skin types -->
              <div v-else class="space-y-2">
                <p class="text-xs text-gray-600 mb-2">{{ $t('profile.skin_profile_page.choose_primary_skin_type') }}</p>
                <label 
                  v-for="skinType in availableSkinTypes" 
                  :key="skinType.id"
                  class="flex items-start space-x-2 p-2 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  :class="{ 'border-blue-500 bg-blue-50': selectedSkinType === skinType.id }"
                >
                  <input 
                    type="radio" 
                    :value="skinType.id" 
                    v-model="selectedSkinType"
                    class="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-gray-900">{{ skinType.name }}</p>
                    <p class="text-xs text-gray-600 mt-0.5">{{ skinType.description }}</p>
                  </div>
                  <div v-if="selectedSkinType === skinType.id" class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check class="w-3 h-3 text-white" />
                  </div>
                </label>
              </div>
              <div class="flex space-x-2 pt-3 border-t border-gray-200">
                <button 
                  @click="saveSection('skinType')"
                  :disabled="saving"
                  class="flex-1 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                  <Check v-else class="w-3.5 h-3.5" />
                  <span>{{ $t('profile.save') }}</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {{ $t('profile.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Age Group Section -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar class="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ $t('profile.skin_profile_page.age_group') }}</h3>
                  <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.select_age_range') }}</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'ageGroup' ? null : 'ageGroup'"
                class="px-2.5 py-1.5 text-green-600 hover:text-green-700 text-xs font-semibold bg-green-50 hover:bg-green-100 rounded-lg transition-all duration-200"
              >
                {{ selectedAgeGroup ? $t('profile.skin_profile_page.change') : $t('profile.skin_profile_page.select') }}
              </button>
            </div>

            <div v-if="editSection === 'ageGroup'" class="space-y-2.5">
              <div class="space-y-2">
                <p class="text-xs text-gray-600 mb-2">{{ $t('profile.skin_profile_page.select_age_range') }}</p>
                <label 
                  v-for="ageGroup in ageGroups" 
                  :key="ageGroup.value"
                  class="flex items-start space-x-2 p-2 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer"
                  :class="{ 'border-green-500 bg-green-50': selectedAgeGroup === ageGroup.value }"
                >
                  <input 
                    type="radio" 
                    :value="ageGroup.value" 
                    v-model="selectedAgeGroup"
                    class="mt-0.5 w-3.5 h-3.5 text-green-600 border-gray-300 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <p class="text-xs font-medium text-gray-900">{{ ageGroup.label }}</p>
                    <p class="text-xs text-gray-600 mt-0.5">{{ ageGroup.description }}</p>
                  </div>
                  <div v-if="selectedAgeGroup === ageGroup.value" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check class="w-3 h-3 text-white" />
                  </div>
                </label>
              </div>
              <div class="flex space-x-2 pt-3 border-t border-gray-200">
                <button 
                  @click="saveSection('ageGroup')"
                  :disabled="saving"
                  class="flex-1 py-2 bg-green-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                  <Check v-else class="w-3.5 h-3.5" />
                  <span>{{ $t('profile.save') }}</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {{ $t('profile.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Skin Concerns Section -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart class="w-3 h-3 text-red-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ $t('profile.skin_profile_page.skin_concerns') }}</h3>
                  <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.select_all_that_apply') }}</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'skinConcerns' ? null : 'skinConcerns'"
                class="px-2.5 py-1.5 text-red-600 hover:text-red-700 text-xs font-semibold bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200"
              >
                {{ selectedSkinConcerns.length > 0 ? $t('profile.skin_profile_page.edit') : $t('profile.skin_profile_page.select') }}
              </button>
            </div>

            <div v-if="editSection === 'skinConcerns'" class="space-y-2.5">
              <!-- Loading state for skin concerns -->
              <div v-if="availableSkinConcerns.length === 0" class="text-center py-6">
                <Loader2 class="w-6 h-6 text-red-600 animate-spin mx-auto mb-2" />
                <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.loading_skin_concerns') }}</p>
              </div>
              
              <!-- Available skin concerns -->
              <div v-else>
                <p class="text-xs text-gray-600 mb-2">{{ $t('profile.skin_profile_page.select_all_skin_concerns') }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <button 
                    v-for="concern in availableSkinConcerns" 
                    :key="concern.id"
                    @click="toggleSkinConcern(concern.id)"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5',
                      selectedSkinConcerns.includes(concern.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <span>{{ concern.name }}</span>
                    <Check v-if="selectedSkinConcerns.includes(concern.id)" class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  {{ $t('profile.skin_profile_page.selected') }}: {{ selectedSkinConcerns.length }} {{ selectedSkinConcerns.length !== 1 ? $t('profile.skin_profile_page.concerns') : $t('profile.skin_profile_page.concern') }}
                </p>
              </div>
              <div class="flex space-x-2 pt-3 border-t border-gray-200">
                <button 
                  @click="saveSection('skinConcerns')"
                  :disabled="saving"
                  class="flex-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                  <Check v-else class="w-3.5 h-3.5" />
                  <span>{{ $t('profile.save') }}</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {{ $t('profile.cancel') }}
                </button>
              </div>
            </div>
          </div>

          <!-- Product Types Section -->
          <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package class="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">{{ $t('profile.skin_profile_page.product_types') }}</h3>
                  <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.select_products_you_use') }}</p>
                </div>
              </div>
              <button 
                @click="editSection = editSection === 'productTypes' ? null : 'productTypes'"
                class="px-2.5 py-1.5 text-purple-600 hover:text-purple-700 text-xs font-semibold bg-purple-50 hover:bg-purple-100 rounded-lg transition-all duration-200"
              >
                {{ selectedProductTypes.length > 0 ? $t('profile.skin_profile_page.edit') : $t('profile.skin_profile_page.select') }}
              </button>
            </div>

            <div v-if="editSection === 'productTypes'" class="space-y-2.5">
              <!-- Loading state for product types -->
              <div v-if="availableProductTypes.length === 0" class="text-center py-6">
                <Loader2 class="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_page.loading_product_types') }}</p>
              </div>
              
              <!-- Available product types -->
              <div v-else>
                <p class="text-xs text-gray-600 mb-2">{{ $t('profile.skin_profile_page.select_products_you_use') }}</p>
                <div class="flex flex-wrap gap-1.5">
                  <button 
                    v-for="productType in availableProductTypes" 
                    :key="productType.id"
                    @click="toggleProductType(productType.id)"
                    :class="[
                      'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5',
                      selectedProductTypes.includes(productType.id)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    ]"
                  >
                    <span>{{ productType.name }}</span>
                    <Check v-if="selectedProductTypes.includes(productType.id)" class="w-3 h-3" />
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  {{ $t('profile.skin_profile_page.selected') }}: {{ selectedProductTypes.length }} {{ selectedProductTypes.length !== 1 ? $t('profile.skin_profile_page.product_types_plural') : $t('profile.skin_profile_page.product_type') }}
                </p>
              </div>
              <div class="flex space-x-2 pt-3 border-t border-gray-200">
                <button 
                  @click="saveSection('productTypes')"
                  :disabled="saving"
                  class="flex-1 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
                >
                  <Loader2 v-if="saving" class="w-3.5 h-3.5 animate-spin" />
                  <Check v-else class="w-3.5 h-3.5" />
                  <span>{{ $t('profile.save') }}</span>
                </button>
                <button 
                  @click="editSection = null"
                  class="flex-1 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                >
                  {{ $t('profile.cancel') }}
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
import { 
  Sparkles, User, Calendar, Heart, Package, Loader2, Check, X, 
  CheckCircle, AlertCircle
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
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
    showError(t('profile.skin_profile_page.failed_to_load'))
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
    showError(t('profile.skin_profile_page.failed_to_load_options'))
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
    const sectionNames = {
      skinType: t('profile.skin_profile_page.skin_type_updated'),
      ageGroup: t('profile.skin_profile_page.age_group_updated'),
      skinConcerns: t('profile.skin_profile_page.skin_concerns_updated'),
      productTypes: t('profile.skin_profile_page.product_types_updated')
    }
    showSuccess(sectionNames[section] || t('profile.skin_profile_page.profile_updated'))
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
    showSuccess(t('profile.skin_profile_page.profile_updated'))
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