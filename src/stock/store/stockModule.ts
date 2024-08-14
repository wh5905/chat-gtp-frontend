// stockModule.ts
import actions, { StockActions } from "./actions";
import mutations, { StockMutations } from "./mutations";
import state, { StockState } from "./states";

export interface StockModule {
    namespaced: true;
    state: StockState;
    actions: StockActions;
    mutations: StockMutations;
}

const stockModule: StockModule = {
    namespaced: true,
    state,
    actions,
    mutations,
};

export default stockModule;