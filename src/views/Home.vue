<template>
  <div class="home">
    <Auth />
  </div>
</template>

<script setup lang="ts">
import Auth from '../components/Auth.vue';
</script>

<style scoped>
.home {
  width: 100%;
  height: calc(100vh - 60px); /* Adjust based on your menu bar height */
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>