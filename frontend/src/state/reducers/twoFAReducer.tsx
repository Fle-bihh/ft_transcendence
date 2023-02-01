import { io } from "socket.io-client"
import { twoFAActionType } from "../action-types";
import { twoFAAction } from "../actions";

interface TwoFAData {
    twoFactorVerify: boolean,
}

export const initialState: TwoFAData = {
    twoFactorVerify: false
};

export const twoFAReducer = (state: TwoFAData = initialState, action: twoFAAction) => {
    switch (action.type) {
        case twoFAActionType.SETTWOFA: {
            return {
                ...state,
                twoFactorVerify: action.twoFactorVerify
            };
        }
        default:
            return state;
    }
}