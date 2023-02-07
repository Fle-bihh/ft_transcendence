import { useEffect} from "react";
import { setUser, removeNotifPong } from "../../state/action-creators";
import "./signup.scss";

 const Signup = () => {

  useEffect(() => {
    console.log("refresh")
    setUser(null);
    removeNotifPong();
  }, [])


  return (

    <div className="signup">
      <button
        className="i42_button"
        onClick={() =>
          window.open(
            `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fhome&response_type=code`,
            "_self"
          )
        }
      >
        <img
          className="i42_logo"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/42_Logo.svg/langfr-280px-42_Logo.svg.png"
          alt=""
        />
      </button>
      <h1>Connect with 42</h1>
    </div>
  );
};

export default Signup;
