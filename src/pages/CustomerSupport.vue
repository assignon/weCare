<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pb-24">
    <div class="p-4">
      <!-- Modern Header -->
      <AppHeader 
        :show-back="true"
        custom-title="Customer Support"
      />

      <!-- Support Hero Section -->
      <div class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg border border-white/30 p-6 mb-6">
        <div class="text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Headphones class="w-10 h-10 text-blue-600" />
          </div>
          <h1 class="text-2xl font-bold text-slate-900 mb-2">We're Here to Help</h1>
          <p class="text-slate-600">Get in touch with our support team for any questions or assistance you need.</p>
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
                <h3 class="text-lg font-semibold text-slate-900">Phone Support</h3>
                <p class="text-slate-600 text-sm">Call us for immediate assistance</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="text-center">
                  <p class="font-medium text-slate-900 mb-2">Main Line</p>
                  <p class="text-2xl font-bold text-slate-900">{{ companyContact.phone }}</p>
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
                <h3 class="text-lg font-semibold text-slate-900">Email Support</h3>
                <p class="text-slate-600 text-sm">Send us a detailed message</p>
              </div>
            </div>
            <div class="mt-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="text-center">
                  <p class="font-medium text-slate-900 mb-2">Support Email</p>
                  <p class="text-lg font-medium text-slate-900 break-all">{{ companyContact.email }}</p>
                  <p class="text-sm text-slate-600 mt-1">We'll respond within 24 hours</p>
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
                <h3 class="text-lg font-semibold text-slate-900">Company Information</h3>
                <p class="text-slate-600 text-sm">About {{ companyContact.companyName }}</p>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <MapPin class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">Address</p>
                    <p class="text-slate-600 text-sm">{{ companyContact.address }}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <Clock class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">Business Hours</p>
                    <p class="text-slate-600 text-sm">{{ companyContact.businessHours }}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-4 bg-slate-50 rounded-2xl">
                <div class="flex items-start space-x-3">
                  <Globe class="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p class="font-medium text-slate-900">Website</p>
                    <a 
                      :href="companyContact.website" 
                      target="_blank"
                      class="text-blue-600 text-sm hover:underline"
                    >
                      {{ companyContact.website }}
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
                <h3 class="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>
                <p class="text-slate-600 text-sm">Quick answers to common questions</p>
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
import { ref, onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { 
  Headphones, Phone, Mail, Building2, 
  MapPin, Clock, Globe, HelpCircle, ChevronDown
} from 'lucide-vue-next'

// Company contact details from environment variables
const companyContact = ref({
  companyName: import.meta.env.VITE_COMPANY_NAME || 'AfriQ Express',
  phone: import.meta.env.VITE_COMPANY_PHONENUMBER || '+1 (555) 123-4567',
  email: import.meta.env.VITE_COMPANY_EMAIL || 'support@afriqexpress.com',
  address: import.meta.env.VITE_COMPANY_ADDRESS || '123 Business Street, City, Country',
  businessHours: import.meta.env.VITE_COMPANY_HOURS || 'Monday - Friday: 9:00 AM - 6:00 PM',
  website: import.meta.env.VITE_COMPANY_WEBSITE || 'https://afriqexpress.com'
})

// FAQ data
const faqs = ref([
  {
    question: "How do I track my order?",
    answer: "You can track your order by going to the Orders page in your profile. Click on any order to see its current status and delivery timeline."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, mobile money, and bank transfers. All payments are processed securely through our encrypted payment gateway."
  },
  {
    question: "How long does delivery take?",
    answer: "Delivery times vary by location. Standard delivery is 2-5 business days, while express delivery is 1-2 business days. You'll receive tracking updates via SMS and email."
  },
  {
    question: "Can I return or exchange items?",
    answer: "Yes! We offer a 30-day return policy for unused items in original packaging. Contact our support team to initiate a return or exchange."
  },
  {
    question: "How do I update my delivery address?",
    answer: "Go to your Profile > Addresses to add, edit, or remove delivery addresses. You can also update your address during checkout."
  },
  {
    question: "What if I'm not satisfied with my purchase?",
    answer: "We want you to be completely satisfied! Contact our support team within 30 days of purchase, and we'll work with you to resolve any issues."
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
