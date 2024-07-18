<template>
    <div class="users-container">
      <h2>Zunguka Squad Central</h2>      
      <DataTable :value="users" :paginator="true" :rows="10" dataKey="User_Name"
                 class="custom-table" :rowHover="true">
        <Column field="User_Name" header="Username" sortable></Column>
        <Column field="Phone" header="Phone" sortable></Column>
        <Column field="Is_Verified" header="Verified" sortable>
          <template #body="slotProps">
            <Badge :value="slotProps.data.Is_Verified ? 'Yes' : 'No'" 
                   :class="slotProps.data.Is_Verified ? 'verified-badge' : 'unverified-badge'">
            </Badge>
          </template>
        </Column>
        <Column field="Role" header="Role" sortable></Column>
        <Column field="Image" header="Image">
          <template #body="slotProps">
            <img :src="'/userImages/' + slotProps.data.Image" 
                 v-if="slotProps.data.Image" 
                 alt="User Image" 
                 class="user-image">
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button :label="slotProps.data.Is_Verified ? 'Deny' : 'Verify'" 
                    :class="[
                      'custom-button',
                      slotProps.data.Is_Verified ? 'deny-button' : 'verify-button'
                    ]"
                    @click="toggleUserVerification(slotProps.data)" 
                    :disabled="userRole !== 'manager'">
            </Button>
          </template>
        </Column>
      </DataTable>
    </div>
    <Toast />
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  //
  import { useToast } from "primevue/usetoast";
  import Toast from 'primevue/toast';
  //
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Badge from 'primevue/badge';
  import axios from '../axiosInstance';
  
  export default {
    name: 'Users',
    // Register components used in the template
    components: {
      DataTable,
      Column,
      Button,
      Badge,
      Toast
    },
    setup() {
      //
      const toast = useToast();
      //
      // Reactive references for users data and current user's role
      const users = ref([]);
      const userRole = ref('');
      const businessName = 'Zunguka Africa Safaris';
  
      // Function to fetch users from the server
      const fetchUsers = async () => {
        try {
          const response = await axios.post('/user/getUsers', { businessName });
          if (response.data.ok) {
            users.value = response.data.data;
            userRole.value = response.data.userRole;
          } else {
            console.error('Failed to fetch users:', response.data.message);
            toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'You are not verified. Please contact the admin', life: 3000 });
        }
      };
  
      // Function to toggle user verification status
      const toggleUserVerification = async (user) => {
        try {
          const endpoint = user.Is_Verified ? '/user/denyUser' : '/user/verifyUser';
          const response = await axios.post(endpoint, {
            userName: user.User_Name,
            businessName
          });
          if (response.data.ok) {
            user.Is_Verified = response.data.data.Is_Verified;
            toast.add({ severity: 'success', summary: 'Success', detail: 'User verification status updated', life: 3000 });
          } else {
            console.error('Failed to update user verification:', response.data.message);
            toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
          }
        } catch (error) {
          console.error('Error updating user verification:', error);
          toast.add({ severity: 'error', summary: 'Error', detail: 'You are unverified. Please contact the admin', life: 3000 });
        }
      };
  
      // Fetch users when the component is mounted
      onMounted(fetchUsers);
  
      // Return reactive references and functions to be used in the template
      return {
        users,
        userRole,
        toggleUserVerification,
        toast
      };
    }
  };
  </script>
  
  <style scoped>
  .users-container {
    padding: 20px;
    background-color: #fff;
    color: #004682;
  }
  h2{
    color: #000;
  }
  .custom-table {
    font-family: Arial, sans-serif;
  }
  
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    background-color: #004682;
    color: #fff;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f0f8ff;
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:hover) {
    background-color: #e6f2ff;
  }
  
  .verified-badge {
    background-color: #004682;
    color: #fff;
  }
  
  .unverified-badge {
    background-color: #c4b500;
    color: #fff;
  }
  
  .user-image {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #004682;
  }
  
  .custom-button {
    border: none;
    color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .verify-button {
    background-color: #004682;
  }
  
  .verify-button:hover {
    background-color: #003366;
  }
  
  .deny-button {
    background-color: #c4b500;
  }
  
  .deny-button:hover {
    background-color: #a39000;
  }
  
  :deep(.p-paginator) {
    background-color: #f0f8ff;
  }
  
  :deep(.p-paginator .p-paginator-page.p-highlight) {
    background-color: #004682;
    color: #fff;
  }
  </style>