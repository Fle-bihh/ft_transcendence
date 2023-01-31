import { userActionType } from "../action-types";

type SetUserAction = {
    type: userActionType.SETUSER
    payload: {
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
        twoFactorVerify: boolean,
    } | null
}

export type userAction = SetUserAction

import { notifActionType } from "../action-types";
import { NotifType } from "../type";

type AddNotifAction = {
    type: notifActionType.ADDNOTIF
    payload: {
        type: NotifType,
        data: any
    }
}

type DelNotifAction = {
    type: notifActionType.DELNOTIF
    payload: number
}

type SeenAllNotifAction = {
    type: notifActionType.SEENALLNOTIF
}

export type notifAction = AddNotifAction | DelNotifAction | SeenAllNotifAction
