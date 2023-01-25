import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../state";
import { bindActionCreators } from "redux";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ip } from "../App";
import { useEffect, useState } from "react";

function ConnectionChecker(props: { children: any }): JSX.Element {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [isConnected, setIsConnected] = useState(true);
  const utils = useSelector((state: RootState) => state.utils);
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    console.log(userReducer.user)
    if (userReducer.user === null) {
      setIsConnected(false);
    } else {
      axios
        .get(`http://${ip}:5001/user/login/${userReducer.user.username}`)
        .catch((error) => {
          setIsConnected(false)
        });
    }
  });
  if (isConnected) {
    return <>{props.children}</>;
  }
  return <Navigate to="/Signup"></Navigate>;
}

export default ConnectionChecker;
