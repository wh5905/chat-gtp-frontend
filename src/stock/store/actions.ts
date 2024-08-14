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
  fetchStocks({ commit, state }: ActionContext<StockState, any>, page: number): Promise<void>;
  fetchStockDetail(context: ActionContext<StockState, any>, ticker: string): Promise<void>;
}

const actions: StockActions = {
  async fetchStocks({ commit, state }, page: number): Promise<void> {
    commit(SET_LOADING, true);
    try {
      const res = await axiosInst.djangoAxiosInst.get<StockData[]>(
        '/board/get-all-stocks',
        { params: { page, size: state.pageSize } }
      );
      // 데이터와 현재 페이지를 업데이트
      commit(SET_STOCKS, res.data);
      commit(SET_CURRENT_PAGE, page);
      
      // 총 페이지 수를 클라이언트 측에서 계산
      const totalItems = 957; // 전체 항목 수를 알고 있다고 가정
      const totalPages = Math.ceil(totalItems / state.pageSize);
      commit(SET_TOTAL_PAGES, totalPages);
      
      console.log('Fetched stocks:', res.data);
      console.log('Total Pages:', totalPages);
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
    } catch (error) {
      commit(SET_ERROR, 'Failed to fetch stock detail');
      console.error('Error fetching stock detail:', error);
    } finally {
      commit(SET_LOADING, false);
    }
  }
};

export default actions;
