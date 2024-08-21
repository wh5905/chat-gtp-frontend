import { ActionContext } from "vuex";
import { StockState, StockData } from "@/stock/store/states";
import axiosInst from "@/utility/axiosInstance";
import {
  SET_STOCKS,
  SET_CURRENT_PAGE,
  SET_TOTAL_PAGES,
  SET_PAGE_SIZE,
  SET_LOADING,
  SET_ERROR,
  SET_CURRENT_STOCK
} from "./mutation-types";

export type StockActions = {
  fetchStocks(
    { commit, state }: ActionContext<StockState, any>, 
    { page, searchQuery }: { page: number, searchQuery: string }
  ): Promise<void>;
  fetchStockDetail(
    context: ActionContext<StockState, any>, 
    ticker: string
  ): Promise<void>;
}

const actions: StockActions = {
  async fetchStocks(
    { commit, state }, 
    { page, searchQuery }: { page: number, searchQuery: string }
  ): Promise<void> {
    commit(SET_LOADING, true);
    try {
      const res = await axiosInst.djangoAxiosInst.get<{
        stocks: StockData[], 
        totalItems: number
      }>(
        '/board/stocks/', 
        { 
          params: { 
            page, 
            size: state.pageSize, 
            search: searchQuery 
          }
        }
      );
      
      commit(SET_STOCKS, res.data.stocks);
      commit(SET_CURRENT_PAGE, page);
      
      const totalPages = Math.ceil(res.data.totalItems / state.pageSize);
      commit(SET_TOTAL_PAGES, totalPages);
      
      console.log('Fetched stocks:', res.data.stocks);
      console.log('Current page:', page);
      console.log('Total pages:', totalPages);
      console.log('Total items:', res.data.totalItems);
    } catch (error) {
      commit(SET_ERROR, 'Failed to fetch stocks');
      console.error('Error fetching stocks:', error);
    } finally {
      commit(SET_LOADING, false);
    }
  },
  
  async fetchStockDetail({ commit }, ticker: string): Promise<void> {
    commit(SET_LOADING, true);
    try {
      const res = await axiosInst.djangoAxiosInst.get<StockData>(
        `/board/get-stock/${ticker}`
      );
      commit(SET_CURRENT_STOCK, res.data);
      console.log('Fetched stock detail:', res.data);
    } catch (error) {
      commit(SET_ERROR, 'Failed to fetch stock detail');
      console.error('Error fetching stock detail:', error);
    } finally {
      commit(SET_LOADING, false);
    }
  }
};

export default actions;