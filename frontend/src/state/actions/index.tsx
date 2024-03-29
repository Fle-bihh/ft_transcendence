import { userActionType } from "../action-types";

type SetUserAction = {
    type: userActionType.SETUSER
    payload: {
        id: string,
        username: string
        login: string,
        profileImage: string,
        email: string,
        WinNumber: number,
        LossNumber: number,
        Rank: number,
        twoFactorAuth: boolean,
        friend: number,
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

type RemoveNotifPong = {
    type: notifActionType.REMOVENOTIFPONG
}

type RemoveNotifInvite = {
    type: notifActionType.REMOVENOTIFINVITE
    payload: string
}


export type notifAction = AddNotifAction | DelNotifAction | SeenAllNotifAction | RemoveNotifPong | RemoveNotifInvite

import { twoFAActionType } from "../action-types";

type setTwoFA = {
    type: twoFAActionType.SETTWOFA
    twoFactorVerify: boolean,
}

export type twoFAAction = setTwoFA
