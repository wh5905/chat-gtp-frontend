<template>
    <v-app-bar app dense>
        <v-toolbar-title>회원가입</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click="goToHome">
          <v-icon>mdi-home</v-icon>
        </v-btn>
    </v-app-bar>

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
                                <v-col cols="1">
                                    <v-btn color="primary"
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
                                <v-col cols="1">
                                    <v-btn color="primary"
                                            @click="checkNicknameDuplication"
                                            class="check-button"
                                            small>
                                        아이디 중복 검사
                                    </v-btn>
                                </v-col>
                            </v-row>
                            <v-text-field
                                    v-model="password"
                                    label="Password"
                                    required
                                    :rules="passwordRules"/>
                        </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" 
                                @click="submitForm" 
                                :disabled="!isValidForSubmission">
                            신청하기
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        </v-container>
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
            console.log('아이디 중복 검사')

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
                alert('회원가입이 되었습니다.\n 로그인을 진행해주세요')
                router.push('/account/register')
            }
        },
    },
}
</script>

<style scoped>
.check {
  transform: scale(1.1); /* 체크박스 크기 증가 */
  margin-right: 20px; /* 체크박스 사이 간격 */
}
.mt-3 {
  margin-top: 20px; /* 필요한 만큼 간격 조정 */
}
check-button{
    justify-items:right;

}
</style>
