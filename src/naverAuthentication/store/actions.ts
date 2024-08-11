import { ActionContext } from "vuex"
import { NaverAuthenticationState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import {REQUEST_IS_NAVER_AUTHENTICATED_TO_DJANGO} from "./mutation-types"
export type NaverAuthenticationActions = {
    requestNaverOauthRedirectionToDjango(): Promise<void>
    requestAccessTokenToDjangoRedirection(
        context: ActionContext<NaverAuthenticationState, any>, 
        payload: { code: string }): Promise<void>
}

const actions: NaverAuthenticationActions = {
    async requestNaverOauthRedirectionToDjango(): Promise<void> {
        return axiosInst.djangoAxiosInst.get('/naver_oauth/naver').then((res) => {
            window.location.href = res.data.url
        })
    },
    async requestAccessTokenToDjangoRedirection(
        context: ActionContext<NaverAuthenticationState, any>, 
        payload: { code: string }): Promise<void> {

        try {
            console.log('requestAccessTokenToDjangoRedirection()')
            const { code } = payload

            const response = await axiosInst.djangoAxiosInst.post(
                '/naver_oauth/naver/access-token', { code })
            localStorage.setItem("naverAccessToken", response.data.accessToken.access_token)
            } catch (error) {
                console.log('Access Token 요청 중 문제 발생:', error)
                throw error
                }
            },
};

export default actions;