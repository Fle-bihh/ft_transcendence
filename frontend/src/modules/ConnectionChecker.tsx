import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../state";
import { useEffect, useState } from "react";

function ConnectionChecker(props: { children: any }): JSX.Element {
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (userReducer.user === null) {
      setIsConnected(false);
    }
  }, [userReducer.user]);
  if (isConnected) {
    return <>{props.children}</>;
  }
  return <Navigate to="/Signup"></Navigate>;
}

export default ConnectionChecker;
