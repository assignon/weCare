<template>
  <div class="home-page">
    <v-container>
      <h2 class="text-h6 font-weight-bold mb-4">Products</h2>
      <v-row class="mb-4">
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="search"
            label="Search products"
            prepend-inner-icon="mdi-magnify"
            clearable
            @keyup.enter="fetchProducts"
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-select
            v-model="selectedCategory"
            :items="categories"
            item-title="name"
            item-value="id"
            label="Category"
            clearable
            @change="fetchProducts"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col
          v-for="product in products"
          :key="product.id"
          cols="12" sm="6" md="4"
        >
          <v-card class="mb-4">
            <v-img :src="product.image || 'https://via.placeholder.com/150'" height="160" />
            <v-card-title class="text-subtitle-1 font-weight-bold">{{ product.name }}</v-card-title>
            <v-card-subtitle class="text-body-2">${{ product.price }}</v-card-subtitle>
            <v-card-actions>
              <v-btn color="primary" block :to="{ name: 'ProductDetails', params: { id: product.id } }">View</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
    </v-container>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const products = ref([])
const error = ref(null)
const search = ref('')
const categories = ref([])
const selectedCategory = ref(null)

const fetchCategories = async () => {
  try {
    const res = await axios.get('/api/products/categories/')
    categories.value = res.data.results || res.data
  } catch (err) {
    // ignore category errors for now
  }
}

const fetchProducts = async () => {
  try {
    const params = {}
    if (search.value) params.search = search.value
    if (selectedCategory.value) params.category = selectedCategory.value
    const res = await axios.get('/api/products/products/', { params })
    products.value = res.data.results || res.data
  } catch (err) {
    error.value = 'Failed to load products.'
  }
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.home-page {
  padding-bottom: 64px;
}
</style> 