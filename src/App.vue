<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
    <v-bottom-navigation
      v-if="showBottomNav"
      app
      color="primary"
      grow
      class="bottom-nav"
    >
      <v-btn :to="{ name: 'Home' }" icon>
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn :to="{ name: 'Orders' }" icon>
        <v-icon>mdi-receipt</v-icon>
      </v-btn>
      <v-btn :to="{ name: 'Wishlist' }" icon>
        <v-icon>mdi-heart</v-icon>
      </v-btn>
      <v-btn :to="{ name: 'Cart' }" icon>
        <v-icon>mdi-cart</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

body {
  background: #f9f9f9;
}
</style>
