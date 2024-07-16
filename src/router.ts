// src/router.ts
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from './views/Home.vue';
import ResetPassword from './views/ResetPassword.vue';
import ViewSales from './views/ViewSales.vue';
import AddSale from './views/AddSale.vue';
import Analysis from './views/Analysis.vue';
import Users from './views/Users.vue';
import ClientReminders from './views/ClientReminders.vue';
import Profile from './views/Profile.vue';
import Website from './views/WebsiteView.vue';
import HotelsMap from './views/HotelsMap.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'analysis',
    component: Analysis,
    meta: { requiresAuth: true },
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresGuest: true },
  },
  {
    path: '/resetPassword',
    name: 'ResetPassword',
    component: ResetPassword,
    meta: { requiresGuest: true },
  },
  {
    path: '/website',
    name: 'Website',
    component: Website,
    meta: { requiresAuth: true }
  },
  {
    path: '/hotels',
    name: 'HotelsMap',
    component: HotelsMap,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true },
  },
  {
    path: '/view-sales',
    name: 'ViewSale',
    component: ViewSales,
    meta: { requiresAuth: true },
  },
  {
    path: '/add-sale',
    name: 'AddSale',
    component: AddSale,
    meta: { requiresAuth: true },
  },
  {
    path: '/analysis',
    name: 'Analysis',
    component: Analysis,
    meta: { requiresAuth: true },
  },
  {
    path: '/users',
    name: 'Users',
    component: Users,
    meta: { requiresAuth: true },
  },
  {
    path: '/client-reminders',
    name: 'ClientReminder',
    component: ClientReminders,
    meta: { requiresAuth: true },
  },
  // Add other routes as needed
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});
//
// Navigation guard
router.beforeEach((to, _from, next) => {
  const isLoggedIn = !!localStorage.getItem('token');

  if (to.meta.requiresAuth && !isLoggedIn) {
    //
    // If the route requires auth and the user is not logged in, redirect to home
    next('/home');
  } else if (to.meta.requiresGuest && isLoggedIn) {
    //
    // If the route is for guests only and the user is logged in, redirect to dashboard
    next('/');
  } else {
    // In all other cases, allow navigation
    next();
  }
});

export default router;
