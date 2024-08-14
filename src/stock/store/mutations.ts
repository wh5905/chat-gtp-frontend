import { MutationTree } from "vuex";
import { StockState, StockData } from "./states";

export interface StockMutations extends MutationTree<StockState> {
  SET_STOCKS(state: StockState, stocks: StockData[]): void;
  SET_LOADING(state: StockState, loading: boolean): void;
  SET_ERROR(state: StockState, error: string | null): void;
  SET_CURRENT_PAGE(state: StockState, page: number): void;  // 현재 페이지 설정
  SET_TOTAL_PAGES(state: StockState, totalPages: number): void;  // 총 페이지 수 설정
  SET_PAGE_SIZE(state: StockState, size: number): void;  // 페이지당 항목 수 설정
  SET_CURRENT_STOCK(state: StockState, stock: StockData | undefined): void;  // 현재 선택된 주식 설정
}

const mutations: StockMutations = {
  SET_STOCKS(state, stocks) {
    state.stocks = stocks;
  },
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  SET_ERROR(state, error) {
    state.error = error;
  },
  SET_CURRENT_PAGE(state, page) {
    state.currentPage = page;
  },
  SET_TOTAL_PAGES(state, totalPages) {
    state.totalPages = totalPages;
  },
  SET_PAGE_SIZE(state, size) {
    state.pageSize = size;
  },
  SET_CURRENT_STOCK(state, stock) {
    state.currentStock = stock;
  }
}

export default mutations;
