<template>
  <div class="stock-detail container my-5" v-if="currentStock">
    <div class="card shadow-lg">
      <div class="card-header bg-primary text-white">
        <h2 class="mb-0">{{ currentStock.name }} ({{ currentStock.ticker }})</h2>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                날짜
                <span class="badge bg-secondary">{{ currentStock.date }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                시가
                <span class="badge bg-info">{{ formatCurrency(currentStock.open) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                고가
                <span class="badge bg-success">{{ formatCurrency(currentStock.high) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                저가
                <span class="badge bg-danger">{{ formatCurrency(currentStock.low) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                종가
                <span class="badge bg-warning text-dark">{{ formatCurrency(currentStock.close) }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                거래량
                <span class="badge bg-dark">{{ formatNumber(currentStock.volume) }}</span>
              </li>
            </ul>
          </div>
          <div class="col-md-6">
            <stock-chart :stock-data="currentStock"></stock-chart>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import StockChart from '@/stock/pages/list/StockList.vue';
// npm install bootstrap @fortawesome/fontawesome-free --legacy-peer-deps

export default {
  name: 'StockDetail',
  components: {
    StockChart
  },
  computed: {
    ...mapState('stock', ['currentStock'])
  },
  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    },
    formatNumber(value) {
      return new Intl.NumberFormat('ko-KR').format(value);
    },
    fetchStockData() {
      this.$store.dispatch('stock/fetchStockDetail', this.$route.params.ticker);
    }
  },
  created() {
    this.fetchStockData();
  },
  watch: {
    '$route.params.ticker': {
      handler() {
        this.fetchStockData();
      },
      immediate: true
    }
  }
};
</script>

<style scoped>
.stock-detail .card {
  border-radius: 15px;
  overflow: hidden;
}

.stock-detail .card-header {
  background: linear-gradient(45deg, #007bff, #6610f2);
}

.stock-detail .list-group-item {
  transition: all 0.3s ease;
}

.stock-detail .list-group-item:hover {
  background-color: #f8f9fa;
}

.stock-detail .badge {
  font-size: 1rem;
  padding: 0.5em 0.75em;
  border-radius: 10px;
}
</style>