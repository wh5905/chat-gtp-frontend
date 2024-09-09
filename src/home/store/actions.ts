import { ActionContext } from "vuex"
import { AxiosResponse } from "axios"
import axiosInst from "@/utility/axiosInstance"
import { UserInputState } from "./states"

export type UserInputActions = {
    requestQuestionOpenAiToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string>
    requestQuestionToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string>
    requestAnswerOpenAiToFastAPI(
        context: ActionContext<UserInputState, any>): Promise<string>
    requestQuestionLlamaToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { symbol: string }): Promise<string>
    requestNewsDataToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { symbol: string }): Promise<any> 
    // requestAnswerLlamaToFastAPI(
    //     context: ActionContext<UserInputState, any>): Promise<string>
}

const actions: UserInputActions = {
    async requestQuestionOpenAiToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string> {

        try {
            console.log('requestQuestionOpenAiToFastAPI()')
            const { data } = payload
            console.log("data:", data)
            const command = 7

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command,"data": [data] })
            return response.data
        } catch (error) {
            console.log('requestQuestionOpenAiToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    async requestAnswerOpenAiToFastAPI(context: ActionContext<UserInputState, any>): Promise<string> {
        try {
            console.log('requestAnswerOpenAiToFastAPI()')
            const response = await axiosInst.fastapiAxiosInst.get('/openai-answer')
            console.log('response.data', response.data)
            return response.data
        } catch (error) {
            console.log('requestAnswerOpenAiToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    async requestQuestionToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { data: string }): Promise<string> {

        try {
            console.log('requestQuestionOpenAiToFastAPI()')
            const { data } = payload
            console.log("data:", data)
            const command = 8

            const response = await axiosInst.fastapiAxiosInst.post(
                '/request-ai-command', { command,"data": [data] })
            return response.data
        } catch (error) {
            console.log('requestQuestionOpenAiToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    async requestQuestionLlamaToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { symbol: string }): Promise<any> {

        try {
            console.log('requestQuestionLlamaToFastAPI()')
            const { symbol } = payload
            console.log("symbol:", symbol)

            const response = await fetch("https://onebottlekick.loca.lt/predict-stock-price", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "bypass-tunnel-reminder": "true"
                },
                body: JSON.stringify({ symbol: symbol }),
            }); 
            return response;            
        } catch (error) {
            console.log('requestQuestionLlamaToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    async requestNewsDataToFastAPI(
        context: ActionContext<UserInputState, any>,
        payload: { symbol: string }): Promise<any> {

        try {
            console.log('requestNewsDataToFastAPI()')
            const { symbol } = payload
            console.log("symbol:", symbol)

            const response = await fetch("https://onebottlekick.loca.lt/news", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "bypass-tunnel-reminder": "true"
                },
                body: JSON.stringify({ symbol: symbol }),
            }); 
            return response.json();            
        } catch (error) {
            console.log('requestNewsDataToFastAPI() 중 문제 발생:', error)
            throw error
        }
    },
    // async requestAnswerLlamaToFastAPI(context: ActionContext<UserInputState, any>): Promise<string> {
    //     try {
    //         console.log('requestAnswerLlamaToFastAPI()')
    //         const response = await axiosInst.fastapiAxiosInst.post('/llama-result')
    //         console.log('response.data', response.data)
    //         return response.data
    //     } catch (error) {
    //         console.log('requestAnswerLlamaToFastAPI() 중 문제 발생:', error)
    //         throw error
    //     }
    // },
}

export default actions;
