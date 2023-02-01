import { userActionType } from "../action-types";
import { userAction } from "../actions";

export interface User {
    user: {
        id: string,
        username: string
        login: string,
        profileImage: string,
        email: string,
        nWinNumber: number,
        LossNumber: number,
        Rank: number,
        twoFactorAuth: boolean,
        friend: number,
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
