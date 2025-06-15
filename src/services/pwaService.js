class PWAService {
  constructor() {
    this.deferredPrompt = null
    this.isInstalled = false
    this.isStandalone = false
    this.installCallbacks = []
    
    this.init()
  }

  init() {
    // Check if app is running in standalone mode
    this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone === true ||
                       document.referrer.includes('android-app://')

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      this.deferredPrompt = e
      console.log('PWA install prompt available')
    })

    // Listen for app installation
    window.addEventListener('appinstalled', (evt) => {
      console.log('PWA was installed')
      this.isInstalled = true
      this.deferredPrompt = null
      this.notifyInstallCallbacks(true)
    })

    // Check if already installed
    if (this.isStandalone) {
      this.isInstalled = true
    }
  }

  // Check if PWA can be installed
  canInstall() {
    return this.deferredPrompt !== null && !this.isInstalled
  }

  // Show install prompt
  async showInstallPrompt() {
    if (!this.canInstall()) {
      return { success: false, reason: 'Cannot install' }
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        return { success: true, outcome: 'accepted' }
      } else {
        console.log('User dismissed the install prompt')
        return { success: false, outcome: 'dismissed' }
      }
    } catch (error) {
      console.error('Error showing install prompt:', error)
      return { success: false, error: error.message }
    } finally {
      this.deferredPrompt = null
    }
  }

  // Check if app is installed
  isAppInstalled() {
    return this.isInstalled
  }

  // Check if app is running in standalone mode
  isRunningStandalone() {
    return this.isStandalone
  }

  // Get installation status
  getInstallationStatus() {
    return {
      canInstall: this.canInstall(),
      isInstalled: this.isInstalled,
      isStandalone: this.isStandalone
    }
  }

  // Register callback for installation events
  onInstall(callback) {
    this.installCallbacks.push(callback)
  }

  // Remove install callback
  offInstall(callback) {
    const index = this.installCallbacks.indexOf(callback)
    if (index > -1) {
      this.installCallbacks.splice(index, 1)
    }
  }

  // Notify all install callbacks
  notifyInstallCallbacks(installed) {
    this.installCallbacks.forEach(callback => {
      try {
        callback(installed)
      } catch (error) {
        console.error('Error in install callback:', error)
      }
    })
  }

  // Handle service worker updates
  handleServiceWorkerUpdate() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Service worker has been updated and is now controlling the page
        console.log('Service worker updated')
        // You can show a notification to the user here
      })
    }
  }

  // Check for app updates
  async checkForUpdates() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.update()
          console.log('Checked for service worker updates')
        }
      } catch (error) {
        console.error('Error checking for updates:', error)
      }
    }
  }

  // Get PWA display mode
  getDisplayMode() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return 'standalone'
    }
    if (window.matchMedia('(display-mode: minimal-ui)').matches) {
      return 'minimal-ui'
    }
    if (window.matchMedia('(display-mode: fullscreen)').matches) {
      return 'fullscreen'
    }
    return 'browser'
  }

  // Show install banner/notification
  showInstallBanner() {
    // This would typically show a custom install banner
    // You can integrate this with your app's notification system
    return {
      show: this.canInstall(),
      message: 'Install afriQExpress for a better experience!',
      action: 'Install'
    }
  }
}

// Create singleton instance
const pwaService = new PWAService()

export default pwaService
export { PWAService } 