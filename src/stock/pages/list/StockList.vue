<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <router-link to="/" class="btn btn-link text-white p-0">
        <i class="fas fa-chevron-left"></i>
      </router-link>
      <h2 class="text-white text-center mx-auto">주식 목록</h2>
    </div>
    <div class="row justify-content-center mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text text-white">
            <i class="fas fa-search"></i>
          </span>
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            class="form-control text-white"
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
            v-for="stock in stocks"
            :key="stock.id"
            :to="{ name: 'stock', params: { ticker: stock.ticker } }"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <div>
              <h5 class="mb-1">{{ stock.name }}</h5>
              <small class="text-muted">{{ stock.ticker }}</small>
            </div>
            <div class="d-flex align-items-center">
              <div class="text-end me-3">
                <span class="fw-bold">{{ formatCurrency(stock.close) }}</span>
                <br />
                <span
                  :class="{
                    'text-danger': stock.priceChange > 0,
                    'text-primary': stock.priceChange < 0
                  }"
                >
                  {{ formatCurrency(stock.priceChange) }} 
                  <span v-if="stock.priceChange !== 0">
                    ({{ formatPercentage(stock.percentageChange) }})
                  </span>
                </span>
              </div>
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
        <div v-if="stocks.length === 0" class="text-center mt-4">
          <p class="text-muted">검색 결과가 없습니다.</p>
        </div>
      </div>
    </div>
    <!-- Pagination Controls -->
    <div class="row mt-4">
      <div class="col-md-8 offset-md-2 text-center">
        <nav aria-label="Page navigation">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage <= 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">이전</a>
            </li>
            <li class="page-item" v-for="page in paginationRange" :key="page" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage >= totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">다음</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import axiosInst from "@/utility/axiosInstance"
import { debounce } from 'lodash';

export default {
  data() {
    return {
      stocks: [],
      currentPage: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      searchQuery: '',
      favorites: [],
      loading: false,
    };
  },
  computed: {
    paginationRange() {
      const range = 2;
      const start = Math.max(1, this.currentPage - range);
      const end = Math.min(this.totalPages, this.currentPage + range);
      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  },
  methods: {
    async fetchStocks() {
      this.loading = true;
      try {
        const response = await axiosInst.djangoAxiosInst.get('/board/stocks', {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            search: this.searchQuery
          }
        });
        this.stocks = response.data.stocks.map(stock => ({
          ...stock,
          priceChange: stock.close - stock.open,
          percentageChange: ((stock.close - stock.open) / stock.open) * 100
        }));
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
        console.log('Fetched stocks:', this.stocks);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        this.loading = false;
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.fetchStocks();
        console.log('Changed to page:', page);
      }
    },
    debouncedSearch: debounce(function() {
      this.currentPage = 1;
      this.fetchStocks();
    }, 300),
    formatCurrency(value) {
      return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value);
    },
    formatPercentage(value) {
      return `${value.toFixed(2)}%`;
    },
    toggleFavorite(stockId) {
      const index = this.favorites.indexOf(stockId);
      if (index === -1) {
        this.favorites.push(stockId);
      } else {
        this.favorites.splice(index, 1);
      }
      // TODO: Implement API call to save favorites
    },
  },
  mounted() {
    this.fetchStocks();
    // TODO: Fetch user's favorites from API
  }
};
</script>

<style scoped>
.container-fluid {
  background-color: #1e1e1e;
  border-radius: 1px;
  padding: 20px;
}

.input-group-text {
  background-color: #333333;
  border: none;
  color: #ffffff;
}

.form-control {
  background-color: #333333;
  border: none;
  color: #ffffff;
}

.list-group-item {
  background-color: #1e1e1e;
  border: 1px solid #333333;
  color: #ffffff;
}

.list-group-item:hover {
  background-color: #333333;
}

.page-link {
  background-color: #333333;
  border: none;
  color: #ffffff;
}

.page-item.active .page-link {
  background-color: #555555;
  border: none;
}

.favorite-button {
  transition: all 0.2s ease-in-out;
}

.favorite-button.favorite {
  color: gold;
  border-color: gold;
}

.favorite-button:hover {
  transform: scale(1.1);
}

.text-danger {
  color: #ff0000; /* Red for positive change */
}

.text-primary {
  color: #0000ff; /* Blue for negative change */
}
</style>