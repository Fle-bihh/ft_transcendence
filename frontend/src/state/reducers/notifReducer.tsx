import { notifActionType } from "../action-types";
import { notifAction } from "../actions";
import { Notif, NotifType } from "../type";

export interface NotifArray {
	notifArray: Array<Notif>
}

export const initialState: NotifArray = {
	notifArray: new Array<Notif>(),
}

export const notifReducer = (state: NotifArray = initialState, action: notifAction) => {
	switch (action.type) {
		case notifActionType.ADDNOTIF: {
			state.notifArray.push({...action.payload, seen: false})
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.SEENALLNOTIF: {
			state.notifArray.forEach(notif => notif.seen = true)
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.DELNOTIF: {
			state.notifArray.splice(action.payload, 1);
			return {
				...state,
				notifArray: state.notifArray
			};
		}
		case notifActionType.REMOVENOTIFPONG: {
			let array = new Array<Notif>();
			state.notifArray.forEach((notif) => {
				if (notif.type !== NotifType.INVITEGAME)
					array.push(notif)
				
			})
			return {
				...state,
				notifArray: array
			};
		}
		case notifActionType.REMOVENOTIFINVITE: {
			let array = new Array<Notif>();
			state.notifArray.forEach((notif) => {
				if (action.payload !== notif.data.sender)
					if (notif.type !== NotifType.FRIENDREQUEST)
						array.push(notif)
			})
			return {
				...state,
				notifArray: array
			};
		}
		default:
			return state;
	}
}