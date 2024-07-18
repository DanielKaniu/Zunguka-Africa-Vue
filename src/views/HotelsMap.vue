<template>
    <div class="container">
      <div class="sidebar">
        <h2>Hotel Finder</h2>
        <div class="p-fluid">
          <div class="p-field">
            <AutoComplete
              v-model="selectedHotelName"
              :suggestions="filteredHotels"
              @complete="searchHotels"
              placeholder="Search hotel"
              @item-select="selectHotel"
              field="name"
            >
              <template #item="slotProps">
                {{ slotProps.item.name }}
              </template>
            </AutoComplete>
          </div>
          <div class="p-field">
            <Button label="Search" @click="() => searchHotels({ query: selectedHotelName })" />
          </div>
          <div class="p-field">
            Hotels found: {{ hotels.length }}
          </div>
          <div class="p-field-checkbox">
            <Checkbox v-model="autoFetch" :binary="true" @change="toggleAutoFetch" />
            <label class="sub-title">Auto-fetch hotels</label>
          </div>
          <div class="p-field">
            <label for="maxHotels" class="sub-title">Max hotels to display:</label>
            <InputNumber id="maxHotels" v-model="maxHotels" :min="1" :max="1000" />
          </div>
          <div class="p-field">
            <Button label="Fetch Hotels" @click="fetchHotels" />
          </div>
          <div class="p-field">
            <Button label="Clear Hotels" @click="clearHotels" />
          </div>
          <div class="p-field">
            <Button label="Go to My Location" @click="getCurrentLocation" />
          </div>
        </div>
      </div>
      <div class="map-container">
        <l-map v-if="locationSet" ref="map" v-model:zoom="zoom" :center="center" @moveend="onMapMove" @ready="onMapReady">
          <l-tile-layer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            layer-type="base"
            name="OpenStreetMap"
          ></l-tile-layer>
          <l-marker v-for="hotel in displayedHotels" :key="hotel.id" :lat-lng="hotel.position" :icon="createHotelIcon(hotel.name)">
            <l-popup>
              <div>
                <h3>{{ hotel.name }}</h3>
                <p>Type: {{ hotel.type }}</p>
                <p v-if="hotel.stars">Stars: {{ hotel.stars }}</p>
                <p v-if="hotel.rooms">Rooms: {{ hotel.rooms }}</p>
                <p v-if="hotel.phone">Phone: {{ hotel.phone }}</p>
                <p v-if="hotel.website"><a :href="hotel.website" target="_blank">Website</a></p>
              </div>
            </l-popup>
          </l-marker>
        </l-map>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet';
  import L from 'leaflet';
  import axios from 'axios';
  import debounce from 'lodash/debounce';
  
  // PrimeVue components
  import Button from 'primevue/button';
  import Checkbox from 'primevue/checkbox';
  import InputNumber from 'primevue/inputnumber';
  import AutoComplete from 'primevue/autocomplete';
  
  const createHotelIcon = (hotelName) => {
    return L.divIcon({
      html: `
        <div class="hotel-icon-container">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
            <path fill="#FF9800" d="M11,9H9V2H7V9H5V2H3V9C3,11.12 4.66,12.84 6.75,12.97V22H9.25V12.97C11.34,12.84 13,11.12 13,9V2H11V9M16,6V14H18.5V22H21V2C18.24,2 16,4.24 16,6Z" />
          </svg>
          <span class="hotel-name">${hotelName}</span>
        </div>
      `,
      className: 'hotel-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  };
  
  const zoom = ref(13);
  const center = ref([51.505, -0.09]); // Default to London
  const map = ref(null);
  const hotels = ref([]);
  const autoFetch = ref(true);
  const maxHotels = ref(100);
  const locationSet = ref(false);
  
  const displayedHotels = computed(() => {
    return hotels.value.slice(0, maxHotels.value);
  });
  
  const fetchHotels = async () => {
    if (!map.value) return;
    
    try {
      const bounds = map.value.leafletObject.getBounds();
      const query = `
        [out:json][timeout:25];
        (
          node["tourism"="hotel"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          way["tourism"="hotel"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          relation["tourism"="hotel"](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        );
        out center;
      `;
  
      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: query }
      });
  
      hotels.value = response.data.elements.map(element => ({
        id: element.id,
        name: element.tags.name || 'Unnamed Hotel',
        position: [element.lat || element.center.lat, element.lon || element.center.lon],
        type: element.tags.tourism,
        stars: element.tags.stars,
        rooms: element.tags.rooms,
        phone: element.tags.phone,
        website: element.tags.website
      }));
    } catch (error) {
      console.error('Error fetching hotels:', error);
    }
  };
  
  const debouncedFetchHotels = debounce(fetchHotels, 500);
  
  const onMapMove = () => {
    if (autoFetch.value) {
      debouncedFetchHotels();
    }
  };
  
  const onMapReady = () => {
    console.log('Map is ready');
    locationSet.value = true;
    if (autoFetch.value) {
      fetchHotels();
    }
  };
  
  const toggleAutoFetch = () => {
    if (autoFetch.value) {
      debouncedFetchHotels();
    }
  };
  
  const clearHotels = () => {
    hotels.value = [];
  };
  
  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          center.value = [position.coords.latitude, position.coords.longitude];
          zoom.value = 13;
          locationSet.value = true;
        },
        error => {
          console.error('Error getting location:', error);
          locationSet.value = true; // Set to true even on error to allow map to load
        }
      );
    } else {
      console.log('Geolocation is not available');
      locationSet.value = true; // Set to true if geolocation is not available
    }
  };
  
  const selectedHotelName = ref('');
  const filteredHotels = ref([]);

  const searchHotels = async (event) => {
    const query = event.query.toLowerCase();
    if (query.length < 3) return; // Only search if query is at least 3 characters long

    try {
      const bounds = map.value.leafletObject.getBounds();
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"="hotel"]["name"~"${query}", i](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          way["tourism"="hotel"]["name"~"${query}", i](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
          relation["tourism"="hotel"]["name"~"${query}", i](${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()});
        );
        out center;
      `;

      const response = await axios.get('https://overpass-api.de/api/interpreter', {
        params: { data: overpassQuery }
      });

      filteredHotels.value = response.data.elements.map(element => ({
        id: element.id,
        name: element.tags.name || 'Unnamed Hotel',
        position: [element.lat || element.center.lat, element.lon || element.center.lon],
        type: element.tags.tourism,
        stars: element.tags.stars,
        rooms: element.tags.rooms,
        phone: element.tags.phone,
        website: element.tags.website
      })).slice(0, 5); // Limit to 5 suggestions
    } catch (error) {
      console.error('Error searching hotels:', error);
      filteredHotels.value = [];
    }
  };

const selectHotel = (event) => {
  const hotel = event.value;
  selectedHotelName.value = hotel.name;
  center.value = hotel.position;
  zoom.value = 15;  // Zoom in on the selected hotel
};
  
  onMounted(() => {
    getCurrentLocation();
  });
  </script>
  
  <style scoped>
  h2, .sub-title {
    color: #000;
  }
  
  .container {
    margin-top: 1%;
    display: flex;
    width: 94vw;
    height: 90vh;
  }
  
  .sidebar {
    width: 300px;
    padding: 20px;
    overflow-y: auto;
    background-color: #f8f9fa;
  }
  
  .map-container {
    flex-grow: 1;
  }
  
  .p-field {
    margin-bottom: 0.5rem;
    color: #004682;
  }
  
  :deep(.hotel-icon) {
    background: none;
    width: auto !important;
    height: auto !important;
  }
  
  :deep(.hotel-icon-container) {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 2px 5px;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
    color: #004682;
  }
  
  :deep(.hotel-icon-container svg) {
    width: 20px;
    height: 20px;
    margin-right: 5px;
  }
  
  :deep(.hotel-name) {
    font-size: 12px;
    white-space: nowrap;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>