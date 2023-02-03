import { Socket } from "socket.io-client";

export interface User {
    username: string
    login: string,
    profileImage: string,
    email: string,
    WinNumber: number,
    LossNumber: number,
    Rank: number,
    twoFactorAuth: boolean,
    friend: number,
}

export enum NotifType {
  FRIENDREQUEST = "FRIENDREQUEST",
  INVITEGAME = "INVITEGAME",
}

export interface Notif {
  type: NotifType;
  data: any;
  seen: boolean;
}
