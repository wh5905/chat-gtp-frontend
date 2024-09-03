import { MutationTree } from 'vuex';
import { StockState, StockData } from './states';
import {
  SET_STOCKS,
  SET_CURRENT_STOCK,
  SET_CURRENT_PAGE,
  SET_TOTAL_PAGES,
  SET_PAGE_SIZE,
  SET_LOADING,
  SET_INITIAL_LOADING,
  SET_ERROR,
  SET_FAVORITES
} from './mutation-types';

export interface StockMutations extends MutationTree<StockState> {
  [SET_STOCKS](state: StockState, stocks: StockData[]): void;
  [SET_CURRENT_STOCK](state: StockState, stock: StockData | null): void;
  [SET_CURRENT_PAGE](state: StockState, page: number): void;
  [SET_TOTAL_PAGES](state: StockState, totalPages: number): void;
  [SET_PAGE_SIZE](state: StockState, pageSize: number): void;
  [SET_LOADING](state: StockState, loading: boolean): void;
  [SET_INITIAL_LOADING](state: StockState, initialLoading: boolean): void;
  [SET_ERROR](state: StockState, error: string | null): void;
  [SET_FAVORITES](state: StockState, favorites: string[]): void;
}

export const mutations: StockMutations = {
  [SET_STOCKS](state, stocks: StockData[]) {
    state.stocks = stocks;
  },
  [SET_CURRENT_STOCK](state, stock: StockData | null) {
    state.currentStock = stock;
  },
  [SET_CURRENT_PAGE](state, page: number) {
    state.currentPage = page;
  },
  [SET_TOTAL_PAGES](state, totalPages: number) {
    state.totalPages = totalPages;
  },
  [SET_PAGE_SIZE](state, pageSize: number) {
    state.pageSize = pageSize;
  },
  [SET_LOADING](state, loading: boolean) {
    state.loading = loading;
  },
  [SET_INITIAL_LOADING](state, initialLoading: boolean) {
    state.initialLoading = initialLoading;
  },
  [SET_ERROR](state, error: string | null) {
    state.error = error;
  },
  [SET_FAVORITES](state, favorites: string[]) {
    state.favorites = favorites;
  },
};

export default mutations;