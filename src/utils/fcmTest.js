// FCM Implementation Test Utility
import fcmService from '@/services/fcmService'
import { messaging, vapidKey } from '@/services/firebaseConfig'

class FCMTester {
  constructor() {
    this.testResults = []
  }

  log(test, status, message, details = null) {
    const result = {
      test,
      status, // 'pass', 'fail', 'warning', 'info'
      message,
      details,
      timestamp: new Date().toISOString()
    }
    this.testResults.push(result)
    
    const emoji = {
      pass: '✅',
      fail: '❌', 
      warning: '⚠️',
      info: 'ℹ️'
    }
    
    console.log(`${emoji[status]} ${test}: ${message}`, details || '')
  }

  async runAllTests() {
    console.log('🧪 Starting FCM Implementation Tests...\n')
    
    // Test 1: Check if Firebase is imported correctly
    this.testFirebaseImports()
    
    // Test 2: Check environment variables
    this.testEnvironmentVariables()
    
    // Test 3: Check browser support
    this.testBrowserSupport()
    
    // Test 4: Check Firebase config
    this.testFirebaseConfig()
    
    // Test 5: Check service worker registration
    await this.testServiceWorkerSetup()
    
    // Test 6: Check FCM service initialization
    await this.testFCMServiceInit()
    
    // Test 7: Check API endpoint connectivity
    await this.testAPIEndpoints()
    
    // Print summary
    this.printSummary()
    
    return this.testResults
  }

  testFirebaseImports() {
    try {
      if (typeof messaging !== 'undefined') {
        this.log('Firebase Imports', 'pass', 'Firebase messaging imported successfully')
      } else {
        this.log('Firebase Imports', 'fail', 'Firebase messaging not imported')
      }
      
      if (typeof fcmService !== 'undefined' && fcmService.initialize) {
        this.log('FCM Service', 'pass', 'FCM service class loaded successfully')
      } else {
        this.log('FCM Service', 'fail', 'FCM service class not loaded properly')
      }
    } catch (error) {
      this.log('Firebase Imports', 'fail', 'Error importing Firebase', error.message)
    }
  }

  testEnvironmentVariables() {
    const requiredVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_SENDER_ID', 
      'VITE_FIREBASE_APP_ID',
      'VITE_FIREBASE_VAPID_KEY'
    ]

    const missingVars = []
    const placeholderVars = []

    requiredVars.forEach(varName => {
      const value = import.meta.env[varName]
      if (!value) {
        missingVars.push(varName)
      } else if (value.includes('placeholder') || value.includes('test_') || value === 'your_') {
        placeholderVars.push(varName)
      }
    })

    if (missingVars.length > 0) {
      this.log('Environment Variables', 'fail', `Missing environment variables: ${missingVars.join(', ')}`)
    } else if (placeholderVars.length > 0) {
      this.log('Environment Variables', 'warning', `Placeholder values detected: ${placeholderVars.join(', ')}`, 'Replace with actual Firebase credentials')
    } else {
      this.log('Environment Variables', 'pass', 'All Firebase environment variables are set')
    }

    // Check VAPID key format
    if (vapidKey && vapidKey.length > 20 && !vapidKey.includes('placeholder')) {
      this.log('VAPID Key', 'pass', 'VAPID key appears to have correct format')
    } else {
      this.log('VAPID Key', 'warning', 'VAPID key missing or appears to be placeholder')
    }
  }

  testBrowserSupport() {
    const checks = [
      { name: 'Notifications API', check: 'Notification' in window },
      { name: 'Service Worker API', check: 'serviceWorker' in navigator },
      { name: 'Push Messaging', check: 'PushManager' in window },
      { name: 'HTTPS/Secure Context', check: location.protocol === 'https:' || location.hostname === 'localhost' }
    ]

    checks.forEach(({ name, check }) => {
      if (check) {
        this.log('Browser Support', 'pass', `${name} supported`)
      } else {
        this.log('Browser Support', 'fail', `${name} not supported`)
      }
    })

    // Check notification permission
    if ('Notification' in window) {
      const permission = Notification.permission
      if (permission === 'granted') {
        this.log('Notification Permission', 'pass', 'Notification permission granted')
      } else if (permission === 'denied') {
        this.log('Notification Permission', 'fail', 'Notification permission denied')
      } else {
        this.log('Notification Permission', 'warning', 'Notification permission not yet requested')
      }
    }
  }

  testFirebaseConfig() {
    try {
      if (messaging) {
        this.log('Firebase Config', 'pass', 'Firebase messaging initialized successfully')
      } else {
        this.log('Firebase Config', 'fail', 'Firebase messaging not initialized')
      }
    } catch (error) {
      this.log('Firebase Config', 'fail', 'Firebase configuration error', error.message)
    }
  }

  async testServiceWorkerSetup() {
    if (!('serviceWorker' in navigator)) {
      this.log('Service Worker', 'fail', 'Service Worker not supported')
      return
    }

    try {
      // Check if firebase-messaging-sw.js exists
      const response = await fetch('/firebase-messaging-sw.js')
      if (response.ok) {
        this.log('Service Worker File', 'pass', 'firebase-messaging-sw.js file found')
        
        // Check if service worker is registered
        const registrations = await navigator.serviceWorker.getRegistrations()
        const fcmSW = registrations.find(reg => reg.scope.includes('firebase-messaging-sw'))
        
        if (fcmSW) {
          this.log('Service Worker Registration', 'pass', 'Firebase messaging service worker registered')
        } else {
          this.log('Service Worker Registration', 'warning', 'Firebase messaging service worker not yet registered')
        }
      } else {
        this.log('Service Worker File', 'fail', 'firebase-messaging-sw.js file not found')
      }
    } catch (error) {
      this.log('Service Worker', 'fail', 'Service worker test failed', error.message)
    }
  }

  async testFCMServiceInit() {
    if (!fcmService) {
      this.log('FCM Service Init', 'fail', 'FCM service not available')
      return
    }

    try {
      // Test if FCM service methods exist
      const methods = ['initialize', 'requestPermission', 'getToken', 'registerServiceWorker']
      const missingMethods = methods.filter(method => typeof fcmService[method] !== 'function')
      
      if (missingMethods.length === 0) {
        this.log('FCM Service Methods', 'pass', 'All required FCM service methods present')
      } else {
        this.log('FCM Service Methods', 'fail', `Missing methods: ${missingMethods.join(', ')}`)
      }

      // Test if FCM is supported
      if (fcmService.isSupported && fcmService.isSupported()) {
        this.log('FCM Support', 'pass', 'FCM is supported in this browser')
      } else {
        this.log('FCM Support', 'fail', 'FCM is not supported in this browser')
      }

    } catch (error) {
      this.log('FCM Service Init', 'fail', 'FCM service initialization test failed', error.message)
    }
  }

  async testAPIEndpoints() {
    try {
      // Test if we can reach the backend API
      const response = await fetch('/api/core/fcm/register/', {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok || response.status === 405) { // 405 = Method Not Allowed is okay for OPTIONS
        this.log('API Endpoints', 'pass', 'Backend FCM endpoints reachable')
      } else {
        this.log('API Endpoints', 'warning', `Backend responded with status: ${response.status}`)
      }
    } catch (error) {
      this.log('API Endpoints', 'fail', 'Cannot reach backend FCM endpoints', error.message)
    }
  }

  printSummary() {
    console.log('\n📊 FCM Test Summary:')
    console.log('═'.repeat(50))
    
    const summary = this.testResults.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1
      return acc
    }, {})

    Object.entries(summary).forEach(([status, count]) => {
      const emoji = {
        pass: '✅',
        fail: '❌',
        warning: '⚠️', 
        info: 'ℹ️'
      }
      console.log(`${emoji[status]} ${status.toUpperCase()}: ${count}`)
    })

    console.log('═'.repeat(50))
    
    if (summary.fail && summary.fail > 0) {
      console.log('🔧 ACTION REQUIRED: Fix failing tests before proceeding')
    } else if (summary.warning && summary.warning > 0) {
      console.log('⚠️ WARNINGS: Some configuration may need attention')
    } else {
      console.log('🎉 ALL TESTS PASSED: FCM implementation looks good!')
    }

    // Provide next steps
    this.printNextSteps()
  }

  printNextSteps() {
    console.log('\n📋 Next Steps:')
    console.log('─'.repeat(30))
    
    const hasFailures = this.testResults.some(r => r.status === 'fail')
    const hasWarnings = this.testResults.some(r => r.status === 'warning')
    
    if (hasFailures || hasWarnings) {
      console.log('1. 🔥 Set up Firebase project at https://console.firebase.google.com/')
      console.log('2. 📝 Copy env.template to .env and fill in actual Firebase credentials')
      console.log('3. 🔧 Replace placeholders in firebase-messaging-sw.js with actual config')
      console.log('4. 🚀 Start Django backend with FCM support')
      console.log('5. 🔄 Re-run this test: fcmTester.runAllTests()')
    } else {
      console.log('1. ✅ Initialize FCM service: await fcmService.initialize()')
      console.log('2. 🔔 Test notification sending from backend')
      console.log('3. 📱 Test notifications on different devices/browsers')
    }
  }

  // Method to test FCM in console
  async quickTest() {
    console.log('🚀 Quick FCM Test...')
    
    try {
      if (fcmService.isSupported()) {
        console.log('✅ FCM is supported')
        
        const permission = await fcmService.requestPermission()
        console.log(`🔔 Permission: ${permission}`)
        
        if (permission === 'granted') {
          const initialized = await fcmService.initialize()
          console.log(`🔧 Initialized: ${initialized}`)
          
          if (initialized) {
            const token = fcmService.getCurrentToken()
            console.log(`🎫 Token: ${token ? 'Generated' : 'Not available'}`)
          }
        }
      } else {
        console.log('❌ FCM not supported in this browser')
      }
    } catch (error) {
      console.log('❌ Quick test failed:', error.message)
    }
  }
}

// Export for use in console or components
export const fcmTester = new FCMTester()

// Auto-run basic test on import in development
if (import.meta.env.DEV) {
  console.log('🔬 FCM Test Utility Loaded')
  console.log('Run fcmTester.runAllTests() to test FCM implementation')
  console.log('Run fcmTester.quickTest() for a quick test')
}

export default fcmTester 