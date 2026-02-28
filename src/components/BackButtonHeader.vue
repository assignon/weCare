<template>
  <div class="sticky top-0 z-10 bg-white/90 backdrop-blur-md px-5 py-3 w-full">
    <div class="flex items-center gap-3 w-full">
      <button 
        @click="goBack" 
        class="w-10 h-10 flex items-center justify-center rounded-2xl bg-grey-50 hover:bg-grey-100 transition-colors"
      >
        <ArrowLeft class="w-5 h-5 text-navy" />
      </button>
      <h1 class="text-base font-bold text-navy">{{ title }}</h1>
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
