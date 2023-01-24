// import { Navigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { actionCreators, RootState } from "../state";
// import { bindActionCreators } from "redux";
// // import axios from "axios";
// // import InvitationChecker from "../InvitationChecker/InvitationChecker";
// import { Children, useEffect, useState } from "react";
// import axios from "axios";
// import { ip } from "../App";

// var test = false

// function ConnectionChecker(props: {
//   children: any
// }): JSX.Element {

//   const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
//   const utils = useSelector((state: RootState) => state.utils)
//   const [userExist, setUserExist] = useState(false);

//   const dispatch = useDispatch();
//   const { setUser } = bindActionCreators(actionCreators, dispatch);
//   console.log(userExist);

//  useEffect(() => {
//     console.log('useEffect connectionChecker')
//   if (persistantReducer.userReducer.user != null) {
//     axios.get(`http://${ip}:5001/user/login/` + persistantReducer.userReducer.user?.username).then(response => {
//       if (response.data == null) {
//         setUser(null);
//         setUserExist(false);
//       }
//       else {
//         setUser(response.data);
//         setUserExist(true);
//       }
//     })
//   }})

//   if (userExist) {
//     console.log(userExist);
//     return (<>{props.children}</>)
//   }
//   else {
//     console.log('quoii');
//     return <Navigate to="/Signin"/>;
//   }
// }

// export default ConnectionChecker;
//
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../state";
import { bindActionCreators } from "redux";
import axios from "axios";
// import InvitationChecker from "../InvitationChecker/InvitationChecker";
import { useLocation } from "react-router-dom";
import { ip } from "../App";
import { useEffect, useState } from "react";
// import NotFound from "../../Page/NotFound/NotFound";

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

  // console.log('username', )
  // return (
  //   <div></div>
  // )

  // if (persistantReducer.userReducer.user?.username !== undefined && props.sign == false) {
  //   console.log("1");
  //   return (<>{props.children}</>)
  // }
  // else if (props.sign == false) {
  //   console.log("2");
  //   return <Navigate to="/Signup" />
  // }
  // else if (persistantReducer.userReducer.user?.username == undefined) {
  //   console.log("3");
  //   return (<>{props.children}</>)
  // }
  // else {
  //   console.log("4");
  //   return (<Navigate to="/" />)
  // }
}

export default ConnectionChecker;
