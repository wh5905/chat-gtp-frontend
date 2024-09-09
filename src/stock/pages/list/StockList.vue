<template>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <v-app-bar app color="#121212" dark>
        <v-toolbar-title class="mr-4">주식 목록</v-toolbar-title>
        <v-btn icon @click="goToTrading">
          <v-icon>mdi-clipboard-list-outline</v-icon>
        </v-btn>
        <v-btn icon @click="goToHome">
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </v-app-bar>
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
        <div v-if="initialLoading" class="list-group">
          <!-- 스켈레톤 UI -->
          <div v-for="n in 10" :key="n" class="list-group-item skeleton-item d-flex justify-content-between align-items-center">
            <div>
              <div class="skeleton-text skeleton-title"></div>
              <div class="skeleton-text skeleton-subtitle"></div>
            </div>
            <div class="d-flex align-items-center">
              <div class="text-end me-3">
                <div class="skeleton-text skeleton-change"></div>
                <div class="skeleton-text skeleton-change"></div>
              </div>
              <div class="skeleton-button"></div>
            </div>
          </div>
        </div>

        <div v-else class="list-group">
          <div
            v-for="stock in stocks"
            :key="stock.id"
            class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
          >
            <router-link
              :to="{ name: 'stock', params: { ticker: stock.ticker } }"
              class="d-flex justify-content-between align-items-center flex-grow-1 text-decoration-none text-white"
            >
              <div>
                <h5 class="mb-1">{{ stock.name }}</h5>
                <small class="text-muted custom-small">{{ stock.ticker }}</small>
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
              </div>
            </router-link>
            <button
              v-if="isLoggedIn"
              class="btn btn-outline-secondary btn-sm favorite-button"
              @click.stop="toggleFavorite(stock)"
            >
              <!-- 즐겨찾기된 상태에서는 채워진 별, 아닌 경우 밝은 색 빈 별 아이콘 -->
              <i v-if="stock.isFavorite" class="fas fa-star text-warning"></i>
              <i v-else class="far fa-star"></i> <!-- 빈 별 아이콘을 흰색으로 -->
            </button>
          </div>
        </div>
        <div v-if="stocks.length === 0 && !loading && !initialLoading" class="text-center mt-4 text-white">
          <p>검색한 종목이 없습니다.</p>
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
import axiosInst from "@/utility/axiosInstance";
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
      loading: false,
      initialLoading: true, // 페이지 초기 로딩 시 사용
      isLoggedIn: false, // 로그인 상태를 저장
    };
  },
  computed: {
    paginationRange() {
      const totalPagesToShow = 5;
      const totalPages = this.totalPages;
      const currentPage = this.currentPage;

      if (totalPages <= totalPagesToShow) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }

      let start = 1;
      let end = totalPagesToShow;

      if (currentPage > 3) {
        start = Math.max(currentPage - 2, 1); // start는 1보다 작을 수 없음
        end = Math.min(currentPage + 2, totalPages); // end는 totalPages를 초과할 수 없음

        if (end - start + 1 < totalPagesToShow) {
          start = Math.max(end - totalPagesToShow + 1, 1); // 범위 조정
        }
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }
  },
  methods: {
    async fetchStocks() {
      if (!this.initialLoading) {
        this.loading = true;
      }
      const email = sessionStorage.getItem('email');
      try {
        const response = await axiosInst.djangoAxiosInst.get('/board/stocks', {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            search: this.searchQuery,
            email: email
          }
        });

        this.stocks = response.data.stocks;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
        console.log('Fetched stocks:', this.stocks);
      } catch (error) {
        console.error('Error fetching stocks:', error);
      } finally {
        this.loading = false;
        this.initialLoading = false; // 초기 로딩이 끝났으므로 false로 설정
      }
    },
    async toggleFavorite(stock) {
      console.log('Toggling favorite for ticker:', stock.ticker); // 로그 추가
      console.log('Current favorites:', this.stocks); // 로그 추가

      const url = stock.isFavorite ? '/favorite_stocks/favorite/remove' : '/favorite_stocks/favorite/add';
      const email = sessionStorage.getItem('email');

      if (!email) {
        console.error('User token not found in session storage');
        return;
      }

      try {
        const response = await axiosInst.djangoAxiosInst.post(url, {
          email: email,
          ticker: stock.ticker
        });

        // 서버로부터 업데이트된 즐겨찾기 상태를 받아옵니다.
        console.log('Server response:', response.data); // 서버 응답 로그 추가
        stock.isFavorite = !stock.isFavorite; // 즐겨찾기 상태를 토글
        console.log('Updated stock:', stock); // 로그 추가
      } catch (error) {
        console.error(`Error ${stock.isFavorite ? 'removing from' : 'adding to'} favorites:`, error);
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
      if (value === undefined || value === null) {
        return '0.00%';
      }
      return `${value.toFixed(2)}%`;
    },
    goToHome() {
      this.$router.push("/");
    },
    goToTrading() {
      this.$router.push("/stock/trade");
    },
    checkLoginStatus() {
      const email = sessionStorage.getItem('email');
      this.isLoggedIn = !!email; // email이 존재하면 true, 그렇지 않으면 false
    }
  },
  mounted() {
    this.checkLoginStatus(); // 컴포넌트가 마운트될 때 로그인 상태를 확인
    this.fetchStocks();
    this.loading = this.currentPage === 1;
    console.log('Mounted: stocks initialized', this.stocks); // 로그 추가
  }
};
</script>

<style scoped>
.container-fluid {
  background-color: #1e1e1e;
  border-radius: 1px;
  padding: 20px;
  min-height: 100vh;
}

.input-group-text {
  background-color: #707070;
  border: none;
  color: #ffffff;
}

.form-control {
  background-color: #696969;
  border: none;
  color: #000000 !important; /* 텍스트 색상을 검정으로 설정하고 우선순위를 높임 */
}

.text-center {
  margin-top: 20px;
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

.favorite-button .fa-star-o {
  color: #dadada; /* 빈 별 아이콘 색상 */
}
.favorite-button .far.fa-star {
  color: #a09e9e; /* 빈 별 아이콘을 흰색으로 */
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

.mr-4 {
  text-align: center;
  font-weight: bold;
  font-size: 32px;
}

.skeleton-item {
  background-color: #333;
  height: 75px;
  margin-bottom: 10px;
  border-radius: 5px;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skeleton-text {
  background-color: #444;
  height: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.skeleton-title {
  width: 150px;
}

.skeleton-subtitle {
  width: 100px;
}

.skeleton-change {
  width: 80px;
}

.skeleton-button {
  background-color: #444;
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.custom-small {
  font-size: 0.7rem !important; /* 더 작은 글씨 크기 */
  color: #a3a3a3 !important; /* 회색 */
}
</style>