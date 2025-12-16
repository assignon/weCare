import { createI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { nextTick } from 'vue'
import fr from './locales/fr.json'
import en from './locales/en.json'

// Default locale
const FALLBACK_LOCALE = 'fr'

// Reactive current locale
export const currentLocale = ref(FALLBACK_LOCALE)

// Initialize locale from sessionStorage or default
const initializeCurrentLocale = () => {
  if (typeof window !== 'undefined') {
    const saved = sessionStorage.getItem('locale')
    if (saved && ['fr', 'en'].includes(saved)) {
      currentLocale.value = saved
      return saved
    }
  }
  return FALLBACK_LOCALE
}

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: initializeCurrentLocale(),
  fallbackLocale: 'en',
  globalInjection: true, // Make $t available globally
  messages: {
    fr,
    en
  }
})

// Sync global locale with our reactive locale
const syncLocales = () => {
  i18n.global.locale.value = currentLocale.value
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('locale', currentLocale.value)
    document.documentElement.lang = currentLocale.value
  }
}

// Watch for locale changes and sync
watch(currentLocale, (newLocale) => {
  console.log(`🌍 Switching to: ${newLocale}`)
  syncLocales()
}, { immediate: true })

export default i18n

// Helper function to change language
export const changeLanguage = async (locale) => {
  if (['fr', 'en'].includes(locale)) {
    currentLocale.value = locale
    await nextTick() // Wait for reactivity
    console.log(`✅ Language changed to: ${locale}`)
  }
}

// Helper function to get current language
export const getCurrentLanguage = () => {
  return currentLocale.value
}

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ]
}

// Initialize function for app mounting
export const initializeLocale = () => {
  syncLocales()
}

