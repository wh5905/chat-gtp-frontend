<template>
    <div class="order-list-container">
      <v-app-bar app color="#121212" dark>
        <v-btn icon @click="goToHome">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn icon @click="goToStockList">
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
      </v-app-bar>
      <v-container>
        <v-card class="mt-5">
          <v-card-title>
            <span class="headline">주문한 주식 목록</span>
          </v-card-title>
          <v-card-text>
            <v-btn @click="filterOrders(null)" color="grey lighten-1">전체</v-btn>
            <v-btn @click="filterOrders('매수')" color="red lighten-4">매수</v-btn>
            <v-btn @click="filterOrders('매도')" color="blue lighten-4">매도</v-btn>
            <v-data-table
              :headers="headers"
              :items="filteredStockOrders"
              class="elevation-1"
            />
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref, computed } from 'vue';
  import axiosInst from "@/utility/axiosInstance";
  import router from '@/router';
  
  interface StockOrder {
    ord_dt: string;
    ord_dvsn_name: string;
    sll_buy_dvsn_cd_name: string;
    prdt_name: string;
    ord_qty: number;
    ord_unpr: number;
    ord_tmd: string;
    avg_prvs: number;
    tot_ccld_amt: number;
  }
  
  export default defineComponent({
    name: 'OrderList',
    setup() {
      const stockOrders = ref<StockOrder[]>([]);
      const filter = ref<string | null>(null);
      const headers = [
        { text: '주문 날짜 (예: 2024-09-06)', value: 'ord_dt', align: 'start' },
        { text: '주문 구분 (예: 보통가)', value: 'ord_dvsn_name' },
        { text: '구분 (예: 매수)', value: 'sll_buy_dvsn_cd_name' },
        { text: '종목 이름 (예: AJ네트웍스)', value: 'prdt_name' },
        { text: '주문 수량 (예: 1)', value: 'ord_qty' },
        { text: '주문 가격 (예: ₩4,420)', value: 'ord_unpr' },
        { text: '주문 시간 (예: 12:52:21)', value: 'ord_tmd' },
        { text: '평균 가격 (예: ₩4,420)', value: 'avg_prvs' },
        { text: '총 체결 금액 (예: ₩4,420)', value: 'tot_ccld_amt' },
      ];
  
      onMounted(async () => {
        await fetchStockOrders();
      });
  
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
  
      const formatDate = (dateString: string): string => {
        const year = dateString.substring(0, 4);
        const month = dateString.substring(4, 6);
        const day = dateString.substring(6, 8);
        return `${year}-${month}-${day}`;
      };
  
      const formatTime = (timeString: string): string => {
        const hours = timeString.substring(0, 2);
        const minutes = timeString.substring(2, 4);
        const seconds = timeString.substring(4, 6);
        return `${hours}:${minutes}:${seconds}`;
      };
  
      const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
      };
  
      const formattedStockOrders = computed(() => {
        return stockOrders.value.map(order => ({
          ...order,
          ord_dt: formatDate(order.ord_dt),
          ord_tmd: formatTime(order.ord_tmd),
          ord_unpr: formatCurrency(order.ord_unpr),
          avg_prvs: formatCurrency(order.avg_prvs),
          tot_ccld_amt: formatCurrency(order.tot_ccld_amt),
        }));
      });
  
      const filteredStockOrders = computed(() => {
        if (!filter.value) {
          return formattedStockOrders.value;
        }
        return formattedStockOrders.value.filter(order => order.sll_buy_dvsn_cd_name === filter.value);
      });
  
      const filterOrders = (type: string | null) => {
        filter.value = type;
      };
  
      const goToHome = () => {
        router.push('/');
      };
  
      const goToStockList = () => {
        router.push('/stocks/list');
      };
  
      return {
        stockOrders,
        headers,
        formattedStockOrders,
        filteredStockOrders,
        filterOrders,
        goToHome,
        goToStockList,
      };
    },
  });
  </script>
  
  <style scoped>
  .order-list-container {
    background-color: #121212;
    color: #e0e0e0;
    min-height: 100vh;
  }
  
  .v-card {
    background-color: #1e1e1e;
    color: #e0e0e0;
  }
  
  .headline {
    color: #e0e0e0;
  }
  
  .v-data-table {
    background-color: #1e1e1e;
    color: #e0e0e0;
  }
  
  .v-data-table-header th {
    background-color: #2c2c2c;
  }
  
  .v-data-table__divider {
    border-color: #444;
  }
  </style>