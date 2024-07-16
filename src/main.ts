import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router';
//
//For hotels maps.
import "leaflet/dist/leaflet.css";
//
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/tailwind-light/theme.css'; // Choose the theme you prefer
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Ripple from 'primevue/ripple';

import SpeedDial from 'primevue/speeddial'

const app = createApp(App);

app.
    use(PrimeVue).
    use(router).
    use(ToastService).
    use(ConfirmationService).
    directive('ripple', Ripple).
    component('SpeedDial', SpeedDial).
    mount('#app');