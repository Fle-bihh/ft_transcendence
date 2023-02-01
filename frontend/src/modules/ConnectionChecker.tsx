import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../state";
import { bindActionCreators } from "redux";
import axios from "axios";
import { ip } from "../App";
import { useEffect, useState } from "react";
import Cookies from "universal-cookie";

function ConnectionChecker(props: { children: any }): JSX.Element {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [isConnected, setIsConnected] = useState(true);
  const utils = useSelector((state: RootState) => state.utils);
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  useEffect(() => {
    const cookies = new Cookies();
    const jwt = cookies.get("jwt");
    const options = {
      headers: {
        authorization: `Bearer ${jwt}`,
      },
    };
    console.log(userReducer.user);
    if (userReducer.user === null) {
      setIsConnected(false);
    } else {
      axios
        .get(`http://${ip}:5001/user/login/${userReducer.user.login}`, options)
        .then((response) => {})
        .catch((error) => {
          setIsConnected(false);
          setUser(null);
        });
    }
  });
  if (isConnected) {
    return <>{props.children}</>;
  }
  return <Navigate to="/Signup"></Navigate>;
}

export default ConnectionChecker;
