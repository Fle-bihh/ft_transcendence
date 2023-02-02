import { userActionType } from "../action-types";
import { userAction } from "../actions";

interface UserType {
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


const initialState: UserType = {
    user: null
}

export const userReducer = (state: UserType = initialState, action: userAction) => {
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
