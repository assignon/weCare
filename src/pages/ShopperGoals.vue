<template>
    <div class="goals-page">
        <!-- Progress Header -->
        <div class="progress-header">
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: `${(currentStep / totalSteps) * 100}%` }">
                    </div>
                </div>
                <div class="progress-text text-center">
                    Step <span class="text-primary font-weight-bold">{{ currentStep }}</span> of {{ totalSteps }}
                </div>
            </div>
            <!-- <v-btn icon variant="text" @click="skipQuestionnaire" class="skip-btn">
                <v-icon>mdi-close</v-icon>
            </v-btn> -->
        </div>

        <!-- Step Content -->
        <div class="step-content">
            <!-- Step 1: Skin Type -->
            <div v-if="currentStep === 1" class="step-container">
                <div class="step-header">
                    <div class="step-icon">
                        <v-icon size="48" color="primary">mdi-face-woman-shimmer</v-icon>
                    </div>
                    <h2 class="step-title">What's your skin type?</h2>
                    <p class="step-subtitle">Help us recommend the perfect products for your skin</p>
                </div>

                <div class="options-grid">
                    <div v-for="skinType in skinTypes" :key="skinType.id" class="option-card"
                        :class="{ active: selectedSkinType === skinType.id }" @click="selectSkinType(skinType.id)">
                        <div class="option-icon">
                            <v-icon size="32" :color="selectedSkinType === skinType.id ? 'white' : 'primary'">
                                {{ getSkinTypeIcon(skinType.name) }}
                            </v-icon>
                        </div>
                        <h3 class="option-title">{{ skinType.name }}</h3>
                        <p class="option-description">{{ skinType.description }}</p>
                        <v-btn icon size="small" variant="text" @click.stop="showSkinTypeInfo(skinType)"
                            class="info-btn">
                            <v-icon size="16">mdi-information-outline</v-icon>
                        </v-btn>
                    </div>
                </div>

                <div class="step-actions">
                    <v-btn color="primary" size="large" :disabled="!selectedSkinType" @click="nextStep"
                        class="next-btn">
                        Continue
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </div>
            </div>

            <!-- Step 2: Skin Concerns -->
            <div v-if="currentStep === 2" class="step-container">
                <div class="step-header">
                    <div class="step-icon">
                        <v-icon size="48" color="primary">mdi-heart-pulse</v-icon>
                    </div>
                    <h2 class="step-title">What are your main skin concerns?</h2>
                    <p class="step-subtitle">Select all that apply - we'll find products that target these areas</p>
                </div>

                <div class="options-grid multi-select">
                    <div v-for="concern in skinConcerns" :key="concern.id" class="option-card"
                        :class="{ active: selectedSkinConcerns.includes(concern.id) }"
                        @click="toggleSkinConcern(concern.id)">
                        <div class="option-icon">
                            <v-icon size="32" :color="selectedSkinConcerns.includes(concern.id) ? 'white' : 'primary'">
                                {{ getSkinConcernIcon(concern.name) }}
                            </v-icon>
                        </div>
                        <h3 class="option-title">{{ concern.name }}</h3>
                        <p class="option-description">{{ concern.description }}</p>
                        <v-btn icon size="small" variant="text" @click.stop="showSkinConcernInfo(concern)"
                            class="info-btn">
                            <v-icon size="16">mdi-information-outline</v-icon>
                        </v-btn>
                    </div>
                </div>

                <div class="step-actions">
                    <v-btn variant="outlined" @click="previousStep" class="back-btn">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Back
                    </v-btn>
                    <v-btn color="primary" size="large" :disabled="selectedSkinConcerns.length === 0" @click="nextStep"
                        class="next-btn">
                        Continue
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </div>
            </div>

            <!-- Step 3: Product Types -->
            <div v-if="currentStep === 3" class="step-container">
                <div class="step-header">
                    <div class="step-icon">
                        <v-icon size="48" color="primary">mdi-bottle-tonic-plus</v-icon>
                    </div>
                    <h2 class="step-title">What products do you use?</h2>
                    <p class="step-subtitle">Tell us about your current routine so we can suggest improvements</p>
                </div>

                <div class="options-grid multi-select">
                    <div v-for="productType in productTypes" :key="productType.id" class="option-card"
                        :class="{ active: selectedProductTypes.includes(productType.id) }"
                        @click="toggleProductType(productType.id)">
                        <div class="option-icon">
                            <v-icon size="32"
                                :color="selectedProductTypes.includes(productType.id) ? 'white' : 'primary'">
                                {{ getProductTypeIcon(productType.name) }}
                            </v-icon>
                        </div>
                        <h3 class="option-title">{{ productType.name }}</h3>
                        <p class="option-description">{{ productType.description }}</p>
                        <v-btn icon size="small" variant="text" @click.stop="showProductTypeInfo(productType)"
                            class="info-btn">
                            <v-icon size="16">mdi-information-outline</v-icon>
                        </v-btn>
                    </div>
                </div>

                <div class="step-actions">
                    <v-btn variant="outlined" @click="previousStep" class="back-btn">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Back
                    </v-btn>
                    <v-btn color="primary" size="large" :disabled="selectedProductTypes.length === 0" @click="nextStep"
                        class="next-btn">
                        Continue
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </div>
            </div>

            <!-- Step 4: Age Group -->
            <div v-if="currentStep === 4" class="step-container">
                <div class="step-header">
                    <div class="step-icon">
                        <v-icon size="48" color="primary">mdi-calendar-heart</v-icon>
                    </div>
                    <h2 class="step-title">What's your age group?</h2>
                    <p class="step-subtitle">Age helps us recommend age-appropriate skincare solutions</p>
                </div>

                <div class="options-grid">
                    <div v-for="ageGroup in ageGroups" :key="ageGroup.value" class="option-card"
                        :class="{ active: selectedAgeGroup === ageGroup.value }"
                        @click="selectAgeGroup(ageGroup.value)">
                        <div class="option-icon">
                            <v-icon size="32" :color="selectedAgeGroup === ageGroup.value ? 'white' : 'primary'">
                                {{ ageGroup.icon }}
                            </v-icon>
                        </div>
                        <h3 class="option-title">{{ ageGroup.label }}</h3>
                        <p class="option-description">{{ ageGroup.description }}</p>
                    </div>
                </div>

                <div class="step-actions">
                    <v-btn variant="outlined" @click="previousStep" class="back-btn">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Back
                    </v-btn>
                    <v-btn color="primary" size="large" :disabled="!selectedAgeGroup" @click="nextStep"
                        class="next-btn">
                        Continue
                        <v-icon end>mdi-arrow-right</v-icon>
                    </v-btn>
                </div>
            </div>

            <!-- Step 5: Completion -->
            <div v-if="currentStep === 5" class="step-container completion">
                <div class="completion-content">
                    <div class="completion-icon">
                        <v-icon size="80" color="success">mdi-check-circle</v-icon>
                    </div>
                    <h2 class="completion-title">Perfect! You're all set!</h2>
                    <p class="completion-subtitle">
                        We've created your personalized beauty profile.
                        Now we can recommend products that are perfect for you!
                    </p>

                    <div class="profile-summary">
                        <h3>Your Beauty Profile:</h3>
                        <div class="summary-item">
                            <v-icon start color="primary">mdi-face-woman-shimmer</v-icon>
                            <span>{{ getSkinTypeName(selectedSkinType) }}</span>
                        </div>
                        <div class="summary-item">
                            <v-icon start color="primary">mdi-heart-pulse</v-icon>
                            <span>{{ selectedSkinConcerns.length }} skin concerns</span>
                        </div>
                        <div class="summary-item">
                            <v-icon start color="primary">mdi-bottle-tonic-plus</v-icon>
                            <span>{{ selectedProductTypes.length }} product types</span>
                        </div>
                        <div class="summary-item">
                            <v-icon start color="primary">mdi-calendar-heart</v-icon>
                            <span>{{ getAgeGroupName(selectedAgeGroup) }}</span>
                        </div>
                    </div>

                    <div class="completion-actions">
                        <v-btn color="primary" size="large" @click="completeQuestionnaire" :loading="saving"
                            class="complete-btn">
                            Start Shopping
                            <v-icon end>mdi-shopping</v-icon>
                        </v-btn>
                    </div>
                </div>
            </div>
        </div>

        <!-- Info Dialog -->
        <v-dialog v-model="infoDialog" max-width="400">
            <v-card>
                <v-card-title class="d-flex align-center">
                    <v-icon start color="primary">{{ infoDialogIcon }}</v-icon>
                    {{ infoDialogTitle }}
                </v-card-title>
                <v-card-text>
                    {{ infoDialogContent }}
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="infoDialog = false">Got it</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Loading Overlay -->
        <v-overlay v-model="loading" class="align-center justify-center">
            <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
        </v-overlay>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const currentStep = ref(1)
const totalSteps = ref(5)

// Data
const skinTypes = ref([])
const skinConcerns = ref([])
const productTypes = ref([])

// Selections
const selectedSkinType = ref(null)
const selectedSkinConcerns = ref([])
const selectedProductTypes = ref([])
const selectedAgeGroup = ref(null)

// Age groups
const ageGroups = ref([
    {
        value: 'under_18',
        label: 'Under 18',
        description: 'Young skin with natural glow',
        icon: 'mdi-baby-face'
    },
    {
        value: '18_25',
        label: '18-25',
        description: 'Prevention and maintenance',
        icon: 'mdi-face-woman'
    },
    {
        value: '26_35',
        label: '26-35',
        description: 'Early anti-aging care',
        icon: 'mdi-face-woman-profile'
    },
    {
        value: '36_45',
        label: '36-45',
        description: 'Targeted anti-aging',
        icon: 'mdi-face-woman-shimmer'
    },
    {
        value: '46_plus',
        label: '46+',
        description: 'Mature skin care',
        icon: 'mdi-face-woman-outline'
    }
])

// Info dialog
const infoDialog = ref(false)
const infoDialogTitle = ref('')
const infoDialogContent = ref('')
const infoDialogIcon = ref('')

// Methods
const fetchData = async () => {
    loading.value = true
    try {
        // Note: API endpoints for skin types, concerns, product types no longer exist  
        const [skinTypesRes, skinConcernsRes, productTypesRes] = await Promise.all([
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] }),
            Promise.resolve({ data: [] })
        ])

        skinTypes.value = skinTypesRes.data.results || skinTypesRes.data || []
        skinConcerns.value = skinConcernsRes.data.results || skinConcernsRes.data || []
        productTypes.value = productTypesRes.data.results || productTypesRes.data || []
    } catch (error) {
        console.error('Failed to fetch questionnaire data:', error)
    } finally {
        loading.value = false
    }
}

const selectSkinType = (id) => {
    selectedSkinType.value = id
}

const toggleSkinConcern = (id) => {
    const index = selectedSkinConcerns.value.indexOf(id)
    if (index > -1) {
        selectedSkinConcerns.value.splice(index, 1)
    } else {
        selectedSkinConcerns.value.push(id)
    }
}

const toggleProductType = (id) => {
    const index = selectedProductTypes.value.indexOf(id)
    if (index > -1) {
        selectedProductTypes.value.splice(index, 1)
    } else {
        selectedProductTypes.value.push(id)
    }
}

const selectAgeGroup = (value) => {
    selectedAgeGroup.value = value
}

const nextStep = () => {
    if (currentStep.value < totalSteps.value) {
        currentStep.value++
    }
}

const previousStep = () => {
    if (currentStep.value > 1) {
        currentStep.value--
    }
}

const skipQuestionnaire = () => {
    // Since this page requires authentication, always redirect to home
    router.push({ name: 'Home' })
}

const completeQuestionnaire = async () => {
    saving.value = true
    try {
        // Save preferences to authenticated user's profile
        const profileData = {
            skin_type: selectedSkinType.value,
            skin_concerns: selectedSkinConcerns.value,
            product_types: selectedProductTypes.value,
            age_group: selectedAgeGroup.value
        }

        await apiService.updateProfile(profileData)
        console.log('Beauty profile saved successfully for user:', authStore.user?.id)

        // Redirect to home
        router.push({ name: 'Home' })
    } catch (error) {
        console.error('Failed to save profile:', error)
        // You could add a snackbar or error message here
    } finally {
        saving.value = false
    }
}

// Info dialogs
const showSkinTypeInfo = (skinType) => {
    infoDialogTitle.value = skinType.name
    infoDialogContent.value = skinType.description
    infoDialogIcon.value = getSkinTypeIcon(skinType.name)
    infoDialog.value = true
}

const showSkinConcernInfo = (concern) => {
    infoDialogTitle.value = concern.name
    infoDialogContent.value = concern.description
    infoDialogIcon.value = getSkinConcernIcon(concern.name)
    infoDialog.value = true
}

const showProductTypeInfo = (productType) => {
    infoDialogTitle.value = productType.name
    infoDialogContent.value = productType.description
    infoDialogIcon.value = getProductTypeIcon(productType.name)
    infoDialog.value = true
}

// Icon helpers
const getSkinTypeIcon = (name) => {
    const iconMap = {
        'Normal': 'mdi-face-woman',
        'Dry': 'mdi-water-off',
        'Oily': 'mdi-oil',
        'Combination': 'mdi-yin-yang',
        'Sensitive': 'mdi-heart-pulse',
        'Acne-Prone': 'mdi-alert-circle'
    }
    return iconMap[name] || 'mdi-face-woman-shimmer'
}

const getSkinConcernIcon = (name) => {
    const iconMap = {
        'Acne': 'mdi-alert-circle',
        'Aging': 'mdi-clock-outline',
        'Dark Spots': 'mdi-circle-multiple',
        'Wrinkles': 'mdi-waves',
        'Dryness': 'mdi-water-off',
        'Oiliness': 'mdi-oil',
        'Sensitivity': 'mdi-heart-pulse',
        'Dullness': 'mdi-brightness-6',
        'Pores': 'mdi-dots-grid',
        'Redness': 'mdi-heart'
    }
    return iconMap[name] || 'mdi-heart-pulse'
}

const getProductTypeIcon = (name) => {
    const iconMap = {
        'Cleanser': 'mdi-soap',
        'Moisturizer': 'mdi-water',
        'Serum': 'mdi-eyedropper',
        'Sunscreen': 'mdi-weather-sunny',
        'Toner': 'mdi-bottle-tonic',
        'Exfoliant': 'mdi-screwdriver',
        'Mask': 'mdi-face-woman-shimmer',
        'Eye Cream': 'mdi-eye',
        'Oil': 'mdi-oil',
        'Treatment': 'mdi-medical-bag'
    }
    return iconMap[name] || 'mdi-bottle-tonic-plus'
}

// Helper functions
const getSkinTypeName = (id) => {
    const skinType = skinTypes.value.find(st => st.id === id)
    return skinType ? skinType.name : ''
}

const getAgeGroupName = (value) => {
    const ageGroup = ageGroups.value.find(ag => ag.value === value)
    return ageGroup ? ageGroup.label : ''
}

onMounted(async () => {
    // Ensure user is authenticated (router guard should handle this, but double-check)
    if (!authStore.isAuthenticated) {
        console.log('User not authenticated, redirecting to login')
        router.push({ name: 'Login' })
        return
    }

    console.log('ShopperGoals page loaded for user:', authStore.user?.id)
    await fetchData()
})
</script>

<style scoped>
.goals-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 0;
    display: flex;
    flex-direction: column;
}

.progress-header {
    background: white;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    width: 92%;
    margin: 0 auto;
    margin-top: 10px;
    border-radius: 10px;
}

.progress-container {
    flex: 1;
    max-width: 80%;
}

.progress-bar {
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #7C3AED, #A855F7);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.progress-text {
    font-size: 14px;
    color: #666;
    font-weight: 500;
}

.skip-btn {
    color: #666;
}

.step-content {
    padding: 40px 24px;
    max-width: 800px;
    margin: 0 auto;
    margin-top: 80px;
    /* Account for fixed header */
    flex: 1;
    display: flex;
    flex-direction: column;
}

.step-container {
    background: white;
    border-radius: 24px;
    padding: 40px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    animation: slideIn 0.5s ease;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 160px);
    /* Full height minus header and margins */
    max-height: calc(100vh - 160px);
}

.step-container.completion {
    text-align: center;
    justify-content: center;
    overflow-y: auto;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.step-header {
    text-align: center;
    margin-bottom: 24px;
    flex-shrink: 0;
}

.step-icon {
    margin-bottom: 16px;
}

.step-title {
    font-size: 28px;
    font-weight: 700;
    color: #1a2233;
    margin-bottom: 8px;
}

.step-subtitle {
    font-size: 16px;
    color: #666;
    line-height: 1.5;
}

.options-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    flex: 1;
    overflow-y: auto;
    padding-right: 8px;
    margin-bottom: 24px;
}

/* Custom scrollbar styling */
.options-grid::-webkit-scrollbar {
    width: 6px;
}

.options-grid::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.options-grid::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.options-grid::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.options-grid.multi-select {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.option-card {
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    text-align: center;
}

.option-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    border-color: #7C3AED;
}

.option-card.active {
    background: linear-gradient(135deg, #7C3AED, #A855F7);
    border-color: #7C3AED;
    color: white;
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
}

.option-icon {
    margin-bottom: 16px;
}

.option-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
}

.option-description {
    font-size: 14px;
    opacity: 0.8;
    line-height: 1.4;
    margin-bottom: 0;
}

.info-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0.6;
}

.info-btn:hover {
    opacity: 1;
}

.step-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

.next-btn,
.complete-btn {
    min-width: 140px;
    height: 48px;
    border-radius: 24px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0.5px;
}

.back-btn {
    height: 48px;
    border-radius: 24px;
    font-weight: 600;
    text-transform: none;
}

.completion-content {
    max-width: 500px;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.completion-icon {
    margin-bottom: 24px;
}

.completion-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a2233;
    margin-bottom: 16px;
}

.completion-subtitle {
    font-size: 18px;
    color: #666;
    line-height: 1.6;
    margin-bottom: 32px;
}

.profile-summary {
    background: #f8f9fa;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 32px;
    text-align: left;
}

.profile-summary h3 {
    font-size: 20px;
    font-weight: 600;
    color: #1a2233;
    margin-bottom: 16px;
    text-align: center;
}

.summary-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 0;
    font-size: 16px;
    color: #333;
}

.completion-actions {
    margin-top: 32px;
}

@media (max-width: 768px) {
    .step-content {
        padding: 20px 16px;
        margin-top: 70px;
        /* Smaller margin for mobile */
    }

    .step-container {
        padding: 24px;
        border-radius: 16px;
        height: calc(100vh - 130px);
        /* Adjust for mobile */
        max-height: calc(100vh - 130px);
    }

    .options-grid {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    .step-actions {
        flex-direction: column-reverse;
        gap: 12px;
    }

    .next-btn,
    .back-btn,
    .complete-btn {
        width: 100%;
    }

    .step-title {
        font-size: 24px;
    }

    .completion-title {
        font-size: 28px;
    }

    .progress-header {
        padding: 12px 16px;
    }
}
</style>
