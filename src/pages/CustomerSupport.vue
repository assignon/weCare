<template>
  <div class="min-h-screen bg-white pb-24">
    <BackButtonHeader :title="$t('profile.customer_support_page.title')" />
    <div class="p-3 pt-4">
      <!-- Support Hero Section -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-3">
        <div class="text-center">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Headphones class="w-6 h-6 text-blue-600" />
          </div>
          <h1 class="text-base font-bold text-gray-900 mb-1">{{ $t('profile.customer_support_page.were_here_to_help') }}</h1>
          <p class="text-xs text-gray-600">{{ $t('profile.customer_support_page.get_in_touch') }}</p>
        </div>
      </div>

      <!-- Contact Methods -->
      <div class="space-y-2">
        <!-- Phone Support -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-3">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone class="w-3.5 h-3.5 text-green-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.customer_support_page.phone_support') }}</h3>
                <p class="text-xs text-gray-600">{{ $t('profile.customer_support_page.call_us') }}</p>
              </div>
            </div>
            <div class="mt-2">
              <div class="p-2.5 bg-gray-50 rounded-lg">
                <div class="text-center">
                  <p class="text-xs font-medium text-gray-900 mb-1">{{ $t('profile.customer_support_page.main_line') }}</p>
                  <p class="text-base font-bold text-gray-900">+228 97 78 38 64</p>
                       </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Email Support -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-3">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail class="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.customer_support_page.email_support') }}</h3>
                <p class="text-xs text-gray-600">{{ $t('profile.customer_support_page.send_detailed_message') }}</p>
              </div>
            </div>
            <div class="mt-2">
              <div class="p-2.5 bg-gray-50 rounded-lg">
                <div class="text-center">
                  <p class="text-xs font-medium text-gray-900 mb-1">{{ $t('profile.customer_support_page.support_email') }}</p>
                  <p class="text-sm font-medium text-gray-900 break-all">afriqxpress@gmail.com</p>
                  <p class="text-xs text-gray-600 mt-0.5">{{ $t('profile.customer_support_page.respond_within_24h') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Company Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-3">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 class="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.customer_support_page.company_information') }}</h3>
                <p class="text-xs text-gray-600">{{ $t('profile.customer_support_page.about_company') }} AfriQExpress</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="p-2.5 bg-gray-50 rounded-lg">
                <div class="flex items-start space-x-2">
                  <MapPin class="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-xs font-medium text-gray-900">{{ $t('profile.customer_support_page.address') }}</p>
                    <p class="text-xs text-gray-600">Adoboukome, Rue 88, Lomé, Togo</p>
                  </div>
                </div>
              </div>
              
              <div class="p-2.5 bg-gray-50 rounded-lg">
                <div class="flex items-start space-x-2">
                  <Clock class="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-xs font-medium text-gray-900">{{ $t('profile.customer_support_page.business_hours') }}</p>
                    <p class="text-xs text-gray-600">{{ companyContact.businessHours }}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-2.5 bg-gray-50 rounded-lg">
                <div class="flex items-start space-x-2">
                  <Globe class="w-3.5 h-3.5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p class="text-xs font-medium text-gray-900">{{ $t('profile.customer_support_page.website') }}</p>
                    <a 
                      href="https://afriqxpress.com" 
                      target="_blank"
                      class="text-blue-600 text-xs hover:underline"
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
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-3">
            <div class="flex items-center space-x-2 mb-2">
              <div class="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HelpCircle class="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-semibold text-gray-900">{{ $t('profile.customer_support_page.frequently_asked_questions') }}</h3>
                <p class="text-xs text-gray-600">{{ $t('profile.customer_support_page.quick_answers') }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div 
                v-for="(faq, index) in faqs" 
                :key="index"
                class="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button 
                  @click="toggleFaq(index)"
                  class="w-full p-2.5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span class="text-xs font-medium text-gray-900">{{ faq.question }}</span>
                  <ChevronDown 
                    :class="`w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0 ${expandedFaqs.includes(index) ? 'rotate-180' : ''}`"
                  />
                </button>
                <div 
                  v-if="expandedFaqs.includes(index)"
                  class="px-2.5 pb-2.5 text-xs text-gray-600 border-t border-gray-100"
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
import BackButtonHeader from '@/components/BackButtonHeader.vue'
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
