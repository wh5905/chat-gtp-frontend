import AccountLoginPage from "@/account/pages/login/AccountLoginPage.vue"
import AccountRegisterPage from "@/account/pages/register/AccountGenralRegisterPage.vue"

import AccountMypage from "@/account/pages/my/AccountMypage.vue"
const AccountRoutes = [
    {
        path: '/account/login',
        name: 'AccountLoginPage',
        component: AccountLoginPage
    },
    {
        path: '/account/register',
        name: 'AccountGeneralRegisterPage',
        component: AccountRegisterPage
    },
    {
        path: '/account/my',
        name: 'AccountMyPage',
        component: AccountMypage
    },

]

export default AccountRoutes