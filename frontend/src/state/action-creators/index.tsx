import { Dispatch } from "redux"
import { userActionType } from "../action-types/index"
import { userAction } from "../actions/index"

export const setUser = (item: {
    login: string
} | null) => {
    return (dispatch: Dispatch<userAction>) => {
        dispatch({
            type: userActionType.SETUSER,
            payload: item
        })
    } 
}