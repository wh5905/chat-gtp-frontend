import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import BoardRoutes from '@/board/router/BoardRoutes'
import HomeRoutes from '@/home/router/HomeRoutes'
import AccountRoutes from '@/account/router/AccountRoutes'
import AuthenticationRoutes from '@/authentication/router/AuthenticationRoutes'
import GoogleAuthenticationRoutes from '@/googleAuthentication/router/GoogleAuthenticationRoutes'
import NaverAuthenticationRoutes from '@/naverAuthentication/router/NaverAuthenticationRoutes'
import StockRoutes from '@/stock/router/StockRoutes'

const routes: Array<RouteRecordRaw> = [
  ...BoardRoutes,
  ...HomeRoutes,
  ...AccountRoutes,
  ...AuthenticationRoutes,
  ...GoogleAuthenticationRoutes,
  ...NaverAuthenticationRoutes,
  ...StockRoutes,
]  
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
