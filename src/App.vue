<template>
  <div class="app-container">
    <MenuBar @logout="handleLogout" ref="menuBar"/>
    <main class="main-content">
      <router-view></router-view>
    </main>
    <SpeedDial 
      :model="items" 
      :radius="80" 
      type="quarter-circle" 
      direction="up-right" 
      :buttonClassName="'p-button-rounded'" 
      showIcon="pi pi-share-alt" 
      hideIcon="pi pi-share-alt" 
      :tooltipOptions="{position: 'right', event: 'hover'}"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import MenuBar from './components/MenuBar.vue';
import SpeedDial from 'primevue/speeddial';

const router = useRouter();
const menuBar = ref<InstanceType<typeof MenuBar> | null>(null);

const items = [
  {
    label: 'Facebook',
    icon: 'pi pi-facebook',
    command: () => {
      window.open('https://web.facebook.com/tuzungukeAfricasafaris', '_blank');
    }
  },
  {
    label: 'Instagram',
    icon: 'pi pi-instagram',
    command: () => {
      window.open('https://www.instagram.com/zunguka_africa_safaris/', '_blank');
    }
  },
  {
    label: 'TikTok',
    icon: 'pi pi-tiktok',
    command: () => {
      window.open('https://www.tiktok.com/@zungukaafricasafaris', '_blank');
    }
  },
  {
    label: 'X X',
    icon: 'pi pi-twitter',
    command: () => {
      window.open('https://x.com/ZungukaAfrika', '_blank');
    }
  }
];

const handleLogout = () => {
  localStorage.clear();
  router.push('/home');
};
</script>

<style scoped>
.app-container {
  position: relative;
  min-height: 100vh;
  padding-top: 3rem; /* Adjust this value to match your menu bar height */
}

.main-content {
  width: 90vw;
  margin-left: auto;
  margin-right: auto;
}

:deep(.p-speeddial) {
  position: fixed !important;
  bottom: 20px !important;
  left: 20px !important;
  z-index: 9999;
}

:deep(.p-speeddial-button) {
  width: 3rem !important;
  height: 3rem !important;
  background-color: #004381 !important;
  border-color: #004381 !important;
}

:deep(.p-speeddial-button:hover) {
  background-color: #003366 !important;
  border-color: #003366 !important;
}

:deep(.p-speeddial-button .pi-share-alt) {
  color: #fff;
  font-size: 1.2rem;
}

:deep(.p-speeddial-action) {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #fff;
  border: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0);
}

:deep(.p-speeddial-opened .p-speeddial-action) {
  opacity: 1;
  transform: scale(1);
}

:deep(.p-speeddial-action:hover) {
  transform: scale(1.1);
}

:deep(.p-speeddial-action .pi) {
  font-size: 1rem;
}

:deep(.p-speeddial-action .pi-facebook) { color: #1877F2; }
:deep(.p-speeddial-action .pi-instagram) { color: #E4405F; }
:deep(.p-speeddial-action .pi-tiktok) { color: #000000; }
:deep(.p-speeddial-action .pi-twitter) { color: #1DA1F2; }

:deep(.p-speeddial-list) {
  padding: 0;
  margin: 0;
}
</style>