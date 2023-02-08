import {
  AppBar,
  Badge,
  Box,
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import { NavLink } from "react-router-dom";
import "./nav.scss";
import LogoutIcon from "@mui/icons-material/Logout";

import {
  PersonAdd,
  AccountCircle,
  Notifications,
  Message,
} from "@mui/icons-material/";
import { useDispatch, useSelector } from "react-redux";
import { actionCreators, RootState } from "../../state";
import { bindActionCreators } from "redux";
import Cookies from "universal-cookie";
import { seenAllNotif } from "../../state/action-creators";

const Navbar = (props: any) => {
  const dispatch = useDispatch();
  const { setUser, setTwoFA } = bindActionCreators(actionCreators, dispatch);
  // const { setTwoFA } = bindActionCreators(actionCreators, dispatch);
  const persistantReducer = useSelector((state: RootState) => state.persistantReducer);
  const utilsReducer = useSelector((state: RootState) => state.utils);
  const StyledToolbar = styled(Toolbar)({display: "flex",justifyContent: "space-between",});
  const ItemsNav = styled(Box)({ display: "flex",gap: 15,});
  const ItemsInNav = [
    { Name: <PersonAdd />, Link: "/Friends" },
    { Name: <Badge badgeContent={persistantReducer.notifReducer.notifArray.filter((notif) => !notif.seen).length} showZero={false} color="error" ><Notifications /></Badge>, Link: "/Notif" },
    { Name: <Message />, Link: "/Chat" },
    { Name: <AccountCircle />, Link: "/Profile" },
    { Name: <LogoutIcon />, Link: "/Signup" },
  ];

  const HomeBox = styled(Box)({
    display: "flex",
    gap: 15,
  });
  const HomeItems = [
    { Name: "Home", Link: "/" },
    { Name: "Pong", Link: "/pong" },
  ];

  return (
    <AppBar sx={{ background: "white", opacity: 0.8 }}>
      <StyledToolbar>
        {/* La barre des Items HOME */}
        <HomeBox sx={{ display: { xs: "flex", sm: "flex", md: "flex" } }}>
          {HomeItems.map((item) => (
            <NavLink key={item.Link} to={`${item.Link}`} className="link">
              <Typography
                sx={{ cursor: "pointer", frontSize: "14px", color: "black" }}
              >
                {item.Name}
              </Typography>
            </NavLink>
          ))}
        </HomeBox>

        {/* La barre des Items NAV  (profil, deco etc*/}
        <ItemsNav sx={{ display: { xs: "flex", sm: "flex", md: "flex" } }}>
          {ItemsInNav.map((item) => {
            if (item.Link === "/Notif")
              return (
                <NavLink key={item.Link} to={`${item.Link}`} className="link" onClick={seenAllNotif}>
                  <Badge
                    badgeContent={
                      persistantReducer.notifReducer.notifArray.filter(
                        (notif) => !notif.seen
                      ).length
                    }
                    showZero={false}
                    color={"error"}
                  >
                    <Typography
                      sx={{
                        cursor: "pointer",
                        frontSize: "14px",
                        color: "black",
                      }}
                    >
                      {item.Name}
                    </Typography>
                  </Badge>
                </NavLink>
              );
            else if (item.Link === "/Signup") {
              return (
                <div
                  key={item.Link}
                  className="link"
                  onClick={() => {
                    utilsReducer.gameSocket.emit("DISCONNECT_SOCKET");
                    const cookies = new Cookies();
                    cookies.set('jwt', '', {path: '/',sameSite: 'lax'});
                    setUser(null);
                    setTwoFA(false);
                    window.history.pushState({}, window.location.toString());
                    window.location.replace("/signup");
                  }}
                >
                  <Typography
                    sx={{
                      cursor: "pointer",
                      frontSize: "14px",
                      color: "black",
                    }}
                  >
                    {item.Name}
                  </Typography>
                </div>
              );
            } else
              return (
                <NavLink key={item.Link} to={`${item.Link}`} className="link">
                  <Typography
                    sx={{
                      cursor: "pointer",
                      frontSize: "14px",
                      color: "black",
                    }}
                  >
                    {item.Name}
                  </Typography>
                </NavLink>
              );
          })}
        </ItemsNav>
      </StyledToolbar>
    </AppBar>
  );
};

export default Navbar;
