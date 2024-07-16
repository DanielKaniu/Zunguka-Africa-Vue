<template>
    <div class="card menu-bar">
        <Menubar :model="currentMenuItems">
            <template #item="{ item, props, hasSubmenu }">
                <a v-ripple 
                   :href="item.url" 
                   :target="item.target" 
                   v-bind="props.action"
                   :class="{ 'active': item.label === activeItem }">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <span v-if="hasSubmenu" class="submenu-indicator"></span>
                </a>
            </template>
            <template #end>
                <div class="user-menu">
                    <img src="../assets/logo.png" alt="User" class="user-image" />
                    <div  v-if="!isHomePage" class="user-submenu">
                        <!-- <a @click="goToProfile" class="submenu-item">
                            <span class="pi pi-user"></span>
                            <span>Profile</span>
                        </a> -->
                        <a @click="logout" class="submenu-item">
                            <span class="pi pi-power-off"></span>
                            <span>Logout</span>
                        </a>
                    </div>
                </div>
            </template>
        </Menubar>
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

const goToProfile = () => {
    router.push('/profile');
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

<!-- In MenuBar.vue -->
<style scoped>
.menu-bar {
    padding: 0.05rem;
    position: fixed;
    top: 0px;
    left: 0;
    right: 0;
    z-index: 1000;
    background-color: #004183; /* Primary brand color */
}

.p-menubar {
    background-color: #004183;
    border: none;
}

.p-menubar .p-menuitem-link {
    color: #fff; /* White text color */
}

.p-menubar .p-menuitem-link:hover {
    background-color: #3172b4;
}

.p-menubar .p-menuitem-link .p-menuitem-icon {
    color: #c4b500; /* Secondary brand color for icons */
}

.user-menu {
    position: relative;
    cursor: pointer;
}

.user-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #c4b500; /* Secondary brand color border */
}

.user-submenu {
    display: none;
    position: absolute;
    right: 0;
    top: 100%;
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    border-radius: 4px;
    padding: 0.5rem 0;
    z-index: 1001;
}

.user-menu:hover .user-submenu {
    display: block;
}

.submenu-item {
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    color: #004183; /* Primary brand color for text */
    text-decoration: none;
}

.submenu-item:hover {
    background-color: rgba(0, 65, 131, 0.1); /* Light primary color background on hover */
}

.submenu-item span {
    margin-right: 0.5rem;
}

/* Add this to style the submenu indicator */
.p-menuitem-icon.pi-angle-down {
    color: #c4b500; /* Secondary brand color for submenu indicator */
}

/* Add this to create a custom submenu indicator */
.submenu-indicator::after {
    content: "\e902"; /* PrimeIcons chevron-down glyph */
    font-family: 'primeicons';
    margin-left: 0.5rem;
    color: #c4b500; /* Secondary brand color for custom submenu indicator */
}

.p-menubar .p-menuitem-link.active {
    background-color: #3172b4;
    font-weight: bold;
}
</style>