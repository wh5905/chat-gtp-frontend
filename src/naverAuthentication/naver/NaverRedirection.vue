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
        'requestAccessTokenToDjangoRedirection'
    ]),
      async setRedirectData () {
          const code = this.$route.query.code
          await this.requestAccessTokenToDjangoRedirection({ code })
          const NaverAccessToken = localStorage.getItem("naverAccessToken")
          console.log(NaverAccessToken)
        }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>