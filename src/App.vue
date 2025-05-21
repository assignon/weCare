<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const mainPages = ['Home', 'Orders', 'Wishlist']
const showBottomNav = computed(() => mainPages.includes(route.name))
</script>

<template>
  <v-app class="app-container">
    <v-main class="main-content">
      <router-view />
    </v-main>
    <v-bottom-navigation
      v-if="showBottomNav"
      fixed
      color="primary"
      grow
      class="bottom-nav"
    >
      <v-btn :to="{ name: 'Home' }">
        <v-icon>mdi-home</v-icon>
        <span>Home</span>
      </v-btn>
      <v-btn :to="{ name: 'Orders' }">
        <v-icon>mdi-receipt</v-icon>
        <span>Orders</span>
      </v-btn>
      <v-btn :to="{ name: 'Wishlist' }">
        <v-icon>mdi-heart</v-icon>
        <span>Wishlist</span>
      </v-btn>
      <v-btn :to="{ name: 'Cart' }">
        <v-icon>mdi-cart</v-icon>
        <span>Cart</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

:root {
  --primary-color: #7C3AED;
  --secondary-color: #006763;
}

html, body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;
}

* {
  box-sizing: border-box;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.main-content {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  width: 100%;
}

body {
  background: #f9f9f9;
}

/* Fix for v-app not taking full width in some browsers */
.v-application {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}

.v-application__wrap {
  width: 100% !important;
  min-width: 100% !important;
}
</style>
