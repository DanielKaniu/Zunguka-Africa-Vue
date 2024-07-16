<template>
    <div class="profile-container">
      
      <div class="profile-content">
        <div class="profile-image-section">
          <p-image :src="userImageUrl" alt="User Profile" width="250" preview />
          <p-file-upload mode="basic" name="image" url="/api/save-user-image" accept="image/*" :auto="true" @upload="onImageUpload" />
        </div>
  
        <div class="profile-details-section">
          <p-card>
            <template #title>
              <div class="card-header">
                <h2>Profile Details</h2>
                <p-button icon="pi pi-pencil" @click="toggleEdit" :label="isEditing ? 'Cancel' : 'Edit'" />
              </div>
            </template>
            <template #content>
              <div class="p-fluid">
                <div v-for="(value, key) in userData" :key="key" class="p-field">
                  <label :for="key">{{ formatLabel(key) }}</label>
                  <p-input-text v-if="isEditing" :id="key" v-model="userData[key]" />
                  <p v-else>{{ value }}</p>
                </div>
              </div>
            </template>
            <template #footer>
              <p-button v-if="isEditing" label="Save Changes" icon="pi pi-check" @click="saveUserDetails" />
            </template>
          </p-card>
        </div>
      </div>
  
      <div v-if="isManager" class="user-list-section">
        <h2>User Management</h2>
        <p-data-table :value="users" :paginator="true" :rows="10">
          <p-column field="User_Name" header="Username"></p-column>
          <p-column field="Phone" header="Phone"></p-column>
          <p-column field="Is_Verified" header="Verified">
            <template #body="slotProps">
              <p-tag :severity="slotProps.data.Is_Verified ? 'success' : 'warning'">
                {{ slotProps.data.Is_Verified ? 'Yes' : 'No' }}
              </p-tag>
            </template>
          </p-column>
          <p-column field="Role" header="Role"></p-column>
          <p-column header="Image">
            <template #body="slotProps">
              <p-image :src="getUserImageUrl(slotProps.data.Image)" alt="User Image" width="50" preview />
            </template>
          </p-column>
        </p-data-table>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  
  // Import PrimeVue components
  import Image from 'primevue/image';
  import FileUpload from 'primevue/fileupload';
  import Card from 'primevue/card';
  import InputText from 'primevue/inputtext';
  import Button from 'primevue/button';
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Tag from 'primevue/tag';
  
  export default {
    components: {
      'p-image': Image,
      'p-file-upload': FileUpload,
      'p-card': Card,
      'p-input-text': InputText,
      'p-button': Button,
      'p-data-table': DataTable,
      'p-column': Column,
      'p-tag': Tag
    },
    setup() {
      const userData = ref({
        first_name: '',
        second_name: '',
        user_name: '',
        email: '',
        phone: '',
      });
      const userImageUrl = ref('');
      const users = ref([]);
      const isManager = ref(false);
      const isEditing = ref(false);
  
      const toggleEdit = () => {
        isEditing.value = !isEditing.value;
      };
  
      const formatLabel = (key) => {
        return key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      };
  
      const onImageUpload = (event) => {
        if (event.xhr.status === 201) {
          const response = JSON.parse(event.xhr.response);
          userImageUrl.value = `/userImages/${response.userImageName}`;
        }
      };
  
      const saveUserDetails = async () => {
        try {
          const response = await axios.post('/api/editUserDetails', { modifiedData: userData.value });
          if (response.data.ok) {
            // Show success message
            isEditing.value = false; // Exit edit mode after successful save
          }
        } catch (error) {
          // Handle error
          console.error('Error saving user details:', error);
        }
      };
  
      const getUsers = async () => {
        try {
          const response = await axios.get('/api/getUsers', { params: { businessName: 'Zunguka Africa Safaris' } });
          if (response.data.ok) {
            users.value = response.data.data;
            isManager.value = response.data.userRole === 'manager';
          }
        } catch (error) {
          // Handle error
          console.error('Error fetching users:', error);
        }
      };
  
      const getUserImageUrl = (imageName) => {
        return imageName ? `/userImages/${imageName}` : '/default-user-image.png';
      };
  
      const fetchCurrentUserData = async () => {
        try {
          const response = await axios.get('/api/getCurrentUserData');
          if (response.data.ok) {
            userData.value = response.data.userData;
            userImageUrl.value = getUserImageUrl(response.data.userData.image);
          }
        } catch (error) {
          console.error('Error fetching current user data:', error);
        }
      };
  
      onMounted(() => {
        getUsers();
        fetchCurrentUserData();
      });
  
      return {
        userData,
        userImageUrl,
        users,
        isManager,
        isEditing,
        onImageUpload,
        saveUserDetails,
        getUserImageUrl,
        toggleEdit,
        formatLabel,
      };
    },
  };
  </script>
  
  <style scoped>
  .profile-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    color: #004183;
  }
  
  .profile-title {
    color: #004183;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .profile-content {
    display: flex;
    gap: 2rem;
  }
  
  .profile-image-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .profile-details-section {
    flex: 2;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .user-list-section {
    margin-top: 3rem;
  }
  
  :deep(.p-button) {
    background-color: #004183;
    border-color: #004183;
  }
  
  :deep(.p-button:hover) {
    background-color: #c4b500;
    border-color: #c4b500;
  }
  
  :deep(.p-card) {
    background-color: #fff;
  }
  
  :deep(.p-inputtext:focus) {
    border-color: #c4b500;
    box-shadow: 0 0 0 1px #c4b500;
  }
  
  .p-field {
    margin-bottom: 1rem;
  }
  
  .p-field label {
    font-weight: bold;
    margin-bottom: 0.5rem;
    display: block;
  }
  
  .p-field p {
    margin: 0;
  }
  
  @media (max-width: 768px) {
    .profile-content {
      flex-direction: column;
    }
  
    .profile-image-section,
    .profile-details-section {
      flex: 1;
    }
  }
  </style>