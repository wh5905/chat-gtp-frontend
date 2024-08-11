import { ActionContext } from "vuex"
import { NaverAuthenticationState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import {REQUEST_IS_NAVER_AUTHENTICATED_TO_DJANGO} from "./mutation-types"
export type NaverAuthenticationActions = {
    requestNaverOauthRedirectionToDjango(): Promise<void>
}

const actions: NaverAuthenticationActions = {
    async requestNaverOauthRedirectionToDjango(): Promise<void> {
        return axiosInst.djangoAxiosInst.get('/naver_oauth/naver').then((res) => {
            window.location.href = res.data.url
        })
    },
};

export default actions;