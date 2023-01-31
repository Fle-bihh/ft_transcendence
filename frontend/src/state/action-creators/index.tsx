import { Dispatch } from "redux";
import { notifActionType, userActionType } from "../action-types/index";
import { notifAction, userAction } from "../actions/index";
import { NotifType } from "../type";

export const setUser = (
  item: {
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
  } | null
) => {
  return (dispatch: Dispatch<userAction>) => {
    dispatch({
      type: userActionType.SETUSER,
      payload: item,
    });
  };
};

export const addNotif = (item: { type: NotifType; data: any }) => {
  return (dispatch: Dispatch<notifAction>) => {
    dispatch({
      type: notifActionType.ADDNOTIF,
      payload: item,
    });
  };
};

export const delNotif = (item: number) => {
  return (dispatch: Dispatch<notifAction>) => {
    dispatch({
      type: notifActionType.DELNOTIF,
      payload: item,
    });
  };
};

export const seenAllNotif = () => {
  return (dispatch: Dispatch<notifAction>) => {
    dispatch({
      type: notifActionType.SEENALLNOTIF,
    });
  };
};
