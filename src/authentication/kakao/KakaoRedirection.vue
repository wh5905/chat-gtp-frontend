<template>
    <div></div>
</template>

<script>
import router from '@/router';
import { mapActions, mapState } from 'vuex'

const authenticationModule = 'authenticationModule'
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
        ...mapActions(authenticationModule, [
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
            const userInfo = await this.requestUserInfoToDjango()
            this.email = userInfo.kakao_account.email
            this.nickname = userInfo.properties.nickname
            this.password = Math.random().toString(36).slice(-8)
            this.logintype = "KAKAO"
            
            const isEmailDuplication = 
                await this.requestEmailDuplicationCheckToDjango({ "email": this.email })
            if (isEmailDuplication === true) {

                const accessToken = sessionStorage.getItem("accessToken");
                if (accessToken) {
                    await this.requestAddRedisAccessTokenToDjango({ email:this.email, accessToken });
                    
                } else {
                    console.error('AccessToken is missing');
                }
                sessionStorage.setItem('email',this.email)
                this.$router.push('/')
            } else {
                const accountInfo = {
                    email: this.email,
                    nickname: this.nickname,
                    password: this.password,
                    logintype: this.logintype
                }
                console.log('전송한 데이터:', accountInfo)
                const accessToken = sessionStorage.getItem("accessToken");
                await this.requestCreateNewAccountToDjango(accountInfo)
                await this.requestAddRedisAccessTokenToDjango({ email:this.email, accessToken });
                sessionStorage.setItem('email',this.email)
                router.push('/')
            } 
        }
    },
    async created () {
        await this.setRedirectData()
    }
}
</script>