export interface StockData {
  id: number;
  name: string;
  ticker: string;
  close: number;
  priceChange: number;
  percentageChange: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  date: string;
  updated_at: string;
  favorite: boolean;
}


export interface StockState {
  stocks: StockData[];
  currentStock: StockData | null;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  loading: boolean;
  initialLoading: boolean;
  error: string | null;
  userToken: string | null; // 추가된 부분
  favorites: string[]; // 추가된 부분
}

const state: StockState = {
  stocks: [],
  currentStock: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  loading: false,
  initialLoading: true,
  error: null,
  userToken: localStorage.getItem('userToken') || null, // 추가된 부분
  favorites: [], // 추가된 부분
};

export default state;