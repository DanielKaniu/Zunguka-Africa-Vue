<template>
  <Toast/>
  <div class="report-dashboard">

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else>

      <!-- Sales and Profit -->
      <div class="card">
        <h2>Sales and Profit (Last 12 Months)</h2>
        <Chart type="line" :data="salesProfitChartData" :options="chartOptions" />
      </div>

      <!-- Top Clients -->
      <div class="card">
        <h2>Top 20 Clients</h2>
        <DataTable :value="topClients" :paginator="true" :rows="10">
          <Column field="Client_Name" header="Client Name"></Column>
          <Column field="Amount_Spent" header="Amount Spent"></Column>
          <Column field="Bookings" header="Bookings"></Column>
          <Column field="Top_Hotel" header="Top Hotel"></Column>
        </DataTable>
      </div>

      <!-- This Month's Booking Performance -->
      <div class="card">
        <h2>This Month's Booking Performance</h2>
        <div class="p-grid">
          <div class="p-col-6">
            <h3>Today's Performance</h3>
            <p>Visits Today: {{ bookingPerformance?.visitsToday || 'N/A' }}</p>
            <p>Payments Today: {{ bookingPerformance?.paymentsToday || 'N/A' }}</p>
          </div>
          <div class="p-col-6">
            <h3>Monthly Totals</h3>
            <p>Total Visits: {{ bookingPerformance?.totalVisits || 'N/A' }}</p>
            <p>Total Payments: {{ bookingPerformance?.totalPayments || 'N/A' }}</p>
          </div>
        </div>
        <!-- Uncomment this when Chart is properly set up -->
        <Chart type="bar" :data="weeklyChartData" :options="chartOptions" />
      </div>

      <!-- Payment Performance -->
      <div class="card">
        <h2>Payment Performance</h2>
        <p>Total Clients: {{ paymentPerformance?.Total_Clients || 'N/A' }}</p>
        <p>Total Client Balance: {{ paymentPerformance?.Total_Client_Balance || 'N/A' }}</p>
        <p>Total Hotel Balance: {{ paymentPerformance?.Total_Hotel_Balance || 'N/A' }}</p>
      </div>

      <!-- Popular Hotels -->
      <div class="card">
        <h2>Top 20 Popular Hotels</h2>
        <DataTable :value="popularHotels" :paginator="true" :rows="10">
          <Column field="Hotel" header="Hotel Name"></Column>
          <Column field="Frequency" header="Frequency"></Column>
        </DataTable>
      </div>

    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axiosInstance from '../axiosInstance';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Chart from 'primevue/chart';
import { useToast } from "primevue/usetoast";
import Toast from 'primevue/toast';

export default {
  name: 'Analysis',
  components: {
    DataTable,
    Column,
    Chart,
    Toast
  },
  setup() {
    const toast = useToast();
    const topClients = ref([]);
    const bookingPerformance = ref({
      visitsToday: 0,
      paymentsToday: 0,
      totalVisits: 0,
      totalPayments: 0,
      weeklyData: {}
    });
    const paymentPerformance = ref({
      Total_Clients: 0,
      Total_Client_Balance: 0,
      Total_Hotel_Balance: 0
    });
    const popularHotels = ref([]);
    const salesProfit = ref([]);
    const profitData = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchData = async () => {
      try {
        loading.value = true;
        error.value = null;

        const businessName = 'Zunguka Africa Safaris'; // Replace with actual business name or fetch it from user state

        const [topClientsRes, bookingPerformanceRes, paymentPerformanceRes, popularHotelsRes] = await Promise.all([
          axiosInstance.post('/report/getTopClients', {  businessName  }),
          axiosInstance.post('/report/getThisMonthsBookingPerformance', { businessName }),
          axiosInstance.post('/report/getThisMonthsPaymentPerformance', { businessName }),
          axiosInstance.post('/report/getPopularHotels', { businessName })
        ]);
        //
        //Get sales data and profit.
        const [salesProfitRes, profitDataRes] = await Promise.all([
          axiosInstance.get('/report/getSales', { businessName }),
          axiosInstance.get('/report/getProfit', { businessName })
        ]);
        salesProfit.value = salesProfitRes.data.data;
        profitData.value = profitDataRes.data.data;

        topClients.value = topClientsRes.data.data;
        bookingPerformance.value = {
          visitsToday: bookingPerformanceRes.data.data.visitsToday || 0,
          paymentsToday: bookingPerformanceRes.data.data.paymentsToday || 0,
          totalVisits: bookingPerformanceRes.data.data.totalVisits || 0,
          totalPayments: bookingPerformanceRes.data.data.totalPayments || 0,
          weeklyData: bookingPerformanceRes.data.data.weeklyData || {}
        };
        paymentPerformance.value = {
          Total_Clients: paymentPerformanceRes.data?.data?.Total_Clients ?? 0,
          Total_Client_Balance: paymentPerformanceRes.data?.data?.Total_Client_Balance ?? 0,
          Total_Hotel_Balance: paymentPerformanceRes.data?.data?.Total_Hotel_Balance ?? 0
        };
        popularHotels.value = popularHotelsRes.data.data;
        salesProfit.value = salesProfitRes.data.data;
      } catch (err) {
        console.error('Error fetching data:', err);
        error.value = 'An error occurred while fetching data. Please try again later.';
        toast.add({ severity: 'error', summary: 'Error', detail: 'You are not verfied. Please contact the admin', life: 3000 });
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchData);

    const weeklyChartData = computed(() => ({
      labels: Object.keys(bookingPerformance.value.weeklyData || {}),
      datasets: [
        {
          label: 'Visits',
          data: Object.values(bookingPerformance.value.weeklyData || {}).map(w => w.Visits),
          backgroundColor: '#42A5F5'
        },
        {
          label: 'Payments',
          data: Object.values(bookingPerformance.value.weeklyData || {}).map(w => w.Payments),
          backgroundColor: '#66BB6A'
        }
      ]
    }));

    const salesProfitChartData = computed(() => ({
      labels: salesProfit.value.map(item => item.Month),
      datasets: [
        {
          label: 'Sales',
          data: salesProfit.value.map(item => item.Amount),
          borderColor: '#FFA726',
          fill: false
        },
        {
          label: 'Profit',
          data: profitData.value.map(item => item.Profit),
          borderColor: '#66BB6A',
          fill: false
        }
      ]
    }));

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    };

    return {
      topClients,
      bookingPerformance,
      paymentPerformance,
      popularHotels,
      salesProfit,
      profitData,
      weeklyChartData,
      salesProfitChartData,
      chartOptions,
      loading,
      error
    };
  }
};
</script>

<style scoped>
*{
  color: #004682;
}
.report-dashboard {
  padding: 20px;
}
.card {
  background: #ffffff;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
}
.loading, .error {
  text-align: center;
  padding: 20px;
  font-size: 18px;
}
.error {
  color: red;
}
</style>