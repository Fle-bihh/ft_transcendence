import { io } from "socket.io-client"

interface UtilsData {
    socket: any,
}

export const initialState: UtilsData = {
    socket: io('http://172.16.1.10:5001')
};

export const utilsReducer = (state: UtilsData = initialState, action: { type: any; }) => {
    switch (action.type) {
        
        default:
            return state;
    }
};