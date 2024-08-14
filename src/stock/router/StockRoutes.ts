import StockListPage from "@/stock/pages/list/StockList.vue";
import StockDetailPage from "@/stock/pages/detail/StockDetail.vue";

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
      }
];



export default StockRoutes;
