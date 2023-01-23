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
//     return <Navigate to="/signin"/>;
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
import { useLocation } from 'react-router-dom'
import { ip } from "../App";
// import NotFound from "../../Page/NotFound/NotFound";

var test = false

function ConnectionChecker(props: {
  children: any;
}): JSX.Element {

  const persistantReducer = useSelector((state: RootState) => state.persistantReducer)
  const utilsData = useSelector((state: RootState) => state.utils)
  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

  if (!test) {
    // axios.get("https://localhost:5001/user/login/", { withCredentials: true }).then((item) => { setUser(item.data) }).catch((err) => setUser(null));
    axios.get(`http://${ip}:5001/user/login/` + persistantReducer.userReducer.user?.username).then((item) => { 
      setUser(item.data);
    test = true }).catch((err) => setUser(null));


    // utilsData.socket.emit('storeClientInfo', persistantReducer.userReducer.user ? persistantReducer.userReducer.user : '');
  }


  if (persistantReducer.userReducer.user?.username !== undefined)
    {
      return (<>{props.children}</>)
    }
    else
      return <Navigate to="/signin" />
}

export default ConnectionChecker;
