/**
 * Currency composable for Vue 3
 * Provides reactive currency formatting based on user preferences
 */

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatCurrencyForUser, getCurrencySymbol, getCurrencyInfo } from '@/utils/currency'

export function useCurrency() {
  const authStore = useAuthStore()

  // Get user's currency from auth store
  const userCurrency = computed(() => {
    return authStore.user?.currency || { code: 'CFA', symbol: 'CFA' }
  })

  // Get user's country from auth store
  const userCountry = computed(() => {
    return authStore.user?.country || { code: 'CM', name: 'Cameroon' }
  })

  /**
   * Format amount using user's currency preference
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  const formatPrice = (amount) => {
    if (!amount && amount !== 0) return '0.00'
    if (authStore.user && authStore.user.currency) {
      return formatCurrency(amount, authStore.user.currency.code)
    }
    
    return formatCurrency(amount, 'CFA')
  }

  /**
   * Format amount with specific currency code
   * @param {number} amount - Amount to format
   * @param {string} currencyCode - Currency code to use
   * @returns {string} Formatted currency string
   */
  const formatPriceWithCurrency = (amount, currencyCode) => {
    return formatCurrency(amount, currencyCode)
  }

  /**
   * Get currency symbol for user's currency
   * @returns {string} Currency symbol
   */
  const getCurrencySymbolForUser = () => {
    const currency = userCurrency.value
    return getCurrencySymbol(currency.code)
  }

  /**
   * Get currency info for user's currency
   * @returns {object} Currency formatting configuration
   */
  const getCurrencyInfoForUser = () => {
    const currency = userCurrency.value
    return getCurrencyInfo(currency.code)
  }

  /**
   * Format price using API response data
   * @param {object} priceData - Price data from API with currency_info
   * @returns {string} Formatted price string
   */
  const formatApiPrice = (priceData) => {
    if (!priceData) return '0.00'
    
    // If API provides formatted_price, use it
    if (priceData.formatted_price) {
      return priceData.formatted_price
    }
    
    // If API provides currency_info, use it
    if (priceData.currency_info) {
      const { amount, currency_code } = priceData.currency_info
      return formatCurrency(amount, currency_code)
    }
    
    // Fallback to raw price with user currency
    return formatPrice(priceData.price || priceData)
  }

  /**
   * Format multiple prices (e.g., price range)
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @returns {string} Formatted price range string
   */
  const formatPriceRange = (minPrice, maxPrice) => {
    if (!minPrice && !maxPrice) return '0.00'
    
    const formattedMin = formatPrice(minPrice)
    const formattedMax = formatPrice(maxPrice)
    
    if (minPrice === maxPrice) {
      return formattedMin
    }
    
    return `${formattedMin} - ${formattedMax}`
  }

  /**
   * Check if user has a specific currency
   * @param {string} currencyCode - Currency code to check
   * @returns {boolean} True if user has the specified currency
   */
  const hasUserCurrency = (currencyCode) => {
    return userCurrency.value.code === currencyCode
  }

  /**
   * Get display name for currency
   * @param {string} currencyCode - Currency code
   * @returns {string} Currency display name
   */
  const getCurrencyDisplayName = (currencyCode) => {
    const currencyNames = {
      'USD': 'US Dollar',
      'EUR': 'Euro',
      'GBP': 'British Pound',
      'XOF': 'West African CFA Franc',
      'XAF': 'Central African CFA Franc',
      'NGN': 'Nigerian Naira',
      'GHS': 'Ghanaian Cedi',
      'KES': 'Kenyan Shilling',
      'UGX': 'Ugandan Shilling',
      'TZS': 'Tanzanian Shilling',
      'RWF': 'Rwandan Franc',
      'ETB': 'Ethiopian Birr',
      'ZAR': 'South African Rand',
      'MAD': 'Moroccan Dirham',
      'EGP': 'Egyptian Pound',
    }
    
    return currencyNames[currencyCode] || currencyCode
  }

  return {
    // Reactive values
    userCurrency,
    userCountry,
    
    // Formatting functions
    formatPrice,
    formatPriceWithCurrency,
    formatApiPrice,
    formatPriceRange,
    
    // Utility functions
    getCurrencySymbolForUser,
    getCurrencyInfoForUser,
    hasUserCurrency,
    getCurrencyDisplayName,
  }
} 