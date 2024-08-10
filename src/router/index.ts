import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import BoardRoutes from '@/board/router/BoardRoutes'
import HomeRoutes from '@/home/router/HomeRoutes'
import AccountRoutes from '@/account/router/AccountRoutes'
import AuthenticationRoutes from '@/authentication/router/AuthenticationRoutes'
import GoogleAuthenticationRoutes from '@/googleAuthentication/router/GoogleAuthenticationRoutes'

const routes: Array<RouteRecordRaw> = [
  ...BoardRoutes,
  ...HomeRoutes,
  ...AccountRoutes,
  ...AuthenticationRoutes,
  ...GoogleAuthenticationRoutes,
]  
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
