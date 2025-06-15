<template>
    <div class="skin-profile-page">
        <!-- Header -->
        <div class="profile-header">
            <div class="header-container">
                <v-btn icon variant="text" @click="$router.go(-1)" class="back-btn">
                    <v-icon>mdi-arrow-left</v-icon>
                </v-btn>
                <h1 class="header-title">Skin Profile</h1>
                <div style="width: 40px"></div> <!-- Spacer -->
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
            <v-progress-circular color="primary" indeterminate size="64"></v-progress-circular>
            <p class="loading-text">Loading your skin profile...</p>
        </div>

        <!-- Content -->
        <div v-else class="profile-content">
            <!-- Current Profile Summary -->
            <v-card class="profile-summary-card mb-6" elevation="0">
                <v-card-title class="d-flex align-center pa-4">
                    <v-icon color="primary" class="mr-2">mdi-face-woman-shimmer</v-icon>
                    <span class="text-h6 font-weight-bold">Your Skin Type Profile</span>
                </v-card-title>

                <v-card-text class="pt-0">
                    <div v-if="!hasProfileData" class="text-center py-4">
                        <v-icon size="48" color="grey-lighten-1" class="mb-2">mdi-face-woman-outline</v-icon>
                        <p class="text-body-2 text-grey mb-3">No skin profile data found</p>
                        <p class="text-caption text-grey">Complete the sections below to build your profile</p>
                    </div>

                    <div v-else class="current-profile">
                        <!-- Skin Type -->
                        <div class="profile-item mb-3">
                            <div class="d-flex align-center">
                                <v-icon color="primary" size="20" class="mr-2">mdi-face-woman</v-icon>
                                <span class="text-subtitle-2 font-weight-medium">Skin Type:</span>
                                <v-spacer></v-spacer>
                                <span class="text-body-2">{{ currentProfile.skin_type_detail.name || 'Not set'
                                }}</span>
                            </div>
                        </div>

                        <!-- Age Group -->
                        <div class="profile-item mb-3" v-if="currentProfile.age_group">
                            <div class="d-flex align-center">
                                <v-icon color="primary" size="20" class="mr-2">mdi-calendar-heart</v-icon>
                                <span class="text-subtitle-2 font-weight-medium">Age Group:</span>
                                <v-spacer></v-spacer>
                                <span class="text-body-2">{{ getAgeGroupLabel(currentProfile.age_group) }}</span>
                            </div>
                        </div>

                        <!-- Skin Concerns -->
                        <div class="profile-item mb-3">
                            <div class="d-flex align-center mb-1">
                                <v-icon color="primary" size="20" class="mr-2">mdi-heart-pulse</v-icon>
                                <span class="text-subtitle-2 font-weight-medium">Skin Concerns:</span>
                            </div>
                            <div class="ml-6">
                                <div v-if="currentProfile.skin_concerns && currentProfile.skin_concerns.length > 0"
                                    class="d-flex flex-wrap gap-1">
                                    <v-chip v-for="concern in currentProfile.skin_concerns_detail" :key="concern.id"
                                        size="small" color="primary" variant="outlined" class="text-caption">
                                        {{ concern.name }}
                                    </v-chip>
                                </div>
                                <span v-else class="text-body-2 text-grey">None selected</span>
                            </div>
                        </div>

                        <!-- Product Types -->
                        <div class="profile-item">
                            <div class="d-flex align-center mb-1">
                                <v-icon color="primary" size="20" class="mr-2">mdi-bottle-tonic-plus</v-icon>
                                <span class="text-subtitle-2 font-weight-medium">Product Types:</span>
                            </div>
                            <div class="ml-6">
                                <div v-if="currentProfile.product_types && currentProfile.product_types.length > 0"
                                    class="d-flex flex-wrap gap-1">
                                    <v-chip v-for="productType in currentProfile.product_types_detail"
                                        :key="productType.id" size="small" color="primary" variant="outlined"
                                        class="text-caption">
                                        {{ productType.name }}
                                    </v-chip>
                                </div>
                                <span v-else class="text-body-2 text-grey">None selected</span>
                            </div>
                        </div>
                    </div>
                </v-card-text>
            </v-card>

            <!-- Edit Sections -->
            <div class="edit-sections">
                <!-- Skin Type Section -->
                <v-card class="section-card mb-4" elevation="0">
                    <v-card-title class="d-flex align-center pa-4 pb-2">
                        <v-icon color="primary" class="mr-2">mdi-face-woman</v-icon>
                        <span class="text-h6 font-weight-bold">Skin Type</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="text" size="small" @click="editSection = 'skinType'"
                            class="text-none">
                            {{ selectedSkinType ? 'Change' : 'Select' }}
                        </v-btn>
                    </v-card-title>

                    <v-card-text class="pt-0" v-if="editSection === 'skinType'">
                        <v-radio-group v-model="selectedSkinType" class="mt-0">
                            <v-radio v-for="skinType in availableSkinTypes" :key="skinType.id" :value="skinType.id"
                                :label="skinType.name" class="mb-1">
                                <template v-slot:label>
                                    <div>
                                        <div class="font-weight-medium">{{ skinType.name }}</div>
                                        <div class="text-caption text-grey">{{ skinType.description }}</div>
                                    </div>
                                </template>
                            </v-radio>
                        </v-radio-group>
                        <div class="section-actions mt-3">
                            <v-btn color="primary" @click="saveSection('skinType')" :loading="saving"
                                class="text-none mr-2">
                                Save
                            </v-btn>
                            <v-btn variant="outlined" @click="editSection = null" class="text-none">
                                Cancel
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Age Group Section -->
                <v-card class="section-card mb-4" elevation="0">
                    <v-card-title class="d-flex align-center pa-4 pb-2">
                        <v-icon color="primary" class="mr-2">mdi-calendar-heart</v-icon>
                        <span class="text-h6 font-weight-bold">Age Group</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="text" size="small" @click="editSection = 'ageGroup'"
                            class="text-none">
                            {{ selectedAgeGroup ? 'Change' : 'Select' }}
                        </v-btn>
                    </v-card-title>

                    <v-card-text class="pt-0" v-if="editSection === 'ageGroup'">
                        <v-radio-group v-model="selectedAgeGroup" class="mt-0">
                            <v-radio v-for="ageGroup in ageGroups" :key="ageGroup.value" :value="ageGroup.value"
                                :label="ageGroup.label" class="mb-1">
                                <template v-slot:label>
                                    <div>
                                        <div class="font-weight-medium">{{ ageGroup.label }}</div>
                                        <div class="text-caption text-grey">{{ ageGroup.description }}</div>
                                    </div>
                                </template>
                            </v-radio>
                        </v-radio-group>
                        <div class="section-actions mt-3">
                            <v-btn color="primary" @click="saveSection('ageGroup')" :loading="saving"
                                class="text-none mr-2">
                                Save
                            </v-btn>
                            <v-btn variant="outlined" @click="editSection = null" class="text-none">
                                Cancel
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Skin Concerns Section -->
                <v-card class="section-card mb-4" elevation="0">
                    <v-card-title class="d-flex align-center pa-4 pb-2">
                        <v-icon color="primary" class="mr-2">mdi-heart-pulse</v-icon>
                        <span class="text-h6 font-weight-bold">Skin Concerns</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="text" size="small" @click="editSection = 'skinConcerns'"
                            class="text-none">
                            {{ selectedSkinConcerns.length > 0 ? 'Edit' : 'Select' }}
                        </v-btn>
                    </v-card-title>

                    <v-card-text class="pt-0" v-if="editSection === 'skinConcerns'">
                        <p class="text-caption text-grey mb-3">Select all that apply</p>
                        <div class="d-flex flex-wrap gap-2">
                            <v-chip v-for="concern in availableSkinConcerns" :key="concern.id"
                                :color="selectedSkinConcerns.includes(concern.id) ? 'primary' : 'default'"
                                :variant="selectedSkinConcerns.includes(concern.id) ? 'flat' : 'outlined'" clickable
                                @click="toggleSkinConcern(concern.id)" class="text-caption">
                                {{ concern.name }}
                            </v-chip>
                        </div>
                        <div class="section-actions mt-3">
                            <v-btn color="primary" @click="saveSection('skinConcerns')" :loading="saving"
                                class="text-none mr-2">
                                Save
                            </v-btn>
                            <v-btn variant="outlined" @click="editSection = null" class="text-none">
                                Cancel
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>

                <!-- Product Types Section -->
                <v-card class="section-card mb-4" elevation="0">
                    <v-card-title class="d-flex align-center pa-4 pb-2">
                        <v-icon color="primary" class="mr-2">mdi-bottle-tonic-plus</v-icon>
                        <span class="text-h6 font-weight-bold">Product Types</span>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" variant="text" size="small" @click="editSection = 'productTypes'"
                            class="text-none">
                            {{ selectedProductTypes.length > 0 ? 'Edit' : 'Select' }}
                        </v-btn>
                    </v-card-title>

                    <v-card-text class="pt-0" v-if="editSection === 'productTypes'">
                        <p class="text-caption text-grey mb-3">Select products you currently use</p>
                        <div class="d-flex flex-wrap gap-2">
                            <v-chip v-for="productType in availableProductTypes" :key="productType.id"
                                :color="selectedProductTypes.includes(productType.id) ? 'secondary' : 'default'"
                                :variant="selectedProductTypes.includes(productType.id) ? 'flat' : 'outlined'" clickable
                                @click="toggleProductType(productType.id)" class="text-caption">
                                {{ productType.name }}
                            </v-chip>
                        </div>
                        <div class="section-actions mt-3">
                            <v-btn color="primary" @click="saveSection('productTypes')" :loading="saving"
                                class="text-none mr-2">
                                Save
                            </v-btn>
                            <v-btn variant="outlined" @click="editSection = null" class="text-none">
                                Cancel
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </div>

            <!-- Save All Button -->
            <!-- <div class="save-all-section" v-if="hasChanges">
                <v-card class="save-all-card" elevation="2">
                    <v-card-text class="pa-4">
                        <div class="d-flex align-center">
                            <div>
                                <div class="text-subtitle-1 font-weight-bold">Save All Changes</div>
                                <div class="text-caption text-grey">Update your complete skin profile</div>
                            </div>
                            <v-spacer></v-spacer>
                            <v-btn color="primary" size="large" @click="saveAllChanges" :loading="saving"
                                class="text-none">
                                Save All Changes
                            </v-btn>
                        </div>
                    </v-card-text>
                </v-card>
            </div> -->
        </div>

        <!-- Success Snackbar -->
        <v-snackbar v-model="showSuccessMessage" color="success" timeout="3000">
            <v-icon start>mdi-check-circle</v-icon>
            {{ successMessage }}
        </v-snackbar>

        <!-- Error Snackbar -->
        <v-snackbar v-model="showErrorMessage" color="error" timeout="5000">
            <v-icon start>mdi-alert-circle</v-icon>
            {{ errorMessage }}
        </v-snackbar>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiService } from '@/services/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// State
const loading = ref(false)
const saving = ref(false)
const editSection = ref(null)

// Current profile data
const currentProfile = ref({})

// Available options
const availableSkinTypes = ref([])
const availableSkinConcerns = ref([])
const availableProductTypes = ref([])

// Selected values (for editing)
const selectedSkinType = ref(null)
const selectedAgeGroup = ref(null)
const selectedSkinConcerns = ref([])
const selectedProductTypes = ref([])

// Original values (to track changes)
const originalSkinType = ref(null)
const originalAgeGroup = ref(null)
const originalSkinConcerns = ref([])
const originalProductTypes = ref([])

// Messages
const showSuccessMessage = ref(false)
const showErrorMessage = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

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

// Computed properties
const hasProfileData = computed(() => {
    return currentProfile.value.skin_type ||
        (currentProfile.value.skin_concerns && currentProfile.value.skin_concerns.length > 0) ||
        (currentProfile.value.product_types && currentProfile.value.product_types.length > 0) ||
        currentProfile.value.age_group
})

const hasChanges = computed(() => {
    return selectedSkinType.value !== originalSkinType.value ||
        selectedAgeGroup.value !== originalAgeGroup.value ||
        !arraysEqual(selectedSkinConcerns.value, originalSkinConcerns.value) ||
        !arraysEqual(selectedProductTypes.value, originalProductTypes.value)
})

// Helper functions
const getAgeGroupLabel = (value) => {
    const ageGroup = ageGroups.value.find(ag => ag.value === value)
    return ageGroup ? ageGroup.label : value
}

const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false
    return a.every(val => b.includes(val)) && b.every(val => a.includes(val))
}

// Toggle functions
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

// Data fetching
const fetchProfileData = async () => {
    try {
        const response = await apiService.getProfile()
        currentProfile.value = response.data

        // Debug: Log the profile data structure
        console.log('Profile data received:', currentProfile.value)

        // Set current selections - ensure arrays are properly initialized
        selectedSkinType.value = currentProfile.value.skin_type?.id || null
        selectedAgeGroup.value = currentProfile.value.age_group || null
        selectedSkinConcerns.value = (currentProfile.value.skin_concerns || []).map(c => c?.id).filter(id => id != null)
        selectedProductTypes.value = (currentProfile.value.product_types || []).map(p => p?.id).filter(id => id != null)

        // Debug: Log the selected values
        console.log('Selected values:', {
            skinType: selectedSkinType.value,
            ageGroup: selectedAgeGroup.value,
            skinConcerns: selectedSkinConcerns.value,
            productTypes: selectedProductTypes.value
        })

        // Store original values
        originalSkinType.value = selectedSkinType.value
        originalAgeGroup.value = selectedAgeGroup.value
        originalSkinConcerns.value = [...selectedSkinConcerns.value]
        originalProductTypes.value = [...selectedProductTypes.value]
    } catch (error) {
        console.error('Failed to fetch profile data:', error)
        showError('Failed to load profile data')
    }
}

const fetchOptions = async () => {
    try {
        const [skinTypesRes, skinConcernsRes, productTypesRes] = await Promise.all([
            apiService.getSkinTypes(),
            apiService.getSkinConcerns(),
            apiService.getProductTypes()
        ])

        availableSkinTypes.value = skinTypesRes.data.results || skinTypesRes.data || []
        availableSkinConcerns.value = skinConcernsRes.data.results || skinConcernsRes.data || []
        availableProductTypes.value = productTypesRes.data.results || productTypesRes.data || []
    } catch (error) {
        console.error('Failed to fetch options:', error)
        showError('Failed to load options')
    }
}

// Save functions
const saveSection = async (section) => {
    saving.value = true
    try {
        let updateData = {}

        switch (section) {
            case 'skinType':
                updateData.skin_type = selectedSkinType.value
                break
            case 'ageGroup':
                updateData.age_group = selectedAgeGroup.value
                break
            case 'skinConcerns':
                // Filter out null/undefined values and ensure we have valid IDs
                updateData.skin_concerns = selectedSkinConcerns.value.filter(id => id != null && id !== undefined)
                break
            case 'productTypes':
                // Filter out null/undefined values and ensure we have valid IDs
                updateData.product_types = selectedProductTypes.value.filter(id => id != null && id !== undefined)
                break
        }

        // Debug: Log the data being sent to API
        console.log('Sending update data:', updateData)

        await apiService.updateProfile(updateData)

        // Refresh profile data
        await fetchProfileData()

        // Refresh auth store
        await auth.fetchUserData()

        editSection.value = null
        showSuccess(`${section === 'skinType' ? 'Skin type' :
            section === 'ageGroup' ? 'Age group' :
                section === 'skinConcerns' ? 'Skin concerns' :
                    'Product types'} updated successfully`)
    } catch (error) {
        console.error('Failed to save section:', error)
        showError('Failed to save changes')
    } finally {
        saving.value = false
    }
}

const saveAllChanges = async () => {
    saving.value = true
    try {
        const updateData = {
            skin_type: selectedSkinType.value,
            age_group: selectedAgeGroup.value,
            skin_concerns: selectedSkinConcerns.value.filter(id => id != null && id !== undefined),
            product_types: selectedProductTypes.value.filter(id => id != null && id !== undefined)
        }

        await apiService.updateProfile(updateData)

        // Refresh profile data
        await fetchProfileData()

        // Refresh auth store
        await auth.fetchUserData()

        editSection.value = null
        showSuccess('Skin profile updated successfully')
    } catch (error) {
        console.error('Failed to save all changes:', error)
        showError('Failed to save changes')
    } finally {
        saving.value = false
    }
}

// Message functions
const showSuccess = (message) => {
    successMessage.value = message
    showSuccessMessage.value = true
}

const showError = (message) => {
    errorMessage.value = message
    showErrorMessage.value = true
}

// Initialize
onMounted(async () => {
    loading.value = true
    try {
        await Promise.all([
            fetchProfileData(),
            fetchOptions()
        ])
    } catch (error) {
        console.error('Failed to initialize skin profile page:', error)
    } finally {
        loading.value = false
    }
})
</script>

<style scoped>
.skin-profile-page {
    min-height: 100vh;
    background: #f5f5f5;
    padding-bottom: 80px;
}

.profile-header {
    background: white;
    padding: 16px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 100;
}

.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 800px;
    margin: 0 auto;
}

.header-title {
    font-size: 20px;
    font-weight: 600;
    color: #1a2233;
    margin: 0;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    text-align: center;
}

.loading-text {
    margin-top: 16px;
    color: #666;
    font-size: 16px;
}

.profile-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px;
}

.profile-summary-card,
.section-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e9ecef;
}

.current-profile {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 16px;
}

.profile-item {
    padding: 8px 0;
}

.profile-item:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
}

.section-actions {
    display: flex;
    gap: 8px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
}

.save-all-section {
    position: sticky;
    bottom: 20px;
    z-index: 50;
}

.save-all-card {
    background: white;
    border-radius: 16px;
    border: 2px solid #7C3AED;
}

.gap-1 {
    gap: 4px;
}

.gap-2 {
    gap: 8px;
}

@media (max-width: 768px) {
    .profile-content {
        padding: 16px;
    }

    .header-container {
        padding: 0 8px;
    }

    .section-actions {
        flex-direction: column;
    }

    .section-actions .v-btn {
        width: 100%;
    }
}
</style>