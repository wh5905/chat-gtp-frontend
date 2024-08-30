import { ActionContext } from "vuex"
import { GoogleAuthenticationState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import {REQUEST_IS_GOOGLE_AUTHENTICATED_TO_DJANGO} from "./mutation-types"
export type GoogleAuthenticationActions = {
    requestGoogleOauthRedirectionToDjango(): Promise<void>
    requestAccessTokenToDjangoRedirection(
        context: ActionContext<GoogleAuthenticationState, any>, 
        payload: { code: string }): Promise<void>
    requestUserEmailToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any>
    requestUserInfoToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any>
    requestAddRedisAccessTokenToDjango(
            { commit, state }: ActionContext<GoogleAuthenticationState, any>,
            { email, accessToken }: { email: string, accessToken: string }
        ): Promise<any>
    requestLogoutToDjango(
            context: ActionContext<GoogleAuthenticationState, any>,
            userToken: string
        ): Promise<void>
}

const actions: GoogleAuthenticationActions = {
    async requestGoogleOauthRedirectionToDjango(): Promise<void> {
        return axiosInst.djangoAxiosInst.get('/google_oauth/google').then((res) => {
            window.location.href = res.data.url
        })
    },
    async requestAccessTokenToDjangoRedirection(
        context: ActionContext<GoogleAuthenticationState, any>, 
        payload: { code: string }): Promise<void> {

        try {
            console.log('requestAccessTokenToDjangoRedirection()')
            const { code } = payload

            const response = await axiosInst.djangoAxiosInst.post(
                '/google_oauth/google/access-token', { code })
            sessionStorage.setItem("googleAccessToken", response.data.accessToken.access_token)
            } catch (error) {
                console.log('Access Token 요청 중 문제 발생:', error)
                throw error
                }
            },
    async requestUserEmailToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any> {
    
        try {
            const googleAccessToken = sessionStorage.getItem("googleAccessToken");
            const userInfoResponse: AxiosResponse<any> = 
                await axiosInst.djangoAxiosInst.post(
                    '/google_oauth/google/user_info_email', 
                    { access_token: googleAccessToken });

            const userEmail = userInfoResponse.data.user_info_email
            return userEmail

        } catch (error) {
            alert('사용자 이메일 가져오기 실패!')
            throw error;
        }
    },
    async requestUserInfoToDjango(
        context: ActionContext<GoogleAuthenticationState, any>): Promise<any> {
    
        try {
            const googleAccessToken = sessionStorage.getItem("googleAccessToken");
            const userInfoResponse: AxiosResponse<any> = 
                await axiosInst.djangoAxiosInst.post(
                    '/google_oauth/google/user_info', 
                    { access_token: googleAccessToken });

            const userInfo = userInfoResponse.data.user_info
            return userInfo

        } catch (error) {
            alert('사용자 정보 가져오기 실패!')
            throw error;
        }
    },
    async requestAddRedisAccessTokenToDjango(
        { commit, state }: ActionContext<GoogleAuthenticationState, any>,
        { email, accessToken }: { email: string, accessToken: string }
    ): Promise<any> {
        try {
            const response: AxiosResponse<any> = await axiosInst.djangoAxiosInst.post(
                '/google_oauth/redis-access-token/', {
                    email: email,
                    accessToken: accessToken
                });

            console.log('userToken:', response.data.userToken)

            sessionStorage.removeItem("googleAccessToken")
            sessionStorage.setItem("googleUserToken", response.data.userToken)
            commit(REQUEST_IS_GOOGLE_AUTHENTICATED_TO_DJANGO, true);
            return response.data;
        } catch (error) {
            console.error('Error adding redis access token:', error);
            throw error;
        }
    },
    async requestLogoutToDjango(
        context: ActionContext<GoogleAuthenticationState, any>,
        userToken: string
    ): Promise<void> {
        try {
            const googleUserToken = sessionStorage.getItem("googleUserToken")

            const res = 
                await axiosInst.djangoAxiosInst.post('/google_oauth/logout', {
                    userToken: googleUserToken
                })

            console.log('res:', res.data.isSuccess)
            if (res.data.isSuccess === true) {
                context.commit(REQUEST_IS_GOOGLE_AUTHENTICATED_TO_DJANGO, false)
            }
        } catch (error) {
            console.error('requestPostToFastapi() 중 에러 발생:', error)
            throw error
        }
        sessionStorage.removeItem("googleUserToken")
    }
};

export default actions;