import actions, { UserInputActions } from "./actions"
import mutations, { UserInputMutations } from "./mutations"
import state, { UserInputState } from "./states"


export interface UserModule {
    namespaced: true
    state: UserInputState
    actions: UserInputActions,
    mutations: UserInputMutations
}

const userModule: UserModule = {
    namespaced: true,
    state,
    actions,
    mutations
}

export default userModule