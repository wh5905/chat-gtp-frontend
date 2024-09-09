import env from "@/env"
import axios, { AxiosInstance } from "axios"

const djangoAxiosInst: AxiosInstance = axios.create({
    baseURL: env.api.MAIN_API_URL,
    timeout: 10000,
})

const fastapiAxiosInst: AxiosInstance = axios.create({
    baseURL: env.api.AI_BASE_URL,
    timeout: 10000,
})

const aiAxiosInst : AxiosInstance = axios.create({
    baseURL:env.api.AI_SECOND_URL,
    timeout: 30000,
})

export default { djangoAxiosInst, fastapiAxiosInst,aiAxiosInst}