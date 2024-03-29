import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { actionCreators, RootState } from "../../state";
import Cookies from "universal-cookie";
import PinInput from "react-pin-input";
import "./Connect.scss";
import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material";
import FlashMessage from '../../components/alert-message/Alert'


const Connect = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code") as string;
  const cookies = new Cookies();
  const [firstCo, setFirstCo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [inputValue, setInputValue] = useState("")
  const [message2, setmessage2] = useState("");
  const [error, seterror] = useState(false);

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

  useEffect(() => {
    axios
      .request({
        url: "/auth/api42/Signin",
        method: "post",
        baseURL: `http://${utils.ip}:5001`,
        params: {
          code: code,
          nickName: null,
        },
      })
      .then((response: AxiosResponse<any, any>) => {
        if (!response.data) {
          window.history.pushState({}, window.location.toString());
          window.location.replace("/");
        }
        if (response.data.user?.username && response.data.accesToken !== null) {
          cookies.set("jwt", response.data.accessToken, { path: `/` });
          setUser(response.data.user);
          if (response.data.user.firstConnection && response.data.accessToken) {
            setFirstCo(true);
          }
          else if (response.data.accessToken)
            setFirstCo(false);
          setLoading(false)
        }
      })
      .catch(() => {
        /*  window.history.pushState({}, window.location.toString());
          window.location.replace("/signup");*/
      });
  }, [])

  function verify2FA(value: string) {
    const jwt = cookies.get("jwt");
    const options = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };
    axios
      .get(
        `http://${utils.ip}:5001/user/${userReducer.user?.id}/2fa/verify/` +
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

  // useEffect(() => {
  //   // console.log('ouiouiouoiuoiui', firstCo)
  // }, [firstCo])

  const handleClose = () => {
    const jwt = cookies.get('jwt');
    const options = {
      headers: {
        'authorization': `Bearer ${jwt}`
      }
    }
    let tmp = inputValue.replace(/ /g, "")
    if (tmp === "") {
      tmp = userReducer.user?.username ? userReducer.user.username : ""
    }
    axios.patch(`http://${utils.ip}:5001/user/${userReducer.user?.id}/username`, { username: tmp }, options)
      .then((response) => {
        if (response.data != null) {
          setUser(response.data)
          window.history.pushState({}, window.location.toString());
          window.location.replace("/");
          setFirstCo(false)
        }
      })
      .catch((e) => {
        setmessage2("This username is already used")
        seterror(true)
        console.log(e)
      })
      seterror(false)

  }

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
            onKeyDown={(e) => { if (e.key === 'Enter') { handleClose() } }}
          ></TextField>
          <Button onClick={() => handleClose()}>Confirm</Button>
        </div>
        {
                    error ? <FlashMessage message2={message2} /> : ''
                }
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
