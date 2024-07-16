<template>
  <div class="add-sale">
    <Toast />
    <div class="button-container">
      <Button label="Add Row" @click="addRow" class="p-button-primary" rounded/>
      <Button label="Save" @click="saveSales" class="p-button-success" rounded :loading="isLoading" :disabled="isLoading"/>
    </div>
    <DataTable :value="sales" editMode="cell" @cell-edit-complete="onCellEditComplete" class="editable-table">
      <Column header="Actions" :exportable="false">
        <template #body="slotProps">
          <Button icon="pi pi-trash" class="p-button-rounded p-button-danger p-button-text" @click="deleteRow(slotProps.index)" />
        </template>
      </Column>
      <Column v-for="col in columns" :key="col.field" :field="col.field" :header="col.header">
        <template #body="{ data, field }">
          <div :class="['editable-cell', { 'required': isRequired(field), 'empty': isEmptyRequired(data, field), 'highlight': highlightedCells.includes(`${data.id}-${field}`) }]">
            {{ formatCellValue(data[field], field) }}
          </div>
        </template>
        <template #editor="{ data, field }">
          <InputText v-if="['checkIn', 'checkOut', 'Payment_Date'].includes(field)" v-model="data[field]" placeholder="YYYY-MM-DD" @input="validateDateInput($event, data, field)" />
          <InputNumber v-else-if="numberFields.includes(field)" v-model="data[field]" :disabled="disabledFields.includes(field)" />
          <ToggleButton v-else-if="field === 'isTripComplete'" v-model="data[field]" onLabel="Yes" offLabel="No" onIcon="pi pi-check" offIcon="pi pi-times" :style="{ width: '100%' }" />
          <InputText v-else v-model="data[field]" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axiosInstance from '../axiosInstance';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Toast from 'primevue/toast';
import { useToast } from "primevue/usetoast";
import ToggleButton from 'primevue/togglebutton';

export default {
  name: 'AddSale',
  components: {
    DataTable,
    Column,
    Button,
    InputText,
    InputNumber,
    Toast,
    ToggleButton
  },
  setup() {
    const columns = [
      { field: 'invoice', header: 'Invoice' },
      { field: 'name', header: 'Name' },
      { field: 'numberOfPeople', header: 'No. of People' },
      { field: 'checkIn', header: 'Check In' },
      { field: 'checkOut', header: 'Check Out' },
      { field: 'Trip_Cost', header: 'Trip Cost' },
      { field: 'Trip_Payment', header: 'Trip Payment' },
      { field: 'Client_Balance', header: 'Client Balance' },
      { field: 'hotelName', header: 'Hotel Name' },
      { field: 'Hotel_Charge', header: 'Hotel Cost' },
      { field: 'Hotel_Payment', header: 'Hotel Payment' },
      { field: 'Hotel_Balance', header: 'Hotel Balance' },
      { field: 'Ref_Number', header: 'Ref Number' },
      { field: 'Payment_Date', header: 'Payment Date' },
      { field: 'Park', header: 'Park' },
      { field: 'Transport', header: 'Transport' },
      { field: 'Visa', header: 'Visa' },
      { field: 'Water', header: 'Water' },
      { field: 'Sgr', header: 'Sgr' },
      { field: 'Flight', header: 'Flight' },
      { field: 'Transfer', header: 'Transfer' },
      { field: 'Excursion', header: 'Excursion' },
      { field: 'Paid_To_Supplier', header: 'Paid To Supplier' },
      { field: 'Profit', header: 'Profit' },
      { field: 'Profit_Loss', header: 'Profit/Loss' },
      { field: 'isTripComplete', header: 'Is Trip Complete' },
    ];
    
    const toast = useToast();
    const highlightedCells = ref([]);
    //
    //The loading spinner.
    const isLoading = ref(false);

    const sales = ref([
      {
        id: 0,
        invoice: '',
        name: '',
        numberOfPeople: null,
        checkIn: '',
        checkOut: '',
        Trip_Cost: null,
        Trip_Payment: null,
        Client_Balance: null,
        hotelName: '',
        Hotel_Charge: null,
        Hotel_Payment: null,
        Hotel_Balance: null,
        Ref_Number: '',
        Payment_Date: '',
        Park: null,
        Transport: null,
        Visa: null,
        Water: null,
        Sgr: null,
        Flight: null,
        Transfer: null,
        Excursion: null,
        Paid_To_Supplier: null,
        Profit: null,
        Profit_Loss: '',
        isTripComplete: false
      }
    ]);

    const requiredFields = [
      'name', 'checkIn', 'checkOut', 'hotelName',
      'numberOfPeople', 'Trip_Cost', 'Trip_Payment', 'Hotel_Charge', 'Hotel_Payment'
    ];

    const numberFields = [
      'numberOfPeople', 'Trip_Cost', 'Trip_Payment', 'Client_Balance',
      'Hotel_Charge', 'Hotel_Payment', 'Hotel_Balance', 'Paid_To_Supplier', 'Profit',
      'Park', 'Transport', 'Visa', 'Water', 'Sgr', 'Flight', 'Transfer', 'Excursion'
    ];

    const disabledFields = ['Client_Balance', 'Hotel_Balance', 'Paid_To_Supplier', 'Profit', 'Profit_Loss'];

    const paidToSupplierFields = [
      'Hotel_Payment', 'Park', 'Transport', 'Visa', 'Water', 'Sgr', 'Flight', 'Transfer', 'Excursion'
    ];

    onMounted(() => {
      sales.value.forEach((sale, index) => {
        sale.id = index;
        calculateBalances(sale);
      });
    });

    const addRow = () => {
      const newRow = {
        id: sales.value.length,
        isTripComplete: false
      };
      sales.value.push(newRow);
    };

    const deleteRow = (index) => {
      sales.value.splice(index, 1);
      sales.value.forEach((sale, i) => {
        sale.id = i;
      });
    };

    const calculateBalances = (data) => {
      data.Client_Balance = (data.Trip_Cost || 0) - (data.Trip_Payment || 0);
      data.Hotel_Balance = (data.Hotel_Charge || 0) - (data.Hotel_Payment || 0);
      
      data.Paid_To_Supplier = paidToSupplierFields.reduce((sum, field) => sum + (data[field] || 0), 0);
      
      data.Profit = (data.Trip_Cost || 0) - (data.Paid_To_Supplier || 0);
      data.Profit_Loss = data.Profit > 0 ? 'Profit' : 'Loss';
    };

    const onCellEditComplete = (event) => {
      let { data, newValue, field } = event;
      data[field] = newValue;
      calculateBalances(data);
    };

    const isRequired = (field) => requiredFields.includes(field);

    const isEmptyRequired = (data, field) => {
      return isRequired(field) && (data[field] === undefined || data[field] === null || data[field] === '');
    };

    const validateDateInput = (event, data, field) => {
      const input = event.target.value;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(input)) {
        data[field] = input.replace(/[^0-9-]/g, '').slice(0, 10);
        if (data[field].length === 4 || data[field].length === 7) {
          data[field] += '-';
        }
      }
      // Additional date validation
      if (dateRegex.test(data[field])) {
        const [year, month, day] = data[field].split('-').map(Number);
        const date = new Date(year, month - 1, day);
        if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
          data[field] = ''; // Clear invalid date
        }
      }
    };

    const validateSales = () => {
      let emptyFields = [];
      let emptyRows = [];
      highlightedCells.value = [];

      sales.value.forEach((sale, index) => {
        let rowEmpty = true;
        let rowEmptyFields = [];

        for (let field of requiredFields) {
          if (isEmptyRequired(sale, field)) {
            rowEmptyFields.push(field);
            highlightedCells.value.push(`${sale.id}-${field}`);
          } else {
            rowEmpty = false;
          }
        }

        if (rowEmpty) {
          emptyRows.push(index + 1);
        } else if (rowEmptyFields.length > 0) {
          emptyFields.push({ row: index + 1, fields: rowEmptyFields });
        }
      });

      return { emptyFields, emptyRows };
    };

    const saveSales = async () => {
      
      const { emptyFields, emptyRows } = validateSales();

      if (emptyRows.length > 0) {
        toast.add({severity:'error', summary: 'Error', detail: `Rows ${emptyRows.join(', ')} are completely empty and will not be saved.`, life: 5000});
        return;
      }

      if (emptyFields.length > 0) {
        const errorMessages = emptyFields.map(({ row, fields }) => `Row ${row}: ${fields.join(', ')}`);
        toast.add({severity:'error', summary: 'Error', detail: `Please fill in all required fields:\n${errorMessages.join('\n')}`, life: 5000});
        return;
      }

      isLoading.value = true;  // Set loading to true when starting the request

      try {
        const userId = JSON.parse(localStorage.getItem('user')).id;
        
        const formattedSales = sales.value
          .filter(sale => !emptyRows.includes(sale.id + 1))
          .map(sale => ({
            ...sale,
            isTripComplete: sale.isTripComplete ? 1 : 0
          }));

        const response = await axiosInstance.post('/sales/saveNewSale', {
          userId: userId,
          businessName: 'Zunguka Africa Safaris',
          salesData: formattedSales
        });

        if (response.data.ok) {
          toast.add({severity:'success', summary: 'Success', detail: response.data.message, life: 3000});
          sales.value = [{
            id: 0,
            invoice: '',
            name: '',
            numberOfPeople: null,
            checkIn: '',
            checkOut: '',
            Trip_Cost: null,
            Trip_Payment: null,
            Client_Balance: null,
            hotelName: '',
            Hotel_Charge: null,
            Hotel_Payment: null,
            Hotel_Balance: null,
            Ref_Number: '',
            Payment_Date: '',
            Park: null,
            Transport: null,
            Visa: null,
            Water: null,
            Sgr: null,
            Flight: null,
            Transfer: null,
            Excursion: null,
            Paid_To_Supplier: null,
            Profit: null,
            Profit_Loss: '',
            isTripComplete: false
          }];
        } else {
          toast.add({severity:'error', summary: 'Error', detail: response.data.message, life: 5000});
        }
      } catch (error) {
        toast.add({severity:'error', summary: 'Error', detail: 'Failed to save sales data.', life: 5000});
      } finally {
        isLoading.value = false;  // Set loading back to false when the request is complete
      }
    };

    const formatCellValue = (value, field) => {
      if (['checkIn', 'checkOut', 'Payment_Date'].includes(field)) {
        return value || '';
      }
      if (numberFields.includes(field) && typeof value === 'number') {
        return value.toFixed(2);
      }
      if (field === 'isTripComplete') {
        return value ? 'Yes' : 'No';
      }
      return value;
    };

    return {
      columns,
      sales,
      addRow,
      deleteRow,
      onCellEditComplete,
      saveSales,
      formatCellValue,
      isRequired,
      isEmptyRequired,
      numberFields,
      disabledFields,
      highlightedCells,
      validateDateInput,
      isLoading
    };
  }
}
</script>

<style scoped>
.add-sale {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.button-container {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.p-button-primary {
  background-color: #004183;
  border-color: #004183;
}

.p-button-primary:hover {
  background-color: #003366;
  border-color: #003366;
}

.p-button-success {
  background-color: #c4b500;
  border-color: #c4b500;
  color: #004183;
}

.p-button-success:hover {
  background-color: #a39600;
  border-color: #a39600;
}

.editable-table {
  margin-top: 20px;
}

.editable-cell {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  transition: background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.editable-cell:hover {
  background-color: #f0f8ff;
  border-color: #004183;
  box-shadow: 0 0 5px rgba(0, 65, 131, 0.2);
}

.editable-cell::after {
  content: '✎';
  font-size: 12px;
  color: #004183;
  opacity: 0;
  float: right;
  transition: opacity 0.2s;
}

.editable-cell:hover::after {
  opacity: 1;
}

.editable-cell.required {
  background-color: #f0f8ff;
}

.editable-cell.empty {
  background-color: #ffe6e6;
}

.editable-cell.highlight {
  border: 2px solid #ff0000;
}

.p-button-rounded.p-button-danger {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
}

.p-button-rounded.p-button-danger:hover {
  background-color: #ff4f4f;
  border-color: #ff4f4f;
}

.p-inputtext,
.p-inputnumber-input,
.p-togglebutton {
  width: 13vw;
  padding: 6px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.p-inputtext:hover,
.p-inputnumber-input:hover,
.p-togglebutton:hover {
  border-color: #004183;
}

.p-inputtext:focus,
.p-inputnumber-input:focus,
.p-togglebutton:focus {
  border-color: #004183;
  box-shadow: 0 0 0 2px rgba(0, 65, 131, 0.2);
  outline: none;
}

.p-togglebutton.p-highlight {
  background-color: #004183;
  border-color: #004183;
}

.p-togglebutton.p-highlight:hover {
  background-color: #003366;
  border-color: #003366;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #004183;
  color: #fff;
  font-weight: bold;
  padding: 0.75rem;
  border: 1px solid #003366;
}

.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
}

.p-datatable .p-datatable-tbody > tr:nth-child(even) {
  background-color: #f8f9fa;
}

.p-datatable .p-datatable-tbody > tr:hover {
  background-color: #e9ecef;
}

.p-toast .p-toast-message.p-toast-message-success {
  background-color: #c4b500;
  border-color: #c4b500;
  color: #004183;
}

.p-toast .p-toast-message.p-toast-message-error {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
}

.table-info {
  margin-bottom: 10px;
  font-style: italic;
  color: #666;
}

.p-cell-editing {
  padding: 0 !important;
}

</style>