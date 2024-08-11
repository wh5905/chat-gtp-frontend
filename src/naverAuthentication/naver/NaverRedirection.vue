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
    ]),
      async setRedirectData () {
          const code = this.$route.query.code 
        }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>