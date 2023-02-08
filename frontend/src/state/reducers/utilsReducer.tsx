import { io } from "socket.io-client"

interface UtilsData {
    socket: any,
    gameSocket: any,
    ip: any
}

export const initialState: UtilsData = {
    ip: process.env.REACT_APP_IP,
    socket: io(`http://${process.env.REACT_APP_IP}:5001`),
    gameSocket: io(`http://${process.env.REACT_APP_IP}:5002`, { transports: ['websocket'] }),
};

export const utilsReducer = (state: UtilsData = initialState, action: { type: any; }) => {
    switch (action.type) {
        
        default:
            return state;
    }
};
