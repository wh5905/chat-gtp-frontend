<template>
    <div class="stock-order-history">
        <div class="d-flex justify-content-between align-items-center mb-4">
  <v-app-bar app color="#121212" dark>
    <v-spacer></v-spacer>
    
    <v-btn icon @click="goToStockList">
      <v-icon>mdi-format-list-bulleted</v-icon>
    </v-btn>
    <v-btn icon @click="goToHome">
      <v-icon>mdi-home</v-icon>
    </v-btn>
  </v-app-bar>
</div>
      <div class="card">
        <h2 class="card-title">주식 주문 내역</h2>
        <div class="filter-buttons">
          <button @click="setFilter('all')" :class="{ active: currentFilter === 'all' }" >전체</button>
          <button @click="setFilter('buy')" :class="{ active: currentFilter === 'buy','buy-button': true }" >매수</button>
          <button @click="setFilter('sell')" :class="{ active: currentFilter === 'sell', 'sell-button': true  }">매도</button>
        </div>
        <div class="card-content">
          <table v-if="paginatedOrders.length > 0" class="order-table">
            <thead>
              <tr>
                <th>주문일시</th>
                <th>상품명</th>
                <th>주문구분</th>
                <th>매수/매도</th>
                <th>주문수량</th>
                <th>주문가격</th>
                <th>총체결금액</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in paginatedOrders" :key="order.ord_dt + order.ord_tmd">
                <td>{{ formatDateTime(order.ord_dt, order.ord_tmd) }}</td>
                <td>{{ order.prdt_name }}</td>
                <td>{{ order.ord_dvsn_name }}</td>
                <td>
                  <span :class="['badge', order.sll_buy_dvsn_cd_name === '매수' ? 'badge-buy' : 'badge-sell']">
                    {{ order.sll_buy_dvsn_cd_name }}
                  </span>
                </td>
                <td>{{ order.ord_qty }}</td>
                <td>{{ formatPrice(order.ord_unpr) }}</td>
                <td>{{ formatPrice(order.tot_ccld_amt) }}</td>
              </tr>
            </tbody>
          </table>
          <div v-else class="no-data">
            주문 내역이 없습니다.
          </div>
        </div>
        <div class="pagination">
          <button @click="prevPage" :disabled="currentPage === 1">이전</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">다음</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, computed, onMounted } from 'vue';
  import axiosInst from "@/utility/axiosInstance"; // 경로는 실제 프로젝트 구조에 맞게 조정해주세요
import router from '@/router';
  
  export default {
    name: 'StockOrderHistory',
    setup() {
      const stockOrders = ref([]);
      const currentFilter = ref('all');
      const currentPage = ref(1);
      const itemsPerPage = 10;
  
      const fetchStockOrders = async () => {
        try {
          const response = await axiosInst.djangoAxiosInst.post('/trading/list');
          if (response.status === 200) {
            stockOrders.value = response.data;
            console.log('Fetched stock orders:', stockOrders.value);
          } else {
            console.error('Failed to fetch stock orders:', response.data.error);
          }
        } catch (error) {
          console.error('Error fetching stock orders:', error);
        }
      };
  
      const filteredOrders = computed(() => {
        if (currentFilter.value === 'all') return stockOrders.value;
        return stockOrders.value.filter(order => 
          (currentFilter.value === 'buy' && order.sll_buy_dvsn_cd_name === '매수') ||
          (currentFilter.value === 'sell' && order.sll_buy_dvsn_cd_name === '매도')
        );
      });
  
      const totalPages = computed(() => Math.ceil(filteredOrders.value.length / itemsPerPage));
  
      const paginatedOrders = computed(() => {
        const start = (currentPage.value - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        return filteredOrders.value.slice(start, end);
      });
  
      const setFilter = (filter) => {
        currentFilter.value = filter;
        currentPage.value = 1;
      };
  
      const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
      };
  
      const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
      };
  
      onMounted(() => {
        fetchStockOrders();
      });
  
      const formatDateTime = (date, time) => {
        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = date.slice(6, 8);
        const hour = time.slice(0, 2);
        const minute = time.slice(2, 4);
        const second = time.slice(4, 6);
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
      };
  
      const formatPrice = (price) => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
      };
      const goToHome = () => {
      router.push('/');
    };

    const goToStockList = () => {
      router.push('/stocks/list');
    };
  
      return {
        paginatedOrders,
        currentFilter,
        currentPage,
        totalPages,
        setFilter,
        prevPage,
        nextPage,
        formatDateTime,
        formatPrice,
        goToStockList,
        goToHome,
      };
    }
  }
  </script>
  
  <style scoped>
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background-color: #121212;
  }
  
  .stock-order-history {
    font-family: 'Arial', sans-serif;
    width: 100%;
    min-height: 100vh;
    background-color: #121212;
    color: #ffffff;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
    box-sizing: border-box;
  }
  
  .card {
    background-color: #1e1e1e;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    width: 100%;
    max-width: 1200px;
  }
  
  .card-title {
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
    padding: 20px;
    background-color: #2c2c2c;
    margin: 0;
  }
  
  .card-content {
    padding: 20px;
    overflow-x: auto;
  }
  
  .filter-buttons, .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    background-color: #2c2c2c;
  }
  
  .filter-buttons button, .pagination button {
    margin: 0 10px;
    padding: 8px 16px;
    border: none;
    background-color: #3a3a3a;
    color: #ffffff;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
  }
  
  .filter-buttons button.active, .pagination button:not(:disabled):hover {
    background-color: #4a4a4a;
    font-weight: bold;
  }
  
  .pagination button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .pagination span {
    margin: 0 10px;
  }
  
  .order-table {
    width: 100%;
    border-collapse: collapse;
    color: #ffffff;
  }
  
  .order-table th, .order-table td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #2c2c2c;
  }
  
  .order-table th {
    background-color: #2c2c2c;
    font-weight: bold;
    color: #ffffff;
  }
  
  .order-table tr:hover {
    background-color: #2a2a2a;
  }
  
  .badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
  }
  
  .badge-buy {
    background-color: #941730;
    color: #ffbebe;
  }
  
  .badge-sell {
    background-color: #0a3d62;
    color: #48dbfb;
  }
  
  .no-data {
    text-align: center;
    padding: 20px;
    font-style: italic;
    color: #888;
  }

.buy-button {
  color: #ffbebe; /* 매수 버튼 글씨 색상 */
}

.sell-button {
  color: #48dbfb; /* 매도 버튼 글씨 색상 */
}

  </style>