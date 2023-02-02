import { io } from "socket.io-client"

interface UtilsData {
    socket: any,
    gameSocket: any,
}

export const initialState: UtilsData = {
    socket: io(`http://localhost:5001`),
    gameSocket: io(`http://localhost:5002`, { transports: ['websocket'] })
};

export const utilsReducer = (state: UtilsData = initialState, action: { type: any; }) => {
    switch (action.type) {
        
        default:
            return state;
    }
};
