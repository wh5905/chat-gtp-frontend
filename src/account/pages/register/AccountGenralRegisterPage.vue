<template>
    <v-app-bar app dense>
        <v-toolbar-title>회원가입</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="goToHome">
          <v-icon>mdi-home</v-icon>
        </v-btn>
    </v-app-bar>
    <div class="main">
    <v-container class="register-container" fill-height>
        <v-row align="center" justify="center">
            <v-col cols="12" md="8" lg="6">
                <v-card>
                    <v-card-title>
                        <span class="headline">신규 회원 신청</span>
                    </v-card-title>
                    <v-card-text>
                        <v-form ref="form" v-model="formValid" lazy-validation>
                            <v-row align="center">
                                <v-col cols="10">
                                    <v-text-field
                                            v-model="email"
                                            label="Email"
                                            required
                                            :rules="emailRules"
                                            :error-messages="emailErrorMessages"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn color="#212121"
                                            @click="checkEmailDuplication"
                                            class="check-button"
                                            small>
                                        이메일 중복 검사
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-row align="center">
                                <v-col cols="10">
                                    <v-text-field
                                            v-model="nickname"
                                            label="Nickname"
                                            required
                                            :rules="NicknameRules"
                                            :error-messages="nicknameErrorMessages"/>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn color="#212121"
                                            @click="checkNicknameDuplication"
                                            class="check-button"
                                            small>
                                        닉네임 중복 검사
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-text-field
                                    v-model="password"
                                    label="Password"
                                    required
                                    :type="showPassword ? 'text' : 'password'"
                                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                    @click:append="togglePasswordVisibility"
                                    :rules="passwordRules"/>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="#212121" 
                                @click="submitForm" 
                                :disabled="!isValidForSubmission">
                            신청하기
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        </v-container>
    </div>
</template>

<script>
import router from '@/router';
import { mapActions } from 'vuex'

const authenticationModule = 'authenticationModule'
const accountModule = 'accountModule'

export default {
    data () {
        return {
            formValid: false,
            email: '',
            nickname: '',
            password: "",
            showPassword: false,
            emailRules: [
                v => !!v || 'Email 은 필수입니다!',
                v => /.+@.+\..+/.test(v) || '유효한 Email 주소를 입력하세요!'
            ],
            NicknameRules: [
                v => !!v || 'nickname 은 필수입니다!',
            ],
            emailErrorMessages: [],
            isEmailValid: false,
            isNicknameValid: false,
            nicknameErrorMessages: [],
            passwordRules: [
                v => !!v || '비밀번호는 필수입니다.', // 비밀번호 필수 확인
                v => v.length >= 8 || '비밀번호는 최소 8자 이상이어야 합니다.', // 최소 8자 확인
                v => /[a-z]/.test(v) || '비밀번호에는 소문자가 포함되어야 합니다.', // 소문자 확인
                v => /[A-Z]/.test(v) || '비밀번호에는 대문자가 포함되어야 합니다.', // 대문자 확인
                v => /[!@#$%^&*(),.?":{}|<>]/.test(v) || '비밀번호에는 특수 문자가 포함되어야 합니다.', // 특수 문자 확인
            ],
            logintype:"general"
        }
    },
    computed: {
        isValidForSubmission () {
            return this.formValid && this.isEmailValid && this.isNicknameValid 
        }
    },
    methods: {
        ...mapActions(accountModule, [
            'requestEmailDuplicationCheckToDjango',
            'requestNicknameDuplicationCheckToDjango',
            'requestCreateNewAccountToDjango',
        ]),
        goToHome() {
        router.push('/')
        },
        async checkEmailDuplication () {
            console.log('이메일 중복 검사')

            try {
                const isDuplicate = await this.requestEmailDuplicationCheckToDjango({
                    email: this.email.trim()
                })
                console.log(isDuplicate)
                if (isDuplicate) {
                    this.emailErrorMessages = ['이 email은 이미 사용중입니다!']
                    this.isEmailValid = false
                } else {
                    this.emailErrorMessages = []
                    this.isEmailValid  = true
                }
            } catch (error) {
                alert('이메일 중복 확인에 실패했습니다!')
                this.isEmailValid = false
            }
        },
        async checkNicknameDuplication () {
            console.log('닉네임 중복 검사')

            try {
                const isDuplicate = await this.requestNicknameDuplicationCheckToDjango({
                    newNickname: this.nickname.trim()
                })
                console.log(isDuplicate)
                if (isDuplicate) {
                    this.nicknameErrorMessages = ['이 nickname은 이미 사용중입니다!']
                    this.isNicknameValid = false
                } else {
                    this.nicknameErrorMessages = []
                    this.isNicknameValid  = true
                }
            } catch (error) {
                alert('아이디 중복 확인에 실패했습니다!')
                this.isNicknameValid = false
            }
        },
        togglePasswordVisibility() {
            this.showPassword = !this.showPassword;
        },
        async submitForm () {
            console.log('신청하기 누름')
            console.log(this.email,this.nickname,this.password)
            this.logintype = "GENERAL"
            if (this.$refs.form.validate()) {
                const accountInfo = {
                    email: this.email,
                    nickname: this.nickname,
                    password: this.password,
                    logintype: this.logintype
                }

                await this.requestCreateNewAccountToDjango(accountInfo)
                console.log('전송한 데이터:', accountInfo)
                router.push('/account/login')
                alert('회원가입이 되었습니다.\n 로그인을 진행해주세요')
            }
        },
    },
}
</script>

<style scoped>
/* Global Styles */
body {
  font-family: 'Roboto', sans-serif;
  background-color: #f4f4f4;
  margin: 0;
  padding: 0;
}

/* Main Layout */
.main {
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.v-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* AppBar */
.v-app-bar {
  background-color: #212121;
  color: white;
}

.v-toolbar-title {
  font-weight: bold;
  font-size: 1.5rem;
}

.v-btn {
  color: white;
}

/* Forms */
.v-form {
  margin-top: 10px;
}

.v-text-field label {
  font-size: 0.9rem;
  color: #1976d2;
}

.v-text-field input {
  font-size: 1rem;
  color: #424242;
}

.v-text-field {
  margin-bottom: 15px;
}

.v-btn.small {
  font-size: 0.75rem;
  padding: 5px 10px;
  background-color: #212121;
  color: white;
}

.v-btn.small:hover {
  background-color: #212121;
}

/* Headline and Actions */
.headline {
  font-weight: bold;
  font-size: 1.25rem;
  color: #424242;
}

.v-card-actions {
  padding-top: 0;
}

.v-btn.primary {
  background-color: #212121;
  color: white;
}

.v-btn.primary:disabled {
  background-color: #b0bec5;
}

/* Email & Nickname Duplication Button */
.check-button {
  width: 100%;
  background-color: #ff8f00;
  color: white;
}

.check-button:hover {
  background-color: #ff6f00;
}

/* Message Section (for future implementation) */
.chat-container {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.chat-box {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  height: 70vh;
  overflow-y: auto;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.message {
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  max-width: 75%;
  word-wrap: break-word;
}

.user-message {
  background-color: #1976d2;
  color: white;
  margin-left: auto;
  text-align: right;
}

.bot-message {
  background-color: #e0e0e0;
  color: #424242;
  margin-right: auto;
  text-align: left;
}

.chat-input-card {
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.input-container {
  display: flex;
  align-items: center;
}

.message-input {
  flex: 1;
  background-color: #fff;
  color: #424242;
  border-radius: 8px;
}

.fastSearch {
  background-color: #1976d2;
  color: white;
}

/* Hover and Transition Effects */
.v-btn:hover {
  background-color: #1565c0;
}

.clickable-item:hover {
  background-color: #f1f1f1;
}

/* Favorite Stock Section */
.favorite-stock {
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.favorite-stock h3 {
  font-size: 1rem;
  color: #424242;
  margin-bottom: 5px;
}

.favorite-stock p {
  margin: 0;
  font-size: 0.875rem;
}

.up {
  color: #d32f2f;
}

.down {
  color: #1976d2;
}

/* Colors */
.yellow-text {
  color: #fdd835;
}

.white-text {
  color: white;
}

/* Drawer */
.v-navigation-drawer {
  background-color: #424242;
  color: white;
}

.v-navigation-drawer a {
  color: white;
}

.clickable-item {
  cursor: pointer;
  transition: background-color 0.3s ease;
}
</style>

