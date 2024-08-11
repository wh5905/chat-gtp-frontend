import actions, { NaverAuthenticationActions } from "./actions"
import mutations, { AuthenticationMutations } from "./mutations"
import state, { NaverAuthenticationState } from "./states"


export interface NaverAuthenticationModule {
    namespaced: true
    state: NaverAuthenticationState
    actions: NaverAuthenticationActions
    mutations: AuthenticationMutations
}

const NaverAuthenticationModule: NaverAuthenticationModule = {
    namespaced: true,
    state,
    actions,
    mutations,
}

export default NaverAuthenticationModule