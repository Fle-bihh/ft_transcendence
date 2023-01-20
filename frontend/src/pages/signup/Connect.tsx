import axios, { AxiosResponse } from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { ip } from "../../App";

const Connect = () => {

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get("code") as string;
  const err = urlParams.get("error") as string;


  const navigate = useNavigate();

  if (err) {
    alert(`Error: ${err} !\nIf you want to connect with 42 you must authorize !`)
    navigate({
      pathname: '/',
      state: { reason: `${err}` }
    } as any, { replace: true });
  }

  // if (err) { 
  //   alert(`Error: ${err} !\nIf you want to connect with 42 you must authorize !`) 
  //   return (<Redirect to={{ 
  //     pathname: '/', 
  //     state: { reason: `${err}` } 
  //     }} />) 
  // }


  axios.request({
    url: '/auth/api42/signin',
    method: 'post',
    baseURL: `http://${ip}:5001`,
    params: {
      "code": code,
      "nickName": null,
    }
  }
  ).then((response: AxiosResponse<any, any>) => {
    console.log('response,', response);
    // window.open(`http://${ip}:3000/cookies?token=${response.data.accessToken}`, '_self')
    console.log(response.data.accessToken)
  }).catch(err => {
    console.log('ouiioun')
  })



  return (
      <Navigate to='/signin' ></Navigate>
  )

};

export default Connect;
