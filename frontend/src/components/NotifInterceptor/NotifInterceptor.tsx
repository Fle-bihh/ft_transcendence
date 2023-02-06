import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import Cookies from "universal-cookie";
import { actionCreators, RootState } from "../../state";
import { NotifType } from "../../state/type";

const cookies = new Cookies();

export default function NotifInterceptor(props: { children: any }) {
  const [loading, setLoading] = useState(true)
  const utilsReducer = useSelector((state: RootState) => state.utils);
  const userReducer = useSelector((state: RootState) => state.persistantReducer.userReducer);
  const dispatch = useDispatch();
  const { addNotif, setUser } = bindActionCreators(actionCreators, dispatch);

  utilsReducer.socket.removeListener('add_notif');
  utilsReducer.socket.on("add_notif", (data: { type: NotifType; data: any }) => {
    addNotif(data);
  });

  useEffect(() => {
    utilsReducer.socket.emit('STORE_CLIENT_INFO', { user: userReducer.user })
  }, [])

  utilsReducer.socket.removeListener('store_client_done');
  utilsReducer.socket.on("store_client_done", () => {
    setLoading(false);
  });

  if (loading)
    return <></>

  return <>{props.children}</>;
}
