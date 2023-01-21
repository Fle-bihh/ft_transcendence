import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../state";
import { bindActionCreators } from "redux";
// import axios from "axios";
// import InvitationChecker from "../InvitationChecker/InvitationChecker";
import { Children, useEffect, useState } from "react";
import axios from "axios";

var test = false

function ConnectionChecker(props: {
  children: any
}): JSX.Element {

  const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
  const utils = useSelector((state: RootState) => state.utils)
  const [userExist, setUserExist] = useState(true);
  //   const user = useSelector(
  //     (state: RootState) => state.persistantReducer.userReducer
  //   );

  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  if (persistantReducer.userReducer.user != null)
    axios.get('http://localhost:5001/user/login/' + persistantReducer.userReducer.user?.username).then(response => {
      if (response.data == null) {
        setUser(null);
        setUserExist(false);
      }
    })
  else
    setUserExist(false);


  //   if (!test) {
  //       axios.get("https://localhost:5001/user/userExist/", { withCredentials: true }).then((item) => { setUser(item.data) }).catch((err) => setUser(null));
  if (userExist) {
    // return {props.component}
    return (<>{props.children}</>)
  }
  else {
    return <Navigate to="/signin" />;
  }
  //       utilsData.socket.emit('storeClientInfo', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
  //       test = true;
  //   }
  //   if (persistantReducer.userReducer.user !== null && ((persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled && persistantReducer.twoFactorReducer.verif) || !persistantReducer.userReducer.user.isTwoFactorAuthenticationEnabled))
  //     return <InvitationChecker children={props.component} ></InvitationChecker>
  //   else
  //     return <Navigate to="/Login" />
  // return <div></div>;
}

export default ConnectionChecker;