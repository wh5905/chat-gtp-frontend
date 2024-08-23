import { ActionContext, Commit } from "vuex"
import { AccountState } from "./states"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"

export type AccountActions = {
    requestEmailDuplicationCheckToDjango(
        context: ActionContext<AccountState, any>,
        payload: any
    ): Promise<boolean>
    requestNicknameDuplicationCheckToDjango(
        context: ActionContext<AccountState, any>,
        nickname: string
    ): Promise<boolean>
    requestCreateNewAccountToDjango(
        context: ActionContext<any, any>,
        accountInfo: { email: string, id:string, password:string,logintype:string}
    ): Promise<void>
    requestAccountCheckToDjango(
        context: ActionContext<AccountState, any>,
        payload: any
    ): Promise<boolean>
    requestNicknameToDjango(
        context: ActionContext<AccountState,any>,
        email: string
    ): Promise<void>
    requestNicknameModifyToDjango(
        context: ActionContext<AccountState, any>,
        payload: { email: string; newNickname: string }
    ): Promise<void>;
    requestPasswordModifyToDjango(
        context: ActionContext<AccountState, any>,
        payload: { email: string; newPassword: string }
    ): Promise<void>
}

const actions: AccountActions = {
    async requestEmailDuplicationCheckToDjango(
        context: ActionContext<AccountState, any>,
        payload: any
    ): Promise<boolean> {

        const { email } = payload

        return axiosInst.djangoAxiosInst.post(
                    '/account/email-duplication-check', 
                    { email: email }
        )
        .then((res) => {
            if (res.data.isDuplicate) {
                return true
            } else {
                return false
            }
        })
    },
    async requestNicknameDuplicationCheckToDjango(
        context: ActionContext<AccountState, any>,
        payload: any
    ): Promise<boolean> {

        const { newNickname } = payload

        return axiosInst.djangoAxiosInst.post(
                    '/account/nickname-duplication-check', 
                    { newNickname: newNickname }
        )
        .then((res) => {
            if (res.data.isDuplicate) {
                return true
            } else {
                return false
            }
        })
    },
    async requestAccountCheckToDjango(
        context: ActionContext<AccountState, any>,
        payload: any
    ): Promise<boolean> {

        const { email,password } = payload

        return axiosInst.djangoAxiosInst.post(
                    '/account/account-check', 
                    { email:email,password: password }
        )
        .then((res) => {
            if (res.data.isDuplicate) {
                return true
            } else {
                return false
            }
        })
    },
    async requestCreateNewAccountToDjango(
        context: ActionContext<any, any>,
        accountInfo: { id:string,email: string,password:string,logintype:string}
    ): Promise<void> {
        try {
            await axiosInst.djangoAxiosInst.post('/account/register', accountInfo)
        } catch (error) {
            console.error('신규 계정 생성 실패:', error)
            throw error
        }
    },
    async requestNicknameToDjango(
        context: ActionContext<AccountState,any>,
        email: string
    ): Promise<void>{
        try{
            return await axiosInst.djangoAxiosInst.post('/account/find-nickname',email)
    } catch (error){
        console.error('닉네임 확인 실패:',error)
        throw error
        }
    },
    async requestPasswordModifyToDjango(
        context: ActionContext<AccountState, any>,
        payload: { email: string; newPassword: string }
    ): Promise<void> {
        try {
            await axiosInst.djangoAxiosInst.post('/account/modify-password', { email: payload.email, newPassword: payload.newPassword });
        } catch (error) {
            console.error('비밀번호 변경 실패:', error);
            throw error;
        }
    },
    async requestNicknameModifyToDjango(
        context: ActionContext<AccountState, any>,
        payload: { email: string; newNickname: string }
    ): Promise<void> {
        try {
            await axiosInst.djangoAxiosInst.post('/account/modify-nickname', { email: payload.email, newNickname: payload.newNickname });
        } catch (error) {
            console.error('닉네임 변경 실패:', error);
            throw error;
        }
    }
};

export default actions;