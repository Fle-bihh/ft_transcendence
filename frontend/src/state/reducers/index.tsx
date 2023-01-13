import { combineReducers } from "redux";
import { userReducer } from "./userReducer";
import storage from 'redux-persist/lib/storage'
import persistReducer from "redux-persist/es/persistReducer";
import { utilsReducer } from "./utilsReducer";

const persistConfig = {
    key: 'root',
    storage,
}

const tmp = combineReducers(    {
    userReducer: userReducer,
})

const persistantReducer = persistReducer(persistConfig, tmp)

const reducers = combineReducers(   {
    utils: utilsReducer,
    persistantReducer: persistantReducer
})

export default reducers;

export type RootState = ReturnType<typeof reducers>