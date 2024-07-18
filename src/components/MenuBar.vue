<template>
    <div class="menu-container">
      <div class="hamburger" @click="toggleMenu">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="card menu-bar" :class="{ 'visible': isVisible }">
        <Menubar :model="currentMenuItems">
          <template #start>
            <img src="../assets/logo.png" alt="Logo" class="logo-image" />
          </template>
          <template #item="{ item, props }">
            <a v-ripple 
               v-bind="props.action"
               :class="{ 'active': item.label === activeItem }">
              <span :class="item.icon" />
              <span class="ml-2">{{ item.label }}</span>
            </a>
          </template>
          <template #end>
            <div v-if="!isHomePage" class="user-menu">
              <a @click="logout" class="logout-button">
                <span class="pi pi-power-off"></span>
                <span>Logout</span>
              </a>
            </div>
          </template>
        </Menubar>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { useRouter, useRoute } from 'vue-router';
  import Menubar from "primevue/menubar";
  
  const router = useRouter();
  const route = useRoute();
  const emit = defineEmits(['logout']);
  
  const activeItem = ref('');
  const isVisible = ref(true);
  
  const toggleMenu = () => {
    isVisible.value = !isVisible.value;
  };
  
  const logout = () => {
    emit('logout');
  };
  
  const isHomePage = computed(() => {
    return route.path === '/home';
  });

  const regularMenuItems = ref([
    {
      label: 'Sales',
      icon: 'pi pi-dollar',
      command: () => {
        activeItem.value = 'View Sales';
        router.push('/view-sales');
      }
    },
    {
      label: 'Add a Sale',
      icon: 'pi pi-plus-circle',
      command: () => {
        activeItem.value = 'Add a Sale';
        router.push('/add-sale');
      }
    },
    {
      label: 'Analysis',
      icon: 'pi pi-chart-bar',
      command: () => {
        activeItem.value = 'Analysis';
        router.push('/analysis');
      }
    },
    {
      label: 'Client Reminders',
      icon: 'pi pi-bell',
      command: () => {
        activeItem.value = 'Client Reminders';
        router.push('/client-reminders');
      }
    },
    {
      label: 'Users',
      icon: 'pi pi-user',
      command: () => {
        activeItem.value = 'Users';
        router.push('/users');
      },
    },
    {
      label: 'Visit Website',
      icon: 'pi pi-external-link',
      command: () => {
        activeItem.value = 'Visit Website';
        router.push({ path: '/website', query: { showWebsite: 'true' } });
      }
    },
    {
      label: 'Hotels',
      icon: 'pi pi-map',
      command: () => {
        activeItem.value = 'Hotels';
        router.push('/hotels');
      }
    }
  ]);
  
  const visitWebsiteItem = ref([
    {
      label: 'Login/Register',
      icon: 'pi pi-external-house',
      url: '/home',
      command: () => {
        activeItem.value = 'Login/Register';
      }
    }
  ]);
  
  const currentMenuItems = computed(() => {
    return isHomePage.value ? visitWebsiteItem.value : regularMenuItems.value;
  });
  </script>
  
  <style scoped>
.menu-container {
  position: fixed;
  top: 0;
  /* left: 0; */
  /* right: 0; */
  z-index: 1000;
}

.hamburger {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1001;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  height: 1.5rem;
}

.hamburger span {
  width: 1.5rem;
  height: 0.25rem;
  background: #c4b500;
  border-radius: 10px;
  transition: all 0.3s linear;
  position: relative;
  transform-origin: 1px;
}

.menu-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #004183;
  transform: translateY(-100%);
  transition: transform 0.3s ease-in-out;
}

.menu-bar.visible {
  transform: translateY(0);
}

.p-menubar {
  background-color: transparent;
  border: none;
  padding: 0 1rem;
}

.p-menubar .p-menuitem-link {
  color: #fff;
}

.p-menubar .p-menuitem-link:hover {
  background-color: #3172b4;
}

.p-menubar .p-menuitem-icon {
  color: #c4b500;
}

.logo-image {
  height: 40px;
  margin: 0.5rem 1rem 0.5rem 2rem;
}

.user-menu {
  display: flex;
  align-items: center;
}

.logout-button {
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  cursor: pointer;
}

.logout-button:hover {
  color: #c4b500;
}

.logout-button span {
  margin-right: 0.5rem;
}

.p-menubar .p-menuitem-link.active {
  background-color: #3172b4;
  font-weight: bold;
}
</style>