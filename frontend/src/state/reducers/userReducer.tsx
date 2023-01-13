import { userActionType } from "../action-types";
import { userAction } from "../actions";

export interface User {
    user: {
        login: string
    } | null;
}

export const initialState: User = {
    user: null
}

export const userReducer = (state: User = initialState, action: userAction) => {
    switch (action.type) {
        case userActionType.SETUSER: {
            return {
                ...state,
                user: action.payload
            };
        }
        default:
            return state;
    }
}