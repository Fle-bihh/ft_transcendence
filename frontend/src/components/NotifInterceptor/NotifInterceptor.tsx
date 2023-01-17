import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";

export default function NotifInterceptor(props: { children: any }) {
  const utilsReducer = useSelector((state: RootState) => state.utils);
  const dispatch = useDispatch();
  const { addNotif } = bindActionCreators(
    actionCreators,
    dispatch
  );
  utilsReducer.socket.removeListener('add_notif');
  utilsReducer.socket.on(
    "add_notif",
    (data: { type: NotifType; data: any }) => {
		addNotif(data);
	}
  );

  return <>{props.children}</>;
}
