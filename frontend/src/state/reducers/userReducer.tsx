import { userActionType } from "../action-types";
import { userAction } from "../actions";

export interface User {
    user: {
        id: string,
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        nickName: string,
        profileImage: string,
        email: string,
        isLogged: boolean,
        isAdmin: boolean,
        GoalTaken: number,
        GoalSet: number,
        NormalGameNumber: number,
        RankedGameNumber: number,
        NormalWinNumber: number,
        RankedWinNumber: number,
        PP: number,
        twoFactorAuth: boolean,
        Security: boolean,
        Friend: number,
        Climber: boolean,
        Hater: number,
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