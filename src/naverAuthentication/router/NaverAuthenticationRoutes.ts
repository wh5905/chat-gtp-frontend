import naverRedirection from "@/naverAuthentication/naver/NaverRedirection.vue"

const NaverAuthenticationRoutes = [
    {
        path: '/naver_oauth/access-token',
        name: 'NaverRedirection',
        component: naverRedirection
    },
]

export default NaverAuthenticationRoutes