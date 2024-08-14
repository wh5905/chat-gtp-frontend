import accountModule from '@/account/store/accountModule'
import authenticationModule from '@/authentication/store/authenticationModule'
import boardModule from '@/board/store/boardModule'
import GoogleAuthenticationModule from "@/googleAuthentication/store/GoogleAuthenticationModule"
import NaverAuthenticationModule from '@/naverAuthentication/store/NaverAuthenticationModule'
import StockModule from '@/stock/store/stockModule'
import { createStore } from 'vuex'

export default createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    boardModule,
    accountModule,
    authenticationModule,
    GoogleAuthenticationModule,
    NaverAuthenticationModule,
    stock: StockModule,

  }
})
