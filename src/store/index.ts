import accountModule from '@/account/store/accountModule'
import authenticationModule from '@/authentication/store/authenticationModule'
import boardModule from '@/board/store/boardModule'
import GoogleAuthenticationModule from "@/googleAuthentication/store/GoogleAuthenticationModule"
import userModule from '@/home/store/userModule'
import NaverAuthenticationModule from '@/naverAuthentication/store/NaverAuthenticationModule'
import stockModule from '@/stock/store/stockModule'
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
    stockModule,
    userModule,

  }
})
