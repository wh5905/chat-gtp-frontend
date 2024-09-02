<template>
  <div class="background">
    <v-app-bar app dense class="navi">
      <v-spacer></v-spacer>
      <v-btn icon @click="goToHome">
        <v-icon>mdi-home</v-icon>
      </v-btn>
    </v-app-bar>

    <div class="stars"></div>
    <v-container class="overlay">
      <v-row class="justify-center">
        <v-col class="dark-background rounded-box" cols="12" md="6">
          <v-card-text>
            <v-form ref="form" v-model="formValid" lazy-validation>
              <v-text-field
                v-model="email"
                label="Email"
                required
                :rules="emailRules"
                class="input-field1"
                outlined
                :error-messages="emailErrorMessages"
                color="white"
              />
              <v-text-field
                v-model="password"
                label="Password"
                required
                outlined
                :type="showPassword ? 'text' : 'password'"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="togglePasswordVisibility"
                :rules="passwordRules"
                :error-messages="passwordErrorMessages"
                class="input-field2"
                color="white"
              />
              <v-row class="justify-center mt-4">
                <v-btn class="loginButton" color="black" @click="checkAccount">
                  로그인
                </v-btn>
                <v-btn class="register" outlined color=#212121 @click="accountRegister">
                  회원가입
                </v-btn>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider class="my-4" color="grey"></v-divider>
          <v-row class="justify-center content-center">
            <v-col cols="12">
              <div class="text-center sub-text-2">
                <p>소셜 로그인을 원하신다면</p>
                <p>아래 버튼을 클릭해주세요</p>
                <v-row class="justify-center align-center">
                  <v-col cols="auto" class="icon-col">
                    <v-img
                      height="40"
                      :src="require('@/assets/images/fixed/image.png')"
                      aspect-ratio="1"
                      @click="goToKakaoLogin"
                    />
                  </v-col>
                  <!-- <v-col cols="auto" class="icon-col">
                    <v-img
                      height="40"
                      :src="require('@/assets/images/fixed/google_circle.png')"
                      aspect-ratio="1"
                      @click="goToGoogleLogin"
                    />
                  </v-col> -->
                  <v-col cols="auto" class="icon-col">
                    <v-img
                      height="40"
                      :src="require('@/assets/images/fixed/naver_circle.png')"
                      aspect-ratio="1"
                      @click="goToNaverLogin"
                    />
                  </v-col>
                </v-row>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapActions, useStore, mapState } from 'vuex'
import router from '@/router'
const accountModule = 'accountModule'

export default {
  data() {
    return {
      email: "",
      password: "",
      isIdvalid: false,
      isPasswordvalid: false,
      showPassword: false,
      emailRules: [
        v => !!v || 'Email 은 필수입니다!',
        v => /.+@.+\..+/.test(v) || '유효한 Email 주소를 입력하세요!'
      ],
      emailErrorMessages: [],
      passwordErrorMessages: [],
    }
  },
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
  },
  computed: {
    ...mapState(accountModule, ['isLoggedIn'])
  },
  methods: {
    ...mapActions(accountModule, [
      'requestEmailDuplicationCheckToDjango',
      'requestAccountCheckToDjango'
    ]),
    goToHome() {
      router.push('/')
    },
    accountRegister() {
      router.push('/account/register')
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    async checkAccount() {
      try {
        const isAccontCheck = await this.requestAccountCheckToDjango({
          email: this.email,
          password: this.password
        })
        if (isAccontCheck) {
          this.isEmailValid = true
          this.isPasswordvalid = true
          this.$store.commit(`${accountModule}/REQUEST_IS_ACCOUNT_TO_DJANGO`, true);
          sessionStorage.setItem('generalLogin', true)
          sessionStorage.setItem('email', this.email)
          router.push('/')
        } else {
          this.isEmailValid = false
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
  background-size: cover;
  overflow: hidden;
  height: 100vh;
  background-color: #212121;
}
.navi{
  background-color: #212121;
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
  padding-top: 64px;
}

.stars {
  width: 200%;
  height: 200%;
  background: url('https://www.transparenttextures.com/patterns/stardust.png');
  position: absolute;
  top: -50%;
  left: -50%;
  z-index: 1;
  animation: twinkling 6s infinite;
}

.dark-background {
  background-color: #212121;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 600px;
}

.rounded-box {
  border-radius: 20px;
}

.content-center {
  justify-items: center;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.icon-col {
  display: block;
  margin-top: 20px;
  width: 60px;
  height: 60px;
  object-fit: contain;
  cursor: pointer;
}

.text-center {
  text-align: center;
  color: white;
}

.sub-text-2 {
  font-size: 20px;
  font-weight: bold;
  color: white;
  font-family: "Jua", sans-serif;
}

.input-field1 {
  width: 92%;
  margin-bottom: 15px;
  color: white;
}
.input-field2 {
  width: 100%;
  margin-bottom: 15px;
  color: white;
}

.loginButton {
  margin-right: 10px;
  padding: 8px 20px;
  font-size: 16px;
  font-weight: bold;
  background-color: black;
  color: white;
}

.register {
  margin-left: 10px;
  padding: 8px 20px;
  font-size: 16px;
  font-weight: bold;
  color: white;
}
</style>
