<template>
  <div class="space-y-8">
    <!-- Reviews Overview -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-semibold text-gray-900">Customer Reviews</h2>
        <button
          v-if="canWriteReview"
          @click="showWriteReview = true"
          class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit class="w-4 h-4 mr-2" />
          Write Review
        </button>
      </div>

      <!-- Rating Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Overall Rating -->
        <div class="lg:col-span-1">
          <div class="text-center">
            <div class="text-5xl font-bold text-gray-900 mb-2">{{ overallRating.toFixed(1) }}</div>
            <div class="flex justify-center mb-2">
              <Star
                v-for="i in 5"
                :key="i"
                :class="i <= Math.round(overallRating) ? 'text-yellow-400' : 'text-gray-300'"
                class="w-6 h-6 fill-current"
              />
            </div>
            <div class="text-gray-600">Based on {{ totalReviews }} reviews</div>
          </div>
        </div>

        <!-- Rating Breakdown -->
        <div class="lg:col-span-2">
          <div class="space-y-3">
            <div v-for="rating in [5, 4, 3, 2, 1]" :key="rating" class="flex items-center">
              <span class="text-sm font-medium text-gray-700 w-8">{{ rating }}</span>
              <Star class="w-4 h-4 text-yellow-400 fill-current mr-2" />
              <div class="flex-1 h-2 bg-gray-200 rounded-full mr-4">
                <div 
                  class="h-2 bg-yellow-400 rounded-full transition-all duration-300"
                  :style="{ width: `${(ratingBreakdown[rating] / totalReviews) * 100}%` }"
                ></div>
              </div>
              <span class="text-sm text-gray-600 w-12">{{ ratingBreakdown[rating] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Filters -->
      <div class="flex items-center space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          @click="selectedRatingFilter = null"
          :class="selectedRatingFilter === null 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          All Reviews
        </button>
        <button
          v-for="rating in [5, 4, 3, 2, 1]"
          :key="rating"
          @click="selectedRatingFilter = rating"
          :class="selectedRatingFilter === rating 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          {{ rating }} Star{{ rating > 1 ? 's' : '' }}
        </button>
        <button
          @click="showWithPhotos = !showWithPhotos"
          :class="showWithPhotos 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
          class="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors"
        >
          With Photos
        </button>
      </div>

      <!-- Sort Options -->
      <div class="flex items-center justify-between mb-6">
        <span class="text-sm text-gray-600">{{ filteredReviews.length }} reviews</span>
        <select
          v-model="sortBy"
          class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
          <option value="helpful">Most Helpful</option>
        </select>
      </div>
    </div>

    <!-- Reviews List -->
    <div class="space-y-6">
      <div 
        v-for="review in paginatedReviews" 
        :key="review.id"
        class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <!-- Review Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <img
              :src="review.user.avatar || '/default-avatar.jpg'"
              :alt="review.user.name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div class="ml-3">
              <div class="font-medium text-gray-900">{{ review.user.name }}</div>
              <div class="flex items-center mt-1">
                <div class="flex">
                  <Star
                    v-for="i in 5"
                    :key="i"
                    :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    class="w-4 h-4 fill-current"
                  />
                </div>
                <span class="ml-2 text-sm text-gray-500">{{ formatDate(review.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Verified Purchase Badge -->
          <div v-if="review.verified_purchase" class="flex items-center text-sm text-green-600">
            <CheckCircle class="w-4 h-4 mr-1" />
            Verified Purchase
          </div>
        </div>

        <!-- Review Content -->
        <div class="mb-4">
          <p class="text-gray-700 leading-relaxed">{{ review.comment }}</p>
        </div>

        <!-- Review Photos -->
        <div v-if="review.photos && review.photos.length > 0" class="mb-4">
          <div class="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            <div
              v-for="(photo, index) in review.photos"
              :key="index"
              @click="openPhotoModal(review.photos, index)"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
            >
              <img
                :src="photo.thumbnail || photo.url"
                :alt="`Review photo ${index + 1}`"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        <!-- Seller Response -->
        <div v-if="review.seller_response" class="bg-gray-50 rounded-xl p-4 mb-4">
          <div class="flex items-center mb-2">
            <Store class="w-4 h-4 text-gray-600 mr-2" />
            <span class="font-medium text-gray-900">{{ productData.store_name }} Response</span>
            <span class="ml-2 text-sm text-gray-500">{{ formatDate(review.seller_response.created_at) }}</span>
          </div>
          <p class="text-gray-700">{{ review.seller_response.message }}</p>
        </div>

        <!-- Review Actions -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button
              @click="toggleHelpful(review)"
              :class="review.user_found_helpful 
                ? 'text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'"
              class="flex items-center text-sm transition-colors"
            >
              <ThumbsUp class="w-4 h-4 mr-1" />
              Helpful ({{ review.helpful_count || 0 }})
            </button>
            
            <button
              @click="reportReview(review)"
              class="text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              <Flag class="w-4 h-4 mr-1 inline" />
              Report
            </button>
          </div>

          <!-- Share Review -->
          <button
            @click="shareReview(review)"
            class="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Share2 class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Load More Reviews -->
      <div v-if="hasMoreReviews" class="text-center">
        <button
          @click="loadMoreReviews"
          :disabled="loadingReviews"
          class="px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          <component :is="loadingReviews ? Loader2 : ChevronDown" 
                     :class="{ 'animate-spin': loadingReviews }" 
                     class="w-4 h-4 mr-2 inline" />
          {{ loadingReviews ? 'Loading...' : 'Load More Reviews' }}
        </button>
      </div>
    </div>

    <!-- Write Review Modal -->
    <div v-if="showWriteReview" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showWriteReview = false"></div>
        
        <div class="inline-block align-bottom bg-white rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div class="bg-white px-6 pt-6 pb-4">
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-2xl font-semibold text-gray-900">Write a Review</h3>
              <button
                @click="showWriteReview = false"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X class="w-6 h-6" />
              </button>
            </div>

            <form @submit.prevent="submitReview" class="space-y-6">
              <!-- Rating -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating *
                </label>
                <div class="flex space-x-1">
                  <button
                    v-for="i in 5"
                    :key="i"
                    type="button"
                    @click="newReview.rating = i"
                    class="p-1"
                  >
                    <Star
                      :class="i <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'"
                      class="w-8 h-8 fill-current hover:text-yellow-400 transition-colors"
                    />
                  </button>
                </div>
              </div>

              <!-- Review Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Review Title
                </label>
                <input
                  v-model="newReview.title"
                  type="text"
                  placeholder="Summarize your experience"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <!-- Review Comment -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Your Review *
                </label>
                <textarea
                  v-model="newReview.comment"
                  rows="4"
                  placeholder="Share your thoughts about this product..."
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>

              <!-- Photo Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Add Photos (Optional)
                </label>
                <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    @change="handlePhotoUpload"
                    class="hidden"
                    id="review-photos"
                  />
                  <label for="review-photos" class="cursor-pointer">
                    <Camera class="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <div class="text-sm text-gray-600">Click to upload photos</div>
                  </label>
                </div>
                
                <!-- Photo Previews -->
                <div v-if="newReview.photos.length > 0" class="grid grid-cols-4 gap-2 mt-4">
                  <div
                    v-for="(photo, index) in newReview.photos"
                    :key="index"
                    class="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      :src="photo.preview"
                      :alt="`Photo ${index + 1}`"
                      class="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      @click="removePhoto(index)"
                      class="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X class="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <!-- Pros and Cons -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Pros
                  </label>
                  <div class="space-y-2">
                    <div
                      v-for="(pro, index) in newReview.pros"
                      :key="index"
                      class="flex items-center"
                    >
                      <input
                        v-model="newReview.pros[index]"
                        type="text"
                        placeholder="What did you like?"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        @click="newReview.pros.splice(index, 1)"
                        class="ml-2 p-2 text-red-500 hover:text-red-700"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="newReview.pros.push('')"
                      class="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Pro
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Cons
                  </label>
                  <div class="space-y-2">
                    <div
                      v-for="(con, index) in newReview.cons"
                      :key="index"
                      class="flex items-center"
                    >
                      <input
                        v-model="newReview.cons[index]"
                        type="text"
                        placeholder="What could be improved?"
                        class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        @click="newReview.cons.splice(index, 1)"
                        class="ml-2 p-2 text-red-500 hover:text-red-700"
                      >
                        <X class="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      @click="newReview.cons.push('')"
                      class="text-sm text-blue-600 hover:text-blue-700"
                    >
                      + Add Con
                    </button>
                  </div>
                </div>
              </div>

              <!-- Submit Buttons -->
              <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  @click="showWriteReview = false"
                  class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!newReview.rating || !newReview.comment || submittingReview"
                  class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <component :is="submittingReview ? Loader2 : Send" 
                             :class="{ 'animate-spin': submittingReview }" 
                             class="w-4 h-4 mr-2 inline" />
                  {{ submittingReview ? 'Submitting...' : 'Submit Review' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Modal -->
    <div v-if="showPhotoModal" class="fixed inset-0 z-50 overflow-hidden">
      <div class="flex items-center justify-center min-h-screen">
        <div class="fixed inset-0 bg-black bg-opacity-90" @click="showPhotoModal = false"></div>
        
        <div class="relative max-w-4xl max-h-full p-4">
          <img
            :src="modalPhotos[currentPhotoIndex]?.url"
            :alt="`Photo ${currentPhotoIndex + 1}`"
            class="max-w-full max-h-full object-contain"
          />
          
          <!-- Navigation -->
          <button
            v-if="modalPhotos.length > 1 && currentPhotoIndex > 0"
            @click="currentPhotoIndex--"
            class="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
          >
            <ChevronLeft class="w-6 h-6" />
          </button>
          
          <button
            v-if="modalPhotos.length > 1 && currentPhotoIndex < modalPhotos.length - 1"
            @click="currentPhotoIndex++"
            class="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
          >
            <ChevronRight class="w-6 h-6" />
          </button>
          
          <!-- Close Button -->
          <button
            @click="showPhotoModal = false"
            class="absolute top-4 right-4 p-2 bg-white bg-opacity-20 text-white rounded-full hover:bg-opacity-30 transition-colors"
          >
            <X class="w-6 h-6" />
          </button>
          
          <!-- Photo Counter -->
          <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
            {{ currentPhotoIndex + 1 }} / {{ modalPhotos.length }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { apiService } from '@/services/api'
import { 
  Star, Edit, CheckCircle, ThumbsUp, Flag, Share2, Store, 
  ChevronDown, ChevronLeft, ChevronRight, Camera, X, Send,
  Loader2
} from 'lucide-vue-next'

// Props
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  productData: {
    type: Object,
    default: () => ({})
  },
  canWriteReview: {
    type: Boolean,
    default: true
  }
})

// State
const loading = ref(false)
const loadingReviews = ref(false)
const submittingReview = ref(false)
const showWriteReview = ref(false)
const showPhotoModal = ref(false)
const selectedRatingFilter = ref(null)
const showWithPhotos = ref(false)
const sortBy = ref('newest')
const currentPage = ref(1)

// Data
const reviews = ref([])
const ratingBreakdown = ref({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 })
const modalPhotos = ref([])
const currentPhotoIndex = ref(0)

// New Review Form
const newReview = reactive({
  rating: 0,
  title: '',
  comment: '',
  photos: [],
  pros: [''],
  cons: ['']
})

// Mock data
const mockReviews = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg'
    },
    rating: 5,
    comment: 'Absolutely love this product! The quality is outstanding and it arrived exactly as described. The seller was very responsive to my questions.',
    verified_purchase: true,
    helpful_count: 23,
    user_found_helpful: false,
    created_at: '2024-01-15T10:30:00Z',
    photos: [
      { url: '/review-photos/1a.jpg', thumbnail: '/review-photos/1a-thumb.jpg' },
      { url: '/review-photos/1b.jpg', thumbnail: '/review-photos/1b-thumb.jpg' }
    ],
    seller_response: {
      message: 'Thank you so much for your wonderful review! We truly appreciate your feedback.',
      created_at: '2024-01-16T09:15:00Z'
    }
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      avatar: '/avatars/mike.jpg'
    },
    rating: 4,
    comment: 'Good product overall. Fast shipping and well packaged. Only minor issue was the color was slightly different than expected.',
    verified_purchase: true,
    helpful_count: 12,
    user_found_helpful: true,
    created_at: '2024-01-10T14:22:00Z',
    photos: []
  },
  {
    id: 3,
    user: {
      name: 'Emma Wilson',
      avatar: '/avatars/emma.jpg'
    },
    rating: 3,
    comment: 'It\'s okay. Does what it\'s supposed to do but nothing special. Could be better value for the price.',
    verified_purchase: false,
    helpful_count: 8,
    user_found_helpful: false,
    created_at: '2024-01-08T16:45:00Z',
    photos: []
  }
]

// Initialize with mock data
reviews.value = mockReviews
ratingBreakdown.value = { 5: 1, 4: 1, 3: 1, 2: 0, 1: 0 }

// Computed properties
const totalReviews = computed(() => {
  return Object.values(ratingBreakdown.value).reduce((sum, count) => sum + count, 0)
})

const overallRating = computed(() => {
  const totalPoints = Object.entries(ratingBreakdown.value)
    .reduce((sum, [rating, count]) => sum + (parseInt(rating) * count), 0)
  return totalReviews.value > 0 ? totalPoints / totalReviews.value : 0
})

const filteredReviews = computed(() => {
  let filtered = [...reviews.value]
  
  if (selectedRatingFilter.value) {
    filtered = filtered.filter(review => review.rating === selectedRatingFilter.value)
  }
  
  if (showWithPhotos.value) {
    filtered = filtered.filter(review => review.photos && review.photos.length > 0)
  }
  
  // Sort reviews
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at)
      case 'highest':
        return b.rating - a.rating
      case 'lowest':
        return a.rating - b.rating
      case 'helpful':
        return (b.helpful_count || 0) - (a.helpful_count || 0)
      default: // newest
        return new Date(b.created_at) - new Date(a.created_at)
    }
  })
  
  return filtered
})

const paginatedReviews = computed(() => {
  const pageSize = 5
  return filteredReviews.value.slice(0, currentPage.value * pageSize)
})

const hasMoreReviews = computed(() => {
  const pageSize = 5
  return filteredReviews.value.length > currentPage.value * pageSize
})

// Methods
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const loadMoreReviews = () => {
  currentPage.value++
}

const toggleHelpful = async (review) => {
  try {
    if (review.user_found_helpful) {
      await apiService.removeReviewHelpful(review.id)
      review.helpful_count = Math.max(0, (review.helpful_count || 0) - 1)
    } else {
      await apiService.markReviewHelpful(review.id)
      review.helpful_count = (review.helpful_count || 0) + 1
    }
    review.user_found_helpful = !review.user_found_helpful
  } catch (error) {
    console.error('Error toggling helpful:', error)
  }
}

const reportReview = async (review) => {
  // Implementation for reporting review
  console.log('Report review:', review.id)
}

const shareReview = (review) => {
  const url = `${window.location.origin}/product/${props.productId}#review-${review.id}`
  navigator.clipboard.writeText(url)
  // Show success message
}

const openPhotoModal = (photos, index) => {
  modalPhotos.value = photos
  currentPhotoIndex.value = index
  showPhotoModal.value = true
}

const handlePhotoUpload = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        newReview.photos.push({
          file,
          preview: e.target.result
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removePhoto = (index) => {
  newReview.photos.splice(index, 1)
}

const submitReview = async () => {
  if (!newReview.rating || !newReview.comment) return
  
  submittingReview.value = true
  
  try {
    const formData = new FormData()
    formData.append('product_id', props.productId)
    formData.append('rating', newReview.rating)
    formData.append('title', newReview.title)
    formData.append('comment', newReview.comment)
    
    // Add pros and cons
    const pros = newReview.pros.filter(pro => pro.trim())
    const cons = newReview.cons.filter(con => con.trim())
    if (pros.length > 0) formData.append('pros', JSON.stringify(pros))
    if (cons.length > 0) formData.append('cons', JSON.stringify(cons))
    
    // Add photos
    newReview.photos.forEach((photo, index) => {
      formData.append(`photo_${index}`, photo.file)
    })
    
    const response = await apiService.submitProductReview(formData)
    
    // Add new review to the list
    reviews.value.unshift(response.data)
    
    // Update rating breakdown
    ratingBreakdown.value[newReview.rating]++
    
    // Reset form
    Object.assign(newReview, {
      rating: 0,
      title: '',
      comment: '',
      photos: [],
      pros: [''],
      cons: ['']
    })
    
    showWriteReview.value = false
  } catch (error) {
    console.error('Error submitting review:', error)
  } finally {
    submittingReview.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Load reviews data
  try {
    const response = await apiService.getProductReviews(props.productId)
    reviews.value = response.data.results || response.data || []
    
    // Calculate rating breakdown
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    reviews.value.forEach(review => {
      breakdown[review.rating]++
    })
    ratingBreakdown.value = breakdown
  } catch (error) {
    console.error('Error loading reviews:', error)
  }
})
</script>

<style scoped>
/* Add any custom styles here */
</style>