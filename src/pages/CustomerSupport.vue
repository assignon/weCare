<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        :custom-title="$t('profile.customer_support_page.title')"
      />

      <!-- Support Hero Section -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6 mb-6">
        <div class="text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Headphones class="w-10 h-10 text-blue-600" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">{{ $t('profile.customer_support_page.were_here_to_help') }}</h1>
          <p class="text-slate-600">{{ $t('profile.customer_support_page.get_in_touch') }}</p>
        </div>
      </div>

      <!-- Contact Methods -->
      <div class="space-y-4">
        <!-- Phone Support -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Phone class="w-6 h-6 text-green-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.customer_support_page.phone_support') }}</h3>
                <p class="text-slate-600 text-sm">{{ $t('profile.customer_support_page.call_us') }}</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="text-center">
                  <p class="font-medium text-slate-900 mb-2">{{ $t('profile.customer_support_page.main_line') }}</p>
                  <p class="text-2xl font-bold text-slate-900">+228 97 78 38 64</p>
                       </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Support -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <Mail class="w-6 h-6 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.customer_support_page.email_support') }}</h3>
                <p class="text-slate-600 text-sm">{{ $t('profile.customer_support_page.send_detailed_message') }}</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="text-center">
                  <p class="font-medium text-slate-900 mb-2">{{ $t('profile.customer_support_page.support_email') }}</p>
                  <p class="text-lg font-medium text-slate-900 break-all">afriqxpress@gmail.com</p>
                  <p class="text-sm text-slate-600 mt-1">{{ $t('profile.customer_support_page.respond_within_24h') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Building2 class="w-6 h-6 text-purple-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.customer_support_page.company_information') }}</h3>
                <p class="text-slate-600 text-sm">{{ $t('profile.customer_support_page.about_company') }} AfriQExpress</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <MapPin class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">{{ $t('profile.customer_support_page.address') }}</p>
                    <p class="text-slate-600 text-sm">Adoboukome, Rue 88, Lomé, Togo</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <Clock class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">{{ $t('profile.customer_support_page.business_hours') }}</p>
                    <p class="text-slate-600 text-sm">{{ companyContact.businessHours }}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <Globe class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">{{ $t('profile.customer_support_page.website') }}</p>
                    <a 
                      href="https://afriqxpress.com" 
                      target="_blank"
                      class="text-blue-600 text-sm hover:underline"
                    >
                      afriqxpress.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ Section -->
        <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 overflow-hidden">
          <div class="p-6">
            <div class="flex items-center space-x-4 mb-4">
              <div class="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                <HelpCircle class="w-6 h-6 text-orange-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-slate-900">{{ $t('profile.customer_support_page.frequently_asked_questions') }}</h3>
                <p class="text-slate-600 text-sm">{{ $t('profile.customer_support_page.quick_answers') }}</p>
              </div>
            </div>
            
            <div class="space-y-3">
              <div 
                v-for="(faq, index) in faqs" 
                :key="index"
                class="border border-slate-200 rounded-2xl overflow-hidden"
              >
                <button 
                  @click="toggleFaq(index)"
                  class="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <span class="font-medium text-slate-900">{{ faq.question }}</span>
                  <ChevronDown 
                    :class="`w-5 h-5 text-slate-400 transition-transform ${expandedFaqs.includes(index) ? 'rotate-180' : ''}`"
                  />
                </button>
                <div 
                  v-if="expandedFaqs.includes(index)"
                  class="px-4 pb-4 text-sm text-slate-600 border-t border-slate-100"
                >
                  {{ faq.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/AppHeader.vue'
import { 
  Headphones, Phone, Mail, Building2, 
  MapPin, Clock, Globe, HelpCircle, ChevronDown
} from 'lucide-vue-next'

const { t } = useI18n()

// Company contact details from environment variables
const companyContact = ref({
  companyName: import.meta.env.VITE_COMPANY_NAME || 'AfriQ Express',
  phone: import.meta.env.VITE_COMPANY_PHONENUMBER || '+1 (555) 123-4567',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'support@afriqexpress.com',
  address: import.meta.env.VITE_COMPANY_ADDRESS || '123 Business Street, City, Country',
  businessHours: import.meta.env.VITE_COMPANY_HOURS || 'Monday - Friday: 9:00 AM - 6:00 PM',
  website: import.meta.env.VITE_COMPANY_WEBSITE || 'https://afriqexpress.com'
})

// FAQ data - computed to use translations
const faqs = computed(() => [
  {
    question: t('profile.customer_support_page.faq_how_track_order'),
    answer: t('profile.customer_support_page.faq_how_track_order_answer')
  },
  {
    question: t('profile.customer_support_page.faq_payment_methods'),
    answer: t('profile.customer_support_page.faq_payment_methods_answer')
  },
  {
    question: t('profile.customer_support_page.faq_delivery_time'),
    answer: t('profile.customer_support_page.faq_delivery_time_answer')
  },
  {
    question: t('profile.customer_support_page.faq_return_exchange'),
    answer: t('profile.customer_support_page.faq_return_exchange_answer')
  },
  {
    question: t('profile.customer_support_page.faq_update_address'),
    answer: t('profile.customer_support_page.faq_update_address_answer')
  },
  {
    question: t('profile.customer_support_page.faq_not_satisfied'),
    answer: t('profile.customer_support_page.faq_not_satisfied_answer')
  }
])

// FAQ expansion state
const expandedFaqs = ref([])

// Toggle FAQ expansion
const toggleFaq = (index) => {
  const faqIndex = expandedFaqs.value.indexOf(index)
  if (faqIndex > -1) {
    expandedFaqs.value.splice(faqIndex, 1)
  } else {
    expandedFaqs.value.push(index)
  }
}

// Load company details on mount
onMounted(() => {
  console.log('Customer Support page loaded with company details:', companyContact.value)
})
</script>

<style scoped>
/* Additional styles if needed */
</style>
