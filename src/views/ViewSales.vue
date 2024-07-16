<template>
  <div class="sales-table-container">
    <Toast />
    <ConfirmDialog />
    <DataTable
        v-model:editingRows="editingRows"
      :value="salesData"
      :lazy="true"
      :totalRecords="totalRecords"
      :loading="loading"
      :rows="perPage"
      editMode="cell"
      @cell-edit-complete="onCellEditComplete"
      class="p-datatable-sm"
      responsiveLayout="scroll"
      scrollable
      scrollDirection="both"
      :paginator="true"
      :rowsPerPageOptions="[5, 10, 20, 50]"
      @page="onPageChange"
      :first="(currentPage - 1) * perPage"
    >
    <Column
      v-for="col in columns"
      :key="col.field"
      :field="col.field"
      :header="col.header"
      :editor="col.editable && col.type !== 'boolean' ? 'text' : null"
    >
      <template #body="slotProps">
        <template v-if="col.type === 'boolean'">
          <ToggleButton
            v-model="slotProps.data[col.field]"
            onLabel="Yes"
            offLabel="No"
            onIcon="pi pi-check"
            offIcon="pi pi-times"
            @change="onTripCompleteChange(slotProps.data)"
          />
        </template>
        <template v-else-if="col.field === 'actions'">
            <Button 
              icon="pi pi-trash" 
              class="p-button-rounded p-button-danger p-button-text" 
              @click="confirmDelete(slotProps.data)"
            />
          </template>
        <span v-else
          class="cell-content" 
          :class="{ 
            'payment-cell': col.field === 'tripPayment' || col.field === 'hotelPayment',
            'calculated-cell': !col.editable,
            'profit-cell': col.field === 'profitLoss' && slotProps.data[col.field] === 'Profit',
            'loss-cell': col.field === 'profitLoss' && slotProps.data[col.field] === 'Loss',
            'break-even-cell': col.field === 'profitLoss' && slotProps.data[col.field] === 'Break Even'
          }"
          @click="handleCellClick(slotProps.data, col.field)"
        >
          {{ formatCellContent(slotProps.data[col.field], col) }}
        </span>
      </template>
      <template #editor="{ data, field }" v-if="col.editable && col.type !== 'boolean'">
        <InputText v-model="data[field]" />
      </template>
    </Column>
    </DataTable>
    
    <PaymentHistoryPopup 
      v-model:visible="paymentHistoryVisible"
      :visitId="selectedVisitId"
      :paymentType="selectedPaymentType"
      @paymentChanged="onPaymentChanged"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axiosInstance from '../axiosInstance';
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';
import PaymentHistoryPopup from './PaymentHistoryPopup.vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import ToggleButton from 'primevue/togglebutton';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();

const salesData = ref([]);
const editingRows = ref([]);
const totalRecords = ref(0);
const loading = ref(false);
const perPage = ref(5);
const toast = useToast();
const currentPage = ref(1);

const paymentHistoryVisible = ref(false);
const selectedVisitId = ref(null);
const selectedPaymentType = ref('');

// Define columns with their editability status
const columns = [
  { field: 'actions', header: 'Actions', editable: false },
  { field: 'invoice', header: 'Invoice', editable: false },
  { field: 'name', header: 'Name', editable: true },
  { field: 'phone', header: 'Phone', editable: true },
  { field: 'numberOfPeople', header: 'No. of People', editable: true },
  { field: 'checkIn', header: 'Check In', editable: true, type: 'date' },
  { field: 'checkOut', header: 'Check Out', editable: true, type: 'date' },
  { field: 'tripCost', header: 'Trip Cost', editable: true },
  { field: 'tripPayment', header: 'Trip Payment', editable: false },
  { field: 'clientBalance', header: 'Client Balance', editable: false },
  { field: 'hotelName', header: 'Hotel Name', editable: true },
  { field: 'hotelCost', header: 'Hotel Cost', editable: true },
  { field: 'hotelPayment', header: 'Hotel Payment', editable: false },
  { field: 'hotelBalance', header: 'Hotel Balance', editable: false },
  { field: 'refNumber', header: 'Ref Number', editable: true },
  { field: 'paymentDate', header: 'Payment Date', editable: true, type: 'date' },
  { field: 'park', header: 'Park', editable: true },
  { field: 'transport', header: 'Transport', editable: true },
  { field: 'visa', header: 'Visa', editable: true },
  { field: 'water', header: 'Water', editable: true },
  { field: 'sgr', header: 'Sgr', editable: true },
  { field: 'flight', header: 'Flight', editable: true },
  { field: 'transfer', header: 'Transfer', editable: true },
  { field: 'excursion', header: 'Excursion', editable: true },
  { field: 'paidToSupplier', header: 'Paid To Supplier', editable: false },
  { field: 'profit', header: 'Profit', editable: false },
  { field: 'profitLoss', header: 'Profit/Loss', editable: false },
  { field: 'isTripComplete', header: 'Is Trip Complete', editable: true, type: 'boolean' },
];

onMounted(() => {
  loadData();
});

// Load initial data
const loadData = async (page = 1) => {
  loading.value = true;
  try {
    const response = await axiosInstance.post('/sales/getSalesReport', {
      businessName: 'Zunguka Africa Safaris',
      page: page,
      perPage: perPage.value
    });
    salesData.value = response.data.data.map(item => ({
      ...item,
      isTripComplete: item.isTripComplete === 1
    }));
    totalRecords.value = response.data.total;
    currentPage.value = response.data.current_page;
  } catch (error) {
    console.error('Error loading data:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'You are unverfied. Please contact the admin', life: 3000 });
  } finally {
    loading.value = false;
  }
};

const onPageChange = (event) => {
  loadData(event.page + 1);
};

const onTripCompleteChange = async (rowData) => {
  const newValue = rowData.isTripComplete ? 1 : 0;
  try {
    const response = await axiosInstance.post('/sales/updateSale', {
      salesData: {
        cPk: rowData.cPk,
        hPk: rowData.hPk,
        vPk: rowData.vPk,
        modifiedData: {
          isTripComplete: newValue
        }
      }
    });

    if (response.data.ok) {
      toast.add({ 
        severity: 'success', 
        summary: 'Update Successful', 
        detail: `Updated Trip Complete status`, 
        life: 3000 
      });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
    }
  } catch (error) {
    console.error('Error updating Trip Complete status:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while updating the Trip Complete status', life: 3000 });
  }
};

const calculateProfit = (row) => {
  return parseFloat(row.tripCost) - parseFloat(row.paidToSupplier);
};

const determineProfitLoss = (profit) => {
  if (profit > 0) return 'Profit';
  if (profit < 0) return 'Loss';
  return 'Break Even';
};

// Handle cell click for payment history popup
const handleCellClick = (rowData, field) => {
  if (field === 'tripPayment') {
    openPaymentHistory(rowData, 'trip');
  } else if (field === 'hotelPayment') {
    openPaymentHistory(rowData, 'hotel');
  }
};

const openPaymentHistory = (rowData, type) => {
  selectedVisitId.value = rowData.vPk;
  selectedPaymentType.value = type;
  paymentHistoryVisible.value = true;
};

// Calculate paidToSupplier
const calculatePaidToSupplier = (row) => {
  return [
    'hotelPayment', 'park', 'transport', 'visa', 'water', 
    'sgr', 'flight', 'transfer', 'excursion'
  ].reduce((sum, field) => sum + (parseFloat(row[field]) || 0), 0);
};

// Handle payment changes from the payment history popup
const onPaymentChanged = (newTotalPayment, type) => {
  const index = salesData.value.findIndex(row => row.vPk === selectedVisitId.value);
  if (index !== -1) {
    const row = salesData.value[index];
    if (type === 'trip') {
      row.tripPayment = newTotalPayment;
      row.clientBalance = parseFloat(row.tripCost) - parseFloat(newTotalPayment);
    } else if (type === 'hotel') {
      row.hotelPayment = newTotalPayment;
      row.hotelBalance = parseFloat(row.hotelCost) - parseFloat(newTotalPayment);
      row.paidToSupplier = calculatePaidToSupplier(row);
      row.profit = calculateProfit(row);
      row.profitLoss = determineProfitLoss(row.profit);
    }
    updateBalanceOnServer(row, type);
  }
};

// Update balance on the server
const updateBalanceOnServer = async (rowData, type) => {
  try {
    const response = await axiosInstance.post('/sales/updateSale', {
      salesData: {
        cPk: rowData.cPk,
        hPk: rowData.hPk,
        vPk: rowData.vPk,
        modifiedData: {
          [type === 'trip' ? 'tripPayment' : 'hotelPayment']: rowData[type === 'trip' ? 'tripPayment' : 'hotelPayment'],
          [type === 'trip' ? 'clientBalance' : 'hotelBalance']: rowData[type === 'trip' ? 'clientBalance' : 'hotelBalance'],
          ...(type === 'hotel' ? { 
            paidToSupplier: rowData.paidToSupplier,
            profit: rowData.profit,
            profitLoss: rowData.profitLoss
          } : {})
        }
      }
    });

    if (response.data.ok) {
      toast.add({ 
        severity: 'success', 
        summary: 'Update Successful', 
        detail: `Updated ${type === 'trip' ? 'Client' : 'Hotel'} Balance`, 
        life: 3000 
      });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
    }
  } catch (error) {
    console.error('Error updating balance:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while updating the balance', life: 3000 });
  }
};

// Handle cell edit completion
const onCellEditComplete = async (event) => {
  const { data, newValue, field } = event;
  
  // Update the local data
  data[field] = newValue;

  // Recalculate balances if cost fields are edited
  if (field === 'tripCost') {
    data.clientBalance = parseFloat(data.tripCost) - parseFloat(data.tripPayment);
  } else if (field === 'hotelCost') {
    data.hotelBalance = parseFloat(data.hotelCost) - parseFloat(data.hotelPayment);
  }

  // Recalculate paidToSupplier if relevant fields are edited
  if (['park', 'transport', 'visa', 'water', 'sgr', 'flight', 'transfer', 'excursion', 'hotelPayment'].includes(field)) {
    data.paidToSupplier = calculatePaidToSupplier(data);
  }

  // Recalculate Profit and Profit/Loss
  data.profit = calculateProfit(data);
  data.profitLoss = determineProfitLoss(data.profit);

  // Send update to server
  try {
    const response = await axiosInstance.post('/sales/updateSale', {
      salesData: {
        cPk: data.cPk,
        hPk: data.hPk,
        vPk: data.vPk,
        modifiedData: {
          [field]: newValue,
          ...(field === 'tripCost' ? { clientBalance: data.clientBalance } : {}),
          ...(field === 'hotelCost' ? { hotelBalance: data.hotelBalance } : {}),
          ...((['park', 'transport', 'visa', 'water', 'sgr', 'flight', 'transfer', 'excursion', 'hotelPayment'].includes(field)) ? { 
            paidToSupplier: data.paidToSupplier,
            profit: data.profit,
            profitLoss: data.profitLoss
          } : {}),
          ...(field === 'tripCost' ? { 
            profit: data.profit,
            profitLoss: data.profitLoss
          } : {})
        }
      }
    });

    if (response.data.ok) {
      toast.add({ 
        severity: 'success', 
        summary: 'Update Successful', 
        detail: `Updated ${field}`, 
        life: 3000 
      });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: response.data.message, life: 3000 });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while updating the data', life: 3000 });
  }
};

// Format cell content based on field type
const formatCellContent = (value, col) => {
  if (col.type === 'date' && value) {
    return new Date(value).toLocaleDateString();
  }
  if (['tripCost', 'tripPayment', 'clientBalance', 'hotelCost', 'hotelPayment', 'hotelBalance', 'paidToSupplier'].includes(col.field)) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(value);
  }
  return value;
};

const confirmDelete = (rowData) => {
  confirm.require({
    message: 'Are you sure you want to delete this record?',
    header: 'Confirmation',
    icon: 'pi pi-exclamation-triangle',
    accept: () => deleteRow(rowData),
  });
};

const deleteRow = async (rowData) => {
  try {
    const response = await axiosInstance.post('/sales/deleteTrip', {
      vPk: rowData.vPk
    });

    if (response.data.ok) {
      // Remove the row from the local data
      salesData.value = salesData.value.filter(row => row.vPk !== rowData.vPk);
      
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: response.data.message,
        life: 3000
      });
    } else {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: response.data.message,
        life: 3000
      });
    }
  } catch (error) {
    console.error('Error deleting record:', error);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'An error occurred while deleting the record',
      life: 3000
    });
  }
};
</script>

<style scoped>
.sales-table-container {
  display: flex;
  flex-direction: column;
}

::v-deep .p-datatable {
  flex: 1;
}

::v-deep .p-datatable .p-datatable-thead > tr > th,
::v-deep .p-datatable .p-datatable-tbody > tr > td {
  padding: 0.8rem 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

::v-deep .p-datatable .p-datatable-tbody > tr > td {
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}

::v-deep .p-datatable .p-datatable-tbody > tr > td:hover {
  background-color: rgba(0, 70, 132, 0.1);
  box-shadow: inset 0 0 0 1px #004684;
}

::v-deep .p-datatable .p-datatable-tbody > tr > td::after {
  content: '✎';
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 10px;
  color: #004684;
  opacity: 0;
  transition: opacity 0.2s;
}

::v-deep .p-datatable .p-datatable-tbody > tr > td:hover::after {
  opacity: 1;
}

.cell-content {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pagination-container {
  position: sticky;
  bottom: 0;
  padding: 0.5rem;
  background: none;
}

::v-deep .p-paginator {
  justify-content: center;
  background: none;
}

::v-deep .p-paginator .p-paginator-pages .p-paginator-page,
::v-deep .p-button {
  background-color: #004684;
  color: #fff;
  border: none;
  margin: 0 0.25rem;
}

::v-deep .p-paginator .p-paginator-pages .p-paginator-page:hover,
::v-deep .p-button:hover,
::v-deep .p-calendar .p-datepicker table tbody td .p-datepicker-cell:hover {
  background-color: #c4b600;
}

::v-deep .p-paginator .p-paginator-icon {
  color: #004684;
}

::v-deep .p-paginator .p-paginator-icon:hover {
  color: #c4b600;
}

::v-deep .p-calendar {
  width: 100%;
}

::v-deep .p-calendar .p-inputtext,
::v-deep .p-calendar .p-datepicker,
.p-cell-editing .p-inputtext {
  width: 100%;
  border: 1px solid #004684;
  border-radius: 4px;
  padding: 0.5rem;
}

::v-deep .p-calendar .p-inputtext:focus,
.p-cell-editing .p-inputtext:focus {
  border-color: #c4b600;
  box-shadow: 0 0 0 0.2rem rgba(196, 182, 0, 0.25);
}

::v-deep .p-calendar .p-datepicker .p-datepicker-header {
  background-color: #004684;
  color: #fff;
}

::v-deep .p-calendar .p-datepicker table thead th,
::v-deep .p-calendar .p-datepicker table tbody td .p-datepicker-cell {
  color: #004684;
}

::v-deep .p-calendar .p-datepicker table tbody td .p-datepicker-cell.p-highlight {
  background-color: #004684;
  color: #fff;
}

::v-deep .p-calendar .p-datepicker table tbody td .p-datepicker-cell.p-highlight:hover {
  background-color: #c4b600;
  color: #fff;
}

.p-cell-editing .p-inputtext {
  height: 80%;
  border-color: #c4b600;
}

::v-deep .highlight-column {
  background-color: rgba(196, 182, 0, 0.2);
  transition: background-color 0.5s ease;
}

.profit-cell {
  background-color: rgba(0, 16, 196, 0.2); /* Light shade of #c4b500 */
  color: #004183; /* Brand blue */
  font-weight: bold;
}

.loss-cell {
  background-color: rgba(0, 65, 131, 0.2); /* Light shade of #004183 */
  color: #004183; /* Brand blue */
  font-weight: bold;
}

.break-even-cell {
  background-color: #f0f0f0; /* Light gray background */
  color: #004183; /* Brand blue */
  font-weight: bold;
}

/* Existing styles */
.payment-cell {
  cursor: pointer;
  color: #004183; /* Brand blue */
  text-decoration: underline;
}

.payment-cell:hover {
  color: #c4b500; /* Brand yellow */
}

.calculated-cell {
  background-color: #f7f7f7;
  padding-left: 1rem;
  border-radius: 1rem;
  color: #004183; /* Brand blue */
  cursor: not-allowed;
}

::v-deep .p-togglebutton {
  width: 100px;
  height: 30px;
}

::v-deep .p-togglebutton.p-highlight {
  background-color: #004684;
  border-color: #004684;
}

::v-deep .p-togglebutton:not(.p-disabled):not(.p-highlight):hover {
  background-color: #c4b600;
  border-color: #c4b600;
}

::v-deep .p-button.p-button-danger.p-button-text {
  color: #ef4444;
}

::v-deep .p-button.p-button-danger.p-button-text:hover {
  background: rgba(239, 68, 68, 0.04);
  color: #dc2626;
}
</style>