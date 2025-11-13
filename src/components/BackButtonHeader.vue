<template>
  <div class="sticky top-0 z-10 bg-white border-b px-4 py-3 w-full">
    <div class="flex items-center gap-3 w-full">
      <button 
        @click="goBack" 
        class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
      >
        <div class="gradient-arrow-wrapper">
          <ArrowLeft class="w-6 h-6" />
        </div>
      </button>
      <h1 class="text-md font-semibold">{{ title }}</h1>
      <div v-if="$slots.right" class="ml-auto">
        <slot name="right"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  backRoute: {
    type: [String, Object],
    default: null
  }
})

const router = useRouter()

const goBack = () => {
  if (props.backRoute) {
    if (typeof props.backRoute === 'string') {
      router.push(props.backRoute)
    } else {
      router.push(props.backRoute)
    }
  } else {
    router.back()
  }
}
</script>

<style scoped>
.gradient-arrow-wrapper {
  position: relative;
  width: 24px;
  height: 24px;
  background: linear-gradient(to right, #8c36ea, #3060eb);
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m12 19-7-7 7-7'/%3E%3Cpath d='M19 12H5'/%3E%3C/svg%3E");
  -webkit-mask-size: contain;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
}

.gradient-arrow-wrapper :deep(svg) {
  display: none;
}
</style>

