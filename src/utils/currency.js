/**
 * Currency utilities for formatting prices based on user's country/currency
 */

// Currency formatting configurations
const CURRENCY_FORMATS = {
  'USD': { symbol: '$', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'EUR': { symbol: '€', position: 'after', decimalPlaces: 2, thousandsSeparator: '.' },
  'GBP': { symbol: '£', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'XOF': { symbol: 'CFA', position: 'after', decimalPlaces: 0, thousandsSeparator: ' ' }, // West African CFA franc
  'XAF': { symbol: 'FCFA', position: 'after', decimalPlaces: 0, thousandsSeparator: ' ' }, // Central African CFA franc
  'NGN': { symbol: '₦', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'GHS': { symbol: '₵', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'KES': { symbol: 'KSh', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'UGX': { symbol: 'USh', position: 'before', decimalPlaces: 0, thousandsSeparator: ',' },
  'TZS': { symbol: 'TSh', position: 'before', decimalPlaces: 0, thousandsSeparator: ',' },
  'RWF': { symbol: 'RF', position: 'before', decimalPlaces: 0, thousandsSeparator: ',' },
  'ETB': { symbol: 'Br', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
  'ZAR': { symbol: 'R', position: 'before', decimalPlaces: 2, thousandsSeparator: ' ' },
  'MAD': { symbol: 'DH', position: 'after', decimalPlaces: 2, thousandsSeparator: ' ' },
  'EGP': { symbol: '£E', position: 'before', decimalPlaces: 2, thousandsSeparator: ',' },
}

/**
 * Format a currency amount according to the currency's formatting rules
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO currency code (e.g., 'USD', 'EUR')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currencyCode = 'USD') {
  if (amount === null || amount === undefined) {
    return '0.00'
  }

  // Get formatting configuration for the currency
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD']
  
  // Format the number with appropriate decimal places
  const decimalPlaces = config.decimalPlaces
  let formattedAmount
  
  if (decimalPlaces === 0) {
    formattedAmount = Math.round(amount).toLocaleString('en-US')
  } else {
    formattedAmount = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    })
  }
  
  // Replace thousands separator if needed
  if (config.thousandsSeparator !== ',') {
    formattedAmount = formattedAmount.replace(/,/g, config.thousandsSeparator)
  }
  
  // Add currency symbol
  const symbol = config.symbol
  if (config.position === 'before') {
    return `${symbol}${formattedAmount}`
  } else {
    return `${formattedAmount} ${symbol}`
  }
}

/**
 * Get currency formatting information
 * @param {string} currencyCode - The ISO currency code
 * @returns {object} Currency formatting configuration
 */
export function getCurrencyInfo(currencyCode) {
  return CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD']
}

/**
 * Format currency for a user based on their country/currency preference
 * @param {number} amount - The amount to format
 * @param {object} user - User object with country and currency information
 * @returns {string} Formatted currency string
 */
export function formatCurrencyForUser(amount, user) {
  if (!user || !user.currency) {
    return formatCurrency(amount, 'USD')
  }
  
  return formatCurrency(amount, user.currency.code)
}

/**
 * Get the currency symbol for a currency code
 * @param {string} currencyCode - The ISO currency code
 * @returns {string} Currency symbol
 */
export function getCurrencySymbol(currencyCode) {
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD']
  return config.symbol
}

/**
 * Parse a formatted currency string back to a number
 * @param {string} formattedAmount - The formatted currency string
 * @param {string} currencyCode - The ISO currency code
 * @returns {number} Parsed amount
 */
export function parseCurrency(formattedAmount, currencyCode = 'USD') {
  if (!formattedAmount) return 0
  
  const config = CURRENCY_FORMATS[currencyCode] || CURRENCY_FORMATS['USD']
  
  // Remove currency symbol and spaces
  let cleanAmount = formattedAmount.replace(config.symbol, '').trim()
  
  // Replace thousands separator with empty string
  if (config.thousandsSeparator !== ',') {
    cleanAmount = cleanAmount.replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
  } else {
    cleanAmount = cleanAmount.replace(/,/g, '')
  }
  
  return parseFloat(cleanAmount) || 0
}

/**
 * Create a currency formatter function for a specific currency
 * @param {string} currencyCode - The ISO currency code
 * @returns {function} Currency formatter function
 */
export function createCurrencyFormatter(currencyCode) {
  return (amount) => formatCurrency(amount, currencyCode)
}

/**
 * Format currency using the browser's Intl.NumberFormat API
 * @param {number} amount - The amount to format
 * @param {string} currencyCode - The ISO currency code
 * @param {string} locale - The locale to use for formatting
 * @returns {string} Formatted currency string
 */
export function formatCurrencyIntl(amount, currencyCode = 'USD', locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch (error) {
    // Fallback to custom formatting if Intl fails
    return formatCurrency(amount, currencyCode)
  }
}

/**
 * Get the appropriate locale for a currency code
 * @param {string} currencyCode - The ISO currency code
 * @returns {string} Locale string
 */
export function getLocaleForCurrency(currencyCode) {
  const localeMap = {
    'USD': 'en-US',
    'EUR': 'en-EU',
    'GBP': 'en-GB',
    'XOF': 'fr-SN', // Senegal
    'XAF': 'fr-CM', // Cameroon
    'NGN': 'en-NG',
    'GHS': 'en-GH',
    'KES': 'en-KE',
    'UGX': 'en-UG',
    'TZS': 'en-TZ',
    'RWF': 'en-RW',
    'ETB': 'en-ET',
    'ZAR': 'en-ZA',
    'MAD': 'ar-MA',
    'EGP': 'ar-EG',
  }
  
  return localeMap[currencyCode] || 'en-US'
}

export default {
  formatCurrency,
  getCurrencyInfo,
  formatCurrencyForUser,
  getCurrencySymbol,
  parseCurrency,
  createCurrencyFormatter,
  formatCurrencyIntl,
  getLocaleForCurrency,
} 