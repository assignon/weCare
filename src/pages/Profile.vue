<template>
  <div class="min-h-screen bg-white pb-24">
    <div class="p-3 pt-4">

      <!-- Profile Summary Card -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div class="flex items-center space-x-3">
          <!-- Profile Avatar -->
          <div class="relative">
            <div class="w-14 h-14 rounded-lg overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
              <img 
                v-if="user && user.profile_picture" 
                :src="user.profile_picture" 
                :alt="user.first_name || user.email"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-lg font-bold text-gray-700">{{ userInitials }}</span>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
              <Camera class="w-2 h-2 text-white" />
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <h2 class="text-sm font-bold text-gray-900 truncate">
              {{ user.first_name || user.last_name || user.email }}
            </h2>
            <p class="text-xs text-gray-600">@{{ userHandle }}</p>
            <div class="flex items-center space-x-1 mt-1">
              <div class="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span class="text-xs text-gray-500">{{ $t('profile.active') }}</span>
            </div>
          </div>

          <!-- Edit Profile Button -->
          <button 
            @click="$router.push({ name: 'EditProfile' })"
            class="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center space-x-1.5 flex-shrink-0"
          >
            <Edit3 class="w-3 h-3" />
            <span>{{ $t('profile.edit') }}</span>
          </button>
        </div>
      </div>

      <!-- Profile Menu -->
      <div class="space-y-2">
        <!-- Profile Settings Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-2.5 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.profile_settings') }}</h3>
          </div>
          
          <!-- Edit Profile -->
          <button 
            @click="$router.push({ name: 'EditProfile' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <User class="w-4 h-4 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.edit_profile') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.edit_profile_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <!-- Skin Profile -->
          <button 
            @click="$router.push({ name: 'SkinProfile' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles class="w-4 h-4 text-purple-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.skin_profile') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.skin_profile_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <!-- Addresses -->
          <button 
            @click="$router.push({ name: 'Addresses' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin class="w-4 h-4 text-green-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.addresses') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.addresses_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        <!-- Marketplace Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-2.5 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.marketplace') }}</h3>
          </div>
          
          <!-- My Listings -->
          <button 
            @click="$router.push({ name: 'MyListings' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package class="w-4 h-4 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.my_listings') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.my_listings_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <!-- Listing Inquiries -->
          <button 
            @click="$router.push({ name: 'ListingInquiries' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle class="w-4 h-4 text-green-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.inquiries') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.inquiries_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        <!-- Preferences Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-2.5 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.preferences') }}</h3>
          </div>
          
          <!-- Language -->
          <button 
            @click="showLanguageDialog = true"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe class="w-4 h-4 text-orange-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.language') }}</p>
                <p class="text-xs text-gray-600">{{ currentLanguageName }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>

          <!-- Default Store (Store Category) -->
          <button 
            @click="openDefaultStoreDialog"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors border-t border-gray-100"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Store class="w-4 h-4 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.default_store') }}</p>
                <p class="text-xs text-gray-600">{{ defaultStoreLabel }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        <!-- Support Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-2.5 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.support') }}</h3>
          </div>
          
          <!-- Customer Support -->
          <button 
            @click="$router.push({ name: 'CustomerSupport' })"
            class="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Headphones class="w-4 h-4 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-gray-900">{{ $t('profile.customer_support') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.customer_support_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>

        <!-- Account Section -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-2.5 border-b border-gray-100">
            <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.account') }}</h3>
          </div>
          
          <!-- Logout -->
          <button 
            @click="confirmLogout"
            class="w-full p-3 flex items-center justify-between hover:bg-red-50 transition-colors"
          >
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <LogOut class="w-4 h-4 text-red-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-semibold text-red-600">{{ $t('profile.log_out') }}</p>
                <p class="text-xs text-gray-600">{{ $t('profile.log_out_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-4 h-4 text-red-400 flex-shrink-0" />
          </button>
        </div>
      </div>

      <!-- Language Selection Dialog -->
      <div 
        v-if="showLanguageDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showLanguageDialog = false"
      >
        <div 
          class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Globe class="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">{{ $t('profile.select_language') }}</h3>
              <p class="text-gray-600 text-xs">{{ $t('profile.current') }}: {{ currentLanguageName }}</p>
            </div>
          </div>

          <div v-if="loadingLanguages" class="text-center py-6">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <p class="text-xs text-gray-600">{{ $t('profile.loading_languages') }}</p>
          </div>

          <div v-else class="space-y-2 max-h-64 overflow-y-auto">
            <label 
              v-for="lang in languages" 
              :key="lang.id"
              class="flex items-center p-2.5 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <input 
                type="radio" 
                :value="lang.id" 
                v-model="selectedLanguage"
                class="w-3.5 h-3.5 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span class="ml-2.5 text-xs font-medium text-gray-900">{{ lang.name }}</span>
            </label>
          </div>

          <div class="flex space-x-2 mt-4">
            <button 
              @click="showLanguageDialog = false"
              class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              @click="changeLanguage"
              :disabled="loadingLanguages"
              class="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1.5"
            >
              <Loader2 v-if="loadingLanguages" class="w-3.5 h-3.5 animate-spin" />
              <Check v-else class="w-3.5 h-3.5" />
              <span>{{ $t('profile.save') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Default Store Selection Dialog -->
      <div 
        v-if="showDefaultStoreDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showDefaultStoreDialog = false"
      >
        <div 
          class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <Store class="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">{{ $t('profile.select_default_store') }}</h3>
              <p class="text-gray-600 text-xs">{{ $t('profile.choose_preferred_category') }}</p>
            </div>
          </div>

          <div v-if="loadingStoreCategories" class="text-center py-6">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Loader2 class="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <p class="text-xs text-gray-600">{{ $t('profile.loading_store_categories') }}</p>
          </div>

          <div v-else class="flex flex-wrap gap-1.5 max-h-64 overflow-y-auto">
            <button
              v-for="cat in storeCategories"
              :key="cat.id"
              @click="setDefaultStore(cat.id)"
              class="px-3 py-1.5 rounded-full border text-xs"
              :class="String(cat.id) === String(defaultStoreId) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-gray-200 text-gray-800'"
            >
              {{ cat.name }}
            </button>
          </div>

          <div class="flex space-x-2 mt-4">
            <button 
              @click="showDefaultStoreDialog = false"
              class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              {{ $t('profile.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Logout Confirmation Dialog -->
      <div 
        v-if="showLogoutDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click="showLogoutDialog = false"
      >
        <div 
          class="bg-white rounded-lg p-5 max-w-md w-full shadow-xl"
          @click.stop
        >
          <div class="flex items-center mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <LogOut class="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 class="text-base font-bold text-gray-900">{{ $t('profile.log_out_confirm') }}</h3>
              <p class="text-gray-600 text-xs">{{ $t('profile.log_out_confirm_message') }}</p>
            </div>
          </div>

          <div class="flex space-x-2">
            <button 
              @click="showLogoutDialog = false"
              class="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              @click="logout"
              class="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center space-x-1.5"
            >
              <LogOut class="w-3.5 h-3.5" />
              <span>{{ $t('profile.log_out') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <BottomNavigation />
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/services/api'
import BottomNavigation from '@/components/BottomNavigation.vue'
import { 
  User, Edit3, Sparkles, MapPin, Globe, LogOut, ChevronRight, 
  Camera, Loader2, Check, Store, Headphones, Package, MessageCircle
} from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()
const { t } = useI18n()
const user = auth.user

// Dialog states
const showLanguageDialog = ref(false)
const showLogoutDialog = ref(false)
const selectedLanguage = ref('')
const languages = ref([])
const loadingLanguages = ref(false)

// Default store selection state
const showDefaultStoreDialog = ref(false)
const storeCategories = ref([])
const loadingStoreCategories = ref(false)
const defaultStoreId = ref(sessionStorage.getItem('defaultStore') || '')

// Skin profile states
const loadingProfile = ref(false)
const profileData = ref({})

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

// Computed properties for user info
const userInitials = computed(() => {
  if (!user) return '?'

  const name = user.name || user.full_name || user.email || ''
  return name.split(' ').map(n => n[0]?.toUpperCase() || '').join('').substring(0, 2)
})

const userHandle = computed(() => {
  if (!user) return 'user'
  return user.username || user.email?.split('@')[0] || 'user'
})

const currentLanguageName = computed(() => {
  if (!user?.default_language) return 'English'
  return user.default_language.name
})

const defaultStoreLabel = computed(() => {
  const currentId = String(defaultStoreId.value || '')
  const found = storeCategories.value.find(c => String(c.id) === currentId)
  if (found) return found.name
  if (!currentId) return t('profile.not_set')
  return `Category #${currentId}`
})

const hasProfileData = computed(() => {
  return profileData.value.skin_type ||
    (profileData.value.skin_concerns && profileData.value.skin_concerns.length > 0) ||
    (profileData.value.product_types && profileData.value.product_types.length > 0) ||
    profileData.value.age_group
})

// Helper function to get age group label
const getAgeGroupLabel = (value) => {
  const ageGroup = ageGroups.value.find(ag => ag.value === value)
  return ageGroup ? ageGroup.label : value
}

// Load profile data
const fetchProfileData = async () => {
  loadingProfile.value = true
  try {
    const response = await apiService.getProfile()
    profileData.value = response.data
  } catch (error) {
    console.error('Failed to fetch profile data:', error)
  } finally {
    loadingProfile.value = false
  }
}

// Load languages on mount
onMounted(async () => {
  await Promise.all([
    fetchLanguages(),
    fetchProfileData(),
    ensureStoreCategories()
  ])

  // Set current language as selected
  if (user?.default_language) {
    selectedLanguage.value = user.default_language.id
  }
})

// Fetch available languages
const fetchLanguages = async () => {
  loadingLanguages.value = true
  try {
    const response = await apiService.getLanguages()
    languages.value = response.data.results || response.data || []

    // If no current language is set, default to English
    if (!selectedLanguage.value && languages.value.length > 0) {
      const english = languages.value.find(lang => lang.code === 'en')
      if (english) {
        selectedLanguage.value = english.id
      } else {
        selectedLanguage.value = languages.value[0].id
      }
    }
  } catch (error) {
    console.error('Failed to fetch languages:', error)
  } finally {
    loadingLanguages.value = false
  }
}
// Default store dialog handlers
const ensureStoreCategories = async () => {
  try {
    loadingStoreCategories.value = true
    const resp = await apiService.getStoreCategories({ is_active: true })
    storeCategories.value = resp.data?.results || resp.data || []
  } catch (e) {
    console.warn('Failed to load store categories:', e)
  } finally {
    loadingStoreCategories.value = false
  }
}

const openDefaultStoreDialog = async () => {
  if (storeCategories.value.length === 0) {
    await ensureStoreCategories()
  }
  showDefaultStoreDialog.value = true
}

const setDefaultStore = (id) => {
  defaultStoreId.value = String(id)
  sessionStorage.setItem('defaultStore', defaultStoreId.value)
  showDefaultStoreDialog.value = false
  // Reload to apply filtering across the app
  location.reload()
}

// Confirm logout
const confirmLogout = () => {
  showLogoutDialog.value = true
}

// Logout function
const logout = () => {
  auth.logout()
  router.replace({ name: 'Login' })
}

// Change language function
const changeLanguage = async () => {
  try {
    loadingLanguages.value = true
    
    // Update user's default language
    const updatePayload = {
      default_language: selectedLanguage.value
    }

    await apiService.updateLanguage(selectedLanguage.value)

    // Refresh user data to get updated language
    await auth.fetchUserData()

    showLanguageDialog.value = false

    // You could also trigger a UI language change here if implementing i18n
    console.log(`Language changed to: ${selectedLanguage.value}`)
  } catch (error) {
    console.error('Failed to update language:', error)
  } finally {
    loadingLanguages.value = false
  }
}
</script>

<style scoped>
/* Additional styles if needed */
</style>