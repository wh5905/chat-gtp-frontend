export interface StockData {
  id: number;
  ticker: string;
  name: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  updated_at: string;
}

export interface StockState {
  stocks: StockData[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  currentStock?: StockData;
  loading: boolean;
  error: string | null;
}

const state: StockState = {
  stocks: [],
  currentPage: 1,
  totalPages: 1,
  pageSize: 10,  // 페이지당 10개의 항목을 표시
  currentStock: undefined,
  loading: false,
  error: null,
};

export default state;
