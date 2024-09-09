<template>
    <div></div>
  </template>
  
  <script>
  import router from '@/router';
  import { mapActions } from 'vuex'
  
  const NaverAuthenticationModule = 'NaverAuthenticationModule'
  const accountModule = "accountModule"

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
        'requestAddRedisAccessTokenToDjango',
    ]),
    ...mapActions(accountModule, [
            'requestEmailDuplicationCheckToDjango',
            'requestCreateNewAccountToDjango'
    ]),
      async setRedirectData () {
          const code = this.$route.query.code
          await this.requestAccessTokenToDjangoRedirection({ code })
          const NaverAccessToken = sessionStorage.getItem("naverAccessToken")
          const userInfo = await this.requestUserInfoToDjango()
          this.email = userInfo.response.email
          this.nickname = userInfo.response.nickname
          this.password = Math.random().toString(36).slice(-8)
          this.logintype = "NAVER"
          
          const isEmailDuplication = 
                await this.requestEmailDuplicationCheckToDjango({ "email": this.email })
            if (isEmailDuplication === true) {

                const naverAccessToken = sessionStorage.getItem("naverAccessToken");
                if (naverAccessToken) {
                    await this.requestAddRedisAccessTokenToDjango({ email:this.email, naverAccessToken });
                    
                } else {
                    console.error('AccessToken is missing');
                }
                sessionStorage.setItem('email',this.email)
                this.$router.push('/')
            }else {
                const accountInfo = {
                    email: this.email,
                    nickname: this.nickname,
                    password: this.password,
                    logintype: this.logintype
                }
                console.log('전송한 데이터:', accountInfo)
                const naverAccessToken = sessionStorage.getItem("naverAccessToken");
                sessionStorage.setItem('email',this.email)
                await this.requestCreateNewAccountToDjango(accountInfo)
                await this.requestAddRedisAccessTokenToDjango({ email:this.email, naverAccessToken });
                router.push('/')
            } 
        }
    },
    async created () {
        await this.setRedirectData()
    }
  }
  </script>