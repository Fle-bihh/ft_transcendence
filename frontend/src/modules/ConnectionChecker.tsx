import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../state";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";

function ConnectionChecker(props: { children: any }): JSX.Element {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (userReducer.user === null) {
      setIsConnected(false);
    }
    else {
      const cookies = new Cookies();
      const jwt = cookies.get("jwt");
      const options = {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      }
      axios.get(`localhost:5001/user/login/${userReducer.user.login}`, options)
        .then(() => { })
        .catch(() => { setIsConnected(false)})
    }
  }, [userReducer.user]);
  if (isConnected) {
    return <>{props.children}</>;
  }
  return <Navigate to="/Signup"></Navigate>;
}

export default ConnectionChecker;
