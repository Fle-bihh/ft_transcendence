import React, { useEffect, useState } from "react";
import axios from "axios";
import { ip } from "../../App";
import Cookies from "universal-cookie";
import { setUser } from "../../state/action-creators";

const cookies = new Cookies();
const jwt = cookies.get('jwt');
const options = {
  headers: {
    Authorization: `Bearer ${jwt}`
  }
}
console.log('Signup cookie == ', options);

const Signup = () => {
  const [userName, setuserName] = useState(""); // nous permet de mttre userName a vide
  const [lastName, setlastName] = useState("");
  const [firstName, setfirstName] = useState("");
  const [password, setpassword] = useState("");
  const [succes, setsucces] = useState(false);
  const [error, seterror] = useState(false);
  const [message, setmessage] = useState("");
  const [message2, setmessage2] = useState("");

  useEffect(() => {
    setUser(null);
  }, [])

  const HandleCountAdding = (e: React.ChangeEvent<any>) => {
    const count = { userName, lastName, firstName, password };
    e.preventDefault();

    axios
      .post(`http://${ip}:5001/users/signup`, {
        userName: userName,
        lastName: lastName,
        firstName: firstName,
        password: password,
      })
      .then((response) => {
        setmessage("Welcome " + userName);
        setsucces(true);
        // Handle data
      })
      .catch((error) => {
        if (error.response!.status === 400) {
          setmessage2(error.response.status + " veuillez remplir correctement");
          // setmessage2(error.request);

          seterror(true);
        } else {
          setmessage2(error.response.status + " user existe deja");
          seterror(true);
        }
      });
    setsucces(false);
    seterror(false);
    // pour que quand on écrit de la merde ca recharge pas quand on valide avce le bouton
  };

  return (

    <button
      className="i42-button"
      onClick={() =>
        window.open(
          `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fhome&response_type=code`,
          "_self"
        )
      }
    >
      <img
        className="i42-logo"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/langfr-280px-42_Logo.svg.png"
        alt=""
      />
    </button>
  );
};

export default Signup;
