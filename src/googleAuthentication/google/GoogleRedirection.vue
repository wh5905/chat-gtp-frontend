<template>
    <div></div>
  </template>
  
  <script>
  import router from '@/router';
  import { mapActions } from 'vuex'
  
  const googleAuthenticationModule = 'GoogleAuthenticationModule'
  const accountModule = 'accountModule'

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
        'requestAddRedisAccessTokenToDjango',
    ]),
        ...mapActions(accountModule, [
            'requestEmailDuplicationCheckToDjango',
            'requestCreateNewAccountToDjango'
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
          
          const isEmailDuplication = 
                await this.requestEmailDuplicationCheckToDjango({ "email": this.email })
            if (isEmailDuplication === true) {

                const googleAccessToken = localStorage.getItem("googleAccessToken");
                if (googleAccessToken) {
                    await this.requestAddRedisAccessTokenToDjango({ email:this.email, googleAccessToken });
                    
                } else {
                    console.error('AccessToken is missing');
                }
                this.$router.push('/')
            }else {
                const accountInfo = {
                    email: this.email,
                    nickname: this.nickname,
                    password: this.password,
                    logintype: this.logintype
                }
                console.log('전송한 데이터:', accountInfo)
                await this.requestCreateNewAccountToDjango(accountInfo)

                router.push('/')
            } 
        }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>