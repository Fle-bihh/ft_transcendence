import axios, { AxiosResponse } from "axios";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { bindActionCreators } from "redux";
import { ip } from "../../App";
import { actionCreators } from "../../state";

const Connect = () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code") as string;
  const err = urlParams.get("error") as string;

  const dispatch = useDispatch();
  const { setUser } = bindActionCreators(actionCreators, dispatch);

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
      setUser(response.data.user);
      window.location.replace(`http://${ip}:3000`);
    })
    .catch((err) => {
    });

  return <div></div>;
};

export default Connect;
