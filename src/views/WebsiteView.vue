<template>
    <div class="home">
      <div v-if="!isLoaded" class="loader">
        <ProgressSpinner />
      </div>
      <iframe 
        :src="websiteUrl" 
        @load="onIframeLoad" 
        width="100%" 
        height="800px" 
        frameborder="0"
        v-show="isLoaded"
      ></iframe>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import ProgressSpinner from 'primevue/progressspinner';
  
  const websiteUrl = ref('https://zungukasafaris.com/');
  const isLoaded = ref(false);
  
  const onIframeLoad = () => {
    isLoaded.value = true;
  };
  
  onMounted(() => {
    const isLoggedIn = !!localStorage.getItem('token');
    console.log('User is logged in:', isLoggedIn);
  });
  </script>
  
  <style scoped>
  .home {
    width: 100%;
    height: calc(100vh - 60px); /* Adjust based on your menu bar height */
    overflow: hidden;
  }
  
  .loader {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
  }
  </style>