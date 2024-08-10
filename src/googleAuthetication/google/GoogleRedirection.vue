<template>
    <div></div>
  </template>
  
  <script>
  import { mapActions } from 'vuex'
  
  const googleAuthenticationModule = 'GoogleAuthenticationModule'
  
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
      ...mapActions(googleAuthenticationModule, [
        'requestAccessTokenToDjangoRedirection',
        'requestUserEmailToDjango',
        'requestUserInfoToDjango',
      ]),
  
      async setRedirectData () {
          const code = this.$route.query.code
          await this.requestAccessTokenToDjangoRedirection({ code })
          const googleAccessToken = localStorage.getItem("googleAccessToken")
          const userEmail = await this.requestUserEmailToDjango()
          const userInfo = await this.requestUserInfoToDjango()
          this.email = userEmail.email
          this.nickname =userInfo.name
          this.password = Math.random().toString(36).slice(-8)
          this.logintype = "GOOGLE"
          console.log(userEmail.email)
          console.log(userInfo.name)

      }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>