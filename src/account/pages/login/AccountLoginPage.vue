<template>
    <div class="background">
      <v-app-bar app dense>
        <v-toolbar-title>로그인</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="goToHome">
          <v-icon>mdi-home</v-icon>
        </v-btn>
      </v-app-bar>
      
      <div class="stars"></div>
      <v-container class="overlay">
        <v-row class="justify-center">
          <v-col class="white-background rounded-box" cols="12" md="6">
            <v-card-text>
              <v-form ref="form" v-model="formValid" lazy-validation>
                <v-text-field
                  v-model="email"
                  label="Email"
                  required
                  :rules="emailRules"
                  class="input-field"
                  outlined
                  :error-messages="emailErrorMessages"
                />
                <v-text-field
                  v-model="password"
                  label="Password"
                  required
                  outlined
                  :rules="passwordRules"
                  :error-messages="passwordErrorMessages"
                  class="input-field"
                />
                <v-row align="center" justify="center">
                  <v-btn class="loginButton" color="primary" @click="checkAccount">
                    로그인
                  </v-btn>
                  <v-btn class="register" color="secondary" @click="accountRegister">
                    회원가입
                  </v-btn>
                </v-row>
              </v-form>
            </v-card-text>
            <v-row class="content-center">
              <v-col cols="12">
                <div class="text-center sub-text-2">
                  <p>소셜 로그인을 원하신다면</p>
                  <p>아래 버튼을 클릭해주세요</p>
                  <v-img
                    class="mx-auto icons"
                    height="40"
                    style="margin-top: 30px;"
                    :src="require('@/assets/images/fixed/kakao_login_large_narrow.png')"
                    aspect-ratio="1"
                    @click="goToKakaoLogin"
                  />
                  <v-img
                    class="mx-auto icons"
                    height="40"
                    style="margin-top: 30px;"
                    :src="require('@/assets/images/fixed/google_login.png')"
                    aspect-ratio="1"
                    @click="goToGoogleLogin"
                  />
                  <v-img
                    class="mx-auto icons"
                    height="40"
                    style="margin-top: 30px;"
                    :src="require('@/assets/images/fixed/btnG_official.png')"
                    aspect-ratio="1"
                    @click="goToNaverLogin"
                  />
                </div>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-container>
    </div>
  </template>
  
  <script>
  import { mapActions,useStore,mapState } from 'vuex'
  import router from '@/router'
  const accountModule = 'accountModule'
  
  export default {
    data (){
      return{
        email:"",
        password:"",
        isIdvalid:false,
        isPasswordvalid:false,
        emailRules: [
                v => !!v || 'Email 은 필수입니다!',
                v => /.+@.+\..+/.test(v) || '유효한 Email 주소를 입력하세요!'
            ],
        emailErrorMessages: [],
        passwordErrorMessages: [],
    }},
    setup() {
      const store = useStore()
  
      const goToKakaoLogin = async () => {
        await store.dispatch('authenticationModule/requestKakaoOauthRedirectionToDjango')
      }
      const goToGoogleLogin = async () => {
        await store.dispatch('GoogleAuthenticationModule/requestGoogleOauthRedirectionToDjango')
      }
      const goToNaverLogin = async () => {
        await store.dispatch('NaverAuthenticationModule/requestNaverOauthRedirectionToDjango')
      }
  
      return {
        goToKakaoLogin,
        goToGoogleLogin,
        goToNaverLogin,
      }
    },computed: {
      ...mapState(accountModule, ['isLoggedIn'])
    },
    methods: {
      ...mapActions(accountModule, [
            'requestEmailDuplicationCheckToDjango',
            'requestPasswordDuplicationCheckToDjango'
        ]),
      goToHome() {
        router.push('/')
      },
      accountRegister() {
        router.push('/account/register')
      },
      async checkAccount() {
        try {
                const isEmailDuplicate = await this.requestEmailDuplicationCheckToDjango({
                    email: this.email.trim()
                })
                const isPasswordDuplicate = await this.requestPasswordDuplicationCheckToDjango({
                    password: this.password.trim()
                })
                if (isEmailDuplicate & isPasswordDuplicate) {
                    this.isEmailValid = true
                    this.isPasswordvalid = true
                    this.$store.commit(`${accountModule}/REQUEST_IS_ACCOUNT_TO_DJANGO`, true);
                    console.log(this.isLoggedIn)
                    router.push('/')
                } else {
                    this.isEmailValid  = false
                    this.isPasswordvalid = false
                    alert("이메일 혹은 비밀번호가 일치하지 않습니다. \n확인 후 다시 적어주시기 바랍니다.")
                }
            } catch (error) {
                this.isEmailValid = false
                this.isPasswordvalid = false
            }
        
      }
      
    }
  }
  </script>
  
  <style scoped>
  .background {
    position: relative;
    background: url('@/assets/images/fixed/potato.jpg') no-repeat center center fixed;
    background-size: cover;
    overflow: hidden;
    height: 100vh;
  }
  
  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 64px; /* Toolbar 높이만큼의 padding 추가 */
  }
  
  .stars {
    width: 200%;
    height: 200%;
    background: url('https://www.transparenttextures.com/patterns/stardust.png');
    position: absolute;
    top: -50%;
    left: -50%;
    z-index: 1;
    animation: twinkling 60s infinite;
  }
  
  .white-background {
    background-color: white;
    padding: 20px;
    border-radius: 15px;
    box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    height: auto;
  }
  
  .rounded-box {
    border-radius: 15px;
  }
  
  .content-center {
    justify-items: center;
    margin-top: 20px;
    margin-bottom: 0px;
    width: 100%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .icons {
    cursor: pointer;
  }
  
  .text-center {
    text-align: center;
  }
  
  .sub-text-2 {
    font-size: 22px;
    font-weight: bold;
    color: black;
    font-family: "Jua", sans-serif;
  }
  
  .input-field {
    width: 100%;
    margin-bottom: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  
  .loginButton {
    margin-right: 10px;
  }
  
  .register {
    margin-left: 10px;
  }
  </style>
  