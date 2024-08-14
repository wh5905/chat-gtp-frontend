<template>
  <div class="container mt-5">
    <h2 class="mb-4 text-center">주식 목록</h2>
    <div class="row justify-content-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text">
            <i class="fas fa-search"></i>
          </span>
          <input
            v-model="search"
            class="form-control"
            placeholder="종목명 또는 티커 검색"
            aria-label="종목 검색"
          />
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-md-8 offset-md-2">
        <div class="list-group">
          <router-link
            v-for="stock in paginatedStocks"
            :key="stock.id"
            :to="{ name: 'stock', params: { ticker: stock.ticker } }"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <h5 class="mb-1">{{ stock.name }}</h5>
              <small class="text-muted">{{ stock.ticker }}</small>
            </div>
            <div class="d-flex align-items-center">
              <span class="badge bg-primary rounded-pill me-3">
                {{ formatCurrency(stock.close) }}
              </span>
              <button
                class="btn btn-outline-secondary btn-sm favorite-button"
                @click.stop="toggleFavorite(stock.id)"
                :class="{ 'favorite': favorites.includes(stock.id) }"
              >
                <i class="fas fa-star"></i>
              </button>
            </div>
          </router-link>
        </div>
        <div v-if="filteredStocks.length === 0" class="text-center mt-4">
          <p class="text-muted">검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div class="row mt-4">
      <div class="col-md-8 offset-md-2 text-center">
        <button
          class="btn btn-primary me-2"
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
        >
          Previous
        </button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button
          class="btn btn-primary ms-2"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { StockData } from "@/stock/store/states";

export default defineComponent({
  setup() {
    const store = useStore();
    const search = ref("");
    const currentPage = computed(() => store.state.stock.currentPage);
    const totalPages = computed(() => store.state.stock.totalPages);
    const pageSize = computed(() => store.state.stock.pageSize);

    // Fetch stocks based on the current page
    const fetchStocks = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        store.dispatch("stock/fetchStocks", page);
      }
    };

    // Fetch initial data
    onMounted(() => {
      fetchStocks(currentPage.value);
    });

    // Change page handler
    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        store.dispatch("stock/fetchStocks", page);
      }
    };

    const stocks = computed(() => store.state.stock.stocks || []);
    const filteredStocks = computed(() => {
      return stocks.value.filter(
        (stock: StockData) =>
          stock.name.toLowerCase().includes(search.value.toLowerCase()) ||
          stock.ticker.toLowerCase().includes(search.value.toLowerCase())
      );
    });

    const paginatedStocks = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return filteredStocks.value.slice(start, end);
    });

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat("ko-KR", {
        style: "currency",
        currency: "KRW",
      }).format(value);
    };

    // Manage favorites
    const favorites = ref<number[]>([]);

    const toggleFavorite = (stockId: number) => {
      if (favorites.value.includes(stockId)) {
        favorites.value = favorites.value.filter(id => id !== stockId);
      } else {
        favorites.value.push(stockId);
      }
    };

    return {
      search,
      filteredStocks,
      paginatedStocks,
      formatCurrency,
      currentPage,
      totalPages,
      changePage,
      toggleFavorite,
      favorites,
    };
  },
});
</script>

<style scoped>
.list-group-item:hover {
  background-color: #f8f9fa;
  transition: background-color 0.3s ease;
}

.badge {
  transition: all 0.3s ease;
}

.list-group-item:hover .badge {
  transform: scale(1.1);
}

/* Styling for the favorite button */
.favorite-button {
  position: relative;
  border: none;
  background: none;
  cursor: pointer;
}

.favorite-button .fa-star {
  color: #6c757d; /* Default color */
  transition: color 0.3s ease;
}

.favorite-button.favorite .fa-star {
  color: #ffc107; /* Yellow color for favorite */
}
</style>


