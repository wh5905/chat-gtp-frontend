<template>
 <div class="stock-detail-container" v-if="currentStock">
    <v-app-bar app color=#121212 dark>
      <v-btn icon @click="goToHome">
        <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn icon @click="goToStockList">
        <v-icon>mdi-format-list-bulleted</v-icon>
      </v-btn>
    </v-app-bar>
    <header class="stock-header">
      <div class="stock-title">
        <h1>{{ currentStock.name }}</h1>
        <p class="ticker">{{ currentStock.ticker }}</p>
      </div>
      <div class="stock-price">
        <h2 :class="{ 'up': currentStock.priceChange && currentStock.priceChange > 0, 'down': currentStock.priceChange && currentStock.priceChange < 0 }">
          {{ formatCurrency(currentStock.close) }}
        </h2>
        <p :class="{ 'up': currentStock.priceChange && currentStock.priceChange > 0, 'down': currentStock.priceChange && currentStock.priceChange < 0 }">
          {{ formatChange(currentStock.priceChange ?? 0) }} ({{ formatPercentage(currentStock.percentageChange ?? 0) }})
        </p>
      </div>
    </header>
    <div class="stock-info-grid">
      <div class="info-card">
        <h3>시가</h3>
        <p>{{ formatCurrency(currentStock.open) }}</p>
      </div>
      <div class="info-card high">
        <h3>고가</h3>
        <p>{{ formatCurrency(currentStock.high) }}</p>
      </div>
      <div class="info-card low">
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
import { defineComponent, computed, onMounted, ref, Ref } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { StockData } from '@/stock/store/states';
import Chart, { ChartConfiguration } from 'chart.js/auto';
import axiosInst from "@/utility/axiosInstance";
import router from '@/router';

export default defineComponent({
  name: 'StockDetail',
  setup() {
    const store = useStore();
    const route = useRoute();

    const getFormattedDate = (date: Date): string => {
      return date.toISOString().split('T')[0];
    };

    const currentStock = ref<StockData | null>(null);

    const startDate = ref<string>(getFormattedDate(new Date(new Date().setDate(new Date().getDate() - 14))));
    const endDate = ref<string>(getFormattedDate(new Date()));

    const chartInstance: Ref<Chart | null> = ref(null);

    onMounted(async () => {
      const ticker = route.params.ticker as string;
      await fetchRealtimeStockData(ticker); // 실시간 데이터 가져오기
      // await store.dispatch('stock/fetchStockDetail', ticker);
      loadChartData(ticker);
    });

    const fetchRealtimeStockData = async (ticker: string) => {
  try {
    const response = await axiosInst.djangoAxiosInst.get(`/board/stocks/realtime/${ticker}/`);
    if (response.status === 200) {
      const data = response.data;

      // 실시간 데이터를 현재 주식 데이터에 업데이트
      currentStock.value = {
        id: currentStock.value?.id ?? 0, // 기존 데이터가 있으면 유지, 없으면 기본값 설정
        ticker: currentStock.value?.ticker ?? ticker, // 기존 데이터가 있으면 유지, 없으면 기본값 설정
        name: data.name, // 서버에서 받은 데이터의 name 필드
        date: data.date ?? getFormattedDate(new Date()), // 서버에서 받은 데이터의 date 필드가 없으면 기본값 설정
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume,
        updated_at: getFormattedDate(new Date()), // 현재 날짜로 업데이트
        priceChange: data.priceChange,
        percentageChange: data.percentageChange
      };
      console.log('Current stock:', currentStock.value);
    } else {
      console.error('Failed to fetch real-time stock data:', response.data.error);
    }
  } catch (error) {
    console.error('Error fetching real-time stock data:', error);
  }
};

    const loadChartData = async (ticker: string) => {
      try {
        const response = await axiosInst.djangoAxiosInst.get(`/board/stock/${ticker}/${startDate.value}/${endDate.value}/`);
        const chartData = response.data;
        console.log('Chart data:', chartData);
        renderChart(chartData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    const updateChart = () => {
      const ticker = route.params.ticker as string;
      loadChartData(ticker);
    };

    const renderChart = (data: { 날짜: string; 종가: number }[]) => {
      const canvasElement = document.getElementById('stockChart') as HTMLCanvasElement | null;

      if (chartInstance.value) {
        chartInstance.value.destroy(); // 기존 차트를 파괴
      }

      if (canvasElement) {
        const ctx = canvasElement.getContext('2d') as CanvasRenderingContext2D | null;
        if (ctx) {
          const labels = data.map((item) => item['날짜']);
          const prices = data.map((item) => item['종가']);

          const config: ChartConfiguration<'line'> = {
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
          };

          chartInstance.value = new Chart(ctx, config);
        } else {
          console.error('Failed to get 2D context');
        }
      } else {
        console.error('Failed to find the canvas element.');
      }
    };

    const formatDate = (dateString: string): string => {
      return new Date(dateString).toLocaleDateString('ko-KR');
    };

    const formatCurrency = (value: number): string => {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    };

    const formatNumber = (value: number): string => {
      return new Intl.NumberFormat('ko-KR').format(value);
    };

    const formatChange = (value: number): string => {
      return (value > 0 ? '+' : '') + formatCurrency(Math.abs(value));
    };

    const formatPercentage = (value: number): string => {
      return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
    };

    const goToHome = () => {
      router.push('/');
    };

    const goToStockList = () => {
      router.push('/stocks/list');
    };

    return {
      currentStock,
      startDate,
      endDate,
      updateChart,
      formatDate,
      formatCurrency,
      formatNumber,
      formatChange,
      formatPercentage,
      goToStockList,
      goToHome,
    };
  },
});
</script>


<style scoped>

/* 기본 컨테이너 */
.stock-detail-container {
  margin: 0 auto;
  padding: 20px;
  background-color: #121212; /* 배경색 어두운 색으로 변경 */
  color: #e0e0e0; /* 텍스트 색상 밝게 */
}


/* 헤더 스타일 */
.stock-header {
  display: flex;
  justify-content:space-around;
  align-items: center;
  padding: 20px;
  background-color: #1e1e1e;
  border-radius: 8px;
  margin-bottom: 20px; /* 아래 요소와의 간격 추가 */
  
}
.stock-title {
  flex: 1;
}
.stock-price {
  flex: 1;
  text-align: right;
}

.stock-title h1 {
  margin: 0;
  font-size: 48px;
  font-weight: bold;
  color: #e0e0e0; /* 제목 색상 밝게 */
}

.stock-header > .stock-title,
.stock-header > .stock-price {
  margin: 0 20px;
}

.ticker {
  color: #888;
  font-size: 18px;
}



.stock-price h2 {
  font-size: 36px;
  margin: 0;
}

.change {
  font-size: 18px;
  margin: 5px 0 0;
}

.up { color: #f44336; } /* 상승 텍스트 색상 녹색 */
.down { color: #401aff; } /* 하락 텍스트 색상 빨간색 */

/* 정보 카드 스타일 */
.stock-info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background-color: #1f1f1f; /* 카드 배경 어두운 색으로 변경 */
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.high p {
  color: #ff5252; /* 고가 글씨 색상 빨간색 */
}

.low p {
  color: #448aff; /* 저가 글씨 색상 파란색 */
}

.info-card h3 {
  margin: 0 0 10px;
  font-size: 16px;
  color: #888; /* 서브 텍스트 색상 */
}

.info-card p {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #e0e0e0; /* 카드 텍스트 색상 밝게 */
}

/* 날짜 선택 스타일 */
.date-selection {
  display: flex;
  align-items: center;
  gap: 10px; /* 간격 조정 */
}

.date-selection label {
  font-weight: bold;
  margin-right: 5px;
  color: #e0e0e0; /* 라벨 텍스트 색상 */
}

.date-selection input {
  padding: 5px;
  border: 1px solid #444; /* 테두리 색상 어둡게 */
  border-radius: 5px;
  background-color: #333; /* 입력 필드 배경색 어둡게 */
  color: #e0e0e0; /* 입력 텍스트 색상 밝게 */
}

/* 차트 스타일 */
.stock-chart {
  background-color: #1f1f1f; /* 차트 배경 어둡게 */
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 추가 정보 스타일 */
.additional-info {
  background-color: #1f1f1f; /* 추가 정보 배경 어둡게 */
  border-radius: 10px;
  padding: 20px;
  color: #e0e0e0; /* 텍스트 색상 밝게 */
}

.additional-info h3 {
  margin-top: 0;
}
</style>
