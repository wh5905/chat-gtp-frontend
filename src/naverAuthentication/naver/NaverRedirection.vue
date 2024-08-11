<template>
    <div></div>
  </template>
  
  <script>
  import router from '@/router';
  import { mapActions } from 'vuex'
  
  const NaverAuthenticationModule = 'NaverAuthenticationModule'
  

  export default {
    data () {
        return{
            email:'',
            nickname: '',
            password: '',
            logintype:'',
        }
    },
    methods: {
      ...mapActions(NaverAuthenticationModule, [
        'requestAccessTokenToDjangoRedirection',
        'requestUserInfoToDjango',
    ]),
      async setRedirectData () {
          const code = this.$route.query.code
          await this.requestAccessTokenToDjangoRedirection({ code })
          const NaverAccessToken = localStorage.getItem("naverAccessToken")
          const userInfo = await this.requestUserInfoToDjango()
          this.email = userInfo.response.email
          this.nickname = userInfo.response.nickname
          this.password = Math.random().toString(36).slice(-8)
          this.logintype = "NAVER"
          console.log(userInfo.response)
        }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>