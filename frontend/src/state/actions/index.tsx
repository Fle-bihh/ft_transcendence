import { userActionType } from "../action-types";

type SetUserAction = {
    type: userActionType.SETUSER
    payload: {
    id: string,
    username: string,
    password: string,
    firstName: string,
    lastName: string,
    nickName: string,
    profileImage: string,
    email: string,
    GoalTaken: number,
    GoalSet: number,
    NormalGameNumber: number,
    NormalWinNumber: number,
    NormalLossNumber: number,
    twoFactorAuth: boolean,
    Friend: number,
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
