interface Env {
    mode: string | undefined
    api: {
        MAIN_API_URL: string | undefined
        AI_BASE_URL: string | undefined
        AI_SECOND_URL:string | undefined
    }
}

const env: Env = {
    mode: process.env.MODE_ENV,
    api: {
        MAIN_API_URL: process.env.VUE_APP_BASE_URL,
        AI_BASE_URL: process.env.VUE_APP_AI_BASE_URL,
        AI_SECOND_URL:process.env.VUE_APP_AI_SECOND_URL,
    },
}

export default env