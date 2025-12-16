<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">

      <!-- Profile Summary Card -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6 mb-6">
        <div class="flex items-center space-x-4">
          <!-- Profile Avatar -->
          <div class="relative">
            <div class="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center shadow-lg">
              <img 
                v-if="user && user.profile_picture" 
                :src="user.profile_picture" 
                :alt="user.first_name || user.email"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-2xl font-bold text-slate-700">{{ userInitials }}</span>
            </div>
            <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <Camera class="w-3 h-3 text-white" />
            </div>
          </div>

          <!-- User Info -->
          <div class="flex-1 min-w-0">
            <h2 class="text-xl font-bold text-slate-900 truncate">
              {{ user.first_name || user.last_name || user.email }}
            </h2>
            <p class="text-sm text-slate-600">@{{ userHandle }}</p>
            <div class="flex items-center space-x-2 mt-2">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-xs text-slate-500">{{ $t('profile.active') }}</span>
            </div>
          </div>

          <!-- Edit Profile Button -->
          <button 
            @click="$router.push({ name: 'EditProfile' })"
            class="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg"
            style="background: linear-gradient(to right, #2563eb, #4f46e5);"
            onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
            onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
          >
            <Edit3 class="w-4 h-4" />
            <span>{{ $t('profile.edit') }}</span>
          </button>
        </div>
      </div>

      <!-- Profile Menu -->
      <div class="space-y-4">
        <!-- Profile Settings Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.profile_settings') }}</h3>
          </div>
          
          <!-- Edit Profile -->
          <button 
            @click="$router.push({ name: 'EditProfile' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <User class="w-5 h-5 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.edit_profile') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.edit_profile_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>

          <!-- Skin Profile -->
          <button 
            @click="$router.push({ name: 'SkinProfile' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-slate-100"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles class="w-5 h-5 text-purple-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.skin_profile') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.skin_profile_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>

          <!-- Addresses -->
          <button 
            @click="$router.push({ name: 'Addresses' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-slate-100"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MapPin class="w-5 h-5 text-green-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.addresses') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.addresses_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Marketplace Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.marketplace') }}</h3>
          </div>
          
          <!-- My Listings -->
          <button 
            @click="$router.push({ name: 'MyListings' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Package class="w-5 h-5 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.my_listings') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.my_listings_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>

          <!-- Listing Inquiries -->
          <button 
            @click="$router.push({ name: 'ListingInquiries' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-slate-100"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageCircle class="w-5 h-5 text-green-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.inquiries') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.inquiries_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Preferences Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.preferences') }}</h3>
          </div>
          
          <!-- Language -->
          <button 
            @click="showLanguageDialog = true"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Globe class="w-5 h-5 text-orange-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.language') }}</p>
                <p class="text-sm text-slate-600">{{ currentLanguageName }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>

          <!-- Default Store (Store Category) -->
          <button 
            @click="openDefaultStoreDialog"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors border-t border-slate-100"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Store class="w-5 h-5 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.default_store') }}</p>
                <p class="text-sm text-slate-600">{{ defaultStoreLabel }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Support Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.support') }}</h3>
          </div>
          
          <!-- Customer Support -->
          <button 
            @click="$router.push({ name: 'CustomerSupport' })"
            class="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Headphones class="w-5 h-5 text-blue-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-slate-900">{{ $t('profile.customer_support') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.customer_support_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <!-- Account Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-4 border-b border-slate-100">
            <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.account') }}</h3>
          </div>
          
          <!-- Logout -->
          <button 
            @click="confirmLogout"
            class="w-full p-4 flex items-center justify-between hover:bg-red-50/50 transition-colors"
          >
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <LogOut class="w-5 h-5 text-red-600" />
              </div>
              <div class="text-left">
                <p class="font-semibold text-red-600">{{ $t('profile.log_out') }}</p>
                <p class="text-sm text-slate-600">{{ $t('profile.log_out_subtitle') }}</p>
              </div>
            </div>
            <ChevronRight class="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>

      <!-- Language Selection Dialog -->
      <div 
        v-if="showLanguageDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="showLanguageDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center mr-4">
              <Globe class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">{{ $t('profile.select_language') }}</h3>
              <p class="text-slate-600 text-sm">{{ $t('profile.current') }}: {{ currentLanguageName }}</p>
            </div>
          </div>

          <div v-if="loadingLanguages" class="text-center py-8">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <p class="text-slate-600">{{ $t('profile.loading_languages') }}</p>
          </div>

          <div v-else class="space-y-3 max-h-64 overflow-y-auto">
            <label 
              v-for="lang in languages" 
              :key="lang.id"
              class="flex items-center p-3 rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
            >
              <input 
                type="radio" 
                :value="lang.id" 
                v-model="selectedLanguage"
                class="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span class="ml-3 font-medium text-slate-900">{{ lang.name }}</span>
            </label>
          </div>

          <div class="flex space-x-3 mt-6">
            <button 
              @click="showLanguageDialog = false"
              class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              @click="changeLanguage"
              :disabled="loadingLanguages"
              class="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
              style="background: linear-gradient(to right, #2563eb, #4f46e5);"
              onmouseover="this.style.background='linear-gradient(to right, #1d4ed8, #4338ca)'"
              onmouseout="this.style.background='linear-gradient(to right, #2563eb, #4f46e5)'"
            >
              <Loader2 v-if="loadingLanguages" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              <span>{{ $t('profile.save') }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Default Store Selection Dialog -->
      <div 
        v-if="showDefaultStoreDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="showDefaultStoreDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mr-4">
              <Store class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">{{ $t('profile.select_default_store') }}</h3>
              <p class="text-slate-600 text-sm">{{ $t('profile.choose_preferred_category') }}</p>
            </div>
          </div>

          <div v-if="loadingStoreCategories" class="text-center py-8">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Loader2 class="w-6 h-6 text-blue-600 animate-spin" />
            </div>
            <p class="text-slate-600">{{ $t('profile.loading_store_categories') }}</p>
          </div>

          <div v-else class="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
            <button
              v-for="cat in storeCategories"
              :key="cat.id"
              @click="setDefaultStore(cat.id)"
              class="px-4 py-2 rounded-full border text-sm"
              :class="String(cat.id) === String(defaultStoreId) ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white border-slate-200 text-slate-800'"
            >
              {{ cat.name }}
            </button>
          </div>

          <div class="flex space-x-3 mt-6">
            <button 
              @click="showDefaultStoreDialog = false"
              class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              {{ $t('profile.close') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Logout Confirmation Dialog -->
      <div 
        v-if="showLogoutDialog" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        @click="showLogoutDialog = false"
      >
        <div 
          class="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
          @click.stop
        >
          <div class="flex items-center mb-6">
            <div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mr-4">
              <LogOut class="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-slate-900">{{ $t('profile.log_out_confirm') }}</h3>
              <p class="text-slate-600 text-sm">{{ $t('profile.log_out_confirm_message') }}</p>
            </div>
          </div>

          <div class="flex space-x-3">
            <button 
              @click="showLogoutDialog = false"
              class="flex-1 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-2xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-200"
            >
              {{ $t('profile.cancel') }}
            </button>
            <button 
              @click="logout"
              class="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <LogOut class="w-4 h-4" />
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