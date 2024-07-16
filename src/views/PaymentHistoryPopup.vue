<template>
  <!-- Main Dialog component -->
  <Dialog 
    :visible="visible" 
    @update:visible="$emit('update:visible', $event)"
    :style="{ width: '50vw' }" 
    :header="paymentType === 'trip' ? 'Trip Payment History' : 'Hotel Payment History'"
    :modal="true"
  >
    <!-- DataTable to display payment history -->
    <DataTable :value="paymentHistory" responsiveLayout="scroll">
      <Column field="Ref_No" header="Reference No"></Column>
      <Column field="Amount" header="Amount">
        <template #body="slotProps">
          {{ formatCurrency(slotProps.data.Amount) }}
        </template>
      </Column>
      <Column field="Date" header="Date">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.Date) }}
        </template>
      </Column>
      <Column header="Actions">
        <template #body="slotProps">
          <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" @click="editPayment(slotProps.data)" />
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger" @click="confirmDelete(slotProps.data)" />
        </template>
      </Column>
    </DataTable>

    <!-- Total amount and Add New Payment button -->
    <div class="p-d-flex p-jc-between p-ai-center p-mt-3">
      <div>Total Amount: {{ formatCurrency(totalAmount) }}</div>
      <Button label="Add New Payment" @click="openNewPaymentForm" />
    </div>
    
    <!-- New Payment Form Dialog -->
    <Dialog v-model:visible="newPaymentVisible" header="Add New Payment" :modal="true">
      <div class="p-fluid">
        <div class="p-field">
          <label for="refNo">Reference No</label>
          <InputText id="refNo" v-model="newPayment.refNo" />
        </div>
        <div class="p-field">
          <label for="amount">Amount</label>
          <InputNumber id="amount" v-model="newPayment.amount" mode="currency" currency="KES" />
        </div>
        <div class="p-field">
          <label for="date">Date</label>
          <Calendar id="date" v-model="newPayment.date" dateFormat="yy-mm-dd" />
        </div>
      </div>
      <template #footer>
        <Button label="Save" @click="savePayment" />
        <Button label="Cancel" @click="closeNewPaymentForm" class="p-button-secondary" />
      </template>
    </Dialog>

    <!-- Edit Payment Form Dialog -->
    <Dialog v-model:visible="editDialog" header="Edit Payment" :modal="true">
      <div class="p-fluid" v-if="editingPayment">
        <div class="p-field">
          <label for="editRefNo">Reference No</label>
          <InputText id="editRefNo" v-model="editingPayment.Ref_No" />
        </div>
        <div class="p-field">
          <label for="editAmount">Amount</label>
          <InputNumber id="editAmount" v-model="editingPayment.Amount" mode="currency" currency="KES" />
        </div>
        <div class="p-field">
          <label for="editDate">Date</label>
          <Calendar id="editDate" v-model="editingPayment.Date" dateFormat="yy-mm-dd" />
        </div>
      </div>
      <template #footer>
        <Button label="Save" @click="updatePayment" />
        <Button label="Cancel" @click="editDialog = false" class="p-button-secondary" />
      </template>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue';
import Dialog from 'primevue/dialog';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Calendar from 'primevue/calendar';
import axiosInstance from '../axiosInstance';
import { useToast } from 'primevue/usetoast';

const toast = useToast();

// Props
const props = defineProps({
  visible: Boolean,
  visitId: Number,
  paymentType: String
});

// Emits
const emit = defineEmits(['update:visible', 'paymentChanged']);

// Reactive variables
const paymentHistory = ref([]);
const totalAmount = ref(0);
const newPaymentVisible = ref(false);
const newPayment = ref({ refNo: '', amount: null, date: null });
const editDialog = ref(false);
const editingPayment = ref(null);

// Load payment history when the component becomes visible or visitId changes
watch(
  () => ({ visible: props.visible, visitId: props.visitId }),
  (newVal, oldVal) => {
    if (newVal.visible && newVal.visitId && 
       (newVal.visible !== oldVal.visible || newVal.visitId !== oldVal.visitId)) {
      loadPaymentHistory();
    }
  },
  { immediate: true }
);

// Function to load payment history
const loadPaymentHistory = async () => {
  if (!props.visitId) return;
  
  try {
    const endpoint = props.paymentType === 'trip' ? '/sales/getTripPaymentHistory' : '/sales/getHotelPaymentHistory';
    const response = await axiosInstance.post(endpoint, { vPk: props.visitId });
    if (response.data.ok) {
      paymentHistory.value = response.data.data.map(payment => ({
        ...payment,
        pPk: payment.pPk
      }));
      totalAmount.value = response.data.total;
    }
  } catch (error) {
    console.error('Error loading payment history:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load payment history', life: 3000 });
  }
};

// Utility functions
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'KES' }).format(value);
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return date.toISOString().split('T')[0];
};

// Form handling functions
const openNewPaymentForm = () => {
  newPaymentVisible.value = true;
};

const closeNewPaymentForm = () => {
  newPaymentVisible.value = false;
  newPayment.value = { refNo: '', amount: null, date: null };
};

const savePayment = async () => {
  if (!newPayment.value.amount) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Amount is required.', life: 3000 });
    return;
  }

  try {
    let formattedDate = null;
    if (newPayment.value.date) {
      const date = new Date(newPayment.value.date);
      date.setDate(date.getDate() + 1);
      formattedDate = date.toISOString().split('T')[0];
    }

    const endpoint = props.paymentType === 'trip' ? '/sales/saveTripPayment' : '/sales/saveHotelPayment';
    const response = await axiosInstance.post(endpoint, {
      data: {
        clientPayment: newPayment.value.amount,
        refNumber: newPayment.value.refNo || ''
      },
      paymentDate: formattedDate,
      vPk: props.visitId,
      centreName: props.paymentType === 'trip' ? 'visit_payment' : 'hotel_payment'
    });

    if (response.data.ok) {
      paymentHistory.value.push(response.data.newPayment);
      totalAmount.value = response.data.totalPayment;
      closeNewPaymentForm();
      emit('paymentChanged', response.data.totalPayment, props.paymentType);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Payment saved successfully.', life: 3000 });
    }
  } catch (error) {
    console.error('Error adding new payment:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save payment.', life: 3000 });
  }
};

const editPayment = (payment) => {
  editingPayment.value = { ...payment };
  editDialog.value = true;
};

const updatePayment = async () => {
  const originalPayment = paymentHistory.value.find(p => p.pPk === editingPayment.value.pPk);
  const changes = {};

  if (editingPayment.value.Amount !== originalPayment.Amount) {
    changes.amount = editingPayment.value.Amount;
  }
  if (editingPayment.value.Ref_No !== originalPayment.Ref_No) {
    changes.ref_no = editingPayment.value.Ref_No;
  }
  if (editingPayment.value.Date !== originalPayment.Date) {
    const date = new Date(editingPayment.value.Date);
    date.setDate(date.getDate() + 1);
    changes.date = date.toISOString().split('T')[0];
  }

  if (Object.keys(changes).length === 0) {
    toast.add({ severity: 'info', summary: 'No Changes', detail: 'No modifications were made to the payment.', life: 3000 });
    editDialog.value = false;
    return;
  }

  try {
    const response = await axiosInstance.post('/sales/updatePayment', {
      paymentData: {
        pPk: editingPayment.value.pPk,
        vPk: props.visitId,
        modifiedData: changes,
        paymentType: props.paymentType === 'trip' ? 'tripPayment' : 'hotelPayment'
      }
    });

    if (response.data.ok) {
      const updatedPayment = response.data.newPayment;
      const index = paymentHistory.value.findIndex(p => p.pPk === updatedPayment.id);
      if (index !== -1) {
        paymentHistory.value[index] = {
          ...paymentHistory.value[index],
          Amount: updatedPayment.amount,
          Ref_No: updatedPayment.ref_no,
          Date: updatedPayment.date,
          pPk: updatedPayment.id
        };
      }
      totalAmount.value = parseFloat(response.data.totalPayment);
      editDialog.value = false;
      paymentHistory.value = [...paymentHistory.value];
      emit('paymentChanged', response.data.totalPayment, props.paymentType);
      toast.add({ severity: 'success', summary: 'Payment Updated', detail: 'The payment has been successfully updated.', life: 3000 });
    }
  } catch (error) {
    console.error('Error updating payment:', error);
    toast.add({ severity: 'error', summary: 'Update Failed', detail: 'An error occurred while updating the payment.', life: 3000 });
  }
};

const confirmDelete = (payment) => {
  if (window.confirm('Are you sure you want to delete this payment?')) {
    deletePayment(payment);
  }
};

const deletePayment = async (payment) => {
  try {
    const response = await axiosInstance.post('/sales/deletePayment', {
      pPk: payment.pPk,
      vPk: props.visitId,
      paymentType: props.paymentType === 'trip' ? 'tripPayment' : 'hotelPayment'
    });

    if (response.data.ok) {
      paymentHistory.value = paymentHistory.value.filter(p => p.pPk !== payment.pPk);
      totalAmount.value = response.data.totalPayment;
      emit('paymentChanged', response.data.totalPayment, props.paymentType);
      toast.add({ severity: 'success', summary: 'Success', detail: 'Payment deleted successfully.', life: 3000 });
    } else {
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment.', life: 3000 });
    }
  } catch (error) {
    console.error('Error deleting payment:', error);
    toast.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while deleting the payment.', life: 3000 });
  }
};
</script>

<style scoped>
.p-dialog .p-dialog-content {
  padding: 1.5rem;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #f8f9fa;
  color: #495057;
  font-weight: 600;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.5rem 1rem;
}

.p-field {
  margin-bottom: 1rem;
}

.p-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.p-inputtext, .p-inputnumber, .p-calendar {
  width: 100%;
}

.p-dialog-footer {
  text-align: right;
  padding-top: 1rem;
}

.p-dialog-footer .p-button {
  margin-left: 0.5rem;
}
</style>