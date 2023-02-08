import { useEffect} from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../state";
import { setUser, removeNotifPong } from "../../state/action-creators";
import "./signup.scss";

 const Signup = () => {
<<<<<<< HEAD
  const utils = useSelector((state: RootState) => state.utils);

  useEffect(() => {
    console.log("refresh utils = ", utils.ip)
=======
  const userReducer = useSelector(
    (state: RootState) => state.persistantReducer.userReducer
  );


  useEffect(() => {
    console.log("refresh")
    console.log()
>>>>>>> 2e62612e36d2dcd716942090ea31ff7eaf560fa4
    setUser(null);
    console.log("pls c est quoi ca? == ",userReducer.user)
    removeNotifPong();
  }, [])


  return (

    <div className="signup">
      <button
        className="i42_button"
        onClick={() =>
          window.open(
            `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-2ba494ca541577ab12aead4ea4f59fc22b4c2bea05058775f2524344f2e602a9&redirect_uri=http%3A%2F%2F${utils.ip}%3A3000%2Fhome&response_type=code`,
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
