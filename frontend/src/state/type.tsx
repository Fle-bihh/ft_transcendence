import { Socket } from 'socket.io-client'

export interface User {
    login: string;
}

export enum NotifType {
    FRIENDREQUEST='FRIENDREQUEST'
}

export interface Notif {
    type: NotifType,
    data: any
    seen: boolean
}