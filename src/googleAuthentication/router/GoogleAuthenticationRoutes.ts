import googleRedirection from "@/googleAuthentication/google/GoogleRedirection.vue"

const GoogleAuthenticationRoutes = [
    {
        path: '/google_oauth/access-token',
        name: 'GoogleRedirection',
        component: googleRedirection
    },
]

export default GoogleAuthenticationRoutes