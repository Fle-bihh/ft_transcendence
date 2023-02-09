import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../state";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { utilsReducer } from "../state/reducers/utilsReducer";

function ConnectionChecker(props: { children: any }): JSX.Element {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const utilsReducer = useSelector(
    (state: RootState) => state.utils
  );
  const [isConnected, setIsConnected] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userReducer.user === null) {
      setIsConnected(false);
      setLoading(false);
    }
    else {
      const cookies = new Cookies();
      const jwt = cookies.get("jwt");
      const options = {
        headers: {
          authorization: `Bearer ${jwt}`,
        },
      }
      axios.get(`http://${utilsReducer.ip}:5001/user/login/${userReducer.user.login}`, options)
        .then(() => {
          setLoading(false);
         })
          .catch((err) => { setLoading(false); console.log(err); setIsConnected(false)})
    }
  }, [userReducer.user]);


  if (loading) return (<></>)


  if (isConnected) {
    return <>{props.children}</>;
  }
  return <Navigate to="/Signup"></Navigate>;
}

export default ConnectionChecker;
