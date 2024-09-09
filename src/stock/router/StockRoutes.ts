import StockListPage from "@/stock/pages/list/StockList.vue";
import StockDetailPage from "@/stock/pages/detail/StockDetail.vue";
import TradingPage from "@/stock/pages/trading/Trading.vue";

const StockRoutes = [
    {
        path: '/stocks/list',
        name: 'stock_list',
        component: StockListPage
      },
      {
        path: '/stock/:ticker',
        name: 'stock',
        component: StockDetailPage
      },
      {
        path: '/stock/trade',
        name: 'stock_trade',
        component: TradingPage
      },
];



export default StockRoutes;
