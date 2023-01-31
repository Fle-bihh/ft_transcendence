import axios, { AxiosResponse } from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { ip } from "../../App";
import { actionCreators, RootState } from "../../state";
import Cookies from 'universal-cookie';
import PinInput from "react-pin-input";

const Connect = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code") as string;
  const err = urlParams.get("error") as string;
  const cookies = new Cookies();

  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);
  const { setTwoFA } = bindActionCreators(actionCreators, dispatch);
  const userReducer = useSelector((state: RootState) => state.persistantReducer.userReducer);
  const twoFAReducer = useSelector((state: RootState) => state.persistantReducer.twoFAReducer);
  const navigate = useNavigate();

  if (err) {
    alert(
      `Error: ${err} !\nIf you want to connect with 42 you must authorize !`
    );
    navigate(
      {
        pathname: "/",
        state: { reason: `${err}` },
      } as any,
      { replace: true }
    );
  }
  if (!userReducer.user)
    axios.request({
      url: "/auth/api42/Signin",
      method: "post",
      baseURL: `http://${ip}:5001`,
      params: {
        code: code,
        nickName: null,
      }}).then((response: AxiosResponse<any, any>) => {
        cookies.set('jwt', response.data.accessToken);
        setUser(response.data.user);
        // window.location.replace(`http://${ip}:3000`);
      }).catch((err) => { });

  function verify2FA(value: string) {
    axios.get(`http://localhost:5001/user/${userReducer.user?.username}/2fa/verify/` + value, { withCredentials: true })
      .then((e) => {
        setTwoFA(true);
      })
      .catch((e) => {
        setTwoFA(false);
        const div = document.getElementById("wrong-code") as HTMLDivElement;
        div.style.display = "flex";
      });
  }
  if (userReducer.user && !userReducer.user.twoFactorAuth) return (
    <Navigate to={"/"}/>
  )
  else if (userReducer.user && userReducer.user.twoFactorAuth && !twoFAReducer.twoFactorVerify) return (
    <div className="login-2fa">
      <h1>Google Authenticator Code</h1>
      <PinInput
        length={6}
        focus
        type="numeric"
        inputMode="number"
        style={{ padding: '10px' }}
        onComplete={(value) => { verify2FA(value); }}
        autoSelect={true}
      />
      <div id="wrong-code" style={{ display: "none" }}>
        <p>Wrong code</p>
      </div>
    </div>
  )
  else return (
    <div></div>
  )
};

export default Connect;
