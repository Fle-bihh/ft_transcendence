import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { ip } from "../../App";
import { actionCreators, RootState } from "../../state";
import Cookies from "universal-cookie";
import PinInput from "react-pin-input";
import "./Connect.scss";
import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";


const Connect = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code") as string;
  const cookies = new Cookies();
  const [firstCo, setFirstCo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")

  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);
  const { setTwoFA } = bindActionCreators(actionCreators, dispatch);
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );
  const twoFAReducer = useSelector(
    (state: RootState) => state.persistantReducer.twoFAReducer
  );
  const utils = useSelector((state: RootState) => state.utils);

  axios
    .request({
      url: "/auth/api42/Signin",
      method: "post",
      baseURL: `http://${ip}:5001`,
      params: {
        code: code,
        nickName: null,
      },
    })
    .then((response: AxiosResponse<any, any>) => {
      if (response.data.user?.username) {
        cookies.set("jwt", response.data.accessToken, { path: `/` });
        setUser(response.data.user);
        if (response.data.user.firstConnection) {
          setFirstCo(true);
        }
        setLoading(false)
        console.log('response.data.user -->', firstCo)
        // const tmp = true


        console.log('response.data.user -->', firstCo)
      }
      utils.socket.emit("STORE_CLIENT_INFO", { user: response.data.user });
      utils.gameSocket.emit("CHECK_RECONNEXION", {
        username: userReducer.user?.username,
      });
    })
    .catch(() => { });

  function verify2FA(value: string) {
    const jwt = cookies.get("jwt");
    const options = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    console.log("Connect 1 cookie == ", options);
    axios
      .get(
        `http://localhost:5001/user/${userReducer.user?.id}/2fa/verify/` +
        value,
        options
      )
      .then(() => {
        setTwoFA(true);
      })
      .catch(() => {
        setTwoFA(false);
        const div = document.getElementById("wrong-code") as HTMLDivElement;
        div.style.display = "flex";
      });

  }

  useEffect(() => {
    console.log('ouiouiouoiuoiui', firstCo)
  }, [firstCo])

  const handleClose = () => {
    const jwt = cookies.get('jwt');
    const options = {
      headers: {
        'authorization': `Bearer ${jwt}`
      }
    }
    const tmp = inputValue.replace(/ /g, "")
    console.log("tmp=", tmp)
    if (tmp !== "") {
      console.log("iiiiii")
      axios.patch(`http://localhost:5001/user/${userReducer.user?.id}/username`, { username: tmp }, options).then(response => {
        if (response.data != null) {
          setUser(response.data)
        }
      })
    }
    window.history.pushState({}, window.location.toString());
    window.location.replace("/");
    setFirstCo(false)
  }
  console.log('response.data.user! -->', firstCo)


  if (loading) return (<></>)

if (firstCo)
  return (
    <div className="connectPage">
      <div className="setUsernameContainer">
        <div className="setUsernameTitle">Welcome to The Last Dance</div>
        <div className="setUsernameDescription" onClick={() => {
        }}>
          Please choose the username everyone will see in game. You will still
          be able to change it later.
          </div>
        <TextField
          className="setUsernameTextField"
          placeholder={userReducer.user?.username}
          inputProps={{ maxLength: 12 }}
          onChange={(event) => setInputValue(event.currentTarget.value)}
          onKeyUp={(e) => { if (e.key === 'Enter') { handleClose() } }}
        ></TextField>
        <Button onClick={() => handleClose()}>Confirm</Button>
      </div>
    </div>
  );

  else if (userReducer.user && !userReducer.user.twoFactorAuth)
    return <Navigate to={"/"} />;
  else if (
    userReducer.user &&
    userReducer.user.twoFactorAuth &&
    !twoFAReducer.twoFactorVerify
  )

    return (
      <div className="login-2fa">
        <h1>Google Authenticator Code</h1>
        <PinInput
          length={6}
          focus
          type="numeric"
          inputMode="number"
          style={{ padding: "10px" }}
          onComplete={(value) => {
            verify2FA(value);
          }}
          autoSelect={true}
        />
        <div id="wrong-code" style={{ display: "none" }}>
          <p>Wrong code</p>
        </div>
      </div>
    );
  else if (
    userReducer.user &&
    userReducer.user.twoFactorAuth &&
    twoFAReducer.twoFactorVerify
  )
    return <Navigate to={"/"} />;
  else return <Navigate to={"/"} />;
};

export default Connect;
