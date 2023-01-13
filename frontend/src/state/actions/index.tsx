import { userActionType } from "../action-types";

type SetUserAction = {
    type: userActionType.SETUSER
    payload: {
        login: string
    } | null
}

export type userAction = SetUserAction