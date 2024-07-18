<template>
  <Toast />
    <div class="client-reminders">
      <h2>Balance Buddy: Friendly SMS Payment Reminders</h2>
      <!-- DataTable for displaying clients with arrears -->
      <DataTable 
        :value="clientsWithArrears" 
        :lazy="true"
        :totalRecords="totalRecords"
        :loading="loading"
        :rows="perPage"
        v-model:first="first"
        @page="onPage"
        :paginator="true"
        :rowsPerPageOptions="[6, 12, 18]"
        class="p-datatable-sm"
      >
        <!-- Table columns -->
        <Column field="Invoice" header="Invoice"></Column>
        <Column field="Client_Name" header="Client Name"></Column>
        <Column field="Client_Phone" header="Phone"></Column>
        <Column field="Check_In" header="Check In"></Column>
        <Column field="Check_Out" header="Check Out"></Column>
        <Column field="Client_Balance" header="Balance">
          <template #body="slotProps">
            {{ formatCurrency(slotProps.data.Client_Balance) }}
          </template>
        </Column>
        <Column header="Actions">
          <template #body="slotProps">
            <Button icon="pi pi-send" class="p-button-rounded p-button-text custom-send-button" @click="openSmsDialog(slotProps.data)" />
          </template>
        </Column>
      </DataTable>
  
      <!-- SMS Reminder Dialog -->
      <Dialog v-model:visible="smsDialogVisible" header="Send SMS Reminder" :style="{width: '50vw'}">
        <div class="p-fluid">
          <div class="p-field">
            <label for="message">Message</label>
            <Textarea id="message" v-model="smsMessage" rows="5" />
          </div>
        </div>
        <template #footer>
          <Button label="Send" icon="pi pi-send" @click="sendSms" class="custom-send-button" />
          <Button label="Cancel" icon="pi pi-times" @click="closeSmsDialog" class="p-button-text custom-cancel-button" />
        </template>
      </Dialog>
    </div>
  </template>
  
  <script setup>
  // Imports
  import { ref, onMounted } from 'vue';
  import { useToast } from 'primevue/usetoast';
  import Toast from 'primevue/toast';
  //
  import DataTable from 'primevue/datatable';
  import Column from 'primevue/column';
  import Button from 'primevue/button';
  import Dialog from 'primevue/dialog';
  import Textarea from 'primevue/textarea';
  import axiosInstance from '../axiosInstance';
  
  // Initialize toast for notifications
  const toast = useToast();
  
  // Reactive references
  const clientsWithArrears = ref([]);
  const smsDialogVisible = ref(false);
  const smsMessage = ref('');
  const selectedClient = ref(null);
  const totalRecords = ref(0);
  const loading = ref(false);
  const perPage = ref(6);
  const first = ref(0);
  
  // Update the loadData function
  const loadData = async (page = 1) => {
    loading.value = true;
    try {
        const response = await axiosInstance.post('/notifier/getClientWithArrears', {
        businessName: 'Zunguka Africa Safaris',
        page: page,
        perPage: perPage.value
        });
        clientsWithArrears.value = response.data.data;
        totalRecords.value = response.data.total;
        first.value = (page - 1) * perPage.value;
    } catch (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: 'You are not verfied. Please contact the admin', life: 3000 });
        console.error('Error fetching clients with arrears:', error);
    } finally {
        loading.value = false;
    }
    };

    // Update the onPage function
    const onPage = (event) => {
      if (event.rows !== perPage.value) {
        perPage.value = event.rows;
        loadData(1);
      } else {
        loadData(event.page + 1);
      }
    };
  
  // Load data on component mount
  onMounted(() => {
    loadData();
  });
  
  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(value);
  };
  
  // Open SMS dialog
  const openSmsDialog = (client) => {
    selectedClient.value = client;
    smsMessage.value = `Dear ${client.Client_Name},\nThis is a reminder that you have an outstanding balance of ${formatCurrency(client.Client_Balance)} for your recent trip. Please arrange for payment at your earliest convenience.\nThank you for your business.`;
    smsDialogVisible.value = true;
  };
  
  // Close SMS dialog
  const closeSmsDialog = () => {
    smsDialogVisible.value = false;
    smsMessage.value = '';
    selectedClient.value = null;
  };
  
  // Send SMS
  // Send SMS
  const sendSms = async () => {
    if (selectedClient.value.Client_Phone === '0' || selectedClient.value.Client_Phone === 0) {
      toast.add({ severity: 'warn', summary: 'Warning', detail: 'Invalid phone number. Cannot send SMS.', life: 3000 });
      return;
    }

    try {
      const response = await axiosInstance.post('/notifier/sendSms', {
        recipient: selectedClient.value.Client_Phone,
        message: smsMessage.value,
        type: 'sms',
        vPk: selectedClient.value.vPk
      });
      if (response.data.ok) {
        toast.add({ severity: 'success', summary: 'Success', detail: 'SMS sent successfully', life: 3000 });
        closeSmsDialog();
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to send SMS', life: 3000 });
    }
  };
  </script>
  
  <style scoped> 
  .client-reminders{
    margin-top: 3%;
  } 

  h2{
    color: #000;
  }

  /* Custom styles for DataTable */
  :deep(.p-datatable) {
    border: 1px solid #004684; /* Primary color border */
  }
  
  :deep(.p-datatable .p-datatable-header) {
    background-color: #004684; /* Primary color header */
    color: #fff; /* White text */
  }
  
  :deep(.p-datatable .p-datatable-thead > tr > th) {
    padding: 0.5rem 0.9rem;
    background-color: #004684; /* Primary color for table header */
    color: #fff; /* White text */
  }

    ::v-deep .p-datatable .p-datatable-tbody > tr > td {
    padding: 0.1rem 0.9rem;
    white-space: nowrap;
    }
  
  :deep(.p-datatable .p-datatable-tbody > tr:nth-child(even)) {
    background-color: #f0f4f8; /* Light blue for even rows */
  }
  
  :deep(.p-datatable .p-datatable-tbody > tr:nth-child(odd)) {
    background-color: #fff; /* White for odd rows */
  }
  
  /* Custom styles for buttons */
  :deep(.custom-send-button) {
    background-color: #c4b600 !important; /* Secondary color for send button */
    color: #004684 !important; /* Primary color text */
    border: none !important;
  }
  
  :deep(.custom-send-button:hover) {
    background-color: #a39900 !important; /* Darker shade of secondary color on hover */
  }
  
  :deep(.custom-cancel-button) {
    color: #004684 !important; /* Primary color text for cancel button */
  }
  
  /* Dialog styles */
  :deep(.p-dialog) {
    border: 2px solid #004684; /* Primary color border for dialog */
  }
  
  :deep(.p-dialog .p-dialog-header) {
    background-color: #004684; /* Primary color for dialog header */
    color: #fff; /* White text */
  }
  
  .p-dialog .p-field {
    margin-bottom: 20px;
  }
  
  .p-dialog .p-field label {
    display: block;
    margin-bottom: 5px;
    color: #004684; /* Primary color for labels */
  }
  
  .p-dialog .p-field textarea {
    width: 100%;
    border: 1px solid #004684; /* Primary color border for textarea */
  }

  /* Pagination styles */
:deep(.p-paginator) {
  background-color: #f0f4f8; /* Light blue background */
  border: 1px solid #004684; /* Primary color border */
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page) {
  color: #004684; /* Primary color text */
  border: 1px solid #004684; /* Primary color border */
  min-width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-highlight) {
  background-color: #004684; /* Primary color for active page */
  color: #fff; /* White text for active page */
}

:deep(.p-paginator .p-paginator-first),
:deep(.p-paginator .p-paginator-prev),
:deep(.p-paginator .p-paginator-next),
:deep(.p-paginator .p-paginator-last) {
  color: #004684; /* Primary color for navigation icons */
  min-width: 2.5rem;
  height: 2.5rem;
}

:deep(.p-paginator .p-dropdown) {
  margin-left: 0.5rem;
  height: 2.5rem;
}

:deep(.p-paginator .p-dropdown-label) {
  padding-right: 0.5rem;
}

:deep(.p-paginator .p-paginator-current) {
  color: #004684; /* Primary color for current page text */
}

/* Hover effects for pagination elements */
:deep(.p-paginator .p-paginator-pages .p-paginator-page:not(.p-highlight):hover),
:deep(.p-paginator .p-paginator-first:hover),
:deep(.p-paginator .p-paginator-prev:hover),
:deep(.p-paginator .p-paginator-next:hover),
:deep(.p-paginator .p-paginator-last:hover) {
  background-color: #c4b600; /* Secondary color for hover */
  color: #fff; /* White text on hover */
}

/* Disabled state for pagination elements */
:deep(.p-paginator .p-paginator-pages .p-paginator-page.p-disabled),
:deep(.p-paginator .p-paginator-first.p-disabled),
:deep(.p-paginator .p-paginator-prev.p-disabled),
:deep(.p-paginator .p-paginator-next.p-disabled),
:deep(.p-paginator .p-paginator-last.p-disabled) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Custom styles for the rows per page dropdown */
:deep(.p-paginator .p-dropdown) {
  border-color: #004684; /* Primary color border */
}

:deep(.p-paginator .p-dropdown:not(.p-disabled):hover) {
  border-color: #c4b600; /* Secondary color border on hover */
}

:deep(.p-paginator .p-dropdown .p-dropdown-label) {
  color: #004684; /* Primary color text */
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items .p-dropdown-item) {
  color: #004684; /* Primary color text for dropdown items */
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items .p-dropdown-item:hover) {
  background-color: #f0f4f8; /* Light blue background on hover */
}

:deep(.p-paginator .p-dropdown-panel .p-dropdown-items .p-dropdown-item.p-highlight) {
  background-color: #004684; /* Primary color for selected item */
  color: #fff; /* White text for selected item */
}
  </style>