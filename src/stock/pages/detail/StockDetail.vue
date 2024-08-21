<template>
  <div class="stock-detail-container" v-if="currentStock">
    <header class="stock-header">
      <div class="stock-title">
        <h1>{{ currentStock.name }}</h1>
        <p class="ticker">{{ currentStock.ticker }}</p>
      </div>
      <div class="stock-price">
        <h2 :class="{ 'up': priceChange > 0, 'down': priceChange < 0 }">
          {{ formatCurrency(currentStock.close) }}
        </h2>
        <p class="change" :class="{ 'up': priceChange > 0, 'down': priceChange < 0 }">
          {{ formatChange(priceChange) }} ({{ formatPercentage(priceChangePercent) }})
        </p>
      </div>
    </header>

    <div class="stock-info-grid">
      <div class="info-card">
        <h3>시가</h3>
        <p>{{ formatCurrency(currentStock.open) }}</p>
      </div>
      <div class="info-card">
        <h3>고가</h3>
        <p>{{ formatCurrency(currentStock.high) }}</p>
      </div>
      <div class="info-card">
        <h3>저가</h3>
        <p>{{ formatCurrency(currentStock.low) }}</p>
      </div>
      <div class="info-card">
        <h3>거래량</h3>
        <p>{{ formatNumber(currentStock.volume) }}</p>
      </div>
    </div>

    <!-- 날짜 선택 기능 추가 -->
    <div class="date-selection">
      <label for="startDate">시작 날짜:</label>
      <input type="date" id="startDate" v-model="startDate" @change="updateChart">
      
      <label for="endDate">종료 날짜:</label>
      <input type="date" id="endDate" v-model="endDate" @change="updateChart">
    </div>

    <div class="stock-chart">
      <canvas id="stockChart"></canvas>
    </div>

    <div class="additional-info">
      <h3>추가 정보</h3>
      <p><strong>날짜:</strong> {{ formatDate(currentStock.date) }}</p>
      <p><strong>최종 업데이트:</strong> {{ formatDate(currentStock.updated_at) }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { StockData } from '@/stock/store/states';
import Chart from 'chart.js/auto';
import axiosInst from "@/utility/axiosInstance";

export default defineComponent({
  name: 'StockDetail',
  setup() {
    const store = useStore();
    const route = useRoute();

    const getFormattedDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const currentStock = computed(() => store.state.stock.currentStock as StockData);
    const priceChange = computed(() => {
      if (!currentStock.value) return 0;
      return currentStock.value.close - currentStock.value.open;
    });
    const priceChangePercent = computed(() => {
      if (!currentStock.value) return 0;
      return (priceChange.value / currentStock.value.open) * 100;
    });

    const startDate = ref(getFormattedDate(new Date(new Date().setDate(new Date().getDate() - 14))));
    const endDate = ref(getFormattedDate(new Date()));

    const chartInstance = ref<Chart | null>(null);

    onMounted(async () => {
      const ticker = route.params.ticker as string;
      await store.dispatch('stock/fetchStockDetail', ticker);
      loadChartData(ticker);
    });

    const loadChartData = async (ticker: string) => {
      try {
        const response = await axiosInst.djangoAxiosInst.get(`/board/stock/${ticker}/${startDate.value}/${endDate.value}/`);
        const chartData = response.data;
        renderChart(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    const updateChart = () => {
      const ticker = route.params.ticker as string;
      loadChartData(ticker);
    };

  const renderChart = (data: any) => {
  const canvasElement = document.getElementById('stockChart') as HTMLCanvasElement | null;

  if (chartInstance.value) {
    chartInstance.value.destroy(); // 기존 차트를 파괴
  }

  if (canvasElement) {
    const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D | null;
if (ctx) {
  const labels = data.map((item: any) => item['날짜']);
  const prices = data.map((item: any) => item['종가']);

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: '종가',
          data: prices,
          borderColor: '#f44336',
          backgroundColor: 'rgba(244, 67, 54, 0.2)',
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { display: true },
        y: { display: true },
      },
    },
  });
} else {
  console.error('Failed to get 2D context');
}
  } else {
    console.error('Failed to find the canvas element.');
  }
};

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    const formatNumber = (value: number) => {
      return new Intl.NumberFormat('ko-KR').format(value);
    };

    const formatChange = (value: number) => {
      return (value > 0 ? '+' : '') + formatCurrency(Math.abs(value));
    };

    const formatPercentage = (value: number) => {
      return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
    };

    return {
      currentStock,
      priceChange,
      priceChangePercent,
      startDate,
      endDate,
      updateChart,
      formatDate,
      formatCurrency,
      formatNumber,
      formatChange,
      formatPercentage,
    };
  },
});
</script>

<style scoped>
.stock-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.stock-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
}

.stock-title h1 {
  margin: 0;
  font-size: 32px;
}

.ticker {
  color: #888;
  font-size: 18px;
}

.stock-price {
  text-align: right;
}

.stock-price h2 {
  font-size: 36px;
  margin: 0;
}

.change {
  font-size: 18px;
  margin: 5px 0 0;
}

.up { color: #f44336; }
.down { color: #422af5; }

.stock-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.info-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #888;
}

.info-card p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

/* 날짜 선택 스타일 추가 */
.date-selection {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.date-selection label {
  font-weight: bold;
  margin-right: 10px;
}

.date-selection input {
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.stock-chart {
  background-color: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.additional-info {
  background-color: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.additional-info h3 {
  margin-top: 0;
}
</style>
